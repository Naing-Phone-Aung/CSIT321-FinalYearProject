// Services/ServerService.cs

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

namespace MobControlPC.Services
{
    public class ClientInfo
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = "Unknown Device";
        public string IpAddress { get; set; } = "0.0.0.0";
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
        
        private const int DiscoveryPort = 15000;
        private CancellationTokenSource? _discoveryCts;

        public ServerService()
        {
            DeviceName = Environment.MachineName;
            LocalIP = GetLocalIPAddress() ?? "127.0.0.1";
            ServerAddress = $"ws://{LocalIP}:8181";
        }

        public void Start()
        {
            try
            {
                GenerateQrCode();
                StartWebSocketServer();
                StartUdpBroadcast();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FATAL: Could not start services. Reason: {ex.Message}");
            }
        }
        
        private void StartUdpBroadcast()
        {
            _discoveryCts = new CancellationTokenSource();
            
            Task.Run(async () =>
            {
                // This try/catch block is important to prevent crashes on shutdown
                try
                {
                    using (var udpClient = new UdpClient())
                    {
                        udpClient.EnableBroadcast = true;
                        var broadcastEndpoint = new IPEndPoint(IPAddress.Broadcast, DiscoveryPort);
                        var message = $"MOB_CONTROL_SERVER|{this.DeviceName}|{this.ServerAddress}";
                        var messageBytes = Encoding.UTF8.GetBytes(message);

                        Console.WriteLine($"Starting UDP broadcast on port {DiscoveryPort}...");

                        while (!_discoveryCts.IsCancellationRequested)
                        {
                            await udpClient.SendAsync(messageBytes, messageBytes.Length, broadcastEndpoint);
                            await Task.Delay(3000, _discoveryCts.Token);
                        }
                    }
                }
                catch (TaskCanceledException) { /* This is expected on shutdown */ }
                catch (Exception ex) { Console.WriteLine($"UDP Broadcast Error: {ex.Message}"); }
            }, _discoveryCts.Token);
        }
        
        private void StartWebSocketServer()
        {
            _server = new WebSocketServer($"ws://0.0.0.0:8181");
            _server.Start(socket =>
            {
                socket.OnOpen = () => HandleClientConnected(socket);
                socket.OnClose = () => HandleClientDisconnected(socket);
                socket.OnMessage = message => HandleClientMessage(socket, message);
            });
            Console.WriteLine($"WebSocket Server started at {ServerAddress}");
        }

        // --- THIS IS THE FIXED METHOD ---
        private void GenerateQrCode()
        {
            string qrCodePayload = $"MOB_CONTROL_SERVER|{this.DeviceName}|{this.ServerAddress}";
            
            Console.WriteLine($"Generating QR Code with payload: {qrCodePayload}");

            var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(qrCodePayload, QRCodeGenerator.ECCLevel.Q);
            var pngQrCode = new PngByteQRCode(qrCodeData);
            QrCodeImage = $"data:image/png;base64,{Convert.ToBase64String(pngQrCode.GetGraphic(20))}";
        }
        
        #region Unchanged Methods
        private void HandleClientConnected(IWebSocketConnection socket)
        {
            var clientInfo = new ClientInfo { Id = socket.ConnectionInfo.Id, IpAddress = socket.ConnectionInfo.ClientIpAddress };
            _clientSockets.Add(clientInfo.Id, socket);
            ConnectedClients.Add(clientInfo);
            NotifyStateChanged();
        }

        private void HandleClientDisconnected(IWebSocketConnection socket)
        {
            _clientSockets.Remove(socket.ConnectionInfo.Id);
            ConnectedClients.RemoveAll(c => c.Id == socket.ConnectionInfo.Id);
            NotifyStateChanged();
        }

        private void HandleClientMessage(IWebSocketConnection socket, string message)
        {
            var client = ConnectedClients.FirstOrDefault(c => c.Id == socket.ConnectionInfo.Id);
            if (client != null)
            {
                if (client.Name == "Unknown Device") { client.Name = message; NotifyStateChanged(); }
                else { Console.WriteLine($"Received Data from {client.Name}: {message}"); }
            }
        }

        public void DisconnectClient(Guid clientId)
        {
            if (_clientSockets.TryGetValue(clientId, out var socket)) { socket.Close(); }
        }

        private string? GetLocalIPAddress()
        {
            try 
            {
                using (var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0))
                {
                    socket.Connect("8.8.8.8", 65530);
                    IPEndPoint? endPoint = socket.LocalEndPoint as IPEndPoint;
                    return endPoint?.Address.ToString();
                }
            }
            catch { return null; }
        }

        public void Dispose()
        {
            _discoveryCts?.Cancel();
            _discoveryCts?.Dispose();
        }
        
        private void NotifyStateChanged() => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(null));
        #endregion
    }
}