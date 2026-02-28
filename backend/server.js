const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// CORS setup for Express
app.use(cors());

const server = http.createServer(app);

// ZARURI FIX: Socket.io CORS ko aur specify kiya hai
const io = new Server(server, {
    cors: { 
        origin: "*", // Sabhi frontend links allow karne ke liye
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'] // Polling support bhi add kiya hai safety ke liye
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('🟢 Naya user connect hua! Socket ID:', socket.id);

    socket.on('join', ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on('code-change', ({ roomId, code }) => {
        socket.in(roomId).emit('code-change', { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit('disconnected', {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
    });

    socket.on('disconnect', () => {
        console.log('🔴 User disconnect ho gaya!');
    });
});

// Port configuration for Render
const PORT = process.env.PORT || 5001; 
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});