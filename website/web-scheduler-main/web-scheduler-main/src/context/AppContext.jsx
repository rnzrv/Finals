import { createContext, useContext, useState, useCallback, useEffect} from 'react';
import axios from 'axios';

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


    const [fetchedServices, setFetchedServices] = useState([]);

    // Hydrate auth state from storage on load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken) {
            setIsAuthenticated(true);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    // ignore parse errors
                }
            }
        }
    }, []);

     useEffect(() => {
        axios.get('http://localhost:8081/website/services/getServices')
            .then(response => {
                console.log(response.data); // DEBUG
                setFetchedServices(response.data); // ✅ FIX
            })
            .catch(error => {
                console.error('Error fetching services:', error);
            });
    }, []);


    // User authentication state
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Login message for redirects
    const [loginMessage, setLoginMessage] = useState('');

    // Appointments storage
    const [appointments, setAppointments] = useState([]);

    // Login function (real API)
    const login = useCallback(async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8081/login/login', { email, password });
            const data = response.data;
            if (data?.token) {
                localStorage.setItem('token', data.token);
            }
            const userData = {
                id: data.id,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true, user: userData };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        }
    }, []);

    // Login with Google (set state from backend response)
    const loginWithGoogle = useCallback((data) => {
        if (data?.token) {
            localStorage.setItem('token', data.token);
        }
        const userData = {
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
    }, []);

    // Register function (simulated)
    const register = useCallback((userData) => {
        // Simulate registration
        const newUser = {
            id: Date.now(),
            ...userData,
        };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true, user: newUser };
    }, []);

    // Logout function
    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
        loginWithGoogle,
        register,
        logout,

        // Login message for redirects
        loginMessage,
        setLoginMessage,

        // Appointments state
        appointments,
        bookAppointment,
        cancelAppointment,
        fetchedServices,
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
