import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast'; // Assuming we have or will install this, or use basic alert for now

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user && token) {
            // Initialize socket connection
            const newSocket = io('http://localhost:3000', {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                // Join user specific room
                newSocket.emit('join_room', user.id);

                // If Admin, join admin room
                if (user.role === 'ADMIN') {
                    newSocket.emit('join_room', 'admin_room');
                }
            });

            // Listen for global notifications
            newSocket.on('notification', (data) => {
                console.log('Notification received:', data);

                // Show Toast
                if (data.status === 'APPROVED') {
                    toast.success(data.message, { duration: 5000 });
                } else if (data.status === 'REJECTED') {
                    toast.error(data.message, { duration: 6000 });
                } else {
                    toast(data.message);
                }
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
