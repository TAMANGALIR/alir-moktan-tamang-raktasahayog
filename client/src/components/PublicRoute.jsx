import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute component - Redirects authenticated users to their dashboard
 * Prevents logged-in users from accessing landing page, login, and signup pages
 */
const PublicRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If user is authenticated, redirect to their respective dashboard
    if (isAuthenticated && user) {
        switch (user.role) {
            case 'ADMIN':
                return <Navigate to="/admin/dashboard" replace />;
            case 'ORGANIZATION':
                return <Navigate to="/org-dashboard" replace />;
            case 'USER':
                return <Navigate to="/dashboard" replace />;
            default:
                // Fallback to user dashboard if role is unknown
                return <Navigate to="/dashboard" replace />;
        }
    }

    // User is not authenticated, allow access to public pages
    return children;
};

export default PublicRoute;
