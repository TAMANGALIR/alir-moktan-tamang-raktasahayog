import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaTint,
    FaTachometerAlt,
    FaCalendarAlt,
    FaBullhorn,

    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaChevronLeft,
    FaChevronRight,
    FaUsers,
    FaFlask,
    FaHandHoldingHeart,
    FaExclamationTriangle,
    FaSun,
    FaMoon
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../common/NotificationBell';
import socketService from '../../services/socket.service';
import { useEffect } from 'react';


const OrgLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            socketService.connect(user.id);
            if (user.role === 'ORGANIZATION' && user.organizationId) {
                socketService.joinRoom(`ORG_${user.organizationId}`);
            }
        }
    }, [user]);


    const menuItems = [
        { name: 'Dashboard', icon: FaTachometerAlt, path: '/org-dashboard' },
        { name: 'Blood Inventory', icon: FaFlask, path: '/org-dashboard/inventory' },
        { name: 'Campaigns', icon: FaBullhorn, path: '/org-dashboard/campaigns' },
        { name: 'Appointments', icon: FaCalendarAlt, path: '/org-dashboard/appointments' },
        { name: 'Emergency Requests', icon: FaExclamationTriangle, path: '/org-dashboard/emergency' },
    ];


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - Desktop */}
            <aside
                className={`hidden md:flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                    {isSidebarOpen && (
                        <Link to="/org-dashboard" className="flex items-center space-x-2">
                            <FaTint className="text-2xl text-red-600 dark:text-red-500" />
                            <span className="text-xl font-bold gradient-brand bg-clip-text text-transparent">
                                Raktasahayog
                            </span>
                        </Link>
                    )}
                    {!isSidebarOpen && (
                        <Link to="/org-dashboard" className="mx-auto">
                            <FaTint className="text-2xl text-red-600 dark:text-red-500" />
                        </Link>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 mx-2 mb-1 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            title={!isSidebarOpen ? item.name : ''}
                        >
                            <item.icon className="text-xl flex-shrink-0" />
                            {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {isSidebarOpen ? (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3 px-2">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <span className="text-red-600 dark:text-red-400 font-semibold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Organization</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <FaSignOutAlt className="mx-auto text-xl" />
                        </button>
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-gray-900/50" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 flex flex-col">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                            <Link to="/org-dashboard" className="flex items-center space-x-2">
                                <FaTint className="text-2xl text-red-600 dark:text-red-500" />
                                <span className="text-xl font-bold gradient-brand bg-clip-text text-transparent">
                                    Raktasahayog
                                </span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex-1 overflow-y-auto py-4">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-4 py-3 mx-2 mb-1 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <item.icon className="text-xl" />
                                    <span className="ml-3 font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile User Profile */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-center space-x-3 px-2 mb-2">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <span className="text-red-600 dark:text-red-400 font-semibold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Organization</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
                    {/* Page Title */}
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
                    </h2>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
                        </button>
                        {/* Notification Bell */}
                        <NotificationBell />
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <FaBars className="text-xl" />
                    </button>
                    <Link to="/org-dashboard" className="flex items-center space-x-2">
                        <FaTint className="text-2xl text-red-600 dark:text-red-500" />
                        <span className="text-xl font-bold gradient-brand bg-clip-text text-transparent">
                            Raktasahayog
                        </span>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default OrgLayout;
