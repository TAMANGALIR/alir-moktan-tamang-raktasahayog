import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaTint, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import NotificationBell from '../common/NotificationBell';

const UserLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Campaigns', path: '/campaigns' },
        { name: 'Appointments', path: '/appointments' },
        { name: 'My Donations', path: '/donations' },
        { name: 'Profile', path: '/profile' },
    ];


    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Top Navbar */}
            <nav className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center space-x-3 group">
                            <div className="relative p-2 rounded-xl bg-red-50 dark:bg-red-900/20 group-hover:scale-105 transition-transform duration-300">
                                <FaTint className="text-xl text-red-600 dark:text-red-500" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Raktasahayog
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative px-1 py-1 text-sm font-medium transition-colors duration-200 border-b-2 ${isActive(item.path)
                                        ? 'border-red-600 text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Right Side - Theme Toggle & User */}
                        <div className="flex items-center space-x-4">
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

                            <NotificationBell />

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-3 pl-2 pr-1 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-none">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-64 glass rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden py-1 ring-1 ring-black ring-opacity-5 animation-fade-in-down z-50">
                                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
                                        </div>

                                        <div className="py-2">
                                            {navItems.map((item) => (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className={`block px-5 py-2.5 text-sm font-medium transition-colors ${isActive(item.path)
                                                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10'
                                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                        }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="py-2 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-3 px-5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                <FaSignOutAlt />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation (Scrollable Pill List) */}
                    <div className="md:hidden flex items-center space-x-2 pb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border ${isActive(item.path)
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-600'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default UserLayout;
