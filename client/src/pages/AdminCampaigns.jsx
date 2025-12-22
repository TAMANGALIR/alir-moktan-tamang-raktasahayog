import { useState, useEffect } from 'react';
import ModalPortal from '../components/common/ModalPortal';
import ConfirmModal from '../components/common/ConfirmModal';
import apiClient from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaTimes, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaList } from 'react-icons/fa';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const AdminCampaigns = () => {
    const { token } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('PENDING'); // Default to PENDING
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/campaigns/admin/all', {
                params: {
                    page,
                    limit: 5,
                    search: debouncedSearch,
                    status: filterStatus
                }
            });
            setCampaigns(res.data.data);
            setTotalPages(res.data.meta.totalPages);

            // Fetch stats for all statuses
            const statsPromises = [
                apiClient.get('/campaigns/admin/all', { params: { status: 'ALL', limit: 1 } }),
                apiClient.get('/campaigns/admin/all', { params: { status: 'PENDING', limit: 1 } }),
                apiClient.get('/campaigns/admin/all', { params: { status: 'APPROVED', limit: 1 } }),
                apiClient.get('/campaigns/admin/all', { params: { status: 'REJECTED', limit: 1 } })
            ];

            const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all(statsPromises);

            setStats({
                total: allRes.data.meta.total,
                pending: pendingRes.data.meta.total,
                approved: approvedRes.data.meta.total,
                rejected: rejectedRes.data.meta.total
            });
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    // Rejection Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [approveModal, setApproveModal] = useState({ isOpen: false, id: null });
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = (id) => {
        setApproveModal({ isOpen: true, id });
    };

    const confirmApprove = async () => {
        try {
            await apiClient.patch(`/campaigns/${approveModal.id}/status`, { status: 'APPROVED' });
            toast.success('Campaign approved successfully');
            fetchCampaigns();
        } catch (error) {
            console.error('Error approving campaign:', error);
            toast.error('Failed to approve campaign');
        } finally {
            setApproveModal({ isOpen: false, id: null });
        }
    };

    const openRejectModal = (id) => {
        setSelectedCampaignId(id);
        setRejectionReason('');
        setIsRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) return toast.error('Please provide a reason for rejection.');
        try {
            await apiClient.patch(`/campaigns/${selectedCampaignId}/status`, {
                status: 'REJECTED',
                reason: rejectionReason
            });
            toast.success('Campaign rejected');
            setIsRejectModalOpen(false);
            fetchCampaigns();
        } catch (error) {
            console.error('Error rejecting campaign:', error);
            toast.error('Failed to reject campaign');
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [token, page, debouncedSearch, filterStatus]);

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            APPROVED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED: 'bg-red-100 text-red-800 border-red-200',
            COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles.PENDING}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    onClick={() => { setFilterStatus('ALL'); setPage(1); }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'ALL' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <FaList className="text-2xl text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => { setFilterStatus('PENDING'); setPage(1); }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'PENDING' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <FaClock className="text-2xl text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => { setFilterStatus('APPROVED'); setPage(1); }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'APPROVED' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.approved}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <FaCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => { setFilterStatus('REJECTED'); setPage(1); }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'REJECTED' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.rejected}</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <FaTimesCircle className="text-2xl text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header & Filter Controls (Remains same) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Campaign Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Review and manage all blood donation drives.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search Title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 w-full md:w-48 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading requests...</div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <FaCheck className="mx-auto text-4xl text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Campaigns Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {campaigns.map((campaign) => (
                            <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.title}</h3>
                                        {getStatusBadge(campaign.status)}
                                        {/* Show Urgency if Pending */}
                                        {campaign.urgencyScore > 0 && campaign.status === 'PENDING' && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                                Urgency: {campaign.urgencyScore?.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        Organized by <span className="font-semibold">{campaign.organizer?.name}</span>
                                    </p>

                                    {/* Show Rejection Reason if Rejected */}
                                    {campaign.status === 'REJECTED' && campaign.rejectionReason && (
                                        <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-sm">
                                            <strong>Rejection Reason:</strong> {campaign.rejectionReason}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <FaCalendarAlt /> {new Date(campaign.date).toLocaleDateString()}
                                            {campaign.daysUntil != null && ` (${campaign.daysUntil} days left)`}
                                        </span>
                                        <span>Location: {campaign.location}</span>
                                    </div>
                                    {campaign.governmentPermitUrl && (
                                        <div className="mt-2">
                                            <a href={campaign.governmentPermitUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                <FaCheck className="text-xs" /> View Government Permit
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {campaign.status === 'PENDING' && (
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <Button
                                            onClick={() => handleApprove(campaign.id)}
                                            variant="success"
                                            className="flex items-center gap-2"
                                        >
                                            <FaCheck /> Approve
                                        </Button>
                                        <Button
                                            onClick={() => openRejectModal(campaign.id)}
                                            variant="outline"
                                            className="flex items-center gap-2"
                                        >
                                            <FaTimes /> Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>

                    {/* Rejection Reason Modal */}
                    {isRejectModalOpen && (
                        <ModalPortal>
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl animation-scale-up">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reject Campaign</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Please provide a reason for rejecting this campaign.</p>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 mb-4 focus:outline-none"
                                        rows="4"
                                        placeholder="e.g., Invalid permit document..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            onClick={() => setIsRejectModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors"
                                            onClick={handleRejectSubmit}
                                        >
                                            Confirm Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ModalPortal>
                    )}

                    {/* Approve Confirmation Modal */}
                    <ConfirmModal
                        isOpen={approveModal.isOpen}
                        onClose={() => setApproveModal({ isOpen: false, id: null })}
                        onConfirm={confirmApprove}
                        title="Approve Campaign"
                        message="Are you sure you want to approve this campaign? It will be visible to all donors."
                        confirmText="Approve"
                        variant="success"
                    />
                </div>
            )}
        </div>
    );
};

export default AdminCampaigns;
