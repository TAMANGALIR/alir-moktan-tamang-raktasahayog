import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTint, FaPlus, FaMinus, FaExclamationTriangle } from 'react-icons/fa';

const BloodInventory = () => {
    const [inventory, setInventory] = useState([
        { bloodType: 'A+', units: 45, critical: 20, optimal: 50, status: 'optimal' },
        { bloodType: 'A-', units: 12, critical: 10, optimal: 30, status: 'low' },
        { bloodType: 'B+', units: 38, critical: 20, optimal: 50, status: 'optimal' },
        { bloodType: 'B-', units: 8, critical: 10, optimal: 30, status: 'critical' },
        { bloodType: 'AB+', units: 15, critical: 10, optimal: 25, status: 'low' },
        { bloodType: 'AB-', units: 5, critical: 5, optimal: 15, status: 'critical' },
        { bloodType: 'O+', units: 52, critical: 25, optimal: 60, status: 'optimal' },
        { bloodType: 'O-', units: 18, critical: 15, optimal: 40, status: 'low' },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            case 'low':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            case 'optimal':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'critical' || status === 'low') {
            return <FaExclamationTriangle className="text-sm" />;
        }
        return null;
    };

    const getProgressPercentage = (units, optimal) => {
        return Math.min((units / optimal) * 100, 100);
    };

    const getProgressColor = (status) => {
        switch (status) {
            case 'critical':
                return 'bg-red-500';
            case 'low':
                return 'bg-yellow-500';
            case 'optimal':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const stats = [
        { label: 'Total Units', value: inventory.reduce((sum, item) => sum + item.units, 0), color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Critical Types', value: inventory.filter(item => item.status === 'critical').length, color: 'text-red-600 dark:text-red-400' },
        { label: 'Low Stock', value: inventory.filter(item => item.status === 'low').length, color: 'text-yellow-600 dark:text-yellow-400' },
        { label: 'Optimal', value: inventory.filter(item => item.status === 'optimal').length, color: 'text-green-600 dark:text-green-400' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blood Inventory</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage blood stock levels</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</div>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {inventory.map((item, index) => (
                    <motion.div
                        key={item.bloodType}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                    <FaTint className="text-white text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.bloodType}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.units} units</div>
                                </div>
                            </div>
                            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                <span className="capitalize">{item.status}</span>
                            </span>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <span>Stock Level</span>
                                <span>{item.units}/{item.optimal}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(item.status)}`}
                                    style={{ width: `${getProgressPercentage(item.units, item.optimal)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>Critical: {item.critical}</span>
                                <span>Optimal: {item.optimal}</span>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                <FaPlus />
                                <span className="text-sm font-medium">Add</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                <FaMinus />
                                <span className="text-sm font-medium">Use</span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
                <div className="space-y-3">
                    {[
                        { type: 'O+', action: 'Used', amount: 2, date: '2024-12-20 10:30', user: 'City Hospital' },
                        { type: 'A-', action: 'Added', amount: 5, date: '2024-12-20 09:15', user: 'Blood Drive Campaign' },
                        { type: 'B+', action: 'Used', amount: 1, date: '2024-12-19 16:45', user: 'Emergency Request' },
                        { type: 'AB-', action: 'Added', amount: 3, date: '2024-12-19 14:20', user: 'Regular Donation' },
                    ].map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{transaction.type}</span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {transaction.action} {transaction.amount} unit{transaction.amount > 1 ? 's' : ''}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.user}</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.date}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BloodInventory;
