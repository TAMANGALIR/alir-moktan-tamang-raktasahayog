import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
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

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

// Helper to send notification to specific user
export const sendNotification = (userId: string, type: string, payload: any) => {
    if (io) {
        io.to(userId).emit('notification', { type, ...payload });
    }
};

// Helper to notify all admins
export const notifyAdmins = (type: string, payload: any) => {
    if (io) {
        io.to('admin_room').emit('notification', { type, ...payload });
    }
};
