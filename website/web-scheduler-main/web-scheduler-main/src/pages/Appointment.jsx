import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, SERVICES, TIME_SLOTS } from '../context/AppContext';
import './Appointment.css';

function Appointment() {
    const navigate = useNavigate();
    const { bookAppointment } = useApp();

    // Form state
    const [selectedService, setSelectedService] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(11); // December (0-indexed)
    const [selectedYear, setSelectedYear] = useState(2025);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get days in month
    const daysInMonth = useMemo(() => {
        return new Date(selectedYear, selectedMonth + 1, 0).getDate();
    }, [selectedMonth, selectedYear]);

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = useMemo(() => {
        const day = new Date(selectedYear, selectedMonth, 1).getDay();
        // Convert to Monday-first (0 = Monday, 6 = Sunday)
        return day === 0 ? 6 : day - 1;
    }, [selectedMonth, selectedYear]);

    // Get today's date for comparison
    const today = new Date();
    const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const days = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, disabled: true });
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isPast = isCurrentMonth && day < today.getDate();
            days.push({ day, disabled: isPast });
        }

        // Add empty cells to complete the last week
        const remainingCells = 7 - (days.length % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                days.push({ day: null, disabled: true });
            }
        }

        return days;
    }, [daysInMonth, firstDayOfMonth, isCurrentMonth, today]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedService || !selectedDate || !selectedTime) {
            alert('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = bookAppointment({
            service: selectedService,
            date: new Date(selectedYear, selectedMonth, selectedDate),
            time: selectedTime,
        });

        if (result.success) {
            setSuccessMessage('Appointment booked successfully!');
            setTimeout(() => {
                setSuccessMessage('');
                navigate('/');
            }, 2000);
        }

        setIsSubmitting(false);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const selectedServiceObj = SERVICES.find(s => s.id === selectedService);

    return (
        <div className="appointment-page">
            <section className="appointment-section">
                <div className="appointment-header">
                    <h1 className="appointment-title">Book your Appointment</h1>
                    <p className="appointment-subtitle">Select your preferred service, date, and time</p>
                </div>

                <form onSubmit={handleSubmit} className="appointment-form">
                    {/* Service Selection */}
                    <div className="form-section">
                        <label className="form-label">Select Service</label>
                        <div className="custom-select-wrapper">
                            <button
                                type="button"
                                className="custom-select-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span>{selectedServiceObj ? selectedServiceObj.name : 'Please select'}</span>
                                <svg className={`chevron ${isDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <ul className="custom-select-options">
                                    {SERVICES.map(service => (
                                        <li
                                            key={service.id}
                                            className={`custom-select-option ${selectedService === service.id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedService(service.id);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {service.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        {/* Date Selection */}
                        <div className="form-section date-section">
                            <label className="form-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Select Date
                            </label>

                            {/* Month/Year Selectors */}
                            <div className="date-selectors">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="form-input date-select"
                                >
                                    {months.map((month, index) => (
                                        <option key={month} value={index}>{month}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="form-input date-select"
                                >
                                    {[2024, 2025, 2026].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Calendar Grid */}
                            <div className="calendar">
                                <div className="calendar-header">
                                    {weekDays.map(day => (
                                        <div key={day} className="calendar-weekday">{day}</div>
                                    ))}
                                </div>
                                <div className="calendar-grid">
                                    {calendarDays.map((item, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`calendar-day ${item.disabled ? 'disabled' : ''} ${selectedDate === item.day ? 'selected' : ''}`}
                                            disabled={item.disabled || !item.day}
                                            onClick={() => item.day && setSelectedDate(item.day)}
                                        >
                                            {item.day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="form-section time-section">
                            <label className="form-label">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                Select Time
                            </label>
                            <div className="time-grid">
                                {TIME_SLOTS.map(time => (
                                    <button
                                        key={time}
                                        type="button"
                                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                    </button>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="success-message">{successMessage}</div>
                    )}
                </form>
            </section>
        </div>
    );
}

export default Appointment;
