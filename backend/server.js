io.on('connection', (socket) => {

  socket.on('join', ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const room = io.sockets.adapter.rooms.get(roomId);
    const clients = room
      ? Array.from(room).map((sId) => ({
          socketId: sId,
          username: userSocketMap[sId]
        }))
      : [];

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('joined', {
        clients,
        username,
        socketId: socket.id
      });
    });
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-change', { code });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms].filter(
      (roomId) => roomId !== socket.id
    );

    rooms.forEach((roomId) => {
      socket.to(roomId).emit('disconnected', {
        socketId: socket.id,
        username: userSocketMap[socket.id]
      });
    });

    delete userSocketMap[socket.id];
  });
});