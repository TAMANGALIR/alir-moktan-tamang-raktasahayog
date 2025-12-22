import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCheck, FaTimes, FaBullhorn, FaMapMarkerAlt, FaTint, FaWhatsapp } from 'react-icons/fa';
import RejectionModal from '../components/modals/RejectionModal';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/requests/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id, status, reason = null) => {
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const body = { status };
            if (reason) body.rejectionReason = reason;

            const response = await fetch(`http://localhost:3000/api/requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.success) {
                fetchRequests();
                if (status === 'REJECTED') {
                    setIsRejectModalOpen(false);
                    setSelectedRequestId(null);
                }
                // Handle Broadcast -> WhatsApp Redirect
                if (status === 'SEARCHING') {
                    const req = requests.find(r => r.id === id);
                    if (req) {
                        const message = `URGENT: ${req.bloodGroup} Blood needed at ${req.donationCenter}, ${req.location}. Request by: ${req.user.name}. Priority: ${req.priority}. Please help!`;
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                    }
                }
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Something went wrong');
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectModal = (id) => {
        setSelectedRequestId(id);
        setIsRejectModalOpen(true);
    };

    // Filter Logic
    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
        const matchesSearch = req.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6 container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donation Requests</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and allocate blood requests.</p>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patient or location..."
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="SEARCHING">Searching</option>
                        <option value="REJECTED">Declined</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Patient Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Requirement</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-white">{req.user.name}</span>
                                            <span className="text-xs text-gray-500">{req.location}</span>
                                            <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {req.bloodGroup}
                                            </span>
                                            <span className={`text-xs font-bold ${req.priority === 'CRITICAL' ? 'text-red-600' : 'text-gray-500'}`}>
                                                {req.priority}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{req.donationCenter}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'SEARCHING' ? 'bg-blue-100 text-blue-800' :
                                                        req.status === 'REJECTED' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.status === 'PENDING' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs font-medium transition-colors"
                                                >
                                                    <FaCheck /> Allocate
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(req.id, 'SEARCHING')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs font-medium transition-colors"
                                                >
                                                    <FaWhatsapp /> Broadcast
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(req.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Decline"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        )}
                                        {req.status === 'SEARCHING' && (
                                            <button
                                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs font-medium transition-colors"
                                            >
                                                <FaCheck /> Mark Found
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No requests matching filters found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RejectionModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={(reason) => handleUpdateStatus(selectedRequestId, 'REJECTED', reason)}
                loading={actionLoading}
            />
        </div>
    );
};

export default AdminRequests;
