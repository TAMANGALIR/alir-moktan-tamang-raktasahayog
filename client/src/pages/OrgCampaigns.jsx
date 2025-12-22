import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaList, FaEye, FaEdit, FaTrash, FaBan, FaCreditCard } from 'react-icons/fa';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import CreateCampaignModal from '../components/campaign/CreateCampaignModal';
import Table from '../components/common/Table';
import apiClient from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import ActionDropdown from '../components/common/ActionDropdown';

const OrgCampaigns = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [cancelModal, setCancelModal] = useState({ isOpen: false, id: null, title: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0
    });

    const fetchCampaigns = async () => {
        try {
            const res = await apiClient.get('/campaigns/my-campaigns');
            setCampaigns(res.data);

            // Calculate stats
            const total = res.data.length;
            const pending = res.data.filter(c => c.status === 'PENDING').length;
            const approved = res.data.filter(c => c.status === 'APPROVED').length;
            const rejected = res.data.filter(c => c.status === 'REJECTED').length;
            const completed = res.data.filter(c => c.status === 'COMPLETED').length;

            setStats({ total, pending, approved, rejected, completed });
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [token]);

    const handleEdit = (campaign) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCampaign(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        setActionLoading(true);
        try {
            await apiClient.delete(`/campaigns/${deleteModal.id}`);
            toast.success('Campaign deleted successfully');
            fetchCampaigns();
        } catch (error) {
            toast.error('Failed to delete campaign');
        } finally {
            setDeleteModal({ isOpen: false, id: null });
            setActionLoading(false);
        }
    };

    const handleCancel = (campaign) => {
        setCancelModal({ isOpen: true, id: campaign.id, title: campaign.title });
    };

    const confirmCancel = async () => {
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/payments/cancel/${cancelModal.id}`);
            toast.success(res.data.message || 'Campaign cancelled');
            fetchCampaigns();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel campaign');
        } finally {
            setCancelModal({ isOpen: false, id: null, title: '' });
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PAYMENT_PENDING: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
            APPROVED: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
            REJECTED: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
            COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300',
            CANCELLED: 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-500 line-through',
        };
        const labels = {
            PAYMENT_PENDING: 'AWAITING PAYMENT',
            PENDING: 'PENDING',
            APPROVED: 'APPROVED',
            REJECTED: 'REJECTED',
            COMPLETED: 'COMPLETED',
            CANCELLED: 'CANCELLED',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.PENDING}`}>
                {labels[status] || status}
            </span>
        );
    };

    const filteredCampaigns = campaigns.filter(campaign =>
        filterStatus === 'ALL' || campaign.status === filterStatus
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setPage(1);
    }, [filterStatus]);

    // Table columns
    const columns = [
        {
            key: 'title',
            header: 'Campaign',
            className: 'min-w-[250px]',
            render: (_, row) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{row.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{row.description}</div>
                    {row.status === 'REJECTED' && row.rejectionReason && (
                        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                            <strong>Rejected:</strong> {row.rejectionReason}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'date',
            header: 'Date & Time',
            className: 'min-w-[180px]',
            render: (_, row) => (
                <div className="text-sm">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <FaCalendarAlt className="text-gray-400" />
                        {new Date(row.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                        <FaClock className="text-gray-400" />
                        {row.startTime} - {row.endTime}
                    </div>
                </div>
            )
        },
        {
            key: 'location',
            header: 'Location',
            className: 'min-w-[200px]',
            render: (val) => (
                <div
                    className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
                    title={val}
                >
                    {val ? val.split(',').slice(0, 2).join(', ') : '-'}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            className: 'min-w-[120px]',
            render: (val) => getStatusBadge(val)
        },
        {
            key: 'actions',
            header: '',
            className: 'w-[80px] text-right',
            render: (_, row) => (
                <div className="flex justify-end">
                    <ActionDropdown>
                        <button
                            onClick={() => navigate(`/org-dashboard/campaigns/${row.id}`)}
                            className="text-blue-600 dark:text-blue-400"
                        >
                            <FaEye /> View Details
                        </button>
                        {row.status === 'PAYMENT_PENDING' && (
                            <button
                                onClick={() => window.location.href = `/payment/${row.id}`}
                                className="text-purple-600 dark:text-purple-400"
                            >
                                <FaCreditCard /> Pay Now
                            </button>
                        )}
                        {(row.status === 'PENDING' || row.status === 'REJECTED') && (
                            <button
                                onClick={() => handleEdit(row)}
                                className="text-green-600 dark:text-green-400"
                            >
                                <FaEdit /> {row.status === 'REJECTED' ? 'Edit & Resubmit' : 'Edit Campaign'}
                            </button>
                        )}
                        {(row.status === 'PENDING' || row.status === 'REJECTED') && (
                            <button
                                onClick={() => handleDelete(row.id)}
                                className="text-red-600 dark:text-red-400"
                            >
                                <FaTrash /> Delete Campaign
                            </button>
                        )}
                        {(row.status === 'PAYMENT_PENDING' || row.status === 'PENDING') && (
                            <button
                                onClick={() => handleCancel(row)}
                                className="text-gray-500 dark:text-gray-400"
                            >
                                <FaBan /> Cancel Campaign
                            </button>
                        )}
                    </ActionDropdown>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div
                    onClick={() => setFilterStatus('ALL')}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'ALL' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                        </div>
                        <FaList className="text-xl text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <div
                    onClick={() => setFilterStatus('PENDING')}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'PENDING' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
                        </div>
                        <FaClock className="text-xl text-yellow-600 dark:text-yellow-400" />
                    </div>
                </div>

                <div
                    onClick={() => setFilterStatus('APPROVED')}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'APPROVED' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Approved</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</p>
                        </div>
                        <FaCheckCircle className="text-xl text-green-600 dark:text-green-400" />
                    </div>
                </div>

                <div
                    onClick={() => setFilterStatus('REJECTED')}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'REJECTED' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.rejected}</p>
                        </div>
                        <FaTimesCircle className="text-xl text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <div
                    onClick={() => setFilterStatus('COMPLETED')}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${filterStatus === 'COMPLETED' ? 'border-gray-500 ring-2 ring-gray-200' : 'border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed</p>
                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.completed}</p>
                        </div>
                        <FaCalendarAlt className="text-xl text-gray-600 dark:text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Organize and manage your blood donation drives.</p>
                </div>
                <Button onClick={handleCreate} variant="primary">
                    <FaPlus /> Create Campaign
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                {loading ? (
                    <div className="text-center py-10">Loading campaigns...</div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <FaCalendarAlt className="text-2xl text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Campaigns Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Try changing your filters or create a new one.</p>
                        <Button onClick={handleCreate} variant="primary">
                            Create Now
                        </Button>
                    </div>
                ) : (
                    <>
                        <Table
                            columns={columns}
                            data={paginatedCampaigns}
                            emptyMessage="No campaigns found"
                        />

                        {/* Pagination Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Show</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>per page</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600 dark:text-gray-300 px-3">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <CreateCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCampaignCreated={fetchCampaigns}
                initialData={selectedCampaign}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Delete Campaign"
                message="Are you sure you want to delete this campaign? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                icon={FaTrash}
                loading={actionLoading}
            />

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() => setCancelModal({ isOpen: false, id: null, title: '' })}
                onConfirm={confirmCancel}
                title="Cancel Campaign"
                message={
                    <>
                        <p>Are you sure you want to cancel <strong>"{cancelModal.title}"</strong>?</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            💰 If payment was made, it will be automatically refunded.
                        </p>
                    </>
                }
                confirmText="Cancel & Refund"
                cancelText="Keep Campaign"
                variant="warning"
                loading={actionLoading}
            />
        </div>
    );
};

export default OrgCampaigns;
