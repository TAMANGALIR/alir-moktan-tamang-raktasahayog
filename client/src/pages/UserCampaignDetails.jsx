import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api.service';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaBuilding, FaCheckCircle, FaUsers, FaTint, FaHeart, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import ConfirmModal from '../components/common/ConfirmModal';
import ModalPortal from '../components/common/ModalPortal';
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

const ESEWA_PAYMENT_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

const UserCampaignDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);

    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);

    const [donateModalOpen, setDonateModalOpen] = useState(false);
    const [donateAmount, setDonateAmount] = useState('');
    const [donateMessage, setDonateMessage] = useState('');
    const [donateLoading, setDonateLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [campaignRes, eligibilityRes, regStatusRes] = await Promise.all([
                apiClient.get(`/campaigns/public/${id}`),
                apiClient.get('/donor/eligibility').catch(() => ({ data: { success: false } })),
                apiClient.get(`/campaigns/${id}/registration-status`).catch(() => ({ data: { registered: false } }))
            ]);

            setCampaign(campaignRes.data);

            if (eligibilityRes.data?.success) {
                setEligibility(eligibilityRes.data.data);
            }
            setIsRegistered(regStatusRes.data.registered);

        } catch (error) {
            console.error('Error fetching campaign details:', error);
            toast.error('Failed to load campaign details');
            navigate('/campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setRegisterLoading(true);
        try {
            const res = await apiClient.post(`/campaigns/${id}/register`);
            if (res.data.success) {
                toast.success('Successfully registered!');
                setIsRegistered(true);
                // Optionally update local count
                setCampaign(prev => ({
                    ...prev,
                    _count: {
                        ...prev._count,
                        registrations: (prev._count?.registrations || 0) + 1
                    }
                }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setRegisterModalOpen(false);
            setRegisterLoading(false);
        }
    };

    const handleDonate = async () => {
        const amount = parseFloat(donateAmount);
        if (!amount || amount < 100) {
            toast.error('Minimum donation is Rs. 100');
            return;
        }
        if (amount > 100000) {
            toast.error('Maximum donation is Rs. 1,00,000');
            return;
        }

        setDonateLoading(true);
        try {
            const res = await apiClient.post(`/payments/donate/${id}`, {
                amount,
                message: donateMessage || undefined
            });
            const data = res.data;

            // Auto-submit eSewa form
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = ESEWA_PAYMENT_URL;
            Object.entries(data.formData).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate donation');
            setDonateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-red-100 dark:border-red-900/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                    <FaTint className="absolute inset-0 m-auto text-red-500 animate-pulse text-2xl" />
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="text-center py-20">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Campaign Not Found</h3>
                <button
                    onClick={() => navigate('/campaigns')}
                    className="text-red-600 hover:text-red-700 font-medium"
                >
                    Back to Campaigns
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <button
                onClick={() => navigate('/campaigns')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium mb-4 w-fit"
            >
                <FaArrowLeft className="mr-2" /> Back to Campaigns
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
                {/* Banner */}
                <div className="relative h-64 md:h-80 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {campaign.bannerUrl ? (
                        <img
                            src={campaign.bannerUrl}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center">
                            <FaTint className="text-6xl text-white/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight drop-shadow-md">{campaign.title}</h1>
                            <div className="flex items-center text-red-100 text-sm md:text-base font-medium drop-shadow-md">
                                <FaBuilding className="mr-2 opacity-80" />
                                <span>Organized by {campaign.organizer.name}</span>
                            </div>
                        </div>
                        {eligibility && (
                            <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
                                <p className="text-xs uppercase tracking-wider font-bold mb-0.5 text-white/70">Your Status</p>
                                <p className={`font-semibold flex items-center gap-2 ${eligibility.eligible ? 'text-green-300' : 'text-yellow-300'}`}>
                                    {eligibility.eligible ? (
                                        <><FaCheckCircle /> Eligible to Donate</>
                                    ) : (
                                        <><FaClock /> {eligibility.reason}</>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-8">
                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About this Campaign</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {campaign.description}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0 mr-4">
                                    <FaCalendarAlt className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Date</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {new Date(campaign.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0 mr-4">
                                    <FaClock className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Time</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{campaign.startTime} - {campaign.endTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location Map */}
                        {(campaign.latitude && campaign.longitude) ? (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-red-500" /> Location
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">{campaign.location}</p>
                                <div className="rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 relative z-0 shadow-sm">
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
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-red-500" /> Location
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">{campaign.location}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Actions & Stats */}
                    <div className="lg:w-80 shrink-0 space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Impact So Far</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mr-3">
                                            <FaUsers />
                                        </div>
                                        <span>Registered Donors</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{campaign._count?.registrations || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 mr-3">
                                            <FaHeart />
                                        </div>
                                        <span>Amount Raised</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">Rs. {(campaign.totalDonated || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {isRegistered ? (
                                <button
                                    disabled
                                    className="w-full py-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-xl font-bold flex items-center justify-center cursor-default tracking-wide uppercase text-sm shadow-sm"
                                >
                                    <FaCheckCircle className="mr-2 text-lg" /> You are Registered
                                </button>
                            ) : (
                                <button
                                    onClick={() => setRegisterModalOpen(true)}
                                    disabled={!eligibility?.eligible}
                                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center tracking-wide uppercase text-sm ${!eligibility?.eligible
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transform hover:-translate-y-0.5'
                                        }`}
                                >
                                    {eligibility?.eligible ? 'Register to Donate Blood' : 'Not Eligible'}
                                </button>
                            )}

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setDonateModalOpen(true)}
                                className="w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center tracking-wide text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/20 hover:shadow-pink-500/30 transform hover:-translate-y-0.5"
                            >
                                <FaHeart className="mr-2" /> Support Financially
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Registration Confirmation Modal */}
            <ConfirmModal
                isOpen={registerModalOpen}
                onClose={() => setRegisterModalOpen(false)}
                onConfirm={handleRegister}
                title="Register for Campaign"
                message={
                    <>
                        <p>Are you sure you want to register for <strong>"{campaign.title}"</strong>?</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">You are committing to donate blood at this campaign location on the specified date.</p>
                    </>
                }
                confirmText="Yes, Register"
                cancelText="Not Now"
                variant="success"
                icon={FaTint}
                loading={registerLoading}
            />

            {/* Donate Money Modal */}
            {donateModalOpen && (
                <ModalPortal>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 animation-scale-up border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col items-center mb-6">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center mb-4 shadow-sm">
                                    <FaHeart className="h-7 w-7 text-pink-600 dark:text-pink-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">Make a Financial Donation</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                    Support <strong>{campaign.title}</strong>
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount (Rs.)</label>
                                    <input
                                        type="number"
                                        min="100"
                                        max="100000"
                                        value={donateAmount}
                                        onChange={(e) => setDonateAmount(e.target.value)}
                                        placeholder="Enter amount (min Rs. 100)"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-lg font-semibold transition-shadow"
                                    />
                                    {/* Quick amount buttons */}
                                    <div className="flex gap-2 mt-3">
                                        {[100, 250, 500, 1000].map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => setDonateAmount(String(amt))}
                                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${donateAmount === String(amt)
                                                    ? 'bg-pink-600 text-white shadow-md'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                                                    }`}
                                            >
                                                Rs. {amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message (optional)</label>
                                    <textarea
                                        value={donateMessage}
                                        onChange={(e) => setDonateMessage(e.target.value)}
                                        placeholder="Leave a message of support..."
                                        maxLength={200}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm resize-none transition-shadow"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                                        Secure Payment via
                                    </span>
                                    <span className="font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-md text-sm">eSewa</span>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setDonateModalOpen(false);
                                            setDonateAmount('');
                                            setDonateMessage('');
                                        }}
                                        disabled={donateLoading}
                                        className="px-5 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors disabled:opacity-50 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDonate}
                                        disabled={donateLoading || !donateAmount}
                                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {donateLoading ? 'Processing...' : `Donate Rs. ${donateAmount || '0'}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default UserCampaignDetails;
