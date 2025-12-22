import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaHeart, FaArrowLeft } from 'react-icons/fa';
import apiClient from '../services/api.service';

export default function DonateSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            verifyDonation(data);
        } else {
            setVerifying(false);
            setMessage('No payment data found.');
        }
    }, [searchParams]);

    const verifyDonation = async (data) => {
        try {
            const res = await apiClient.get(`/payments/esewa/verify-donation?data=${data}`);
            if (res.data.success) {
                setVerified(true);
                setMessage(res.data.message);
            } else {
                setMessage(res.data.message || 'Verification failed.');
            }
        } catch (error) {
            setMessage('Could not verify donation. Please contact support.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md text-center">
                {verifying ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verifying your donation...</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we confirm your payment.</p>
                    </div>
                ) : verified ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                            <FaHeart className="text-green-600 dark:text-green-400 text-4xl animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                            Thank You! 🎉
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{message}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                            Your generosity helps save lives. Every contribution makes a difference.
                        </p>
                        <button
                            onClick={() => navigate('/campaigns')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <FaArrowLeft /> Back to Campaigns
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
                            <FaCheckCircle className="text-red-600 dark:text-red-400 text-4xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verification Issue</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
                        <button
                            onClick={() => navigate('/campaigns')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-all"
                        >
                            <FaArrowLeft /> Back to Campaigns
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
