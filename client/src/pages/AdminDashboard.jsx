import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaUsers, FaBuilding, FaClipboardList, FaTint, FaArrowRight } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        verifiedOrganizations: 0,
        pendingOrganizations: 0,
        totalCampaigns: 0,
        totalBloodUnits: 0
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/admin/dashboard-stats`);
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="mr-2 h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-900 to-slate-800 dark:from-gray-950 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
                    <p className="text-gray-300 mt-2 text-lg">Welcome back, {user?.name}. Here's an overview of the platform.</p>
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

                <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/organizations')}>
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

                <Card className="border-t-4 border-t-orange-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/campaigns')}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                                <FaClipboardList className="text-2xl text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Campaigns</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCampaigns}</h3>
                                </div>
                                <FaArrowRight className="text-gray-300" />
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

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Getting Started Guide */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Admin Quick Actions</h3>
                    <div className="space-y-4">
                        <div
                            className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            onClick={() => navigate('/admin/organizations')}
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mr-4">
                                <FaBuilding />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Verify Organizations</h4>
                                <p className="text-sm text-gray-500">Review and approve new organizations</p>
                            </div>
                        </div>
                        <div
                            className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            onClick={() => navigate('/admin/campaigns')}
                        >
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mr-4">
                                <FaClipboardList />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Manage Campaigns</h4>
                                <p className="text-sm text-gray-500">Oversee all active donation campaigns</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
