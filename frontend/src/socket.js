import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        // Dono transports allow kiye hain taaki firewall block na kare
        transports: ['websocket', 'polling'], 
    };
    
    // Render URL bina kisi port ke (Kyunki production mein port 443 use hota hai)
    return io('https://collaborative-editor-backend-d8lj.onrender.com', options);
};