import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    
    // Dhyan de: Agar aapne server.js mein port 5001 kiya tha, toh yahan bhi 5001 hi likhna hai.
    // Agar 4000 kiya tha, toh 4000 likhna.
    return io('http://localhost:5001', options);
};