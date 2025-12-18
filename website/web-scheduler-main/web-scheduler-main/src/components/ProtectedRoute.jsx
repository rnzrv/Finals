import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function ProtectedRoute({ children }) {
    const { isAuthenticated, setLoginMessage } = useApp();
    const location = useLocation();

    if (!isAuthenticated) {
        // Set a message to show on the login page
        setLoginMessage('Please login or register to book an appointment.');

        // Redirect to login, saving the intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;
