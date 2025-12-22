import React, { useState, useEffect } from 'react';
import ModalPortal from '../components/common/ModalPortal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { getOrgAppointments, updateAppointmentStatus } from '../services/appointment.service';
import { FaCheck, FaTimes, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { Loader2, X } from 'lucide-react';
import ActionDropdown from '../components/common/ActionDropdown';

import socketService from '../services/socket.service';

const OrgAppointmentRequests = () => {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            const data = await getOrgAppointments();
            setRequests(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch appointment requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        const handleNewAppointment = (newAppt) => {
            setRequests(prev => [...prev, newAppt]);
            toast.success('New appointment request received!');
        };

        const handleStatusUpdate = (updatedAppt) => {
            setRequests(prev => prev.map(r => r.id === updatedAppt.id ? { ...r, status: updatedAppt.status } : r));
        };

        socketService.socket?.on('appointment_created', handleNewAppointment);
        socketService.socket?.on('appointment_updated', handleStatusUpdate); // Listen for own updates too

        return () => {
            socketService.socket?.off('appointment_created', handleNewAppointment);
            socketService.socket?.off('appointment_updated', handleStatusUpdate);
        };
    }, []);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState(''); // 'APPROVE', 'REJECT', 'RESCHEDULE'
    const [newDate, setNewDate] = useState('');

    const openModal = (req, type) => {
        setSelectedRequest(req);
        setActionType(type);
        setNewDate(req.scheduledAt ? new Date(req.scheduledAt).toISOString().slice(0, 16) : '');
        setIsModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedRequest) return;

        try {
            let status = 'APPROVED';
            let data = {};

            if (actionType === 'REJECT') status = 'REJECTED';
            if (actionType === 'RESCHEDULE') status = 'RESCHEDULED';

            // If just approving, we keep APPROVED status.
            if (actionType === 'APPROVE') status = 'APPROVED';
            if (actionType === 'COMPLETE') status = 'COMPLETED';


            if (actionType === 'RESCHEDULE') {
                data.scheduledAt = new Date(newDate).toISOString();
            }

            await updateAppointmentStatus(selectedRequest.id, status, data.scheduledAt); // Need to update service signature too
            toast.success(`Appointment ${status.toLowerCase()}`);
            setIsModalOpen(false);
            fetchRequests();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment Requests</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Incoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Donor</TableHead>
                                <TableHead>Blood Group</TableHead>
                                <TableHead>Scheduled For</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No appointment requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                    <FaUser className="text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{req.user.name}</p>
                                                    <p className="text-xs text-gray-500">{req.user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-bold">
                                                {req.user.donorProfile?.bloodGroup || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {new Date(req.scheduledAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(req.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{req.user.phone || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge className={
                                                req.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                        req.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                                                            req.status === 'RESCHEDULED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                                'bg-gray-100 text-gray-800'
                                            }>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'PENDING' && (
                                                <div className="flex justify-end space-x-2">
                                                    <ActionDropdown>
                                                        <button
                                                            onClick={() => openModal(req, 'APPROVE')}
                                                            className="text-green-600 dark:text-green-400"
                                                        >
                                                            <FaCheck /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(req, 'RESCHEDULE')}
                                                            className="text-blue-600 dark:text-blue-400"
                                                        >
                                                            <FaCalendarAlt /> Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(req, 'REJECT')}
                                                            className="text-red-600 dark:text-red-400"
                                                        >
                                                            <FaTimes /> Reject
                                                        </button>
                                                    </ActionDropdown>
                                                </div>
                                            )}

                                            {(req.status === 'APPROVED' || req.status === 'RESCHEDULED') && (
                                                <div className="flex justify-end space-x-2">
                                                    <ActionDropdown>
                                                        <button
                                                            onClick={() => openModal(req, 'COMPLETE')}
                                                            className="text-green-600 dark:text-green-400"
                                                        >
                                                            <FaCheck /> Mark Completed
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(req, 'RESCHEDULE')}
                                                            className="text-blue-600 dark:text-blue-400"
                                                        >
                                                            <FaCalendarAlt /> Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(req, 'REJECT')} // Or CANCEL
                                                            className="text-red-600 dark:text-red-400"
                                                        >
                                                            <FaTimes /> Cancel / Reject
                                                        </button>
                                                    </ActionDropdown>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ACTION MODAL */}
            {isModalOpen && (
                <ModalPortal>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md flex flex-col relative overflow-hidden animate-in fade-in zoom-in duration-200">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {actionType === 'APPROVE' && 'Confirm Approval'}
                                    {actionType === 'COMPLETE' && 'Complete Appointment'}
                                    {actionType === 'REJECT' && 'Reject Request'}
                                    {actionType === 'RESCHEDULE' && 'Reschedule Appointment'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {actionType === 'RESCHEDULE' ? (
                                    <div className="space-y-4 text-center">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl mb-4">
                                            <p className="text-sm">Please select a new date and time for this appointment. The donor will be notified of the change.</p>
                                        </div>
                                        <div className="text-left space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">New Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                value={newDate}
                                                onChange={(e) => setNewDate(e.target.value)}
                                                className="w-full border rounded-lg p-3 text-center dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 space-y-4">
                                        {actionType === 'APPROVE' && (
                                            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
                                                <FaCheck className="text-xl" />
                                            </div>
                                        )}
                                        {actionType === 'REJECT' && (
                                            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                                                <FaTimes className="text-xl" />
                                            </div>
                                        )}
                                        <p className="text-gray-600 dark:text-gray-300 text-base">
                                            Are you sure you want to {actionType.toLowerCase()} this appointment request? This action cannot be undone.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 border-none flex items-center justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirmAction}
                                    variant={actionType === 'REJECT' ? 'destructive' : 'primary'}
                                    className={`w-full sm:w-auto text-white shadow-md transition-transform active:scale-95 ${actionType === 'APPROVE' || actionType === 'COMPLETE' ? 'bg-green-600 hover:bg-green-700' :
                                        actionType === 'RESCHEDULE' ? 'bg-blue-600 hover:bg-blue-700' : ''
                                        }`}
                                >
                                    {actionType === 'RESCHEDULE' ? 'Save Changes' : 'Confirm Action'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};


export default OrgAppointmentRequests;
