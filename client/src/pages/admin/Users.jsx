import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaSearch, FaFilter, FaEdit, FaTrash, FaBan, FaCheckCircle, FaTint } from 'react-icons/fa';
import Button from '../../components/common/Button';
import ActionDropdown from '../../components/common/ActionDropdown';

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER', bloodType: 'O+', status: 'active', donations: 5, lastDonation: '2024-12-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER', bloodType: 'A+', status: 'active', donations: 3, lastDonation: '2024-11-20' },
        { id: 3, name: 'Admin User', email: 'admin@life.com', role: 'ADMIN', bloodType: 'B+', status: 'active', donations: 0, lastDonation: null },
        { id: 4, name: 'Test User', email: 'tester99@life.com', role: 'USER', bloodType: 'O+', status: 'active', donations: 3, lastDonation: '2024-12-15' },
        { id: 5, name: 'Mike Johnson', email: 'mike@example.com', role: 'USER', bloodType: 'AB+', status: 'inactive', donations: 1, lastDonation: '2024-08-10' },
    ];

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getStatusColor = (status) => {
        return status === 'active'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    };

    const getRoleBadge = (role) => {
        return role === 'ADMIN'
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all registered users</p>
                </div>
                <Button variant="primary">
                    Add User
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="all">All Roles</option>
                        <option value="USER">Users</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Blood Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Donations</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user, index) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <FaTint className="text-red-600 dark:text-red-400" />
                                            <span className="text-sm text-gray-900 dark:text-white font-medium">{user.bloodType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{user.donations} times</div>
                                        {user.lastDonation && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Last: {new Date(user.lastDonation).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="flex justify-end pr-4">
                                            <ActionDropdown>
                                                <button className="text-blue-600 dark:text-blue-400">
                                                    <FaEdit /> Edit User
                                                </button>
                                                <button className="text-yellow-600 dark:text-yellow-400">
                                                    {user.status === 'active' ? <FaBan /> : <FaCheckCircle />}
                                                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button className="text-red-600 dark:text-red-400">
                                                    <FaTrash /> Delete
                                                </button>
                                            </ActionDropdown>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <FaUser className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
