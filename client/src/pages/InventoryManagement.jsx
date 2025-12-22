import { useState, useEffect } from 'react';
import ModalPortal from '../components/common/ModalPortal';
import { FaTint, FaPlus, FaHistory, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';

const InventoryManagement = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        bloodGroup: 'A_POS',
        quantity: '',
        expiryDate: ''
    });

    const fetchInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/inventory', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setInventory(data.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/inventory/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                alert('Inventory updated successfully');
                setShowAddModal(false);
                fetchInventory();
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const getStatusColor = (quantity) => {
        if (quantity === 0) return 'text-red-600 bg-red-100';
        if (quantity < 5) return 'text-orange-600 bg-orange-100';
        return 'text-green-600 bg-green-100';
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;

    return (
        <div className="space-y-6 container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blood Inventory</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage blood stock levels for your district.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                >
                    <FaPlus /> Add Stock
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'].map(group => {
                    const stock = inventory.find(i => i.bloodGroup === group);
                    const quantity = stock ? stock.quantity : 0;
                    return (
                        <div key={group} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 font-bold">
                                    {group.replace('_POS', '+').replace('_NEG', '-')}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(quantity)}`}>
                                    {quantity === 0 ? 'Out of Stock' : quantity < 5 ? 'Low Stock' : 'Optimal'}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{quantity}</div>
                            <div className="text-sm text-gray-500 mt-1 font-medium italic">Units available</div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {showAddModal && (
                <ModalPortal>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                                <FaTint className="text-red-600" /> Add Blood Stock
                            </h2>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Group</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                                        value={formData.bloodGroup}
                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    >
                                        <option value="A_POS">A+</option>
                                        <option value="A_NEG">A-</option>
                                        <option value="B_POS">B+</option>
                                        <option value="B_NEG">B-</option>
                                        <option value="AB_POS">AB+</option>
                                        <option value="AB_NEG">AB-</option>
                                        <option value="O_POS">O+</option>
                                        <option value="O_NEG">O-</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity (Units)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Number of units"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                    >
                                        Save Stock
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default InventoryManagement;
