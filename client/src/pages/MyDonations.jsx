import { useState, useEffect } from 'react';
import apiClient from '../services/api.service';
import { FaTint, FaCalendarAlt, FaHeart, FaAward } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MyDonations = () => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, badge: 'NORMAL' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await apiClient.get('/donor/history');
                if (data.success) {
                    setStats({ total: data.data.total, badge: data.data.badge });
                    setHistory(data.data.history);
                }
            } catch (error) {
                console.error('Error fetching donation history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getBadgeDetails = (badge) => {
        switch (badge) {
            case 'BRONZE': return { name: 'Bronze Donor', img: '/assets/milestone_bronze.png', bg: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-950/10', color: 'text-orange-700 dark:text-orange-400' };
            case 'SILVER': return { name: 'Silver Donor', img: '/assets/milestone_silver.png', bg: 'from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900', color: 'text-gray-600 dark:text-gray-300' };
            case 'GOLD': return { name: 'Gold Donor', img: '/assets/milestone_gold.png', bg: 'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-950/10', color: 'text-yellow-700 dark:text-yellow-400' };
            case 'PLATINUM': return { name: 'Platinum Donor', img: '/assets/milestone_platinum.png', bg: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-950/10', color: 'text-blue-700 dark:text-blue-400' };
            case 'DIAMOND': return { name: 'Diamond Donor', img: '/assets/milestone_diamond.png', bg: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-950/10', color: 'text-purple-700 dark:text-purple-400' };
            case 'HERO': return { name: 'Hero Donor', img: '/assets/milestone_gold.png', bg: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-950/10', color: 'text-red-700 dark:text-red-400' };
            default: return { name: 'Aspiring Donor', img: null, bg: 'from-gray-50 to-white dark:from-gray-800 dark:to-gray-900', color: 'text-gray-500 dark:text-gray-400' };
        }
    };

    const badgeInfo = getBadgeDetails(stats.badge);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-red-100 dark:border-red-900/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header / Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                <div className="lg:col-span-2 bg-gradient-to-br from-red-600 to-red-900 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-red-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">Your Donation Journey</h1>
                        <p className="text-red-100 max-w-xl text-lg mb-8">Every drop counts. Thank you for being a hero. Track your life-saving contributions and milestones here.</p>

                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md self-start w-max px-6 py-4 rounded-2xl border border-white/20">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FaTint className="text-2xl text-red-100" />
                            </div>
                            <div>
                                <p className="text-sm text-red-200 font-medium uppercase tracking-wider mb-0.5">Total Donations</p>
                                <p className="text-3xl font-black text-white leading-none">{stats.total} <span className="text-lg font-medium text-red-200">times</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 bg-gradient-to-br ${badgeInfo.bg} flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">Current Milestone</p>

                        {badgeInfo.img ? (
                            <motion.img
                                initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                                src={badgeInfo.img} alt={badgeInfo.name} className="w-24 h-24 object-contain drop-shadow-xl mb-4 group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-500">
                                <FaAward className="text-4xl text-gray-400" />
                            </div>
                        )}

                        <h3 className={`text-2xl font-black ${badgeInfo.color}`}>{badgeInfo.name}</h3>
                    </div>
                </div>
            </motion.div>

            {/* Donation History Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FaCalendarAlt className="text-red-500" /> Donation Log
                    </h2>
                </div>

                {history.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
                    >
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <FaTint className="text-4xl text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Donations Yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                            Your journey to becoming a hero starts with a single step. Make your first donation today.
                        </p>
                        <button onClick={() => window.location.href = '/campaigns'} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/20 transform hover:-translate-y-0.5 transition-all">
                            Find a Campaign <FaHeart />
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {history.map((record, index) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                key={record.id}
                                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-xl hover:shadow-red-500/5 transition-all outline-none"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
                                        <FaTint className="text-xl" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-md">
                                        #{record.id.slice(0, 6).toUpperCase()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Blood Donation</h3>

                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                                    <FaCalendarAlt className="text-gray-400 dark:text-gray-500" />
                                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    {record.livesSaved > 0 ? (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Impact</span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-bold border border-green-100 dark:border-green-900/30">
                                                <FaHeart className="text-green-500 animate-pulse" />
                                                {record.livesSaved} Lives Saved
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between opacity-70">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold border border-gray-200 dark:border-gray-600">
                                                Pending Usage
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDonations;
