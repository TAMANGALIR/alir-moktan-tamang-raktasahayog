"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAdmins = exports.sendNotification = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Allow all connections for now
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('join_room', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
exports.getIO = getIO;
// Helper to send notification to specific user
const sendNotification = (userId, type, payload) => {
    if (io) {
        io.to(userId).emit('notification', { type, ...payload });
    }
};
exports.sendNotification = sendNotification;
// Helper to notify all admins
const notifyAdmins = (type, payload) => {
    if (io) {
        io.to('admin_room').emit('notification', { type, ...payload });
    }
};
exports.notifyAdmins = notifyAdmins;
