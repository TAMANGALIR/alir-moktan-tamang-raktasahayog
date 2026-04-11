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
        console.log(data.license)
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
            <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md p-8 space-y-4 text-center bg-white shadow-xl dark:bg-gray-800 rounded-2xl"
                >
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full dark:bg-green-900/30">
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
        <div className="flex h-screen overflow-hidden font-sans bg-white dark:bg-gray-950">
            {/* Left Side - Branding (Hidden on Mobile) */}
            <div className="relative hidden h-full overflow-hidden lg:flex lg:w-5/12 bg-gradient-to-br from-red-700 via-red-600 to-orange-600">
                <div className="absolute inset-0">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-full rounded-full -top-1/2 -left-1/2 bg-gradient-to-br from-white/10 to-transparent blur-3xl"
                    />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12 text-center text-white">
                    <div className="p-4 mb-8 shadow-xl bg-white/10 backdrop-blur-md rounded-2xl">
                        <FaHospital className="text-6xl" />
                    </div>
                    <h1 className="mb-6 text-4xl font-bold">Partner with Raktasahayog</h1>
                    <p className="max-w-md text-lg leading-relaxed text-white/90">
                        Join the largest network of blood banks and hospitals. Manage donations, track inventory, and save lives efficiently.
                    </p>

                    <ul className="w-full max-w-sm mt-12 space-y-4 text-left">
                        <li className="flex items-center p-3 space-x-3 rounded-lg bg-black/20 backdrop-blur-sm">
                            <FaCheckCircle className="flex-shrink-0 text-green-400" />
                            <span className="font-medium">Real-time inventory tracking</span>
                        </li>
                        <li className="flex items-center p-3 space-x-3 rounded-lg bg-black/20 backdrop-blur-sm">
                            <FaCheckCircle className="flex-shrink-0 text-green-400" />
                            <span className="font-medium">Coordinate donor requests</span>
                        </li>
                        <li className="flex items-center p-3 space-x-3 rounded-lg bg-black/20 backdrop-blur-sm">
                            <FaCheckCircle className="flex-shrink-0 text-green-400" />
                            <span className="font-medium">Verified trust badge</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col w-full h-full overflow-y-auto lg:w-7/12 bg-gray-50 dark:bg-gray-900 no-scrollbar">
                <div className="flex flex-col justify-start flex-1 w-full max-w-2xl p-6 pt-12 mx-auto sm:p-12 lg:p-16 lg:pt-20">
                    <div className="flex items-center mb-8 lg:hidden">
                        <FaTint className="mr-2 text-3xl text-red-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">Raktasahayog</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Register Organization</h2>
                        <p className="text-gray-600 dark:text-gray-400">Enter your organization details for verification.</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                            <FaExclamationCircle className="flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                        className="w-full px-4 py-3 text-gray-900 transition-all bg-white border-2 border-gray-300 rounded-lg appearance-none dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="HOSPITAL">Hospital</option>
                                        <option value="BLOOD_BANK">Blood Bank</option>
                                        <option value="NGO">NGO</option>
                                        <option value="GOVERNMENT">Government Body</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 pointer-events-none">
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
                                        className="flex items-center justify-center p-3 text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600 aspect-square"
                                    >
                                        {locationLoading ? (
                                            <span className="animate-spin">⌛</span>
                                        ) : (
                                            <FaMapMarkerAlt className="text-lg" />
                                        )}
                                    </button>
                                </div>
                                {formData.latitude && (
                                    <p className="flex items-center mt-1 text-xs text-green-600 animate-pulse">
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
                                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border-2 border-gray-300 rounded-lg cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-6 pt-8 mt-6 border-t border-gray-200 dark:border-gray-800">
                            <Link to="/" className="px-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                loading={loading}
                                className="px-8 py-3 text-base text-white shadow-lg w-fit bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30 rounded-xl"
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
