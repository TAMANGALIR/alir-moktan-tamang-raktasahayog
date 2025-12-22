import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
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

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role-based access control
    if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (user?.role === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
