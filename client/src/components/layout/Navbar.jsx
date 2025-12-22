import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTint, FaSun, FaMoon, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/#about' },
        { name: 'Partner with Us', href: '/register-partner' },
        { name: 'Contact', href: '/#contact' },
    ];

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
        navigate('/login');
    };

    const getDashboardLink = () => {
        return user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="relative p-2 rounded-xl bg-red-50 dark:bg-red-900/20 group-hover:scale-105 transition-transform duration-300">
                            <FaTint className="text-xl text-red-600 dark:text-red-500" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Raktasahayog
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Theme Toggle & Auth */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-200"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <FaMoon className="text-lg" />
                            ) : (
                                <FaSun className="text-lg" />
                            )}
                        </button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

                        {isAuthenticated ? (
                            <>
                                <NotificationBell />
                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-3 pl-2 pr-1 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 pr-2">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden py-1 ring-1 ring-black ring-opacity-5 animation-fade-in-down">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                                            </div>

                                            <div className="py-1">
                                                <Link
                                                    to={getDashboardLink()}
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <FaTachometerAlt className="text-gray-400" />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </div>

                                            <div className="py-1 border-t border-gray-100 dark:border-gray-800">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                >
                                                    <FaSignOutAlt />
                                                    <span>Sign out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Login/Signup Buttons */
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Donate Now
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        >
                            {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
                        </button>

                        {isAuthenticated && <NotificationBell />}

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        >
                            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden glass border-t border-gray-100 dark:border-gray-800 animation-slide-down">
                    <div className="px-4 py-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="block text-lg font-medium text-gray-800 dark:text-gray-200"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                                            {user?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to={getDashboardLink()}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center space-x-3 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
                                    >
                                        <FaTachometerAlt className="text-gray-400" />
                                        <span className="font-medium text-gray-700 dark:text-gray-200">Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 w-full p-3 rounded-xl text-red-600 bg-red-50 dark:bg-red-900/10"
                                    >
                                        <FaSignOutAlt />
                                        <span className="font-medium">Sign out</span>
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex justify-center py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex justify-center py-3 rounded-xl bg-red-600 text-white font-semibold"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
