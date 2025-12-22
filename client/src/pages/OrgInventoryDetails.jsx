import React, { useState, useEffect } from 'react';
import ModalPortal from '../components/common/ModalPortal';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api.service';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Calendar, User, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const OrgInventoryDetails = () => {
    const { bloodGroup } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);

    // Safely decode
    const decodedBg = bloodGroup ? decodeURIComponent(bloodGroup) : '-';

    useEffect(() => {
        if (bloodGroup) fetchDetails();
    }, [bloodGroup]);

    const fetchDetails = async () => {
        try {
            const { data } = await apiClient.get(`/inventory/${encodeURIComponent(decodedBg)}`);
            if (data.success) {
                setStats(data.stock || { quantity: 0 });
                setHistory(data.history || []);
            }
        } catch (error) {
            console.error('Fetch details error:', error);
            toast.error('Failed to load blood details');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const [modal, setModal] = useState({
        isOpen: false,
        type: null, // 'SINGLE' | 'BATCH'
        unitId: null,
        qty: ''
    });

    const openModal = (type, unitId = null) => {
        setModal({ isOpen: true, type, unitId, qty: '' });
    };

    const closeModal = () => {
        setModal({ isOpen: false, type: null, unitId: null, qty: '' });
    };

    const handleConfirm = async () => {
        try {
            if (modal.type === 'SINGLE') {
                const { data } = await apiClient.post('/inventory/use', { unitId: modal.unitId });
                if (data.success) {
                    toast.success('Unit marked as used! Donor notified.');
                    fetchDetails();
                }
            } else if (modal.type === 'BATCH') {
                const quantity = parseInt(modal.qty);
                if (!quantity || isNaN(quantity) || quantity <= 0) {
                    toast.error('Please enter a valid quantity');
                    return;
                }
                const { data } = await apiClient.post('/inventory/use', {
                    bloodGroup: decodedBg,
                    quantity: quantity
                });
                if (data.success) {
                    toast.success(data.message);
                    fetchDetails();
                }
            }
            closeModal();
        } catch (error) {
            console.error('Action error:', error);
            const msg = error.response?.data?.error || 'Failed to process request';
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/org-dashboard/inventory')}>
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Inventory
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Blood Group: <span className="text-red-600">{decodedBg}</span>
                    </h1>
                </div>
                <Button onClick={() => openModal('BATCH')} className="bg-red-600 hover:bg-red-700">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Quick Use (Batch)
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                        <Badge variant="outline" className="text-lg font-bold">{decodedBg}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{stats?.quantity || 0} ml</div>
                        <p className="text-xs text-muted-foreground">Currently in stock</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Units</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {history.filter(h => h.status === 'AVAILABLE').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Ready for use</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Units Used</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {history.filter(h => h.status === 'USED').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Patient transfusions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Stock History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Source (Donor)</TableHead>
                                <TableHead>Volume</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Used For</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">No history found</TableCell>
                                </TableRow>
                            ) : (
                                history.map((unit) => (
                                    <TableRow key={unit.id}>
                                        <TableCell>{new Date(unit.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{unit.donor?.name || unit.guestName || <em className="text-gray-400">Guest</em>}</TableCell>
                                        <TableCell>{unit.volume} ml</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                unit.status === 'AVAILABLE' ? 'success' :
                                                    unit.status === 'USED' ? 'default' :
                                                        'destructive' // Expired/Discarded
                                            }>
                                                {unit.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {unit.usedFor?.user?.name ? (
                                                <span className="font-semibold text-blue-600">{unit.usedFor.user.name}</span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {new Date(unit.expiryDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {unit.status === 'AVAILABLE' && (
                                                <Button size="sm" onClick={() => openModal('SINGLE', unit.id)}>
                                                    Mark Used
                                                </Button>
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
            {modal.isOpen && (
                <ModalPortal>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm mx-4 flex flex-col items-center">
                            <h2 className="text-xl font-bold mb-4 text-center">
                                {modal.type === 'BATCH' ? 'Batch Use Units' : 'Confirm Action'}
                            </h2>

                            <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
                                {modal.type === 'BATCH'
                                    ? `How many units of ${decodedBg} do you want to mark as USED?`
                                    : 'Are you sure you want to mark this specific unit as USED? The donor will be notified.'}
                            </p>

                            {modal.type === 'BATCH' && (
                                <div className="w-full mb-6">
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 text-center">
                                        Quantity (Units)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={modal.qty}
                                        onChange={(e) => setModal({ ...modal, qty: e.target.value })}
                                        className="w-full border rounded-lg p-3 text-center text-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-red-500"
                                        placeholder="e.g. 2"
                                    />
                                </div>
                            )}

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 py-3 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-transform active:scale-95"
                                >
                                    Confirm Use
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default OrgInventoryDetails;
