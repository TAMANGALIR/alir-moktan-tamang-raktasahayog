import { useState, useEffect } from 'react';
import { FaPlus, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaPhone, FaBullhorn, FaUsers } from 'react-icons/fa';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import ConfirmModal from '../components/common/ConfirmModal';
import apiClient from '../services/api.service';
import { toast } from 'react-hot-toast';
import ActionDropdown from '../components/common/ActionDropdown';
import CreateEmergencyModal from '../components/emergency/CreateEmergencyModal';
import ViewResponsesModal from '../components/emergency/ViewResponsesModal';
import socketService from '../services/socket.service';
import authService from '../services/auth.service';

const OrgEmergencyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewResponsesModalOpen, setIsViewResponsesModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null });
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [stats, setStats] = useState({
        active: 0,
        fulfilled: 0,
        expired: 0,
        total: 0
    });

    const fetchRequests = async () => {
        try {
            const res = await apiClient.get('/emergency/my-requests');
            setRequests(res.data.data);

            // Calculate stats
            const active = res.data.data.filter(r => r.status === 'ACTIVE').length;
            const fulfilled = res.data.data.filter(r => r.status === 'FULFILLED').length;
            const expired = res.data.data.filter(r => r.status === 'EXPIRED').length;

            setStats({
                active,
                fulfilled,
                expired,
                total: res.data.data.length
            });
        } catch (error) {
            console.error('Error fetching emergency requests:', error);
            toast.error('Failed to load emergency requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        // Connect to socket
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            socketService.connect(currentUser.id);

            // Listen for emergency responses
            socketService.on('EMERGENCY_RESPONSE', (data) => {
                fetchRequests();
                toast.success(data.message || 'New response received!', {
                    icon: '🔔',
                    duration: 5000
                });
            });
        }

        return () => {
            socketService.off('EMERGENCY_RESPONSE');
            // Don't disconnect here if other components use it, or manage centrally
            // But for now it's fine since we reconnect on mount
            socketService.disconnect();
        };
    }, []);

    const openConfirmModal = (type, id) => {
        setConfirmModal({ isOpen: true, type, id });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, type: '', id: null });
        setConfirmLoading(false);
    };

    const handleConfirmAction = async () => {
        const { type, id } = confirmModal;
        setConfirmLoading(true);
        try {
            if (type === 'fulfill') {
                await apiClient.patch(`/emergency/${id}/status`, { status: 'FULFILLED' });
                toast.success('Request marked as fulfilled');
            } else if (type === 'cancel') {
                await apiClient.patch(`/emergency/${id}/status`, { status: 'CANCELLED' });
                toast.success('Request cancelled successfully');
            } else if (type === 'rebroadcast') {
                const res = await apiClient.post(`/emergency/${id}/rebroadcast`);
                toast.success(`Re-broadcast sent! ${res.data.notificationsSent || 0} donors notified.`, {
                    duration: 5000,
                    icon: '📢'
                });
            }
            fetchRequests();
        } catch (error) {
            toast.error(`Failed to ${type} request`);
        } finally {
            closeConfirmModal();
        }
    };

    const handleViewResponses = (request) => {
        setSelectedRequest(request);
        setIsViewResponsesModalOpen(true);
    };

    const getUrgencyBadge = (level) => {
        const styles = {
            NORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            EMERGENCY: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[level]}`}>
                {level}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            FULFILLED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const columns = [
        {
            key: 'bloodGroup',
            header: 'Blood Type',
            className: 'min-w-[100px]',
            render: (val) => (
                <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                    {val.replace('_', ' ')}
                </span>
            )
        },
        {
            key: 'unitsNeeded',
            header: 'Units',
            className: 'min-w-[80px]',
            render: (val) => (
                <span className="font-semibold">{val} units</span>
            )
        },
        {
            key: 'location',
            header: 'Location',
            className: 'min-w-[200px]',
            render: (_, row) => (
                <div className="text-sm">
                    <div className="font-semibold">{row.hospitalName || (row.location ? row.location.split(',')[0] : 'Unknown')}</div>
                    <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1 line-clamp-1" title={row.location}>
                        <FaMapMarkerAlt className="text-xs shrink-0" />
                        {row.location ? row.location.split(',').slice(0, 2).join(', ') : '-'}
                    </div>
                </div>
            )
        },
        {
            key: 'urgencyLevel',
            header: 'Urgency',
            className: 'min-w-[120px]',
            render: (val) => getUrgencyBadge(val)
        },
        {
            key: 'responses',
            header: 'Responses',
            className: 'min-w-[100px]',
            render: (_, request) => (
                <div
                    className="flex items-center text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 group"
                    onClick={() => handleViewResponses(request)}
                    title="Click to view details"
                >
                    <FaUsers className="mr-2 text-gray-400 group-hover:text-blue-500" />
                    {request.responses?.length || 0}
                    {request.responses?.some(r => r.status === 'ACCEPTED') && (
                        <span className="ml-2 flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    )}
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
            className: 'min-w-[50px] text-right',
            render: (val, row) => (
                <div className="flex justify-end">
                    {row.status === 'ACTIVE' && (
                        <ActionDropdown>
                            <button
                                onClick={() => openConfirmModal('fulfill', row.id)}
                                className="text-green-600 dark:text-green-400"
                            >
                                <FaCheckCircle /> Mark Fulfilled
                            </button>
                            <button
                                onClick={() => openConfirmModal('rebroadcast', row.id)}
                                className="text-blue-600 dark:text-blue-400"
                            >
                                <FaBullhorn /> Re-broadcast
                            </button>
                            <button
                                onClick={() => openConfirmModal('cancel', row.id)}
                                className="text-red-600 dark:text-red-400"
                            >
                                <FaTimesCircle /> Cancel
                            </button>
                        </ActionDropdown>
                    )}
                </div>
            )
        },
        {
            key: 'createdAt',
            header: 'Created',
            className: 'min-w-[120px]',
            render: (val) => new Date(val).toLocaleString()
        }
    ];

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                        </div>
                        <FaExclamationTriangle className="text-2xl text-gray-600 dark:text-gray-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-green-500 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.active}</p>
                        </div>
                        <FaClock className="text-2xl text-green-600 dark:text-green-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-blue-500 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fulfilled</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.fulfilled}</p>
                        </div>
                        <FaCheckCircle className="text-2xl text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-500 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired</p>
                            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">{stats.expired}</p>
                        </div>
                        <FaTimesCircle className="text-2xl text-gray-600 dark:text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Blood Requests</h1>
                    <p className="text-gray-500 dark:text-gray-400">Broadcast urgent blood needs to nearby donors</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                    <FaPlus /> Create Emergency Request
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                {loading ? (
                    <div className="text-center py-10">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 flex  flex-col  justify-center items-center">
                        <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <FaExclamationTriangle className="text-2xl text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Emergency Requests</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first emergency blood request</p>
                        <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                            Create Now
                        </Button>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={requests}
                        emptyMessage="No emergency requests found"
                    />
                )}
            </div>

            <CreateEmergencyModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onRequestCreated={fetchRequests}
            />

            <ViewResponsesModal
                isOpen={isViewResponsesModalOpen}
                onClose={() => setIsViewResponsesModalOpen(false)}
                responses={selectedRequest?.responses || []}
            />

            {/* Confirmation Modals */}
            <ConfirmModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'fulfill'}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmAction}
                title="Mark as Fulfilled"
                message="Are you sure this emergency blood request has been fulfilled? This will close the request."
                confirmText="Mark Fulfilled"
                variant="success"
                loading={confirmLoading}
            />
            <ConfirmModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'cancel'}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmAction}
                title="Cancel Emergency Request"
                message="Are you sure you want to cancel this emergency request? Donors will no longer be notified."
                confirmText="Cancel Request"
                variant="danger"
                loading={confirmLoading}
            />
            <ConfirmModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'rebroadcast'}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmAction}
                title="Re-broadcast Request"
                message="This will send a new notification to all nearby eligible donors. Continue?"
                confirmText="Re-broadcast"
                cancelText="Not Now"
                variant="info"
                icon={FaBullhorn}
                loading={confirmLoading}
            />
        </div>
    );
};

export default OrgEmergencyRequests;
