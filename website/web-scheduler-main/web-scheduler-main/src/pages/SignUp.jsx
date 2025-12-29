import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function SignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        contactNumber: '',
        gender: '',
        birthday: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
        else if (!/^\d{10,11}$/.test(formData.contactNumber.replace(/\D/g, ''))) newErrors.contactNumber = 'Please enter a valid contact number';
        if (!formData.birthday) newErrors.birthday = 'Birthday is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const res = await axios.post('http://localhost:8081/login/signup', formData);
            alert(res.data.message);
            navigate('/login'); // Redirect to login page after signup
        } catch (err) {
            alert(err.response?.data.message || 'Signup failed');
        }

        setIsSubmitting(false);
    };

    const handleGoogleSignup = async (credentialResponse) => {
        try {
            const res = await axios.post('http://localhost:8081/login/google-login', {
                token: credentialResponse.credential,
            });

            console.log('Google signup/login response:', res.data);
            localStorage.setItem('token', res.data.token);
            alert(`Welcome, ${res.data.firstName}!`);
            navigate('/'); // Redirect after Google login/signup
        } catch (err) {
            console.error('Google signup failed:', err.response?.data || err.message);
            alert('Google signup/login failed!');
            console.log(credentialResponse);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-card">
                    <h1 className="signup-title">Sign up your Account</h1>
                    <p className="signup-subtitle">Unlock Your Skin's True Potential</p>

                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-grid">
                            <div className="form-column">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter your First Name"
                                        className={`form-input ${errors.firstName ? 'error' : ''}`}
                                    />
                                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter your Last Name"
                                        className={`form-input ${errors.lastName ? 'error' : ''}`}
                                    />
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={`form-input ${errors.gender ? 'error' : ''}`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <span className="error-text">{errors.gender}</span>}
                                </div>

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
                            </div>

                            <div className="form-column">
                                <div className="form-group">
                                    <label className="form-label">Middle Name</label>
                                    <input
                                        type="text"
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={handleChange}
                                        placeholder="Enter your Middle Name"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Contact Number</label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        placeholder="Enter your Contact Number"
                                        className={`form-input ${errors.contactNumber ? 'error' : ''}`}
                                    />
                                    {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Birthday</label>
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        className={`form-input ${errors.birthday ? 'error' : ''}`}
                                    />
                                    {errors.birthday && <span className="error-text">{errors.birthday}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your Password"
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
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing up...' : 'Sign up'}
                        </button>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSignup}
                                onError={() => console.log('Google signup/login failed')}
                            />
                        </div>
                    </form>

                    <p className="signup-footer">
                        Already have an account? <Link to="/login" className="link">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
