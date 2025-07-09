using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Fleck;
using QRCoder;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Nefarius.ViGEm.Client;
using Nefarius.ViGEm.Client.Targets;
using Nefarius.ViGEm.Client.Targets.Xbox360;

namespace MobControlPC.Services
{
    public class GamepadInput
    {
        public string Type { get; set; } = string.Empty;
        public string Id { get; set; } = string.Empty;
        public bool? Pressed { get; set; }
        public double? X { get; set; }
        public double? Y { get; set; }
    }

    public class ClientInfo
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = "Unknown Device";
        public string IpAddress { get; set; } = "0.0.0.0";
        public IXbox360Controller? Controller { get; set; }
        public DateTime LastHeartbeat { get; set; }
    }

    public class ServerService : INotifyPropertyChanged, IDisposable
    {
        public string LocalIP { get; private set; }
        public string DeviceName { get; private set; }
        public string ServerAddress { get; private set; }
        public string? QrCodeImage { get; private set; }
        public List<ClientInfo> ConnectedClients { get; private set; } = new();
        public bool IsAnyClientConnected => ConnectedClients.Any();
        public event PropertyChangedEventHandler? PropertyChanged;
        
        private WebSocketServer? _server;
        private readonly Dictionary<Guid, IWebSocketConnection> _clientSockets = new();
        private readonly ViGEmClient? _vigemClient;
        
        private const int DiscoveryPort = 15000;
        private CancellationTokenSource? _discoveryCts;

        // NEW: Heartbeat and Timeout mechanism fields
        private Timer? _heartbeatTimer;
        private readonly TimeSpan _clientTimeoutDuration = TimeSpan.FromSeconds(15); 
        private readonly TimeSpan _pingInterval = TimeSpan.FromSeconds(5); 

        public ServerService()
        {
            DeviceName = Environment.MachineName;
            LocalIP = GetLocalIPAddress() ?? "127.0.0.1";
            ServerAddress = $"ws://{LocalIP}:8181";
            
            try 
            { 
                _vigemClient = new ViGEmClient(); 
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FATAL: ViGEmBus driver not found or failed to initialize. Error: {ex.Message}");
                _vigemClient = null;
            }
        }

        public void Start()
        {
            if (_vigemClient == null) 
            {
                Console.WriteLine("Cannot start server because ViGEm client is not available.");
                return; 
            }
            try
            {
                GenerateQrCode();
                StartWebSocketServer();
                StartUdpBroadcast();
                StartHeartbeatCheck();
            }
            catch (Exception ex) { Console.WriteLine($"FATAL: Could not start services. Reason: {ex.Message}"); }
        }
        
        private void StartWebSocketServer()
        {
            _server = new WebSocketServer($"ws://0.0.0.0:8181");
            _server.RestartAfterListenError = true;
            Fleck.FleckLog.Level = Fleck.LogLevel.Warn;
            _server.Start(socket =>
            {
                socket.OnOpen = () => HandleClientConnected(socket);
                socket.OnClose = () => HandleClientDisconnected(socket);
                socket.OnMessage = message => HandleClientMessage(socket, message);
            });
            Console.WriteLine($"WebSocket Server started at {ServerAddress}");
        }

        private void HandleClientConnected(IWebSocketConnection socket)
        {
            Console.WriteLine($"[WS-SERVER] Event: OnOpen - Client connected with ID: {socket.ConnectionInfo.Id}");
            
            if (_vigemClient == null) 
            {
                Console.WriteLine("[WS-SERVER] ERROR: ViGEm client is null. Cannot create controller.");
                socket.Close(); 
                return;
            }
            try
            {
                var controller = _vigemClient.CreateXbox360Controller();
                controller.Connect();
                Console.WriteLine($"[WS-SERVER] SUCCESS: Virtual controller created for client {socket.ConnectionInfo.Id}.");
                
                var clientInfo = new ClientInfo 
                { 
                    Id = socket.ConnectionInfo.Id, 
                    IpAddress = socket.ConnectionInfo.ClientIpAddress, 
                    Controller = controller,
                    LastHeartbeat = DateTime.UtcNow 
                };

                _clientSockets.Add(clientInfo.Id, socket);
                ConnectedClients.Add(clientInfo);
                NotifyStateChanged();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WS-SERVER] FATAL ERROR: Failed to create virtual controller. Reason: {ex}");
                socket.Close(); 
            }
        }

// The NEW, CORRECT method
private void HandleClientDisconnected(IWebSocketConnection socket)
{
    Console.WriteLine($"[WS-SERVER] Event: OnClose - Client disconnected with ID: {socket.ConnectionInfo.Id}");
    var client = ConnectedClients.FirstOrDefault(c => c.Id == socket.ConnectionInfo.Id);
    if (client != null)
    {
        if (client.Controller != null)
        {
            client.Controller.Disconnect();
            Console.WriteLine($"[WS-SERVER] INFO: Virtual controller for client {client.Id} disconnected.");
        }
        _clientSockets.Remove(client.Id);
        ConnectedClients.RemoveAll(c => c.Id == client.Id);
        NotifyStateChanged();
    }
}
        private void HandleClientMessage(IWebSocketConnection socket, string message)
        {
            var client = ConnectedClients.FirstOrDefault(c => c.Id == socket.ConnectionInfo.Id);
            if (client == null) return;
            client.LastHeartbeat = DateTime.UtcNow;

            if (message.Contains("\"type\":\"pong\""))
            {
                Console.WriteLine($"[WS-SERVER] Received Pong from {client.Id}");
                return;
            }

            Console.WriteLine($"[WS-SERVER] Event: OnMessage - Received RAW message from client {socket.ConnectionInfo.Id}: {message}");
            
            if (client.Controller == null) return;
            
            // Check for the initial device name message
            if (client.Name == "Unknown Device" && !message.StartsWith("{")) 
            { 
                client.Name = message; 
                Console.WriteLine($"[SERVER INFO] Client {client.Id} identified as: {client.Name}");
                NotifyStateChanged();
                return; 
            }
            
            try
            {
                var input = JsonConvert.DeserializeObject<GamepadInput>(message);
                if (input == null) return;

                switch (input.Type)
                {
                    case "button":
                        HandleButtonInput(client.Controller, input);
                        break;
                    case "joystick":
                        HandleJoystickInput(client.Controller, input);
                        break;
                }
            }
            catch (JsonReaderException ex)
            {
                Console.WriteLine($"[SERVER ERROR] JSON Parsing FAILED for message: '{message}'. Error: {ex.Message}");
            }
        }

        private void HandleButtonInput(IXbox360Controller controller, GamepadInput input)
        {
            if (input.Pressed == null) return;
            bool isPressed = input.Pressed.Value;
            Xbox360Button? button = input.Id switch
            {
                "btn_a" => Xbox360Button.A,
                "btn_b" => Xbox360Button.B,
                "btn_x" => Xbox360Button.X,
                "btn_y" => Xbox360Button.Y,
                "btn_lb" => Xbox360Button.LeftShoulder,
                "btn_rb" => Xbox360Button.RightShoulder,
                "dpad-up" => Xbox360Button.Up,
                "dpad-down" => Xbox360Button.Down,
                "dpad-left" => Xbox360Button.Left,
                "dpad-right" => Xbox360Button.Right,
                "menu" => Xbox360Button.Start,
                "clone" => Xbox360Button.Back,
                _ => null
            };
            if (button != null)
            {
                controller.SetButtonState(button, isPressed);
            }
            else if(input.Id == "btn_lt" || input.Id == "btn_rt")
            {
                byte value = isPressed ? (byte)255 : (byte)0;
                if(input.Id == "btn_lt") controller.SetSliderValue(Xbox360Slider.LeftTrigger, value);
                else controller.SetSliderValue(Xbox360Slider.RightTrigger, value);
            }
        }

        private void HandleJoystickInput(IXbox360Controller controller, GamepadInput input)
        {
            if (input.X == null || input.Y == null) return;
            var x = (short)(input.X.Value * short.MaxValue);
            var y = (short)(input.Y.Value * short.MaxValue * -1);
            switch (input.Id)
            {
                case "joy_l":
                    controller.SetAxisValue(Xbox360Axis.LeftThumbX, x);
                    controller.SetAxisValue(Xbox360Axis.LeftThumbY, y);
                    break;
                case "joy_r":
                    controller.SetAxisValue(Xbox360Axis.RightThumbX, x);
                    controller.SetAxisValue(Xbox360Axis.RightThumbY, y);
                    break;
            }
        }
        
        private void StartUdpBroadcast()
        {
            _discoveryCts = new CancellationTokenSource();
            Task.Run(async () =>
            {
                try
                {
                    using var udpClient = new UdpClient { EnableBroadcast = true };
                    var broadcastEndpoint = new IPEndPoint(IPAddress.Broadcast, DiscoveryPort);
                    var message = $"MOB_CONTROL_SERVER|{DeviceName}|{ServerAddress}";
                    var messageBytes = Encoding.UTF8.GetBytes(message);
                    while (!_discoveryCts.IsCancellationRequested)
                    {
                        await udpClient.SendAsync(messageBytes, messageBytes.Length, broadcastEndpoint);
                        await Task.Delay(3000, _discoveryCts.Token);
                    }
                }
                catch (TaskCanceledException) {}
                catch (Exception ex) { Console.WriteLine($"UDP Broadcast Error: {ex.Message}"); }
            }, _discoveryCts.Token);
        }
        
        private void StartHeartbeatCheck()
        {
            _heartbeatTimer = new Timer(CheckClientConnections, null, TimeSpan.Zero, TimeSpan.FromSeconds(1));
        }

        private void CheckClientConnections(object? state)
        {
            var clientsToCheck = _clientSockets.ToList();
            if (!clientsToCheck.Any()) return;

            var now = DateTime.UtcNow;
            const string pingMessage = "{\"type\":\"ping\"}";

            foreach (var clientPair in clientsToCheck)
            {
                var socket = clientPair.Value;
                var clientInfo = ConnectedClients.FirstOrDefault(c => c.Id == socket.ConnectionInfo.Id);
                
                if(clientInfo == null) continue;

                if (now - clientInfo.LastHeartbeat > _clientTimeoutDuration)
                {
                    Console.WriteLine($"[HEARTBEAT] Client {clientInfo.Id} ({clientInfo.Name}) timed out. Closing connection.");
                    socket.Close();
                    continue; 
                }

                if (now - clientInfo.LastHeartbeat > _pingInterval)
                {
                    Console.WriteLine($"[HEARTBEAT] Pinging idle client {clientInfo.Id} ({clientInfo.Name}).");
                    socket.Send(pingMessage);
                }
            }
        }
        
        private void GenerateQrCode()
        {
            string qrCodePayload = $"MOB_CONTROL_SERVER|{this.DeviceName}|{this.ServerAddress}";
            var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(qrCodePayload, QRCodeGenerator.ECCLevel.Q);
            var pngQrCode = new PngByteQRCode(qrCodeData);
            QrCodeImage = $"data:image/png;base64,{Convert.ToBase64String(pngQrCode.GetGraphic(20))}";
        }
        
        public void DisconnectClient(Guid clientId)
        {
            if (_clientSockets.TryGetValue(clientId, out var socket)) 
            { 
                Console.WriteLine($"[MANUAL] Disconnecting client {clientId} by user request.");
                socket.Close(); 
            }
        }

        private string? GetLocalIPAddress()
        {
            try 
            {
                using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0);
                socket.Connect("8.8.8.8", 65530);
                return (socket.LocalEndPoint as IPEndPoint)?.Address.ToString();
            }
            catch { return Dns.GetHostName(); } 
        }

        public void Dispose()
        {
            _discoveryCts?.Cancel();
            _discoveryCts?.Dispose();
            _heartbeatTimer?.Dispose();
            
            foreach(var socket in _clientSockets.Values)
            {
                socket.Close();
            }
            _clientSockets.Clear();
            ConnectedClients.Clear();
            
            _vigemClient?.Dispose();
            _server?.Dispose();
        }
        
        private void NotifyStateChanged() => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(null));
    }
}