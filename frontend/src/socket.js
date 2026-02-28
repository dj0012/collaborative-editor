import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket', 'polling'], // Production mein 'polling' fallback zaruri hai
    };
    
    // Live Render Backend ka URL
    return io('https://collaborative-editor-backend-d8lj.onrender.com', options);
};