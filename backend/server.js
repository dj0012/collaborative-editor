const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ['websocket', 'polling']
});

const userSocketMap = {};
io.on('connection', (socket) => {
    socket.on('join', ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(sId => ({
            socketId: sId, username: userSocketMap[sId]
        }));
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', { clients, username, socketId: socket.id });
        });
    });

    socket.on('code-change', ({ roomId, code }) => {
        socket.in(roomId).emit('code-change', { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit('disconnected', {
                socketId: socket.id, username: userSocketMap[socket.id]
            });
        });
        delete userSocketMap[socket.id];
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));