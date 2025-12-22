import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../services/api.service';
import { toast } from 'react-hot-toast';
import ActionDropdown from '../../components/common/ActionDropdown';
import { FaUser, FaTint, FaMapMarkerAlt, FaCalendarAlt, FaFileAlt, FaCheck, FaTimes, FaEye, FaHourglassHalf } from 'react-icons/fa';

const DonationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewModal, setReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({
        action: '',
        reviewNotes: '',
        rejectionReason: '',
        scheduledAppointment: ''
    });

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = filter === 'all'
                ? 'http://localhost:3000/api/donation-requests/admin/all-pending'
                : `http://localhost:3000/api/donation-requests/admin/assigned?status=${filter}`;

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/donation-requests/admin/review/${selectedRequest.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();
            if (data.success) {
                setReviewModal(false);
                setSelectedRequest(null);
                setReviewData({
                    action: '',
                    reviewNotes: '',
                    rejectionReason: '',
                    scheduledAppointment: ''
                });
                fetchRequests();
            }
        } catch (error) {
            console.error('Review error:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
            ASSIGNED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            UNDER_REVIEW: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
            APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            NORMAL: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
            URGENT: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
            CRITICAL: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return colors[priority] || colors.NORMAL;
    };

    const formatBloodGroup = (bloodGroup) => {
        return bloodGroup.replace('_', '').replace('POS', '+').replace('NEG', '-');
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donation Requests</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Review and approve blood donation requests</p>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="all">All Requests</option>
                        <option value="PENDING">Pending</option>
                        <option value="ASSIGNED">Assigned to Me</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Requests</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{requests.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Review</div>
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {requests.filter(r => r.status === 'PENDING' || r.status === 'ASSIGNED').length}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Urgent</div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {requests.filter(r => r.priority === 'URGENT' || r.priority === 'CRITICAL').length}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {requests.map((request, index) => (
                    <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                    {formatBloodGroup(request.bloodGroup)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {request.user.name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {request.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                            {request.priority}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                            <FaMapMarkerAlt className="text-red-600 dark:text-red-400" />
                                            <span>{request.city}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                            <FaCalendarAlt className="text-red-600 dark:text-red-400" />
                                            <span>{new Date(request.preferredDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                            <FaUser className="text-red-600 dark:text-red-400" />
                                            <span>{request.user.email}</span>
                                        </div>
                                    </div>
                                    {request.medicalConditions && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                <strong>Medical Notes:</strong> {request.medicalConditions}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end ml-4">
                                <ActionDropdown>
                                    <button
                                        onClick={() => {
                                            setSelectedRequest(request);
                                            setReviewModal(true);
                                        }}
                                        className="text-blue-600 dark:text-blue-400"
                                    >
                                        <FaEye /> Review Request
                                    </button>
                                    {request.medicalReportUrl && (
                                        <button
                                            onClick={() => window.open(request.medicalReportUrl, '_blank')}
                                            className="text-purple-600 dark:text-purple-400"
                                        >
                                            <FaFileAlt /> View Medical Report
                                        </button>
                                    )}
                                </ActionDropdown>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {requests.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <FaHourglassHalf className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No requests found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {filter === 'all' ? 'No donation requests at the moment' : `No ${filter.toLowerCase()} requests`}
                    </p>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Donation Request</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Donor Name</label>
                                    <p className="text-gray-900 dark:text-white">{selectedRequest.user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group</label>
                                    <p className="text-gray-900 dark:text-white">{formatBloodGroup(selectedRequest.bloodGroup)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <p className="text-gray-900 dark:text-white">{selectedRequest.city}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Date</label>
                                    <p className="text-gray-900 dark:text-white">{new Date(selectedRequest.preferredDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Action *</label>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setReviewData({ ...reviewData, action: 'approve' })}
                                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${reviewData.action === 'approve'
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        <FaCheck className="inline mr-2" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setReviewData({ ...reviewData, action: 'reject' })}
                                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${reviewData.action === 'reject'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                            : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        <FaTimes className="inline mr-2" />
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {reviewData.action === 'approve' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Schedule Appointment *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={reviewData.scheduledAppointment}
                                        onChange={(e) => setReviewData({ ...reviewData, scheduledAppointment: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {reviewData.action === 'reject' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Rejection Reason *
                                    </label>
                                    <textarea
                                        value={reviewData.rejectionReason}
                                        onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Explain why this request is being rejected..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Review Notes
                                </label>
                                <textarea
                                    value={reviewData.reviewNotes}
                                    onChange={(e) => setReviewData({ ...reviewData, reviewNotes: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Internal notes about this review..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setReviewModal(false);
                                    setSelectedRequest(null);
                                    setReviewData({
                                        action: '',
                                        reviewNotes: '',
                                        rejectionReason: '',
                                        scheduledAppointment: ''
                                    });
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReview}
                                disabled={!reviewData.action || (reviewData.action === 'approve' && !reviewData.scheduledAppointment) || (reviewData.action === 'reject' && !reviewData.rejectionReason)}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Review
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DonationRequests;
