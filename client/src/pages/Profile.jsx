import { NEPALI_DISTRICTS } from '../constants/nepaliLocations';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCalendarAlt, FaPhone, FaTint, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaHeartbeat, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../components/common/Button';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api.service';

const Profile = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDonorForm, setShowDonorForm] = useState(false);
    const [donorProfile, setDonorProfile] = useState(null);
    const [eligibility, setEligibility] = useState(null);

    // User Profile Form
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    // Donor Profile Form
    const [donorData, setDonorData] = useState({
        bloodGroup: '',
        location: '',
        latitude: '',
        longitude: '',
        weight: '',
        dateOfBirth: '',
        hasDiseases: false,
        lastDonationDate: ''
    });
    const [locationLoading, setLocationLoading] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported or permission denied.");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    const address = data.address || {};
                    const city = address.city || address.town || address.village || address.county || '';
                    const district = address.district || address.state_district || '';

                    const formattedLocation = district ? district : (city ? city : data.display_name.split(',')[0]);

                    setDonorData(prev => ({
                        ...prev,
                        location: formattedLocation,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                    }));
                } catch (err) {
                    console.error("Geocoding fetch error:", err);
                    setDonorData(prev => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                    }));
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                alert("Unable to retrieve location. Please check browser permissions.");
                setLocationLoading(false);
            }
        );
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const userRes = await apiClient.get('/user');
            const userData = userRes.data;

            if (userData.success) {
                setFormData({
                    name: userData.data.name || '',
                    email: userData.data.email || '',
                    phone: userData.data.phone || ''
                });
                if (userData.data.donorProfile) {
                    setDonorProfile(userData.data.donorProfile);
                    setDonorData({
                        bloodGroup: userData.data.donorProfile.bloodGroup,
                        location: userData.data.donorProfile.location,
                        latitude: userData.data.donorProfile.latitude || '',
                        longitude: userData.data.donorProfile.longitude || '',
                        weight: userData.data.donorProfile.weight || '',
                        dateOfBirth: userData.data.donorProfile.dateOfBirth ? new Date(userData.data.donorProfile.dateOfBirth).toISOString().split('T')[0] : '',
                        hasDiseases: userData.data.donorProfile.hasDiseases || false,
                        lastDonationDate: userData.data.donorProfile.lastDonationDate ? new Date(userData.data.donorProfile.lastDonationDate).toISOString().split('T')[0] : ''
                    });
                }
            }

            if (userData.data.donorProfile) {
                const eligRes = await apiClient.get('/donor/eligibility');
                const eligData = eligRes.data;
                if (eligData.success) {
                    setEligibility(eligData.data);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserUpdate = async () => {
        try {
            const response = await apiClient.put('/user', {
                name: formData.name,
                phone: formData.phone
            });
            const data = response.data;
            if (data.success) {
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleDonorUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/donor', donorData);
            const data = response.data;
            if (data.success) {
                setDonorProfile(data.data);
                setEligibility(data.eligibility);
                setShowDonorForm(false);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Donor update error:', error);
            alert('Failed to update profile');
        }
    };

    const bloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
    const displayBloodType = (type) => type?.replace('_', '').replace('POS', '+').replace('NEG', '-');

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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">My Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Manage your personal and donor information</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-900/50 hover:shadow-md transition-all self-start"
                    >
                        <FaEdit className="text-red-500" /> Edit App Profile
                    </button>
                )}
                {isEditing && (
                    <div className="flex space-x-3 self-start">
                        <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all">
                            <FaTimes /> Cancel
                        </button>
                        <button onClick={handleUserUpdate} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all transform hover:-translate-y-0.5">
                            <FaSave /> Save Changes
                        </button>
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Details Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1 space-y-8"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                                <FaUser />
                            </div>
                            Account Details
                        </h2>

                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        placeholder="Your full name"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                                    <input
                                        type="email"
                                        disabled
                                        value={formData.email}
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        placeholder="Your mobile number"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Donor Profile Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 min-h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                                    <FaHeartbeat className="text-2xl" />
                                </div>
                                Donor Profile
                            </h2>
                            {donorProfile && !showDonorForm && (
                                <button
                                    onClick={() => setShowDonorForm(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                                >
                                    <FaEdit /> Update Donor Info
                                </button>
                            )}
                        </div>

                        {!donorProfile && !showDonorForm && (
                            <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <div className="w-24 h-24 mx-auto bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                                    <FaHeartbeat className="text-5xl text-red-500 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Give the Gift of Life</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">You haven't registered as a blood donor yet. Register now to save lives and track your impact.</p>
                                <button
                                    onClick={() => setShowDonorForm(true)}
                                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center mx-auto gap-3 text-lg"
                                >
                                    <FaTint /> Become a Donor Today
                                </button>
                            </div>
                        )}

                        {donorProfile && !showDonorForm && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-red-500 to-red-700 p-6 rounded-2xl text-center text-white shadow-lg shadow-red-500/20 relative overflow-hidden">
                                        <div className="absolute right-0 bottom-0 text-white/10 text-6xl -mr-2 -mb-2">
                                            <FaTint />
                                        </div>
                                        <span className="block text-sm text-red-100 font-medium uppercase tracking-wider mb-2">Blood Group</span>
                                        <span className="text-4xl font-black relative z-10">{displayBloodType(donorProfile.bloodGroup)}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl text-center">
                                        <span className="block text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-2">Status</span>
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">{donorProfile.badge}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl text-center">
                                        <span className="block text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-2">Total Donations</span>
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">{donorProfile.totalDonations}</span>
                                    </div>
                                </div>

                                {eligibility && (
                                    <div className={`p-6 rounded-2xl flex items-start space-x-4 border ${eligibility.eligible ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'}`}>
                                        <div className={`p-3 rounded-full shrink-0 ${eligibility.eligible ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600'}`}>
                                            {eligibility.eligible ? <FaCheckCircle className="text-xl" /> : <FaExclamationTriangle className="text-xl" />}
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-bold mb-1 ${eligibility.eligible ? 'text-green-800 dark:text-green-400' : 'text-yellow-800 dark:text-yellow-400'}`}>
                                                {eligibility.eligible ? "Eligible to Donate" : "Not Currently Eligible"}
                                            </h4>
                                            <p className={`text-sm ${eligibility.eligible ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                                                {eligibility.eligible
                                                    ? "You meet all criteria and can currently register for donation campaigns."
                                                    : eligibility.reason}
                                            </p>
                                            {!eligibility.eligible && eligibility.nextEligibleDate && (
                                                <div className="mt-3 inline-block px-3 py-1.5 bg-white/50 dark:bg-black/20 rounded-lg border border-yellow-200/50 dark:border-yellow-900/50">
                                                    <span className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider mr-2">Next Eligible Date:</span>
                                                    <span className="font-semibold text-yellow-900 dark:text-yellow-300">{new Date(eligibility.nextEligibleDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registered Location</label>
                                        <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-red-500" />
                                            {donorProfile.location}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Donation</label>
                                        <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                            <FaCalendarAlt className="text-blue-500" />
                                            {donorProfile.lastDonationDate ? new Date(donorProfile.lastDonationDate).toLocaleDateString() : 'None recorded'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDonorForm && (
                            <motion.form
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleDonorUpdate} className="space-y-6"
                            >
                                <div className="p-6 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                        <FaHeartbeat className="text-red-500" /> Medical & Logistics Info
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Please provide accurate information to help us match you with compatible recipients.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Blood Group <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <FaTint className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                            <select
                                                required
                                                value={donorData.bloodGroup}
                                                onChange={(e) => setDonorData({ ...donorData, bloodGroup: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select Blood Group</option>
                                                {bloodTypes.map(type => (
                                                    <option key={type} value={type}>{displayBloodType(type)}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Current Location <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-grow">
                                                <FaMapMarkerAlt className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={donorData.location}
                                                    onChange={(e) => setDonorData({ ...donorData, location: e.target.value })}
                                                    placeholder="City or District"
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleGetLocation}
                                                disabled={locationLoading}
                                                title="Auto-detect your current location"
                                                className="shrink-0 px-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-red-300 hover:text-red-600 dark:hover:border-red-900 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all disabled:opacity-50"
                                            >
                                                {locationLoading ? <span className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></span> : <FaMapMarkerAlt />}
                                            </button>
                                        </div>
                                        {donorData.latitude && (
                                            <p className="text-xs text-green-600 dark:text-green-500 mt-2 flex items-center font-medium">
                                                <FaCheckCircle className="mr-1.5" /> Location coordinates locked
                                            </p>
                                        )}
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Weight (kg) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            required
                                            value={donorData.weight}
                                            onChange={(e) => setDonorData({ ...donorData, weight: e.target.value })}
                                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                            placeholder="e.g. 65"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            required
                                            value={donorData.dateOfBirth}
                                            onChange={(e) => setDonorData({ ...donorData, dateOfBirth: e.target.value })}
                                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Donation Date <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                                        <input
                                            type="date"
                                            value={donorData.lastDonationDate}
                                            onChange={(e) => setDonorData({ ...donorData, lastDonationDate: e.target.value })}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2 mt-2">
                                        <label className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={donorData.hasDiseases}
                                                onChange={(e) => setDonorData({ ...donorData, hasDiseases: e.target.checked })}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                <strong className="block text-gray-900 dark:text-white mb-1">Pre-existing Medical Conditions</strong>
                                                Check this box if you have any chronic health conditions or have tested positive for diseases like HIV, Hepatitis, or serious heart conditions. This is required for donor safety matching.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowDonorForm(false)}
                                        className="px-6 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all text-center"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaSave /> Save Profile details
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
