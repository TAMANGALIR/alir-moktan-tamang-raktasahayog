import { io } from 'socket.io-client';

let socket;

export const socketService = {
    connect: (userId) => {
        if (socket) return socket;

        socket = io('http://localhost:3000'); // Adjust URL if deployed

        socket.on('connect', () => {
            console.log('Connected to socket server');
            if (userId) {
                socket.emit('join_room', userId);
                console.log(`Joined room: ${userId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        return socket;
    },

    disconnect: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    on: (eventName, callback) => {
        if (socket) {
            socket.on(eventName, callback);
        }
    },

    off: (eventName) => {
        if (socket) {
            socket.off(eventName);
        }
    },

    joinRoom: (room) => {
        if (socket && room) {
            socket.emit('join_room', room);
            // console.log(`Joined room manually: ${room}`);
        }
    }
};


export default socketService;
