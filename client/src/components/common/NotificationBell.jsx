import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!socket) return;

        socket.on('notification', (data) => {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.off('notification');
        };
    }, [socket]);

    const handleNotificationClick = (notif) => {
        setIsOpen(false);

        // Admin Redirects
        if (user?.role === 'ADMIN') {
            if (notif.type === 'CAMPAIGN_CREATED' || notif.type === 'CAMPAIGN_UPDATED') {
                navigate('/admin/campaigns');
            } else if (notif.type === 'REQUEST_CREATED') {
                navigate('/admin/requests');
            }
            return;
        }

        // Organization Redirects
        if (user?.role === 'ORGANIZATION') {
            if (notif.type === 'CAMPAIGN_UPDATE' || notif.type === 'CAMPAIGN_APPROVED' || notif.type === 'CAMPAIGN_REJECTED') {
                navigate('/org-dashboard/campaigns');
            }
            return;
        }

        // User Redirects
        if (user?.role === 'USER') {
            if (notif.type === 'REQUEST_UPDATE') {
                navigate('/donations');
            }
        }
        // Mark as read logic would go here (API call)
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <button
                            onClick={() => setUnreadCount(0)}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            Mark all read
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((notif, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleNotificationClick(notif)}
                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors"
                                >
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Just now</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
