import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserShield, FaMapMarkerAlt, FaToggleOn, FaToggleOff, FaSave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        region: '',
        specialization: '',
        maxDailyRequests: 50,
        isAvailable: true
    });

    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const fetchAdminProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/admins/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setProfile(data.data);
                setFormData({
                    region: data.data.region || '',
                    specialization: data.data.specialization || '',
                    maxDailyRequests: data.data.maxDailyRequests || 50,
                    isAvailable: data.data.isAvailable
                });
            } else if (response.status === 404) {
                // Profile doesn't exist yet, that's fine for first login
                setMessage({ text: 'Please set up your admin profile', type: 'info' });
                setIsEditing(true); // Force edit mode
            }
        } catch (error) {
            console.error('Error fetching admin profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            const token = localStorage.getItem('token');
            const url = 'http://localhost:3000/api/admins/profile';
            const method = profile ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setProfile(data.data);
                setIsEditing(false);
                setMessage({ text: 'Profile saved successfully!', type: 'success' });
            } else {
                setMessage({ text: data.error || 'Failed to save profile', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network error occurred', type: 'error' });
        }
    };

    const toggleAvailability = async () => {
        if (!profile) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/admins/profile/toggle-availability', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setProfile(data.data);
                setFormData(prev => ({ ...prev, isAvailable: data.data.isAvailable }));
            }
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading admin profile...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your regional assignment and availability</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                            <FaUserShield className="text-3xl text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>

                    {!isEditing && profile ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Assigned Region</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{profile.region}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Specialization</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{profile.specialization || 'General'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Max Daily Requests</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{profile.maxDailyRequests}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 pt-4">
                                <span className="text-gray-600 dark:text-gray-400">Current Status</span>
                                <button
                                    onClick={toggleAvailability}
                                    className={`flex items-center space-x-2 px-3 py-1 rounded-full ${profile.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                >
                                    {profile.isAvailable ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                                    <span className="font-medium">{profile.isAvailable ? 'Available' : 'Unavailable'}</span>
                                </button>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full mt-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                                Edit Settings
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Region/City</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        placeholder="e.g. New York"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Donation requests from this city will be auto-assigned to you.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    placeholder="e.g. Rare Blood Types"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Daily Requests</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={formData.maxDailyRequests}
                                    onChange={(e) => setFormData({ ...formData, maxDailyRequests: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
                                >
                                    <FaSave /> <span>Save Profile</span>
                                </button>
                                {profile && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </motion.div>

                {/* Stats / Info */}
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300">
                        <h3 className="font-bold text-lg mb-2">How Auto-Assignment Works</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Requests are assigned based on the user's <strong>City</strong> matching your <strong>Region</strong>.</li>
                            <li>You must be marked as <strong>Available</strong> to receive new assignments.</li>
                            <li>If you reach your <strong>Max Daily Requests</strong>, new requests will remain Pending.</li>
                            <li>Prioritize <strong>Urgent</strong> requests in your dashboard.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
