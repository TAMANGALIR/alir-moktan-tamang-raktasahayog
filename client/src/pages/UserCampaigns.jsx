import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.service';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaBuilding, FaCheckCircle, FaSpinner, FaUsers, FaTint, FaHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import ConfirmModal from '../components/common/ConfirmModal';
import ModalPortal from '../components/common/ModalPortal';

const ESEWA_PAYMENT_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

const UserCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registrations, setRegistrations] = useState({}); // { campaignId: boolean }
    const { user } = useAuth();
    const [eligibility, setEligibility] = useState(null);
    const [registerModal, setRegisterModal] = useState({ isOpen: false, campaignId: null, campaignTitle: '' });
    const [registerLoading, setRegisterLoading] = useState(false);
    const [donateModal, setDonateModal] = useState({ isOpen: false, campaignId: null, campaignTitle: '' });
    const [donateAmount, setDonateAmount] = useState('');
    const [donateMessage, setDonateMessage] = useState('');
    const [donateLoading, setDonateLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [campaignsRes, eligibilityRes] = await Promise.all([
                apiClient.get('/campaigns/public'),
                apiClient.get('/donor/eligibility').catch(() => ({ data: { success: false } }))
            ]);

            setCampaigns(campaignsRes.data);
            if (eligibilityRes.data?.success) {
                setEligibility(eligibilityRes.data.data);
            }

            // Check registrations for all campaigns
            const regStatus = {};
            for (const camp of campaignsRes.data) {
                try {
                    const res = await apiClient.get(`/campaigns/${camp.id}/registration-status`);
                    regStatus[camp.id] = res.data.registered;
                } catch (e) {
                    // ignore
                }
            }
            setRegistrations(regStatus);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const openRegisterModal = (campaign) => {
        if (!eligibility?.eligible) {
            toast.error('You are currently not eligible to donate.');
            return;
        }
        setRegisterModal({ isOpen: true, campaignId: campaign.id, campaignTitle: campaign.title });
    };

    const handleRegister = async () => {
        setRegisterLoading(true);
        try {
            const res = await apiClient.post(`/campaigns/${registerModal.campaignId}/register`);
            if (res.data.success) {
                toast.success('Successfully registered!');
                setRegistrations(prev => ({ ...prev, [registerModal.campaignId]: true }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setRegisterModal({ isOpen: false, campaignId: null, campaignTitle: '' });
            setRegisterLoading(false);
        }
    };

    const openDonateModal = (campaign) => {
        setDonateModal({ isOpen: true, campaignId: campaign.id, campaignTitle: campaign.title });
        setDonateAmount('');
        setDonateMessage('');
    };

    const closeDonateModal = () => {
        setDonateModal({ isOpen: false, campaignId: null, campaignTitle: '' });
        setDonateAmount('');
        setDonateMessage('');
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
            const res = await apiClient.post(`/payments/donate/${donateModal.campaignId}`, {
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

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                        Active Campaigns
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                        Join upcoming donation drives in your area. Your single donation can help save up to 3 lives.
                    </p>
                </div>
                {eligibility && (
                    <div className={`shrink-0 px-6 py-4 rounded-2xl border ${eligibility.eligible ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30' : 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800/30'}`}>
                        <p className="text-xs uppercase tracking-wider font-bold mb-1 text-gray-500 dark:text-gray-400">Your Status</p>
                        <p className={`font-semibold flex items-center gap-2 ${eligibility.eligible ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                            {eligibility.eligible ? (
                                <><FaCheckCircle /> Eligible to Donate</>
                            ) : (
                                <><FaClock /> {eligibility.reason}</>
                            )}
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <FaBuilding className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Campaigns</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">There are no blood donation drives scheduled in your area right now. Please check back later.</p>
                    </div>
                ) : (
                    campaigns.map((campaign, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={campaign.id}
                            className="group flex flex-col bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Card Header/Banner */}
                            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                                {campaign.bannerUrl ? (
                                    <img
                                        src={campaign.bannerUrl}
                                        alt={campaign.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                                        <FaTint className="text-6xl text-white/20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                <div className="absolute top-4 right-4">
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 uppercase tracking-widest shadow-lg">
                                        Upcoming
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="text-xl font-black mb-1 leading-tight line-clamp-2 drop-shadow-md">{campaign.title}</h3>
                                    <div className="flex items-center text-red-100 text-sm font-medium drop-shadow-md">
                                        <FaBuilding className="mr-1.5 opacity-80" />
                                        <span className="truncate">{campaign.organizer.name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-grow flex flex-col">
                                <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-2 text-sm leading-relaxed flex-grow">
                                    {campaign.description}
                                </p>

                                <div className="space-y-4 className=mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-start text-sm">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0 mr-3 mt-0.5">
                                            <FaCalendarAlt />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {new Date(campaign.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400">{campaign.startTime} - {campaign.endTime}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start text-sm">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0 mr-3 mt-0.5">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white leading-tight mt-1.5">{campaign.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Participants + Donations indicator */}
                                <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100 dark:border-gray-700/50 px-2 mt-auto">
                                    <div className="flex items-center text-sm">
                                        <FaUsers className="text-gray-400 mr-2" />
                                        <span className="font-semibold text-gray-900 dark:text-white mr-1">{campaign._count?.registrations || 0}</span>
                                        <span className="text-gray-500">Registered</span>
                                    </div>
                                    {campaign.totalDonated > 0 && (
                                        <div className="flex items-center text-sm">
                                            <FaHeart className="text-pink-500 mr-1.5" />
                                            <span className="font-semibold text-gray-900 dark:text-white">Rs. {campaign.totalDonated.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    {registrations[campaign.id] ? (
                                        <button
                                            disabled
                                            className="w-full py-3.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-xl font-bold flex items-center justify-center cursor-default tracking-wide uppercase text-sm"
                                        >
                                            <FaCheckCircle className="mr-2 text-lg" /> Registered
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => openRegisterModal(campaign)}
                                            disabled={!eligibility?.eligible}
                                            className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center tracking-wide uppercase text-sm ${!eligibility?.eligible
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                                                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transform hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {eligibility?.eligible ? 'Register to Donate' : 'Not Eligible'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openDonateModal(campaign)}
                                        className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center tracking-wide text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/20 hover:shadow-pink-500/30 transform hover:-translate-y-0.5"
                                    >
                                        <FaHeart className="mr-2" /> Donate Money
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Registration Confirmation Modal */}
            <ConfirmModal
                isOpen={registerModal.isOpen}
                onClose={() => setRegisterModal({ isOpen: false, campaignId: null, campaignTitle: '' })}
                onConfirm={handleRegister}
                title="Register for Campaign"
                message={
                    <>
                        <p>Are you sure you want to register for <strong>"{registerModal.campaignTitle}"</strong>?</p>
                        <p className="text-xs text-gray-400 mt-2">You are committing to donate blood at this campaign.</p>
                    </>
                }
                confirmText="Yes, Register"
                cancelText="Not Now"
                variant="success"
                icon={FaTint}
                loading={registerLoading}
            />

            {/* Donate Money Modal */}
            {donateModal.isOpen && (
                <ModalPortal>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 animation-scale-up">
                            <div className="flex flex-col items-center mb-5">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center mb-3">
                                    <FaHeart className="h-7 w-7 text-pink-600 dark:text-pink-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Donate to Campaign</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                                    Support <strong>"{donateModal.campaignTitle}"</strong>
                                </p>
                            </div>

                            {/* Amount Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount (Rs.)</label>
                                <input
                                    type="number"
                                    min="100"
                                    max="100000"
                                    value={donateAmount}
                                    onChange={(e) => setDonateAmount(e.target.value)}
                                    placeholder="Enter amount (min Rs. 100)"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-lg font-semibold"
                                />
                                {/* Quick amount buttons */}
                                <div className="flex gap-2 mt-3">
                                    {[100, 250, 500, 1000].map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setDonateAmount(String(amt))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${donateAmount === String(amt)
                                                    ? 'bg-pink-600 text-white shadow-md'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                                                }`}
                                        >
                                            Rs. {amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Optional Message */}
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message (optional)</label>
                                <textarea
                                    value={donateMessage}
                                    onChange={(e) => setDonateMessage(e.target.value)}
                                    placeholder="Leave a kind message..."
                                    maxLength={200}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm resize-none"
                                />
                            </div>

                            {/* Payment Info */}
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl mb-5 border border-green-100 dark:border-green-800/30">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pay via</span>
                                <span className="font-bold text-green-700 dark:text-green-400">eSewa</span>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={closeDonateModal}
                                    disabled={donateLoading}
                                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDonate}
                                    disabled={donateLoading || !donateAmount}
                                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg shadow-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {donateLoading ? 'Processing...' : `Donate Rs. ${donateAmount || '0'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default UserCampaigns;
