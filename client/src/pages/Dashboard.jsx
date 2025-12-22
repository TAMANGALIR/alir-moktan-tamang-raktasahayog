import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EmergencyAlerts from '../components/emergency/EmergencyAlerts';
import apiClient from '../services/api.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Award, Clock, ArrowRight, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, badge: 'NORMAL' });
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [historyRes, eligRes] = await Promise.all([
          apiClient.get('/donor/history'),
          apiClient.get('/donor/eligibility')
        ]);

        if (historyRes.data.success) {
          setStats({ total: historyRes.data.data.total, badge: historyRes.data.data.badge });
          setHistory(historyRes.data.data.history);
        }

        if (eligRes.data.success) {
          setEligibility(eligRes.data.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getBadgeDetails = (badge) => {
    switch (badge) {
      case 'BRONZE': return { name: 'Bronze Donor', img: '/assets/milestone_bronze.png', color: 'text-orange-700', bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20', border: 'border-orange-200 dark:border-orange-800' };
      case 'SILVER': return { name: 'Silver Donor', img: '/assets/milestone_silver.png', color: 'text-gray-600', bg: 'from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-700', border: 'border-gray-300 dark:border-gray-600' };
      case 'GOLD': return { name: 'Gold Donor', img: '/assets/milestone_gold.png', color: 'text-yellow-600', bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20', border: 'border-yellow-200 dark:border-yellow-800' };
      case 'PLATINUM': return { name: 'Platinum Donor', img: '/assets/milestone_platinum.png', color: 'text-blue-600', bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', border: 'border-blue-200 dark:border-blue-800' };
      case 'DIAMOND': return { name: 'Diamond Donor', img: '/assets/milestone_diamond.png', color: 'text-purple-600', bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20', border: 'border-purple-200 dark:border-purple-800' };
      case 'HERO': return { name: 'Hero Donor', img: '/assets/milestone_gold.png', color: 'text-red-600', bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20', border: 'border-red-200 dark:border-red-800' };
      default: return { name: 'Aspiring Donor', img: null, color: 'text-gray-500', bg: 'from-gray-50 to-white dark:from-gray-800 dark:to-gray-900', border: 'border-gray-200 dark:border-gray-700' };
    }
  };

  const badgeInfo = getBadgeDetails(stats.badge);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 to-red-900 p-8 sm:p-10 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
          <Heart className="w-96 h-96" fill="currentColor" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Hero'}! 👋
          </h1>
          <p className="text-red-100 text-lg sm:text-xl mb-6 leading-relaxed">
            Every drop counts. Your continued support saves lives and brings hope to families in need.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/appointments" className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
              <Droplet className="w-5 h-5 fill-current" /> Donate Now
            </Link>
            <Link to="/user-campaigns" className="bg-red-800/50 hover:bg-red-800 text-white border border-red-500/30 px-6 py-3 rounded-xl font-semibold transition-all backdrop-blur-sm flex items-center gap-2">
              Find Campaigns
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Emergency Alerts Section */}
      <EmergencyAlerts />

      {/* Donation Overview (3 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-900 border border-red-100 dark:border-red-900/30 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-red-600 uppercase tracking-wider">Total Impact</CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <Heart className="h-5 w-5 text-red-600 fill-current" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{stats.total}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Donations completed</p>
              <div className="mt-4 pt-4 border-t border-red-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  Approx. <strong className="text-gray-900 dark:text-white">{stats.total * 3} lives</strong> saved
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`h-full bg-gradient-to-br ${badgeInfo.bg} border ${badgeInfo.border} shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 z-10 relative">
              <CardTitle className={`text-sm font-semibold ${badgeInfo.color} uppercase tracking-wider`}>Donor Status</CardTitle>
              <Award className={`h-5 w-5 ${badgeInfo.color}`} />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-2 z-10 relative">
              {badgeInfo.img ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <img src={badgeInfo.img} alt={badgeInfo.name} className="h-20 w-20 object-contain drop-shadow-xl transform transition-transform duration-500 group-hover:scale-110 relative z-10" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-100/50 dark:bg-gray-800/50 flex items-center justify-center shadow-inner border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                  <Award className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <h3 className={`mt-4 font-black text-xl tracking-tight ${badgeInfo.color}`}>{badgeInfo.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium bg-white/50 dark:bg-gray-900/50 px-3 py-1 rounded-full backdrop-blur-sm">
                {stats.badge === 'NORMAL' ? 'Join the heroes club today!' : 'Thank you for your service!'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`h-full bg-gradient-to-br border shadow-md hover:shadow-xl transition-all duration-300 ${eligibility?.eligible ? 'from-green-50 to-white dark:from-green-900/10 dark:to-gray-900 border-green-200 dark:border-green-800/30' : 'from-yellow-50 to-white dark:from-yellow-900/10 dark:to-gray-900 border-yellow-200 dark:border-yellow-800/30'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-semibold uppercase tracking-wider ${eligibility?.eligible ? 'text-green-600' : 'text-yellow-600'}`}>Eligibility</CardTitle>
              <div className={`p-2 rounded-lg ${eligibility?.eligible ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600'}`}>
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-gray-200 rounded"></div></div></div></div>
              ) : eligibility ? (
                <>
                  <div className={`text-2xl font-black tracking-tight mb-2 ${eligibility.eligible ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {eligibility.eligible ? 'Ready to Donate' : 'On Cooldown'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    {eligibility.eligible
                      ? "You are currently eligible to save lives. Book an appointment today!"
                      : eligibility.reason}
                  </p>
                  {!eligibility.eligible && eligibility.nextEligibleDate && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Eligible Again On</p>
                      <p className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(eligibility.nextEligibleDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Update your donor profile to check eligibility.</p>
                  <Link to="/profile" className="text-red-600 text-sm font-semibold mt-2 inline-flex items-center hover:underline">
                    Go to Profile <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Donation History List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-red-500" />
              My Donation Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div></div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your journey begins here</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">You haven't made any donations yet. Every donation can save up to 3 lives. Ready to make an impact?</p>
                <Link to="/appointments" className="bg-red-600 text-white hover:bg-red-700 px-6 py-2.5 rounded-xl font-medium transition-colors inline-block shadow-lg shadow-red-500/20">
                  Book First Appointment
                </Link>
              </div>
            ) : (
              <div className="p-6">
                <div className="relative border-l-2 border-red-100 dark:border-red-900/50 pl-6 ml-4 space-y-8 py-2">
                  {history.map((record, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={record.id}
                      className="relative group cursor-default"
                    >
                      <div className="absolute -left-[35px] top-1.5 bg-white dark:bg-gray-900 border-2 border-red-500 h-4 w-4 rounded-full group-hover:scale-125 group-hover:bg-red-500 transition-all duration-300 ring-4 ring-white dark:ring-gray-800 z-10"></div>

                      <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300 relative overflow-hidden group-hover:border-red-100 dark:group-hover:border-red-900/50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                Blood Donation
                              </h4>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Completed</Badge>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm font-medium">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 self-start md:self-auto">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Impact</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Heart className="w-4 h-4 text-red-500 fill-current" /> {record.livesSaved || 3} Lives
                              </p>
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Record ID</p>
                              <p className="text-sm font-mono text-gray-600 dark:text-gray-400">#{record.id.slice(0, 6)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Timeline tail */}
                  <div className="absolute -left-[35px] bottom-0 bg-red-100 dark:bg-red-900/30 h-8 w-4 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-300 dark:bg-red-700"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
