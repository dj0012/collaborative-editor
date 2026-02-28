import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        // ZARURI FIX: 'polling' transport bhi add kiya hai safety ke liye
        transports: ['websocket', 'polling'], 
    };
    
    // Render URL bina kisi port (:5001) ke, kyunki Render https port khud handle karta hai
    return io('https://collaborative-editor-backend-d8lj.onrender.com', options);
};