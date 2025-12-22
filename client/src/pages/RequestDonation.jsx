import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTint, FaMapMarkerAlt, FaCalendarAlt, FaProcedures, FaExclamationCircle, FaPhoneAlt, FaInfoCircle, FaHeartbeat } from 'react-icons/fa';
import { NEPALI_DISTRICTS } from '../constants/nepaliLocations';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const RequestDonation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bloodGroup: '',
        location: '',
        priority: 'NORMAL',
        preferredDate: '',
        donationCenter: '',
        medicalConditions: '',
        requestUnits: 1
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Request submitted successfully!');
                navigate('/dashboard');
            } else {
                toast.error(data.error || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Request error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Request Blood <span className="text-red-600">Donation</span></h1>
                <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg max-w-2xl">Create an emergency or routine request. Our community of heroes is ready to help you in times of need.</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-grow lg:w-2/3"
                >
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-8 md:p-10 space-y-8 relative overflow-hidden">

                        {/* Decorative blob */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                        <div className="relative z-10 space-y-8">
                            {/* Section 1: Blood Details */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-sm">1</span>
                                    Patient Requirement
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-red-600 transition-colors">
                                            Blood Group Required <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaTint className="absolute left-4 top-3.5 text-red-400 group-focus-within:text-red-600 transition-colors" />
                                            <select
                                                name="bloodGroup"
                                                required
                                                value={formData.bloodGroup}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select Blood Group</option>
                                                <option value="A_POS">A+ (A Positive)</option>
                                                <option value="A_NEG">A- (A Negative)</option>
                                                <option value="B_POS">B+ (B Positive)</option>
                                                <option value="B_NEG">B- (B Negative)</option>
                                                <option value="AB_POS">AB+ (AB Positive)</option>
                                                <option value="AB_NEG">AB- (AB Negative)</option>
                                                <option value="O_POS">O+ (O Positive)</option>
                                                <option value="O_NEG">O- (O Negative)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-red-600 transition-colors">
                                            Units Required <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-3.5 flex items-center justify-center w-5 h-5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold font-mono">#</div>
                                            <input
                                                type="number"
                                                name="requestUnits"
                                                required
                                                min="1"
                                                max="10"
                                                value={formData.requestUnits}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-700" />

                            {/* Section 2: Location & Timing */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-sm">2</span>
                                    Where & When
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-red-600 transition-colors">
                                            District <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                                            <select
                                                name="location"
                                                required
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select District</option>
                                                {NEPALI_DISTRICTS.map((district) => (
                                                    <option key={district} value={district}>{district}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-red-600 transition-colors">
                                            Hospital / Clinic <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaProcedures className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                                            <input
                                                type="text"
                                                name="donationCenter"
                                                required
                                                placeholder="e.g. Bir Hospital, Kathmandu"
                                                value={formData.donationCenter}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-red-600 transition-colors">
                                            Required Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaCalendarAlt className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                                            <input
                                                type="date"
                                                name="preferredDate"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={formData.preferredDate}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-red-600 transition-colors">
                                            Urgency Level <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaExclamationCircle className={`absolute left-4 top-3.5 transition-colors ${formData.priority === 'CRITICAL' ? 'text-red-600 animate-pulse' : formData.priority === 'URGENT' ? 'text-orange-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                                            <select
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleChange}
                                                className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 outline-none transition-all appearance-none cursor-pointer ${formData.priority === 'CRITICAL' ? 'border-red-300 dark:border-red-900/50 focus:border-red-600 focus:bg-red-50 dark:focus:bg-red-900/20' :
                                                        formData.priority === 'URGENT' ? 'border-orange-300 dark:border-orange-900/50 focus:border-orange-500 focus:bg-orange-50 dark:focus:bg-orange-900/20' :
                                                            'border-gray-100 dark:border-gray-700 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800'
                                                    }`}
                                            >
                                                <option value="NORMAL">Normal Requirement</option>
                                                <option value="URGENT">Urgent (Within 48 hours)</option>
                                                <option value="CRITICAL">Critical (Immediate)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-700" />

                            {/* Section 3: Extra Notes */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-sm">3</span>
                                    Additional Context
                                </h3>
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-focus-within:text-red-600 transition-colors">
                                        Medical Conditions / Patient Notes
                                    </label>
                                    <textarea
                                        name="medicalConditions"
                                        rows="3"
                                        placeholder="Any specific instructions, patient name, replacement requirements, etc..."
                                        value={formData.medicalConditions}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-0 focus:border-red-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 hover:-translate-y-1 active:scale-95'
                                        }`}
                                >
                                    {loading ? (
                                        <><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Submitting...</>
                                    ) : (
                                        <><FaHeartbeat className="text-xl" /> Submit Blood Request</>
                                    )}
                                </button>
                                <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                                    <FaInfoCircle /> By submitting, this request becomes visible to eligible donors nearby.
                                </p>
                            </div>
                        </div>
                    </form>
                </motion.div>

                {/* Info Panel Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:w-1/3"
                >
                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-gray-800 dark:to-gray-800/80 rounded-3xl p-8 border border-red-100 dark:border-gray-700 sticky top-8">
                        <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-50 dark:border-gray-700">
                            <FaHeartbeat className="text-3xl text-red-500 animate-pulse" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How it works</h3>
                        <ul className="space-y-6 text-gray-600 dark:text-gray-300">
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-400 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Submit Request</p>
                                    <p className="text-sm">Provide accurate patient details and requirements. Ensure hospital info is correct.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-400 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white mb-1">We Notify Donors</p>
                                    <p className="text-sm">Our system instantly alerts compatible donors in your selected district.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-400 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Connect</p>
                                    <p className="text-sm">Interested donors will accept the request and you will see their details.</p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-8 pt-8 border-t border-red-200/50 dark:border-gray-700">
                            <p className="font-bold text-gray-900 dark:text-white mb-2">Need immediate assistance?</p>
                            <a href="tel:102" className="flex items-center gap-2 text-red-600 font-bold bg-white dark:bg-gray-900 p-3 rounded-xl border border-red-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <FaPhoneAlt /> Call 102 (Ambulance)
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RequestDonation;
