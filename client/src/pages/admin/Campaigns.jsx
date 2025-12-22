import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaUsers, FaTint, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import ActionDropdown from '../../components/common/ActionDropdown';

const Campaigns = () => {
    const campaigns = [
        {
            id: 1,
            title: 'Winter Blood Drive 2025',
            description: 'Help us meet the increased demand for blood during winter months',
            startDate: '2025-01-20',
            endDate: '2025-02-20',
            location: 'City General Hospital',
            target: 100,
            collected: 45,
            status: 'active',
            participants: 45,
        },
        {
            id: 2,
            title: 'Emergency O- Campaign',
            description: 'Critical shortage of O- blood type. Urgent donations needed',
            startDate: '2025-01-15',
            endDate: '2025-01-30',
            location: 'Red Cross Center',
            target: 50,
            collected: 32,
            status: 'active',
            participants: 32,
        },
        {
            id: 3,
            title: 'Community Health Fair',
            description: 'Annual health fair with blood donation drive',
            startDate: '2024-12-01',
            endDate: '2024-12-15',
            location: 'Community Center',
            target: 75,
            collected: 82,
            status: 'completed',
            participants: 82,
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            case 'completed':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
            case 'upcoming':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
        }
    };

    const getProgressPercentage = (collected, target) => {
        return Math.min((collected / target) * 100, 100);
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage blood donation campaigns</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all">
                    <FaPlus />
                    <span>New Campaign</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Campaigns</div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {campaigns.filter(c => c.status === 'active').length}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Participants</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {campaigns.reduce((sum, c) => sum + c.participants, 0)}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Units Collected</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {campaigns.reduce((sum, c) => sum + c.collected, 0)}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {campaigns.map((campaign, index) => (
                    <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4 flex-1">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                    <FaBullhorn className="text-white text-xl" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{campaign.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">{campaign.description}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                            <FaCalendarAlt className="text-red-600 dark:text-red-400" />
                                            <span>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                            <FaMapMarkerAlt className="text-red-600 dark:text-red-400" />
                                            <span>{campaign.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                            <FaUsers className="text-red-600 dark:text-red-400" />
                                            <span>{campaign.participants} participants</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end ml-4">
                                <ActionDropdown>
                                    <button className="text-blue-600 dark:text-blue-400">
                                        <FaEdit /> Edit Campaign
                                    </button>
                                    <button className="text-red-600 dark:text-red-400">
                                        <FaTrash /> Delete
                                    </button>
                                </ActionDropdown>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <FaTint className="text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Collection Progress</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {campaign.collected} / {campaign.target} units
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(getProgressPercentage(campaign.collected, campaign.target))}`}
                                    style={{ width: `${getProgressPercentage(campaign.collected, campaign.target)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{getProgressPercentage(campaign.collected, campaign.target).toFixed(0)}% Complete</span>
                                {campaign.collected >= campaign.target && (
                                    <span className="text-green-600 dark:text-green-400 font-medium">Target Achieved! 🎉</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Campaigns;
