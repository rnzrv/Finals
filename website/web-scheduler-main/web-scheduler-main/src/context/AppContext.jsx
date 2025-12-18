import { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const AppContext = createContext(null);

// Services offered by the clinic
export const SERVICES = [
    { id: 'anti-aging', name: 'Anti-Aging Treatment', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 'anti-acne', name: 'Anti-Acne Treatment', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 'diode-laser', name: 'Diode Laser', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 'facial-peel', name: 'Facial and Peel', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 'gluta-drip', name: 'Gluta Drip', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 'whitening', name: 'Whitening', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
];

// Time slots available for appointments
export const TIME_SLOTS = [
    '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM',
    '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM',
];

// Context Provider component
export function AppProvider({ children }) {
    // User authentication state
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Login message for redirects
    const [loginMessage, setLoginMessage] = useState('');

    // Appointments storage
    const [appointments, setAppointments] = useState([]);

    // Login function (simulated)
    const login = useCallback((email, password) => {
        // Simulate login - in real app, this would call an API
        if (email && password) {
            const userData = {
                id: Date.now(),
                email,
                firstName: 'Guest',
                lastName: 'User',
            };
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true, user: userData };
        }
        return { success: false, error: 'Invalid credentials' };
    }, []);

    // Register function (simulated)
    const register = useCallback((userData) => {
        // Simulate registration
        const newUser = {
            id: Date.now(),
            ...userData,
        };
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true, user: newUser };
    }, []);

    // Logout function
    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    // Book an appointment
    const bookAppointment = useCallback((appointmentData) => {
        const newAppointment = {
            id: Date.now(),
            ...appointmentData,
            createdAt: new Date().toISOString(),
            status: 'confirmed',
        };
        setAppointments(prev => [...prev, newAppointment]);
        return { success: true, appointment: newAppointment };
    }, []);

    // Cancel an appointment
    const cancelAppointment = useCallback((appointmentId) => {
        setAppointments(prev =>
            prev.map(apt =>
                apt.id === appointmentId
                    ? { ...apt, status: 'cancelled' }
                    : apt
            )
        );
        return { success: true };
    }, []);

    // Context value
    const value = {
        // User state
        user,
        isAuthenticated,
        login,
        register,
        logout,

        // Login message for redirects
        loginMessage,
        setLoginMessage,

        // Appointments state
        appointments,
        bookAppointment,
        cancelAppointment,

        // Static data
        services: SERVICES,
        timeSlots: TIME_SLOTS,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook to use the context
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

export default AppContext;
