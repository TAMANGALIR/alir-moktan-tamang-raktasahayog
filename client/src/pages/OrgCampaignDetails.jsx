import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api.service';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaDownload, FaPlus } from 'react-icons/fa';
import Table from '../components/common/Table';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OrgCampaignDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
    const [guestForm, setGuestForm] = useState({ name: '', bloodGroup: '', phone: '', email: '' });
    const [donationModal, setDonationModal] = useState({ isOpen: false, registrationId: null, volume: 450 });

    useEffect(() => {
        fetchCampaignDetails();
    }, [id]);

    const fetchCampaignDetails = async () => {
        try {
            const response = await apiClient.get(`/campaigns/${id}/details`);
            setCampaign(response.data);
        } catch (error) {
            console.error('Error fetching campaign details:', error);
            toast.error('Failed to load campaign details');
            navigate('/org-dashboard/campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (registrationId, newStatus) => {
        if (newStatus === 'DONATED') {
            setDonationModal({ isOpen: true, registrationId, volume: 450 });
            return;
        }
        await updateStatus(registrationId, newStatus);
    };

    const updateStatus = async (registrationId, status, volume = null) => {
        try {
            const payload = { status };
            if (volume) payload.volume = volume;

            const res = await apiClient.patch(`/campaigns/${id}/registrations/${registrationId}`, payload);
            setCampaign(prev => ({
                ...prev,
                registrations: prev.registrations.map(r => r.id === registrationId ? { ...r, status } : r)
            }));
            toast.success('Status updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleConfirmDonation = async (e) => {
        e.preventDefault();
        await updateStatus(donationModal.registrationId, 'DONATED', donationModal.volume);
        setDonationModal({ isOpen: false, registrationId: null, volume: 450 });
    };

    const handleAddGuest = async (e) => {
        e.preventDefault();
        try {
            const res = await apiClient.post(`/campaigns/${id}/registrations/guest`, guestForm);
            setCampaign(prev => ({
                ...prev,
                registrations: [...prev.registrations, res.data]
            }));
            setIsGuestModalOpen(false);
            setGuestForm({ name: '', bloodGroup: '', phone: '', email: '' });
            toast.success('Guest donor added');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add guest donor');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!campaign) return <div className="p-8 text-center">Campaign not found</div>;

    // Calculate Stats
    const totalRegistrations = campaign.registrations.length;
    const confirmedDonors = campaign.registrations.filter(r => r.status === 'DONATED').length;

    // Prepare Table Data
    const columns = [
        {
            key: 'name',
            header: 'Donor Name',
            className: 'min-w-[150px]',
            render: (_, row) => (
                <div>
                    <div>{row.user?.name || row.guestName || 'N/A'}</div>
                    {!row.userId && <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">Guest</span>}
                </div>
            )
        },
        {
            key: 'bloodGroup',
            header: 'Blood Group',
            className: 'min-w-[100px]',
            render: (_, row) => (row.user?.donorProfile?.bloodGroup?.replace('_', ' ') || row.guestBloodGroup || 'N/A')
        },
        {
            key: 'phone',
            header: 'Contact',
            className: 'min-w-[120px]',
            render: (_, row) => row.user?.phone || row.guestPhone || 'N/A'
        },
        {
            key: 'email',
            header: 'Email',
            className: 'min-w-[200px]',
            render: (_, row) => row.user?.email || row.guestEmail || 'N/A'
        },
        {
            key: 'registeredAt',
            header: 'Registered At',
            className: 'min-w-[120px]',
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            key: 'status',
            header: 'Status',
            className: 'w-[150px]',
            render: (_, row) => (
                <select
                    value={row.status || 'REGISTERED'}
                    onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
                    className={`text-xs p-1 rounded border ${row.status === 'DONATED' ? 'bg-green-50 text-green-700 border-green-200' :
                        row.status === 'NO_SHOW' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                >
                    <option value="REGISTERED">Registered</option>
                    <option value="DONATED">Donated</option>
                    <option value="NO_SHOW">No Show</option>
                </select>
            )
        }
    ];

    const handleExport = () => {
        if (!campaign.registrations || campaign.registrations.length === 0) {
            toast.error('No registrations to export');
            return;
        }

        const headers = ['Donor Name', 'Type', 'Blood Group', 'Contact', 'Email', 'Registered At', 'Status'];
        const rows = campaign.registrations.map(reg => [
            reg.user?.name || reg.guestName || 'N/A',
            reg.userId ? 'Registered User' : 'Guest',
            reg.user?.donorProfile?.bloodGroup?.replace('_', ' ') || reg.guestBloodGroup || 'N/A',
            reg.user?.phone || reg.guestPhone || 'N/A',
            reg.user?.email || reg.guestEmail || 'N/A',
            new Date(reg.registeredAt).toLocaleDateString(),
            reg.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${campaign.title.replace(/\s+/g, '_')}_registrations.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/org-dashboard/campaigns')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <FaArrowLeft className="mr-2" /> Back to Campaigns
            </button>

            {/* Campaign Banner */}
            {campaign.bannerUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <img
                        src={campaign.bannerUrl}
                        alt={campaign.title}
                        className="w-full h-64 object-cover"
                    />
                </div>
            )}

            {/* Campaign Header & Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{campaign.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl">{campaign.description}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-semibold text-sm
                        ${campaign.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {campaign.status}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                    <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                        <div className="p-3 bg-red-100 dark:bg-red-800/30 rounded-full mr-4">
                            <FaUsers className="text-red-600 dark:text-red-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Donated</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{confirmedDonors} / {totalRegistrations}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <FaCalendarAlt className="text-gray-400 text-xl mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-semibold">{new Date(campaign.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <FaClock className="text-gray-400 text-xl mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-semibold">{campaign.startTime} - {campaign.endTime}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <FaMapMarkerAlt className="text-gray-400 text-xl mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-semibold truncate">{campaign.location}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Location Map */}
            {campaign.latitude && campaign.longitude && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        <FaMapMarkerAlt className="inline mr-2" />
                        Campaign Location
                    </h2>
                    <div className="rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 relative z-0">
                        <MapContainer
                            center={[campaign.latitude, campaign.longitude]}
                            zoom={15}
                            style={{ height: '300px', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[campaign.latitude, campaign.longitude]} />
                        </MapContainer>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Coordinates: {campaign.latitude.toFixed(6)}, {campaign.longitude.toFixed(6)}
                    </p>
                </div>
            )}

            {/* Registered Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registered Donors</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsGuestModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                        >
                            <FaPlus className="mr-2" /> Add Walk-in Donor
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                        >
                            <FaDownload className="mr-2" /> Export List
                        </button>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={campaign.registrations}
                    emptyMessage="No users have registered for this campaign yet."
                />
            </div>

            {/* Donation Details Modal */}
            {donationModal.isOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Donation</h3>
                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            Please confirm the blood quantity collected. This will update the inventory.
                        </p>
                        <form onSubmit={handleConfirmDonation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity (ml)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={donationModal.volume}
                                    onChange={e => setDonationModal({ ...donationModal, volume: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDonationModal({ isOpen: false, registrationId: null, volume: 450 })}
                                    className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                                >
                                    Confirm & Update Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Add Guest Modal */}
            {isGuestModalOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Walk-in Donor</h3>
                        <form onSubmit={handleAddGuest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={guestForm.name}
                                    onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                    placeholder="Enter donor name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group *</label>
                                <select
                                    required
                                    value={guestForm.bloodGroup}
                                    onChange={e => setGuestForm({ ...guestForm, bloodGroup: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                >
                                    <option value="">Select Blood Group</option>
                                    {['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'].map(bg => (
                                        <option key={bg} value={bg}>{bg.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={guestForm.phone}
                                    onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={guestForm.email}
                                    onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGuestModalOpen(false)}
                                    className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                                >
                                    Add Donor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default OrgCampaignDetails;
