import React, { useState, useEffect } from 'react';
import ModalPortal from '../components/common/ModalPortal';
import ConfirmModal from '../components/common/ConfirmModal';
import { FaCalendarAlt, FaPlus, FaClock, FaHistory, FaMapMarkerAlt, FaHospital, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { getMyAppointments, createAppointment, updateAppointmentStatus, getBookingOptions } from '../services/appointment.service';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

import { useSocket } from '../context/SocketContext'; // Assuming context or use helper directly if context not avail
import socketService from '../services/socket.service';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Real-time listener
    useEffect(() => {
        const handleUpdate = (updatedAppt) => {
            setAppointments(current =>
                current.map(appt => appt.id === updatedAppt.id ? { ...appt, ...updatedAppt } : appt)
            );

        };

        socketService.socket?.on('appointment_updated', handleUpdate);

        return () => {
            socketService.socket?.off('appointment_updated', handleUpdate);
        };
    }, []);


    // Booking Wizard State
    const [bookingStep, setBookingStep] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Data
    const [organizations, setOrganizations] = useState([]);
    const [cities, setCities] = useState([]);

    // Selection
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [errorData, setErrorData] = useState(null);

    const fetchAppointments = async () => {
        try {
            const data = await getMyAppointments();
            setAppointments(data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookingOptions = async () => {
        try {
            const data = await getBookingOptions();
            setOrganizations(data.data);
            const uniqueCities = [...new Set(data.data.map(org => org.location))];
            setCities(uniqueCities.sort());
        } catch (error) {
            console.error(error);
            toast.error('Failed to load locations');
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            fetchBookingOptions();
            setBookingStep(1);
            setSelectedCity('');
            setSelectedOrg(null);
            setSelectedDate('');
            setErrorData(null);
        }
    }, [isModalOpen]);

    const handleBookAppointment = async () => {
        if (!selectedDate || !selectedOrg) return;

        setBookingLoading(true);
        setErrorData(null);

        try {
            await createAppointment({
                scheduledAt: selectedDate,
                organizationId: selectedOrg.id
            });
            toast.success('Appointment booked successfully!');
            setIsModalOpen(false);
            fetchAppointments();
        } catch (error) {
            if (error.reasons) {
                setErrorData({
                    message: error.error,
                    reasons: error.reasons
                });
            } else {
                toast.error(error.error || error.message || 'Booking failed');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const [cancelModal, setCancelModal] = useState({ isOpen: false, id: null });

    const handleCancel = (id) => {
        setCancelModal({ isOpen: true, id });
    };

    const confirmCancel = async () => {
        try {
            await updateAppointmentStatus(cancelModal.id, 'CANCELED');
            toast.success('Appointment cancelled');
            fetchAppointments();
        } catch (error) {
            toast.error(error.error || 'Failed to cancel');
        } finally {
            setCancelModal({ isOpen: false, id: null });
        }
    };


    const upcomingAppointments = appointments.filter(
        a => (a.status === 'PENDING' || a.status === 'APPROVED' || a.status === 'RESCHEDULED') && new Date(a.scheduledAt) > new Date()
    );

    const pastAppointments = appointments.filter(
        a => a.status === 'COMPLETED' || a.status === 'CANCELED' || a.status === 'REJECTED' || new Date(a.scheduledAt) <= new Date()
    );

    const getStatusBadge = (status) => {

        switch (status) {
            case 'APPROVED': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Approved</span>;
            case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>;
            case 'CANCELED': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">Cancelled</span>;
            case 'COMPLETED': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Completed</span>;

            default: return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
        }
    };

    // Filter orgs by city
    const filteredOrgs = selectedCity
        ? organizations.filter(org => org.location === selectedCity)
        : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">View schedule & book appointments</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    <FaPlus />
                    <span>New Appointment</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                {['upcoming', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab
                            ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="grid gap-4">
                {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCalendarAlt className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No appointments found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {activeTab === 'upcoming' ? "You don't have any upcoming appointments." : "No appointment history available."}
                        </p>
                    </div>
                ) : (
                    (activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map((appt) => (
                        <motion.div
                            key={appt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {new Date(appt.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </h3>
                                        {getStatusBadge(appt.status)}
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center space-x-2">
                                            <FaClock className="text-red-500" />
                                            <span>{new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        {appt.organization && (
                                            <div className="flex items-center space-x-2">
                                                <FaHospital className="text-blue-500" />
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{appt.organization.name}</span>
                                                <span className="text-gray-400">•</span>
                                                <span>{appt.organization.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    {activeTab === 'upcoming' && appt.status !== 'CANCELED' && (
                                        <button
                                            onClick={() => handleCancel(appt.id)}
                                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            Cancel Appointment
                                        </button>
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Booking Modal */}
            {isModalOpen && (
                <ModalPortal>
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h2>
                                    <div className="flex items-center space-x-2 mt-2 text-sm">
                                        <span className={`font-medium ${bookingStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>1. Location</span>
                                        <span className="text-gray-300">/</span>
                                        <span className={`font-medium ${bookingStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>2. Time</span>
                                        <span className="text-gray-300">/</span>
                                        <span className={`font-medium ${bookingStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}>3. Review</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {errorData && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                        <div className="flex items-start space-x-3">
                                            <FaExclamationTriangle className="text-red-600 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-red-800 dark:text-red-200">Eligibility Check Failed</h4>
                                                <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                                                    {errorData.reasons.map((reason, idx) => (
                                                        <li key={idx}>{reason}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 1: Location */}
                                {bookingStep === 1 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select City</label>
                                            <select
                                                value={selectedCity}
                                                onChange={(e) => setSelectedCity(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                            >
                                                <option value="">-- Choose City --</option>
                                                {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                            </select>
                                        </div>

                                        {selectedCity && (
                                            <div className="animate-fade-in">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Center</label>
                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    {filteredOrgs.map(org => (
                                                        <div
                                                            key={org.id}
                                                            onClick={() => setSelectedOrg(org)}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedOrg?.id === org.id
                                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 dark:text-white">{org.name}</p>
                                                                    <p className="text-xs text-gray-500">{org.type}</p>
                                                                </div>
                                                                {selectedOrg?.id === org.id && <FaCheckCircle className="text-red-600" />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                disabled={!selectedOrg}
                                                onClick={() => setBookingStep(2)}
                                                className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                                            >
                                                Next: Select Time
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Time */}
                                {bookingStep === 2 && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                required
                                                min={new Date().toISOString().slice(0, 16)}
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Note: Please verify your eligibility before proceeding.</p>
                                        </div>

                                        <div className="pt-4 flex justify-between">
                                            <button onClick={() => setBookingStep(1)} className="text-gray-600 hover:text-gray-900 font-medium">Back</button>
                                            <button
                                                disabled={!selectedDate}
                                                onClick={() => setBookingStep(3)}
                                                className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-red-700 transition-colors"
                                            >
                                                Next: Review
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Review */}
                                {bookingStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Location</span>
                                                <span className="font-medium text-gray-900 dark:text-white text-right">{selectedOrg?.name}<br /><span className="text-sm font-normal text-gray-500">{selectedOrg?.location}</span></span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-3">
                                                <span className="text-gray-500 dark:text-gray-400">Date</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {selectedDate && new Date(selectedDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Time</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {selectedDate && new Date(selectedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-between items-center">
                                            <button onClick={() => setBookingStep(2)} className="text-gray-600 hover:text-gray-900 font-medium">Back</button>
                                            <button
                                                onClick={handleBookAppointment}
                                                disabled={bookingLoading}
                                                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                                            >
                                                {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={() => setCancelModal({ isOpen: false, id: null })}
                onConfirm={confirmCancel}
                title="Cancel Appointment?"
                message="Are you sure you want to cancel this appointment?"
                confirmText="Yes, Cancel"
                cancelText="Keep it"
                variant="danger"
            />

        </div >
    );
};

export default Appointments;
