import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.service';
import toast from 'react-hot-toast';
import { Loader2, AlertTriangle, Droplet } from 'lucide-react';
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

const OrgInventory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState([]);
    const [requiredBlood, setRequiredBlood] = useState([]);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const { data } = await apiClient.get('/inventory');
            if (data.success) {
                setInventory(data.data);
                setRequiredBlood(data.required || []);
            }
        } catch (error) {
            console.error('Fetch inventory error:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="mr-2 h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    // Helper: Map display BG (A+) to Enum (A_POS)
    const toEnum = (bg) => {
        return bg.replace('+', '_POS').replace('-', '_NEG');
    };

    // Helper to find stock for a blood group
    const getStockQuantity = (bg) => {
        const enumBg = toEnum(bg);
        const item = inventory.find(i => i.bloodGroup === enumBg);
        return item ? item.quantity : 0;
    };

    // Helper to get status color based on stock vs requirement
    const getStockStatus = (bg, requiredQty) => {
        const currentStock = getStockQuantity(bg);
        if (currentStock < requiredQty) return 'destructive'; // Critical Low
        if (currentStock < 500) return 'warning'; // Low Warning
        return 'success';
    };

    // Calculate Stats
    const totalVolume = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStockCount = inventory.filter(i => i.quantity < 450).length;
    const mostAvailable = [...inventory].sort((a, b) => b.quantity - a.quantity)[0];

    // Helper: Map Enum (A_POS) to display (A+)
    const formatBloodGroup = (bg) => {
        return bg.replace('_POS', '+').replace('_NEG', '-');
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Blood Stock</CardTitle>
                        <Droplet className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVolume} ml</div>
                        <p className="text-xs text-muted-foreground">Across all blood groups</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">Blood groups below threshold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Available</CardTitle>
                        <Badge variant="outline">{mostAvailable ? formatBloodGroup(mostAvailable.bloodGroup) : '-'}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {mostAvailable ? mostAvailable.quantity : 0} ml
                        </div>
                        <p className="text-xs text-muted-foreground">Highest stock level</p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Section: Urgent Requirements */}
            {requiredBlood.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-red-700">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Urgent Requirements (Pending Requests)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {requiredBlood.map((req, idx) => {
                                const deficit = req.quantity - getStockQuantity(req.bloodGroup);
                                return (
                                    <div key={idx} className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-red-100">
                                        <Badge variant="outline" className="text-lg font-bold border-red-500 text-red-600">
                                            {formatBloodGroup(req.bloodGroup)}
                                        </Badge>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-600">Required: {req.quantity}ml</span>
                                            <span className={`text-xs font-semibold ${deficit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {deficit > 0 ? `Deficit: ${deficit}ml` : 'Stock Sufficient'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Droplet className="mr-2 h-5 w-5 text-red-500" />
                        Current Blood Stock
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Blood Group</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Units (approx)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Expires By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
                                const item = inventory.find(i => i.bloodGroup === toEnum(bg));
                                const qty = item ? item.quantity : 0;
                                const units = Math.floor(qty / 450);
                                const expiry = (item && qty > 0) ? new Date(item.expiryDate).toLocaleDateString() : '-';

                                let statusVariant = 'default';
                                let statusText = 'Good';

                                if (qty === 0) {
                                    statusVariant = 'destructive';
                                    statusText = 'Empty';
                                } else if (qty < 450) {
                                    statusVariant = 'destructive'; // Critical
                                    statusText = 'Critical';
                                } else if (qty < 1350) { // < 3 units
                                    statusVariant = 'warning';
                                    statusText = 'Low Stock';
                                } else if (qty > 4500) { // > 10 units
                                    statusVariant = 'outline'; // Using outline for abundance/neutral
                                    statusText = 'Abundant';
                                } else {
                                    statusVariant = 'success';
                                    statusText = 'Available';
                                }

                                return (
                                    <TableRow key={bg}>
                                        <TableCell className="font-medium">
                                            <Badge variant="secondary" className="text-md">{bg}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono">{qty} ml</TableCell>
                                        <TableCell className="font-mono">{units} units</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant}>
                                                {statusText}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{expiry}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/org-dashboard/inventory/${encodeURIComponent(bg)}`)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
                <div className="px-6 pb-4 text-xs text-muted-foreground italic">
                    * 1 Unit ≈ 450ml. Status based on standard utilization metrics.
                </div>
            </Card>

        </div>
    );
};

export default OrgInventory;
