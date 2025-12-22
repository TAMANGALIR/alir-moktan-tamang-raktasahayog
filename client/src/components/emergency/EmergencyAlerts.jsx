import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaMapMarkerAlt, FaPhone, FaHospital, FaClock, FaCheckCircle } from 'react-icons/fa';
import apiClient from '../../services/api.service';
import { toast } from 'react-hot-toast';

import Button from '../common/Button';
import socketService from '../../services/socket.service';
import authService from '../../services/auth.service';
import ResponseModal from './ResponseModal';

const EmergencyAlerts = () => {
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

    const fetchEmergencies = async () => {
        try {
            const res = await apiClient.get('/emergency/active');
            const newEmergencies = res.data.data;

            // Show toast for new emergencies
            if (emergencies.length > 0 && newEmergencies.length > emergencies.length) {
                const newest = newEmergencies[0];
                toast.error(
                    `🚨 URGENT: ${newest.bloodGroup.replace('_', ' ')} blood needed at ${newest.hospitalName || newest.location}!`,
                    {
                        duration: 10000,
                        icon: '🚨',
                        style: {
                            background: '#FEE2E2',
                            color: '#991B1B',
                            fontWeight: 'bold'
                        }
                    }
                );
            }

            setEmergencies(newEmergencies);
        } catch (error) {
            console.error('Error fetching emergencies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmergencies();

        // Connect to socket
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            socketService.connect(currentUser.id);

            // Listen for notifications
            socketService.on('notification', (data) => {
                if (data.type === 'EMERGENCY') {
                    // Refresh data
                    fetchEmergencies();

                    // Show toast immediately (even if polling hasn't caught it yet)
                    // Note: fetchEmergencies might also show a toast, but that's fine or we can optimize
                }
            });
        }

        // Poll for new emergencies every 30 seconds (fallback)
        const interval = setInterval(fetchEmergencies, 30000);

        return () => {
            clearInterval(interval);
            socketService.off('notification');
            socketService.disconnect();
        };
    }, []);

    const initiateResponse = (emergency) => {
        setSelectedEmergency(emergency);
        setIsResponseModalOpen(true);
    };

    const handleConfirmResponse = async ({ note, estimatedArrival }) => {
        if (!selectedEmergency) return;

        await handleRespond(selectedEmergency.id, 'ACCEPTED', note, estimatedArrival);
        setIsResponseModalOpen(false);
        setSelectedEmergency(null);
    };

    const handleRespond = async (emergencyId, status, notes = '', estimatedArrival = null) => {
        try {
            await apiClient.post(`/emergency/${emergencyId}/respond`, {
                status,
                notes: status === 'ACCEPTED' ? notes : 'Unable to help at this time',
                estimatedArrival
            });

            toast.success(
                status === 'ACCEPTED'
                    ? '✅ Response sent! The organization has been notified.'
                    : 'Response recorded.',
                { duration: 5000 }
            );

            fetchEmergencies();
        } catch (error) {
            toast.error('Failed to send response');
        }
    };

    const getUrgencyColor = (level) => {
        const colors = {
            NORMAL: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
            HIGH: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
            EMERGENCY: 'border-red-500 bg-red-50 dark:bg-red-900/20'
        };
        return colors[level] || colors.EMERGENCY;
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (emergencies.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <FaExclamationTriangle className="text-2xl text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Blood Requests</h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No active emergency requests at the moment.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-2xl text-red-600 dark:text-red-400" />
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Blood Requests</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emergencies.length} active emergency request{emergencies.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div className="space-y-4">
                {emergencies.map((emergency) => (
                    <div
                        key={emergency.id}
                        className={`rounded-xl border-2 ${getUrgencyColor(emergency.urgencyLevel)} p-6 shadow-lg animate-pulse-slow`}
                    >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {emergency.bloodGroup.replace('_', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100">
                                        {emergency.unitsNeeded} Unit{emergency.unitsNeeded !== 1 ? 's' : ''} Needed
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${emergency.urgencyLevel === 'EMERGENCY' ? 'bg-red-600 text-white' :
                                            emergency.urgencyLevel === 'HIGH' ? 'bg-orange-600 text-white' :
                                                'bg-blue-600 text-white'
                                            }`}>
                                            {emergency.urgencyLevel}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            <FaClock className="inline mr-1" />
                                            {getTimeRemaining(emergency.expiresAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {emergency.distance && (
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        ~{emergency.distance}km
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">from you</div>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-start gap-3">
                                <FaHospital className="text-red-600 dark:text-red-400 mt-1" />
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Hospital/Location</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {emergency.hospitalName || emergency.location}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-xs" />
                                        {emergency.location}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FaPhone className="text-red-600 dark:text-red-400 mt-1" />
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Contact Person</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {emergency.contactPerson}
                                    </div>
                                    <a
                                        href={`tel:${emergency.contactPhone}`}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {emergency.contactPhone}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Custom Message */}
                        {emergency.message && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                    "{emergency.message}"
                                </p>
                            </div>
                        )}

                        {/* Organization Info */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Requested by: <span className="font-semibold">{emergency.organization.name}</span>
                        </div>

                        {/* Actions */}
                        {emergency.hasResponded ? (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <FaCheckCircle className="text-green-600 dark:text-green-400" />
                                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                    You've already responded to this request
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={() => initiateResponse(emergency)}
                                    className="flex-1"
                                >
                                    ✓ I Can Help - Accept Request
                                </Button>
                                <Button
                                    onClick={() => handleRespond(emergency.id, 'DECLINED')}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Unable to Help
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>


            <ResponseModal
                isOpen={isResponseModalOpen}
                onClose={() => setIsResponseModalOpen(false)}
                onConfirm={handleConfirmResponse}
            />
        </div>
    );
};

export default EmergencyAlerts;
