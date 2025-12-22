import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api.service';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { FaHospital, FaGlobe, FaMapMarkerAlt, FaPhone, FaCheckCircle, FaExclamationCircle, FaTint, FaEnvelope, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const OrgRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        location: '',
        latitude: '',
        longitude: '',
        contactInfo: '',
        website: '',
        type: 'HOSPITAL'
    });
    const [licenseFile, setLicenseFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setLicenseFile(e.target.files[0]);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse Geocoding (OpenStreetMap Nominatim)
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
                    const state = data.address?.state || '';
                    const formattedLocation = city && state ? `${city}, ${state}` : data.display_name.split(',').slice(0, 2).join(',');

                    setFormData(prev => ({
                        ...prev,
                        location: formattedLocation,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                    }));
                } catch (err) {
                    console.error("Geocoding fetch error:", err);
                    // Fallback to just saving coords if reverse geocoding fails
                    setFormData(prev => ({
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
                setError("Unable to retrieve your location. Please allow location access.");
                setLocationLoading(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!licenseFile) {
            setError("Please upload a license/registration document.");
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('location', formData.location);
        if (formData.latitude) data.append('latitude', formData.latitude);
        if (formData.longitude) data.append('longitude', formData.longitude);
        data.append('contactInfo', formData.contactInfo);
        data.append('website', formData.website);
        data.append('type', formData.type);
        data.append('license', licenseFile);

        try {
            await apiClient.post('/admin/register-org', data);
            setSuccess(true);
        } catch (error) {
            setError(error.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-4"
                >
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-3xl text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Thank you for registering <strong>{formData.name}</strong>.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                        Your application is currently <strong>Pending Verification</strong>.
                        You will receive an email confirmation shortly, and another email once your organization has been approved by our admin team.
                    </p>
                    <Link to="/login" className="inline-block px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                        Go to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-white dark:bg-gray-950 overflow-hidden font-sans">
            {/* Left Side - Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-orange-600 h-full">
                <div className="absolute inset-0">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
                    />
                </div>
                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white text-center h-full">
                    <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl">
                        <FaHospital className="text-6xl" />
                    </div>
                    <h1 className="text-4xl font-bold mb-6">Partner with Raktasahayog</h1>
                    <p className="text-lg text-white/90 max-w-md leading-relaxed">
                        Join the largest network of blood banks and hospitals. Manage donations, track inventory, and save lives efficiently.
                    </p>

                    <ul className="mt-12 space-y-4 text-left w-full max-w-sm">
                        <li className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaCheckCircle className="text-green-400 flex-shrink-0" />
                            <span className="font-medium">Real-time inventory tracking</span>
                        </li>
                        <li className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaCheckCircle className="text-green-400 flex-shrink-0" />
                            <span className="font-medium">Coordinate donor requests</span>
                        </li>
                        <li className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaCheckCircle className="text-green-400 flex-shrink-0" />
                            <span className="font-medium">Verified trust badge</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-7/12 flex flex-col bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto no-scrollbar">
                <div className="flex-1 flex flex-col justify-start p-6 sm:p-12 lg:p-16 max-w-2xl mx-auto w-full pt-12 lg:pt-20">
                    <div className="lg:hidden flex items-center mb-8">
                        <FaTint className="text-3xl text-red-600 mr-2" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">Raktasahayog</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Register Organization</h2>
                        <p className="text-gray-600 dark:text-gray-400">Enter your organization details for verification.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300">
                            <FaExclamationCircle className="flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization Name</label>
                                <Input
                                    name="name"
                                    placeholder="Official Name (e.g. City General Hospital)"
                                    value={formData.name}
                                    onChange={handleChange}
                                    icon={FaHospital}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization Type</label>
                                <div className="relative">
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                                    >
                                        <option value="HOSPITAL">Hospital</option>
                                        <option value="BLOOD_BANK">Blood Bank</option>
                                        <option value="NGO">NGO</option>
                                        <option value="GOVERNMENT">Government Body</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            name="location"
                                            placeholder="City/District"
                                            value={formData.location}
                                            onChange={handleChange}
                                            icon={FaMapMarkerAlt}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={locationLoading}
                                        title="Auto-detect your current location"
                                        className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center border border-gray-300 dark:border-gray-600 aspect-square"
                                    >
                                        {locationLoading ? (
                                            <span className="animate-spin">⌛</span>
                                        ) : (
                                            <FaMapMarkerAlt className="text-lg" />
                                        )}
                                    </button>
                                </div>
                                {formData.latitude && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center animate-pulse">
                                        <FaCheckCircle className="mr-1" />
                                        Coordinates detected
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Official Email</label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="admin@hospital.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={FaEnvelope}
                                    required
                                />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    icon={FaLock}
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Information</label>
                                <Input
                                    name="contactInfo"
                                    placeholder="Official Phone or Email"
                                    value={formData.contactInfo}
                                    onChange={handleChange}
                                    icon={FaPhone}
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website (Optional)</label>
                                <Input
                                    name="website"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                    icon={FaGlobe}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Proof of Registration (Image)
                                </label>
                                <input
                                    type="file"
                                    name="license"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="pt-8 flex items-center justify-end gap-6 border-t border-gray-200 dark:border-gray-800 mt-6">
                            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium px-2">
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                loading={loading}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-8 text-base shadow-lg shadow-red-500/30 rounded-xl"
                            >
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrgRegistration;
