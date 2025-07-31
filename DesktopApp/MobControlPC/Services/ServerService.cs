// PC side/Services/ServerService.cs

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
using Windows.Networking.Connectivity;
// THIS IS THE NEW LIBRARY'S NAMESPACE.
// IT IS INTENTIONALLY THE SAME, BUT THE UNDERLYING DLL WILL BE DIFFERENT.
using WindowsInput;
using WindowsInput.Native;


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

    public enum ConnectionMethod { Manual, QRCode } 
    public class ClientInfo
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = "Unknown Device";
        public string IpAddress { get; set; } = "0.0.0.0";
        public IXbox360Controller? Controller { get; set; }
        public DateTime LastHeartbeat { get; set; }
        public bool IsVerified { get; set; } = false;
        public ConnectionMethod Method { get; set; } = ConnectionMethod.Manual;
    }

    public class ServerService : INotifyPropertyChanged, IDisposable
    {
        public string LocalIP { get; private set; }
        public string DeviceName { get; private set; }
        public string ServerAddress { get; private set; }
        public string? QrCodeImage { get; private set; }
        public string CurrentOtp { get; private set; } = "------";
        public List<ClientInfo> ConnectedClients { get; private set; } = new();
        public bool IsAnyClientConnected => ConnectedClients.Any(c => c.IsVerified);
        public event PropertyChangedEventHandler? PropertyChanged;
        
        private WebSocketServer? _server;
        private readonly Dictionary<Guid, IWebSocketConnection> _clientSockets = new();
        private readonly ViGEmClient? _vigemClient;
        
        // THIS CODE USES THE NEW LIBRARY
        private readonly IInputSimulator _inputSimulator;
        
        private const int DiscoveryPort = 15000;
        private CancellationTokenSource? _discoveryCts;

        private Timer? _heartbeatTimer;
        private Timer? _otpTimer;
        private readonly Random _random = new Random();
        
        private readonly TimeSpan _clientTimeoutDuration = TimeSpan.FromSeconds(10); 
        private readonly TimeSpan _pingInterval = TimeSpan.FromSeconds(3); 

        public ServerService()
        {
            DeviceName = Environment.MachineName;
            LocalIP = GetLocalIPAddress() ?? "127.0.0.1";
            ServerAddress = $"ws://{LocalIP}:8181";
            
            // THIS LINE INSTANTIATES THE SIMULATOR FROM THE NEW LIBRARY
            _inputSimulator = new InputSimulator();

            try { _vigemClient = new ViGEmClient(); }
            catch (Exception ex) { Console.WriteLine($"FATAL: ViGEmBus driver not found. Error: {ex.Message}"); _vigemClient = null; }
        }

        public void Start()
        {
            if (_vigemClient == null) 
            {
                Console.WriteLine("ViGEmBus not found. Gamepad emulation will be disabled.");
            }
            try
            {
                GenerateQrCode();
                StartWebSocketServer();
                StartUdpBroadcast();
                StartHeartbeatCheck();
                StartOtpGeneration();
            }
            catch (Exception ex) { Console.WriteLine($"FATAL: Could not start services. Reason: {ex.Message}"); }
        }
        
        private void StartOtpGeneration() => _otpTimer = new Timer(GenerateNewOtp, null, TimeSpan.Zero, TimeSpan.FromSeconds(30));

        private void GenerateNewOtp(object? state)
        {
            CurrentOtp = _random.Next(100000, 999999).ToString();
            Console.WriteLine($"[OTP] New OTP Generated: {CurrentOtp}");
            NotifyStateChanged();
        }

        private void StartWebSocketServer()
        {
            _server = new WebSocketServer($"ws://0.0.0.0:8181");
            _server.RestartAfterListenError = true;
            FleckLog.Level = LogLevel.Warn;
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
            Console.WriteLine($"[WS-SERVER] Client connecting from path: '{socket.ConnectionInfo.Path}'");
            var isQrConnection = socket.ConnectionInfo.Path.Equals("/qr", StringComparison.OrdinalIgnoreCase);

            var clientInfo = new ClientInfo 
            { 
                Id = socket.ConnectionInfo.Id, 
                IpAddress = socket.ConnectionInfo.ClientIpAddress,
                Method = isQrConnection ? ConnectionMethod.QRCode : ConnectionMethod.Manual,
                IsVerified = isQrConnection, 
                Controller = null,
                LastHeartbeat = DateTime.UtcNow 
            };
            
            _clientSockets.Add(clientInfo.Id, socket);
            ConnectedClients.Add(clientInfo);
            
            if (isQrConnection && _vigemClient != null)
            {
                Console.WriteLine($"[WS-SERVER] QR Connection detected. Auto-verifying client {clientInfo.Id}.");
                try
                {
                    var controller = _vigemClient.CreateXbox360Controller();
                    controller.Connect();
                    clientInfo.Controller = controller;
                    socket.Send("{\"type\":\"connection_success\"}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[WS-SERVER] FATAL ERROR: Failed to create virtual controller for QR client. Reason: {ex}");
                    clientInfo.IsVerified = false;
                }
            }
            NotifyStateChanged();
        }

        private void HandleClientDisconnected(IWebSocketConnection socket)
        {
            var client = ConnectedClients.FirstOrDefault(c => c.Id == socket.ConnectionInfo.Id);
            if (client != null)
            {
                Console.WriteLine($"[WS-SERVER] Client '{client.Name}' disconnected gracefully.");
                client.Controller?.Disconnect();
                _clientSockets.Remove(client.Id);
                int clientsRemoved = ConnectedClients.RemoveAll(c => c.Id == client.Id);
                if (clientsRemoved > 0)
                {
                    NotifyStateChanged();
                }
            }
        }

        private void HandleClientMessage(IWebSocketConnection socket, string message)
        {
            var client = ConnectedClients.FirstOrDefault(c => c.Id == socket.ConnectionInfo.Id);
            if (client == null) return;

            client.LastHeartbeat = DateTime.UtcNow;

            if (message.Contains("\"type\":\"pong\"")) return;
            
            if (client.Name == "Unknown Device" && !message.StartsWith("{")) 
            { 
                client.Name = message; 
                Console.WriteLine($"[WS-SERVER] Client {client.Id} identified as '{client.Name}'.");
                NotifyStateChanged();
                return; 
            }

            try
            {
                var input = JObject.Parse(message);
                string? type = input["type"]?.ToString();
                
                if (type == "text")
                {
                    HandleTextInput(input["payload"]?.ToString());
                    return; 
                }
                
                if (type == "otp_verify")
                {
                    HandleOtpVerification(client, input["otp"]?.ToString());
                    return;
                }
                if (!client.IsVerified) return;

                var gamepadInput = input.ToObject<GamepadInput>();
                if (gamepadInput == null) return;
                
                if (client.Controller != null)
                {
                    switch (gamepadInput.Type)
                    {
                        case "button":
                            HandleButtonInput(client.Controller, gamepadInput);
                            break;
                        case "joystick":
                            HandleJoystickInput(client.Controller, gamepadInput);
                            break;
                    }
                }
            }
            catch (Exception ex) { Console.WriteLine($"[SERVER ERROR] Message processing failed: '{message}'. Error: {ex.Message}"); }
        }
        
        private void HandleTextInput(string? text)
        {
            if (!string.IsNullOrEmpty(text))
            {
                Console.WriteLine($"[INPUT] Typing text: {text}");
                _inputSimulator.Keyboard.TextEntry(text);
            }
        }

        private void HandleOtpVerification(ClientInfo client, string? receivedOtp)
        {
            if (client == null || client.IsVerified) return;
            if (receivedOtp == CurrentOtp)
            {
                Console.WriteLine($"[WS-SERVER] OTP verification successful for client {client.Id}.");
                client.IsVerified = true;
                if (_vigemClient != null)
                {
                    try
                    {
                        var controller = _vigemClient.CreateXbox360Controller();
                        controller.Connect();
                        client.Controller = controller;
                        _clientSockets[client.Id].Send("{\"type\":\"connection_success\"}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[WS-SERVER] FATAL ERROR: Failed to create virtual controller post-verification. Reason: {ex}");
                        client.IsVerified = false;
                    }
                }
                NotifyStateChanged();
            }
            else
            {
                Console.WriteLine($"[WS-SERVER] OTP verification failed for client {client.Id}.");
                _clientSockets[client.Id].Send("{\"type\":\"otp_failure\", \"message\":\"Invalid OTP\"}");
            }
        }
        
        private void HandleButtonInput(IXbox360Controller controller, GamepadInput input)
        {
            if (input.Pressed == null) return;
            bool isPressed = input.Pressed.Value;
            Xbox360Button? button = input.Id switch
            {
                "btn_a" => Xbox360Button.A, "btn_b" => Xbox360Button.B, "btn_x" => Xbox360Button.X,
                "btn_y" => Xbox360Button.Y, "btn_lb" => Xbox360Button.LeftShoulder, "btn_rb" => Xbox360Button.RightShoulder,
                "dpad-up" => Xbox360Button.Up, "dpad-down" => Xbox360Button.Down, "dpad-left" => Xbox360Button.Left,
                "dpad-right" => Xbox360Button.Right, "menu" => Xbox360Button.Start, "clone" => Xbox360Button.Back,
                _ => null
            };
            if (button != null) controller.SetButtonState(button, isPressed);
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
                case "joy_l": controller.SetAxisValue(Xbox360Axis.LeftThumbX, x); controller.SetAxisValue(Xbox360Axis.LeftThumbY, y); break;
                case "joy_r": controller.SetAxisValue(Xbox360Axis.RightThumbX, x); controller.SetAxisValue(Xbox360Axis.RightThumbY, y); break;
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
                    var message = $"MOB_CONTROL_SERVER|{DeviceName}|ws://{LocalIP}:8181"; 
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
            var clientsToRemove = new List<ClientInfo>();
            var now = DateTime.UtcNow;
            const string pingMessage = "{\"type\":\"ping\"}";

            foreach (var clientInfo in ConnectedClients.ToList())
            {
                if (!_clientSockets.TryGetValue(clientInfo.Id, out var socket))
                {
                    clientsToRemove.Add(clientInfo);
                    continue;
                }
                if (now - clientInfo.LastHeartbeat > _clientTimeoutDuration)
                {
                    Console.WriteLine($"[HEARTBEAT] Client '{clientInfo.Name}' timed out. Closing connection and removing.");
                    socket.Close();
                    clientsToRemove.Add(clientInfo);
                    continue;
                }
                if (now - clientInfo.LastHeartbeat > _pingInterval)
                {
                    if (socket.IsAvailable)
                    {
                        socket.Send(pingMessage);
                    }
                }
            }

            if (clientsToRemove.Any())
            {
                foreach (var client in clientsToRemove)
                {
                    client.Controller?.Disconnect();
                    _clientSockets.Remove(client.Id);
                    ConnectedClients.RemoveAll(c => c.Id == client.Id);
                }
                NotifyStateChanged();
            }
        }

        private void GenerateQrCode()
        {
            string qrCodePayload = $"MOB_CONTROL_SERVER|{this.DeviceName}|{this.ServerAddress}/qr";
            var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(qrCodePayload, QRCodeGenerator.ECCLevel.Q);
            var pngQrCode = new PngByteQRCode(qrCodeData);
            QrCodeImage = $"data:image/png;base64,{Convert.ToBase64String(pngQrCode.GetGraphic(20))}";
        }

        public void DisconnectClient(Guid clientId)
        {
            if (_clientSockets.TryGetValue(clientId, out var socket)) { socket.Close(); }
        }

        private string? GetLocalIPAddress()
        {
            try 
            {
                using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0);
                socket.Connect("8.8.8.8", 65530);
                return (socket.LocalEndPoint as IPEndPoint)?.Address.ToString();
            }
            catch 
            {
                return NetworkInformation.GetHostNames()
                    .FirstOrDefault(h => h.Type == Windows.Networking.HostNameType.Ipv4)?
                    .ToString();
            }
        }

        public void Dispose()
        {
            _discoveryCts?.Cancel();
            _otpTimer?.Dispose();
            _heartbeatTimer?.Dispose();
            foreach(var client in ConnectedClients) { client.Controller?.Disconnect(); }
            foreach(var socket in _clientSockets.Values) { socket.Close(); }
            _vigemClient?.Dispose();
            _server?.Dispose();
        }

        private void NotifyStateChanged() => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(null));
    }
}