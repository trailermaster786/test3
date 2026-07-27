const { Server } = require('socket.io');

const PORT = process.env.WS_PORT || 3003;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const adminClients = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('register', (data) => {
    const { role, userId } = data;
    if (role === 'admin') {
      adminClients.set(userId, socket.id);
      console.log(`Admin registered: ${userId}`);
    }
  });

  socket.on('send-notification', (data) => {
    const { role, notification } = data;
    if (role === 'admin') {
      // Broadcast to all admin clients
      for (const [userId, socketId] of adminClients) {
        io.to(socketId).emit('notification', notification);
      }
    }
  });

  socket.on('disconnect', () => {
    // Remove from admin clients
    for (const [userId, socketId] of adminClients) {
      if (socketId === socket.id) {
        adminClients.delete(userId);
        break;
      }
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

console.log(`WebSocket server running on port ${PORT}`);
