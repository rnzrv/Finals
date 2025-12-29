import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Login.css';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithGoogle, loginMessage, setLoginMessage } = useApp();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authMessage, setAuthMessage] = useState('');

    // Show login message from redirect
    useEffect(() => {
        if (loginMessage) {
            setAuthMessage(loginMessage);
            setLoginMessage('');
        }
    }, [loginMessage, setLoginMessage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        const result = await login(formData.email, formData.password);

        if (result.success) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } else {
            setErrors({ general: result.error || 'Invalid credentials' });
        }
        setIsSubmitting(false);
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const response = await axios.post(
                'http://localhost:8081/login/google-login',
                { token: credentialResponse.credential }
            );

            // Update context with user data and token
            loginWithGoogle(response.data);

            // Redirect after login
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });

        } catch (err) {
            console.error('Google login failed:', err.response?.data || err.message);
            alert('Google login failed!');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <h1 className="login-title">Login your Account</h1>

                    <form onSubmit={handleSubmit} className="login-form">
                        {authMessage && (
                            <div className="auth-message">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {authMessage}
                            </div>
                        )}

                        {errors.general && (
                            <div className="error-message general">{errors.general}</div>
                        )}

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your Email Address"
                                className={`form-input ${errors.email ? 'error' : ''}`}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter Password"
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>

                        {/* Google Login */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => console.log('Google login failed')}
                            />
                        </div>
                    </form>

                    <p className="login-footer">
                        Don't have an account? <Link to="/signup" className="link">Register Now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
