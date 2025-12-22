import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaTint, FaCheckCircle } from 'react-icons/fa';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import authService from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SignupPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        // role removed
    });
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = 'Phone number is invalid';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setApiError('');

        try {
            const { confirmPassword, ...userData } = formData;
            const response = await authService.register(userData);

            // Success - Move to OTP step
            setStep(2);
            // Optionally show success toast
        } catch (error) {
            setApiError(error.response?.data?.message || error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async () => {
        setLoading(true);
        setApiError('');
        try {
            // Manually call verify-otp
            const response = await authService.verifyOtp({ email: formData.email, otp });

            login(response.user, response.accessToken, response.refreshToken);

            if (response.user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            setApiError(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setApiError('');
        try {
            await authService.resendOtp({ email: formData.email });
            toast.success("Verification code has been resent to your email.");
        } catch (error) {
            setApiError("Failed to resend OTP. Please try again.");
        }
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 3) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-orange-700">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, -90, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-red-400/30 to-orange-600/30 rounded-full blur-3xl"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <FaTint className="text-6xl" />
                        </div>
                        <h1 className="text-5xl font-bold mb-4">Join Raktasahayog</h1>
                        <p className="text-xl text-white/90 mb-8 max-w-md">
                            Become a hero today. Register to donate blood and save lives in your community.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-4 mt-12 text-left max-w-md mx-auto">
                            {[
                                'Connect with recipients instantly',
                                'Track your donation history',
                                'Get notified when blood is needed',
                                'Join a community of lifesavers',
                            ].map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                                    className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-3"
                                >
                                    <FaCheckCircle className="text-2xl flex-shrink-0" />
                                    <span className="text-white/90">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md"
                >
                    {/* Logo for mobile */}
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <FaTint className="text-4xl text-red-600" />
                        <span className="text-3xl font-bold gradient-brand bg-clip-text text-transparent ml-2">
                            Raktasahayog
                        </span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {step === 1 ? 'Create Account' : 'Verify Email'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {step === 1 ? 'Fill in your details to get started' : 'Enter the code sent to your email'}
                        </p>
                    </div>

                    {apiError && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400 text-sm">{apiError}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                                placeholder="John Doe"
                                icon={FaUser}
                                required
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                placeholder="you@example.com"
                                icon={FaEnvelope}
                                required
                            />

                            <Input
                                label="Phone Number"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                error={errors.phone}
                                placeholder="+1 (555) 123-4567"
                                icon={FaPhone}
                            />

                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    placeholder="••••••••"
                                    icon={FaLock}
                                    required
                                />
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                                            <span className={`font-semibold ${passwordStrength.label === 'Weak' ? 'text-red-500' :
                                                passwordStrength.label === 'Medium' ? 'text-yellow-500' :
                                                    'text-green-500'
                                                }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                placeholder="••••••••"
                                icon={FaLock}
                                required
                            />

                            {/* Removed Role Selection buttons */}

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={loading}
                            >
                                Create Account
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    We sent a 6-digit code to <strong>{formData.email}</strong>.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enter Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center text-2xl tracking-widest font-mono text-gray-900 dark:text-white focus:border-red-500 focus:ring-0 transition-colors"
                                    maxLength={6}
                                />
                            </div>

                            <Button
                                onClick={handleOtpVerify}
                                variant="primary"
                                fullWidth
                                loading={loading}
                                disabled={otp.length !== 6}
                            >
                                Verify & Login
                            </Button>

                            <div className="text-center">
                                <button
                                    onClick={handleResendOtp}
                                    type="button"
                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-red-600 dark:text-red-400 font-semibold hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SignupPage;
