import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, TIME_SLOTS } from '../context/AppContext';
import './Appointment.css';
import axios from 'axios';

function Appointment() {
    const navigate = useNavigate();
    const { fetchedServices } = useApp();

    // Form state
    const [selectedService, setSelectedService] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(11); // December
    const [selectedYear, setSelectedYear] = useState(2025);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};


    // Book appointment
    const bookAppointment = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Please login first');
            return { success: false, error: 'No token' };
        }

        try {
            const res = await axios.post(
                'http://localhost:8081/website/services/website-appointment',
                {
                    serviceAvailed: selectedService,
                    preferredDate: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`,
                    preferredTime: convertTo24Hour(selectedTime)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return { success: true, data: res.data };
        } catch (err) {
            console.error('Error booking appointment:', err.response?.data || err.message);
            return { success: false, error: err.response?.data?.message || 'Network error' };
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedService || !selectedDate || !selectedTime) {
            alert('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        const result = await bookAppointment();

        if (!result) {
            alert('Something went wrong');
            setIsSubmitting(false);
            return;
        }

        if (result.success) {
            setSuccessMessage('Appointment booked successfully!');
            setTimeout(() => {
                setSuccessMessage('');
                navigate('/');
            }, 2000);
        } else {
            alert(result.error || 'Failed to book appointment');
        }

        setIsSubmitting(false);
    };

    const daysInMonth = useMemo(() => new Date(selectedYear, selectedMonth + 1, 0).getDate(), [selectedMonth, selectedYear]);
    const firstDayOfMonth = useMemo(() => {
        const day = new Date(selectedYear, selectedMonth, 1).getDay();
        return day === 0 ? 6 : day - 1;
    }, [selectedMonth, selectedYear]);

    const today = new Date();
    const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;

    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push({ day: null, disabled: true });
        for (let day = 1; day <= daysInMonth; day++) {
            const isPast = isCurrentMonth && day < today.getDate();
            days.push({ day, disabled: isPast });
        }
        const remainingCells = 7 - (days.length % 7);
        if (remainingCells < 7) for (let i = 0; i < remainingCells; i++) days.push({ day: null, disabled: true });
        return days;
    }, [daysInMonth, firstDayOfMonth, isCurrentMonth, today]);

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const selectedServiceObj = fetchedServices.find(s => s.serviceId === selectedService);

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
                            <button type="button" className="custom-select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <span>{selectedServiceObj ? selectedServiceObj.serviceName : 'Please select'}</span>
                                <svg className={`chevron ${isDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <ul className="custom-select-options">
                                    {fetchedServices.map(service => (
                                        <li key={service.serviceId} className={`custom-select-option ${selectedService === service.serviceId ? 'selected' : ''}`}
                                            onClick={() => { setSelectedService(service.serviceId); setIsDropdownOpen(false); }}>
                                            {service.serviceName}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Date and Time Selection */}
                    <div className="form-row">
                        <div className="form-section date-section">
                            <label className="form-label">Select Date</label>
                            <div className="date-selectors">
                                <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="form-input date-select">
                                    {months.map((month, index) => <option key={month} value={index}>{month}</option>)}
                                </select>
                                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="form-input date-select">
                                    {[2024,2025,2026,2027,2028,2029,2030].map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                            </div>

                            <div className="calendar">
                                <div className="calendar-header">{weekDays.map(day => <div key={day} className="calendar-weekday">{day}</div>)}</div>
                                <div className="calendar-grid">
                                    {calendarDays.map((item,index) => (
                                        <button key={index} type="button" className={`calendar-day ${item.disabled ? 'disabled' : ''} ${selectedDate===item.day ? 'selected' : ''}`}
                                            disabled={item.disabled || !item.day} onClick={()=>item.day && setSelectedDate(item.day)}>
                                            {item.day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-section time-section">
                            <label className="form-label">Select Time</label>
                            <div className="time-grid">
                                {TIME_SLOTS.map(time => (
                                    <button key={time} type="button" className={`time-slot ${selectedTime===time?'selected':''}`} onClick={()=>setSelectedTime(time)}>
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                    </button>

                    {/* Success Message */}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                </form>
            </section>
        </div>
    );
}

export default Appointment;
