import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Protects admin routes from unauthorized access
 * Only allows users with 'Admin' role to access protected pages
 */
const Protect = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
    const adminUserString = localStorage.getItem('adminUser');
    
    // Check if user is authenticated
    if (!isAuthenticated || !adminUserString) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }
    
    try {
        const adminUser = JSON.parse(adminUserString);
        
        // Check if user has Admin role
        if (adminUser.role !== 'Admin') {
            // Clear invalid session
            localStorage.removeItem('token');
            localStorage.removeItem('isAdminAuthenticated');
            localStorage.removeItem('adminUser');
            
            // Redirect to login
            return <Navigate to="/login" replace />;
        }
        
        // User is authenticated and has Admin role - allow access
        return children;
        
    } catch (error) {
        // If JSON parsing fails, clear storage and redirect
        console.error('Invalid admin user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('isAdminAuthenticated');
        localStorage.removeItem('adminUser');
        return <Navigate to="/login" replace />;
    }
};

export default Protect;