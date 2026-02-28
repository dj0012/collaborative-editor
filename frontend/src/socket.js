import { io } from 'socket.io-client';

export const initSocket = async () => {
    return io('https://collaborative-editor-backend-d8lj.onrender.com', {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket', 'polling'],
    });
};