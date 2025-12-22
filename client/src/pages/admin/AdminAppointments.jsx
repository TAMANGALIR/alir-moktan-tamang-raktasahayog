import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaCheckCircle, FaTimes, FaHourglassHalf } from 'react-icons/fa';

const AdminAppointments = () => {
    const [activeTab, setActiveTab] = useState('pending');

    const appointments = {
        pending: [
            { id: 1, donor: 'John Doe', bloodType: 'O+', date: '2025-01-15', time: '10:00 AM', location: 'City General Hospital', phone: '+1 234-567-8901' },
            { id: 2, donor: 'Jane Smith', bloodType: 'A+', date: '2025-01-16', time: '2:00 PM', location: 'Red Cross Center', phone: '+1 234-567-8902' },
            { id: 3, donor: 'Mike Johnson', bloodType: 'B+', date: '2025-01-17', time: '11:00 AM', location: 'Community Blood Drive', phone: '+1 234-567-8903' },
        ],
        confirmed: [
            { id: 4, donor: 'Sarah Williams', bloodType: 'AB+', date: '2025-01-18', time: '9:00 AM', location: 'City General Hospital', phone: '+1 234-567-8904' },
            { id: 5, donor: 'Tom Brown', bloodType: 'O-', date: '2025-01-19', time: '3:00 PM', location: 'Red Cross Center', phone: '+1 234-567-8905' },
        ],
        completed: [
            { id: 6, donor: 'Test User', bloodType: 'O+', date: '2024-12-15', time: '11:00 AM', location: 'City General Hospital', phone: '+1 234-567-8906', units: 450 },
            { id: 7, donor: 'Emily Davis', bloodType: 'A-', date: '2024-12-10', time: '2:00 PM', location: 'Community Blood Drive', phone: '+1 234-567-8907', units: 450 },
        ],
    };

    const getTabCount = (tab) => appointments[tab]?.length || 0;

    const getBloodTypeColor = (bloodType) => {
        const colors = {
            'A+': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            'A-': 'bg-red-200 dark:bg-red-800/30 text-red-800 dark:text-red-300',
            'B+': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
            'B-': 'bg-orange-200 dark:bg-orange-800/30 text-orange-800 dark:text-orange-300',
            'AB+': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
            'AB-': 'bg-purple-200 dark:bg-purple-800/30 text-purple-800 dark:text-purple-300',
            'O+': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'O-': 'bg-blue-200 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300',
        };
        return colors[bloodType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage donation appointments</p>
            </div>

            <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'pending'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <FaHourglassHalf />
                        <span>Pending</span>
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                            {getTabCount('pending')}
                        </span>
                    </div>
                    {activeTab === 'pending' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('confirmed')}
                    className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'confirmed'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <FaCheckCircle />
                        <span>Confirmed</span>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                            {getTabCount('confirmed')}
                        </span>
                    </div>
                    {activeTab === 'confirmed' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'completed'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <FaCheckCircle />
                        <span>Completed</span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                            {getTabCount('completed')}
                        </span>
                    </div>
                    {activeTab === 'completed' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"></div>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appointments[activeTab]?.map((appointment, index) => (
                    <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                                    {appointment.donor.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.donor}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{appointment.phone}</div>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBloodTypeColor(appointment.bloodType)}`}>
                                {appointment.bloodType}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <FaCalendarAlt className="text-red-600 dark:text-red-400" />
                                <span className="text-sm">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <FaClock className="text-red-600 dark:text-red-400" />
                                <span className="text-sm">{appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <FaMapMarkerAlt className="text-red-600 dark:text-red-400" />
                                <span className="text-sm">{appointment.location}</span>
                            </div>
                            {appointment.units && (
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                    <FaCheckCircle className="text-green-600 dark:text-green-400" />
                                    <span className="text-sm">Collected: {appointment.units}ml</span>
                                </div>
                            )}
                        </div>

                        {activeTab === 'pending' && (
                            <div className="flex space-x-2">
                                <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                                    <FaCheckCircle />
                                    <span>Confirm</span>
                                </button>
                                <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                                    <FaTimes />
                                    <span>Reject</span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'confirmed' && (
                            <div className="flex space-x-2">
                                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Mark as Completed
                                </button>
                                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {appointments[activeTab]?.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <FaCalendarAlt className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No {activeTab} appointments
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {activeTab === 'pending' && 'New appointment requests will appear here'}
                        {activeTab === 'confirmed' && 'Confirmed appointments will appear here'}
                        {activeTab === 'completed' && 'Completed appointments will appear here'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;
