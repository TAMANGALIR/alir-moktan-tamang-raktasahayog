import { useState } from 'react';
import ModalPortal from '../common/ModalPortal';
import { FaTimes, FaMapMarkerAlt, FaTint, FaPhone, FaClipboardList, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import Button from '../common/Button';
import Input from '../common/Input';
import MapLocationPicker from '../campaign/MapLocationPicker';
import apiClient from '../../services/api.service';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { id: 1, label: 'Blood Info', icon: FaTint },
    { id: 2, label: 'Location', icon: FaMapMarkerAlt },
    { id: 3, label: 'Contact & Details', icon: FaPhone },
];

const CreateEmergencyModal = ({ isOpen, onClose, onRequestCreated }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        bloodGroup: 'A_POS',
        unitsNeeded: 1,
        urgencyLevel: 'EMERGENCY',
        location: '',
        latitude: null,
        longitude: null,
        hospitalName: '',
        contactPerson: '',
        contactPhone: '',
        radiusKm: 10,
        message: '',
        expiresAt: ''
    });
    const [loading, setLoading] = useState(false);
    const [estimatedDonors, setEstimatedDonors] = useState(null);

    const validateStep = (step) => {
        if (step === 1) {
            if (!formData.bloodGroup || !formData.unitsNeeded || !formData.urgencyLevel) {
                toast.error('Please fill all blood requirement fields');
                return false;
            }
            return true;
        }
        if (step === 2) {
            if (!formData.latitude || !formData.longitude) {
                toast.error('Please select a location on the map');
                return false;
            }
            return true;
        }
        if (step === 3) {
            if (!formData.contactPerson || !formData.contactPhone) {
                toast.error('Please fill contact person and phone');
                return false;
            }
            if (!formData.expiresAt) {
                toast.error('Please set an expiry time');
                return false;
            }
            return true;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setLoading(true);
        try {
            const res = await apiClient.post('/emergency', formData);
            toast.success(`Emergency request created! ${res.data.eligibleDonorsCount} eligible donors found.`);
            setEstimatedDonors(res.data.eligibleDonorsCount);

            // Reset form
            setFormData({
                bloodGroup: 'A_POS',
                unitsNeeded: 1,
                urgencyLevel: 'EMERGENCY',
                location: '',
                latitude: null,
                longitude: null,
                hospitalName: '',
                contactPerson: '',
                contactPhone: '',
                radiusKm: 10,
                message: '',
                expiresAt: ''
            });
            setCurrentStep(1);

            onRequestCreated();
            setTimeout(() => onClose(), 2000);
        } catch (error) {
            console.error('Create emergency error:', error);
            toast.error(error.response?.data?.message || 'Failed to create emergency request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Get minimum datetime (current time)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);

    return (
        <ModalPortal>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5 flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Emergency Request</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Broadcast urgent blood need to nearby donors</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <div className="px-6 pt-5 pb-2 shrink-0">
                        <div className="flex items-center justify-between">
                            {STEPS.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;
                                return (
                                    <div key={step.id} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center flex-1">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                                        : isActive
                                                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 scale-110'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                                    }`}
                                            >
                                                {isCompleted ? <FaCheck className="text-sm" /> : <Icon className="text-sm" />}
                                            </div>
                                            <span className={`text-xs mt-1.5 font-semibold transition-colors ${isActive ? 'text-red-600 dark:text-red-400' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                                                }`}>{step.label}</span>
                                        </div>
                                        {index < STEPS.length - 1 && (
                                            <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all duration-300 -mt-5 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                                }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Blood Requirements */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-5"
                                >
                                    <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-200 dark:border-red-800/50">
                                        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-1">Blood Requirements</h3>
                                        <p className="text-sm text-red-700/70 dark:text-red-300/50 mb-5">Specify the blood type and quantity needed</p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Blood Group *
                                                </label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[
                                                        { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
                                                        { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
                                                        { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
                                                        { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' },
                                                    ].map(bg => (
                                                        <button
                                                            key={bg.value}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, bloodGroup: bg.value })}
                                                            className={`py-3 rounded-xl text-sm font-bold transition-all ${formData.bloodGroup === bg.value
                                                                    ? 'bg-red-600 text-white shadow-md shadow-red-500/30 scale-105'
                                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                                                                }`}
                                                        >
                                                            {bg.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        Units Needed *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        value={formData.unitsNeeded}
                                                        onChange={(e) => setFormData({ ...formData, unitsNeeded: parseInt(e.target.value) })}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-lg font-semibold"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        Urgency Level *
                                                    </label>
                                                    <div className="space-y-2">
                                                        {[
                                                            { value: 'NORMAL', label: 'Normal', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300', active: 'bg-blue-600 text-white shadow-blue-500/30' },
                                                            { value: 'HIGH', label: 'High', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300', active: 'bg-yellow-500 text-white shadow-yellow-500/30' },
                                                            { value: 'EMERGENCY', label: 'Emergency', color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300', active: 'bg-red-600 text-white shadow-red-500/30' },
                                                        ].map(level => (
                                                            <button
                                                                key={level.value}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, urgencyLevel: level.value })}
                                                                className={`w-full py-2.5 rounded-lg text-sm font-bold border transition-all ${formData.urgencyLevel === level.value
                                                                        ? `${level.active} shadow-md border-transparent`
                                                                        : level.color
                                                                    }`}
                                                            >
                                                                {level.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Location */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Location Details</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select the hospital or facility on the map</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Hospital/Facility Name"
                                            value={formData.hospitalName}
                                            onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                                            placeholder="e.g., City Hospital"
                                        />
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Search Radius *
                                            </label>
                                            <div className="flex gap-2">
                                                {[5, 10, 20, 50].map(r => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, radiusKm: r })}
                                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.radiusKm === r
                                                                ? 'bg-red-600 text-white shadow-md shadow-red-500/30'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            }`}
                                                    >
                                                        {r} km
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <MapLocationPicker
                                        latitude={formData.latitude}
                                        longitude={formData.longitude}
                                        onLocationChange={(lat, lng) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: lat,
                                                longitude: lng
                                            }));
                                        }}
                                        locationName={formData.location}
                                        onLocationNameChange={(name) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                location: name
                                            }));
                                        }}
                                    />

                                    {formData.location && (
                                        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/40">
                                            <FaMapMarkerAlt className="text-green-600 shrink-0" />
                                            <span className="text-sm font-medium text-green-800 dark:text-green-300 truncate">{formData.location}</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 3: Contact & Details */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-5"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Contact & Additional Details</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Provide contact information and request details</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Contact Person *"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            placeholder="Dr. John Doe"
                                            required
                                        />
                                        <Input
                                            label="Contact Phone *"
                                            value={formData.contactPhone}
                                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                            placeholder="+977 9812345678"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Expires At *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            min={minDateTime}
                                            value={formData.expiresAt}
                                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Custom Message (Optional)
                                        </label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Additional information for donors..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                        />
                                    </div>

                                    {/* Review Summary */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Review Summary</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Blood Group:</span>
                                                <span className="ml-2 font-bold text-red-600 dark:text-red-400">
                                                    {formData.bloodGroup.replace('_POS', '+').replace('_NEG', '-')}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Units:</span>
                                                <span className="ml-2 font-bold text-gray-900 dark:text-white">{formData.unitsNeeded}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Urgency:</span>
                                                <span className={`ml-2 font-bold ${formData.urgencyLevel === 'EMERGENCY' ? 'text-red-600' : formData.urgencyLevel === 'HIGH' ? 'text-yellow-600' : 'text-blue-600'
                                                    }`}>{formData.urgencyLevel}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Radius:</span>
                                                <span className="ml-2 font-bold text-gray-900 dark:text-white">{formData.radiusKm} km</span>
                                            </div>
                                            {formData.location && (
                                                <div className="col-span-2">
                                                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Success Message */}
                                    {estimatedDonors !== null && (
                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                            <p className="text-green-800 dark:text-green-200 font-semibold">
                                                ✅ Emergency request created! {estimatedDonors} eligible donors will be notified.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Navigation */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-5 flex justify-between items-center shrink-0 bg-gray-50/50 dark:bg-gray-900/30">
                        <div>
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                                >
                                    <FaArrowLeft className="text-xs" /> Back
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-4 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
                            Step {currentStep} of {STEPS.length}
                        </div>

                        <div>
                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    Next <FaArrowRight className="text-xs" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating...' : 'Create Emergency Request'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default CreateEmergencyModal;
