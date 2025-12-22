import React, { useState, useEffect } from 'react';
import ModalPortal from '../components/common/ModalPortal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api.service';
import Table from '../components/common/Table';
import toast from 'react-hot-toast';
import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { FaCheck, FaTimes, FaExternalLinkAlt, FaEllipsisV, FaBan, FaRedo, FaSearch, FaUsers, FaBuilding, FaClipboardList, FaTint } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import socketService from '../services/socket.service';

const SuperAdminDashboard = () => {
    const { token } = useAuth();
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        verifiedOrganizations: 0,
        pendingOrganizations: 0,
        totalCampaigns: 0,
        totalBloodUnits: 0
    });
    const [filter, setFilter] = useState('PENDING'); // 'ALL', 'PENDING', 'VERIFIED', 'REJECTED'
    const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'HOSPITAL', 'BLOOD_BANK', 'NGO', 'OTHER'
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectModal, setRejectModal] = useState({ isOpen: false, orgId: null, reason: '' });
    const [approveModal, setApproveModal] = useState({ isOpen: false, orgId: null });

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const [orgsRes, statsRes] = await Promise.allSettled([
                apiClient.get(`/admin/organizations?status=${filter}&type=${typeFilter}&search=${searchTerm}`),
                apiClient.get(`/admin/dashboard-stats`)
            ]);

            if (orgsRes.status === 'fulfilled' && orgsRes.value.data.success) {
                setOrgs(orgsRes.value.data.data);
            }
            if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
                setStats(statsRes.value.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrgs();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [filter, typeFilter, searchTerm]);

    const handleRejectClick = (org) => {
        setRejectModal({ isOpen: true, orgId: org.id, reason: '' });
    };

    const confirmReject = async () => {
        if (!rejectModal.reason.trim()) return toast.error("Reason is required");

        await performAction(rejectModal.orgId, 'REJECTED', rejectModal.reason);
        setRejectModal({ isOpen: false, orgId: null, reason: '' });
    };

    const handleApproveClick = (id) => {
        setApproveModal({ isOpen: true, orgId: id });
    };

    const confirmApprove = async () => {
        await performAction(approveModal.orgId, 'VERIFIED');
        setApproveModal({ isOpen: false, orgId: null });
    };

    const performAction = async (id, status, reason = '') => {
        try {
            await apiClient.post(`/admin/verify/${id}`,
                { status, rejectionReason: reason }
            );
            toast.success(`Organization ${status.toLowerCase()} successfully`);
            fetchOrgs();
        } catch (error) {
            console.error("Action failed", error);
            toast.error(error.response?.data?.error || "Action failed");
        }
    };

    const handleApprove = (id) => {
        handleApproveClick(id);
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            VERIFIED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status}
            </span>
        );
    };

    // Action Dropdown Renderer
    const renderActions = (row) => {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex justify-center w-full px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
                    <FaEllipsisV />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md z-50">
                    {/* PENDING: Accept & Reject */}
                    {row.status === 'PENDING' && (
                        <>
                            <DropdownMenuItem onClick={() => handleApprove(row.id)} className="cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-900/20 flex items-center px-2 py-2 text-sm">
                                <FaCheck className="mr-2" /> Accept
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectClick(row)} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 flex items-center px-2 py-2 text-sm">
                                <FaTimes className="mr-2" /> Reject
                            </DropdownMenuItem>
                        </>
                    )}

                    {/* VERIFIED: Deactivate */}
                    {row.status === 'VERIFIED' && (
                        <DropdownMenuItem onClick={() => handleRejectClick(row)} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 flex items-center px-2 py-2 text-sm">
                            <FaBan className="mr-2" /> Deactivate
                        </DropdownMenuItem>
                    )}

                    {/* REJECTED: Activate */}
                    {row.status === 'REJECTED' && (
                        <DropdownMenuItem onClick={() => handleApprove(row.id)} className="cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-900/20 flex items-center px-2 py-2 text-sm">
                            <FaRedo className="mr-2" /> Activate
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const columns = [
        { key: 'name', header: 'Organization Name', sortable: true },
        { key: 'type', header: 'Type', sortable: true },
        {
            key: 'status',
            header: 'Status',
            render: (status) => getStatusBadge(status)
        },
        {
            key: 'location',
            header: 'Location',
            sortable: true,
            render: (val) => (
                <div title={val} className="truncate max-w-[200px]">
                    {val ? val.split(',').slice(0, 2).join(', ') : '-'}
                </div>
            )
        },
        {
            key: 'licenseUrl',
            header: 'License',
            render: (url) => (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <span className="mr-1">View</span> <FaExternalLinkAlt className="text-xs" />
                </a>
            )
        },
        {
            key: 'createdAt',
            header: 'Registered At',
            sortable: true,
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            key: 'actions',
            header: '',
            render: (_, row) => renderActions(row) // Custom Actions Column
        }
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-900 to-slate-800 dark:from-gray-950 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations Management</h1>
                    <p className="text-gray-300 mt-2 text-lg">Verify, activate, and deactivate organizations on the platform.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                                <FaUsers className="text-2xl text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Donors</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                                <FaBuilding className="text-2xl text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Organizations</p>
                                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200">
                                        {stats.pendingOrganizations} Pending
                                    </Badge>
                                </div>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.verifiedOrganizations}</h3>
                                    <span className="text-sm text-gray-500 font-medium">Verified</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                                <FaClipboardList className="text-2xl text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Campaigns</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCampaigns}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                                <FaTint className="text-2xl text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform Blood Units</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBloodUnits}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search organizations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 bg-white dark:bg-gray-800"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full sm:w-auto h-10">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap px-2">Status:</span>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[120px] h-8 border-none shadow-none focus:ring-0">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="VERIFIED">Verified</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm w-full sm:w-auto h-10">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap px-2">Type:</span>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[120px] h-8 border-none shadow-none focus:ring-0">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="HOSPITAL">Hospital</SelectItem>
                                <SelectItem value="BLOOD_BANK">Blood Bank</SelectItem>
                                <SelectItem value="NGO">NGO</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <Table
                    columns={columns}
                    data={orgs}
                    isLoading={loading}
                    emptyMessage="No organizations found."
                />
            </div>

            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <ModalPortal>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 animation-scale-up">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reject Organization</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Please provide a reason for rejection. This will be sent to the organization via email.
                            </p>
                            <textarea
                                value={rejectModal.reason}
                                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                                placeholder="Reason for rejection (e.g. Invalid document, blurry image...)"
                                className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                            />
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setRejectModal({ isOpen: false, orgId: null, reason: '' })}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Helper: Approve Modal */}
            <ConfirmModal
                isOpen={approveModal.isOpen}
                onClose={() => setApproveModal({ isOpen: false, orgId: null })}
                onConfirm={confirmApprove}
                title="Approve Organization"
                message="Are you sure you want to verify this organization? They will gain access to the platform immediately."
                confirmText="Confirm Approval"
                variant="success"
            />
        </div>
    );
};

export default SuperAdminDashboard;
