import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTrash } from 'react-icons/fa';

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'critical',
            title: 'Critical Blood Shortage',
            message: 'O- blood type is critically low. Only 5 units remaining.',
            time: '5 minutes ago',
            read: false,
        },
        {
            id: 2,
            type: 'warning',
            title: 'Low Stock Alert',
            message: 'A- blood type is running low. Current stock: 12 units.',
            time: '1 hour ago',
            read: false,
        },
        {
            id: 3,
            type: 'success',
            title: 'Campaign Target Achieved',
            message: 'Community Health Fair campaign has exceeded its target!',
            time: '2 hours ago',
            read: true,
        },
        {
            id: 4,
            type: 'info',
            title: 'New Appointment Request',
            message: 'John Doe has requested an appointment for January 15, 2025.',
            time: '3 hours ago',
            read: true,
        },
        {
            id: 5,
            type: 'success',
            title: 'Donation Completed',
            message: 'Test User successfully donated 450ml of O+ blood.',
            time: '5 hours ago',
            read: true,
        },
    ]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'critical':
                return <FaExclamationTriangle className="text-red-600 dark:text-red-400" />;
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400" />;
            case 'success':
                return <FaCheckCircle className="text-green-600 dark:text-green-400" />;
            case 'info':
                return <FaInfoCircle className="text-blue-600 dark:text-blue-400" />;
            default:
                return <FaBell className="text-gray-600 dark:text-gray-400" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'critical':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            default:
                return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notif => notif.id !== id));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                        Mark All as Read
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{notifications.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unread</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{unreadCount}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Critical</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {notifications.filter(n => n.type === 'critical').length}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Warnings</div>
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {notifications.filter(n => n.type === 'warning').length}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {notifications.map((notification, index) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-lg border p-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'shadow-md' : ''
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{notification.message}</p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                        title="Mark as read"
                                    >
                                        <FaCheckCircle />
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {notifications.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <FaBell className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No notifications
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        You're all caught up! New notifications will appear here.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Notifications;
