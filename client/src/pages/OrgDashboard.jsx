import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api.service';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaTint, FaBullhorn, FaCalendarAlt, FaAmbulance, FaPlus, FaArrowRight } from 'react-icons/fa';
import socketService from '../services/socket.service';
import { toast } from 'react-hot-toast';

const OrgDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        inventory: { totalStock: 0, pendingRequests: 0, recentUnits: [] },
        campaigns: { active: 0, total: 0 },
        appointments: { pending: 0, recent: [] },
        emergencies: { active: 0, recent: [] }
    });

    useEffect(() => {
        fetchDashboardData();

        // --- REAL-TIME LISTENERS ---
        if (socketService.connect(user?.id)) {
            // Join Org Room to receive specific updates
            if (user?.organizationId) {
                socketService.joinRoom(`ORG_${user.organizationId}`);
            }

            const handleAppointmentUpdate = () => {
                fetchDashboardData(); // Silently refresh data
            };

            const handleNotification = (data) => {
                if (data.type === 'EMERGENCY' || data.type === 'EMERGENCY_RESPONSE') {
                    fetchDashboardData();
                }
            };

            socketService.on('appointment_created', handleAppointmentUpdate);
            socketService.on('appointment_updated', handleAppointmentUpdate);
            socketService.on('notification', handleNotification);

            return () => {
                socketService.off('appointment_created');
                socketService.off('appointment_updated');
                socketService.off('notification');
            };
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const [inventoryRes, campaignsRes, appointmentsRes, emergenciesRes] = await Promise.allSettled([
                apiClient.get('/inventory'),
                apiClient.get('/campaigns/my-campaigns'),
                apiClient.get('/appointments/org-requests'),
                apiClient.get('/emergency/my-requests')
            ]);

            const inventoryData = inventoryRes.status === 'fulfilled' && inventoryRes.value.data.success ? inventoryRes.value.data : null;
            const campaignsData = campaignsRes.status === 'fulfilled' && campaignsRes.value.data.success ? campaignsRes.value.data.data : [];
            const appointmentsData = appointmentsRes.status === 'fulfilled' && appointmentsRes.value.data.data ? appointmentsRes.value.data.data : [];
            const emergenciesData = emergenciesRes.status === 'fulfilled' && emergenciesRes.value.data.success ? emergenciesRes.value.data.data : [];

            // Compute aggregations
            let totalStock = 0;
            let pendingReqsVolume = 0;
            if (inventoryData) {
                totalStock = inventoryData.data?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
                pendingReqsVolume = inventoryData.required?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
            }

            const activeCampaigns = campaignsData.filter(c => c.status === 'APPROVED' || c.status === 'ACTIVE').length;

            const pendingAppointments = appointmentsData.filter(a => a.status === 'PENDING').length;
            const sortedAppointments = [...appointmentsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

            const activeEmergencies = emergenciesData.filter(e => e.status === 'ACTIVE').length;
            const sortedEmergencies = [...emergenciesData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

            setDashboardData({
                inventory: {
                    totalStock,
                    pendingRequests: pendingReqsVolume,
                    recentUnits: inventoryData?.recentUnits || []
                },
                campaigns: {
                    active: activeCampaigns,
                    total: campaignsData.length
                },
                appointments: {
                    pending: pendingAppointments,
                    recent: sortedAppointments
                },
                emergencies: {
                    active: activeEmergencies,
                    recent: sortedEmergencies
                }
            });

        } catch (error) {
            console.error('Fetch dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Loader2 className="mr-2 h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
                    <p className="text-blue-200 mt-2 text-lg">Welcome back, {user?.name}</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => navigate('/org-dashboard/campaigns')} className="bg-white text-blue-900 hover:bg-blue-50">
                        <FaBullhorn className="mr-2" /> Campaigns
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                                <FaTint className="text-2xl text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Blood Stock</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.inventory.totalStock} ml</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                                <FaCalendarAlt className="text-2xl text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Appointments</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.appointments.pending}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                                <FaBullhorn className="text-2xl text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Campaigns</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.campaigns.active}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl">
                                <FaAmbulance className="text-2xl text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Emergencies</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.emergencies.active}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/org-dashboard/campaigns">
                        <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <FaPlus className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Create Campaign</h3>
                                    <p className="text-sm text-gray-500">Host a blood donation drive</p>
                                </div>
                            </div>
                            <FaArrowRight className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                        </div>
                    </Link>

                    <Link to="/org-dashboard/emergency">
                        <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <FaAmbulance className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Emergency Request</h3>
                                    <p className="text-sm text-gray-500">Broadcast an urgent need</p>
                                </div>
                            </div>
                            <FaArrowRight className="text-gray-300 group-hover:text-red-500 transition-colors" />
                        </div>
                    </Link>

                    <Link to="/org-dashboard/inventory">
                        <div className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FaTint className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Manage Inventory</h3>
                                    <p className="text-sm text-gray-500">Update blood stock levels</p>
                                </div>
                            </div>
                            <FaArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Appointments */}
                <Card className="shadow-sm border-gray-100 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle>Recent Appointments</CardTitle>
                            <CardDescription>Latest donor appointment requests</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/org-dashboard/appointments')} className="text-blue-600">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Donor Name</TableHead>
                                    <TableHead>Scheduled Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboardData.appointments.recent.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No recent appointments</TableCell>
                                    </TableRow>
                                ) : (
                                    dashboardData.appointments.recent.map((appt) => (
                                        <TableRow key={appt.id}>
                                            <TableCell className="font-medium">{appt.user?.name || 'Unknown'}</TableCell>
                                            <TableCell>{new Date(appt.scheduledAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    appt.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }>
                                                    {appt.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Emergencies */}
                <Card className="shadow-sm border-gray-100 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle>Active Emergencies</CardTitle>
                            <CardDescription>Recent urgent blood requests</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/org-dashboard/emergency')} className="text-blue-600">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient Name</TableHead>
                                    <TableHead>Blood Group</TableHead>
                                    <TableHead>Required By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboardData.emergencies.recent.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No active emergencies</TableCell>
                                    </TableRow>
                                ) : (
                                    dashboardData.emergencies.recent.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.patientName}</TableCell>
                                            <TableCell><Badge variant="destructive" className="font-bold bg-red-100 text-red-700 hover:bg-red-200">{req.bloodGroup}</Badge></TableCell>
                                            <TableCell>{new Date(req.requiredDate).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OrgDashboard;
