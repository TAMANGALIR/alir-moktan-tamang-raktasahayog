import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaArrowLeft, FaTint, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import apiClient from '../services/api.service';
import { toast } from 'react-hot-toast';

const ESEWA_PAYMENT_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

export default function PaymentPage() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        fetchCampaign();
    }, [campaignId]);

    const fetchCampaign = async () => {
        try {
            const res = await apiClient.get(`/campaigns/${campaignId}/details`);
            setCampaign(res.data);
        } catch (error) {
            toast.error('Failed to load campaign details');
            navigate('/org-dashboard/campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setPaying(true);
        try {
            const res = await apiClient.post(`/payments/initiate/${campaignId}`, { provider: 'ESEWA' });
            const data = res.data;

            // Create and submit a hidden form for eSewa
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
            console.error('Payment initiation failed:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-lg">
                {/* Back button */}
                <button
                    onClick={() => navigate('/org-dashboard/campaigns')}
                    className="flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <FaArrowLeft /> Back to Campaigns
                </button>

                {/* Payment Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 text-center bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <FaShieldAlt className="text-red-600 dark:text-red-400" />
                            <span className="text-xs font-semibold tracking-widest uppercase text-red-600 dark:text-red-400">
                                Secure Payment
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Campaign Registration Fee</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            One-time fee to submit your campaign for approval
                        </p>
                    </div>

                    {/* Campaign Info */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                <FaTint className="text-red-600 dark:text-red-400 text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Campaign</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{campaign?.title}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {campaign?.date && (
                                        <span className="flex items-center gap-1">
                                            <FaCalendarAlt className="text-xs" />
                                            {new Date(campaign.date).toLocaleDateString()}
                                        </span>
                                    )}
                                    {campaign?.location && (
                                        <span className="flex items-center gap-1 truncate">
                                            <FaMapMarkerAlt className="text-xs" />
                                            {campaign.location.split(',')[0]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Amount to Pay</span>
                            <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                                Rs. 250
                            </span>
                        </div>
                    </div>

                    {/* eSewa Payment Button */}
                    <div className="p-6">
                        <button
                            onClick={handlePayment}
                            disabled={paying}
                            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl text-white font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #60BB46, #4a9e34)' }}
                        >
                            {paying ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                                        style={{ background: 'rgba(255,255,255,0.2)' }}>
                                        eS
                                    </div>
                                    Pay with eSewa
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                            🔒 Your payment is secured. Refund available if campaign is cancelled or rejected.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
