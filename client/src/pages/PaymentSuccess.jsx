import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import apiClient from '../services/api.service';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        const data = searchParams.get('data');

        if (!data) {
            setStatus('failed');
            setMessage('No payment data received. Please try again.');
            return;
        }

        try {
            const res = await apiClient.get(`/payments/esewa/verify?data=${encodeURIComponent(data)}`);

            if (res.data.success) {
                setStatus('success');
                setMessage(res.data.message || 'Payment verified successfully!');
                setTimeout(() => {
                    navigate('/org-dashboard/campaigns');
                }, 3500);
            } else {
                setStatus('failed');
                setMessage(res.data.message || 'Payment verification failed.');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setStatus('failed');
            setMessage(error.response?.data?.message || 'Payment verification failed. Please contact support.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">

                    {status === 'verifying' && (
                        <>
                            <div className="mb-6 flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                    <FaSpinner className="animate-spin text-4xl text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifying Payment</h1>
                            <p className="text-gray-500 dark:text-gray-400">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mb-6 flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center border-2 border-green-500">
                                    <FaCheckCircle className="text-4xl text-green-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-2">{message}</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Your campaign has been submitted for admin approval.
                            </p>
                            <div className="mt-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                                    <FaSpinner className="animate-spin text-xs" />
                                    Redirecting to campaigns...
                                </div>
                            </div>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="mb-6 flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border-2 border-red-500">
                                    <FaTimesCircle className="text-4xl text-red-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
                            <button
                                onClick={() => navigate('/org-dashboard/campaigns')}
                                className="px-6 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all hover:scale-105 shadow-sm"
                            >
                                Back to Campaigns
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
