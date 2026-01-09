import Sidebar from "./Sidebar";
import user from "../icons/user.svg";
import "../css/appointment.css"; // ✅ new CSS file for styling
import search from "../icons/search.svg"
import React, {useState, useEffect} from "react";
import axios from "axios";
import RequestAppointment from "./modals/appointment/requestappointment";
import Notification from './modals/notification/notification';
import LogoutModal from "./modals/logout/logout";
function Appointments() {

  const Months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const color = ["#BDA55D", "rgba(206, 3, 3, 0.8)",]

  const [selectedMonth, setSelectedMonth] = useState(Months[new Date().getMonth()]);
  const [selectedWeek, setSelectedWeek] = useState(Math.ceil(new Date().getDate() / 7));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const role = sessionStorage.getItem("role") || localStorage.getItem("role");

  // Generate years: 5 years back to 5 years forward
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const Week = [1, 2, 3, 4, 5];

  useEffect(() => {
    const monthIndex = Months.indexOf(selectedMonth);
    const days = new Date(selectedYear, monthIndex + 1, 0).getDate();
    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
  }, [selectedMonth, selectedYear]);

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM",
    "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
    "9:00 PM", "10:00 PM"
  ];

  /* Map week numbers to their corresponding days
   * Week 1: 01 Mon - 07 Sun
   * Week 2: 08 Mon - 14 Sun
   * Week 3: 15 Mon - 21 Sun
   * Week 4: 22 Mon - 28 Sun
   * Week 5: 29 Mon - 31 Sun (if applicable)
   */
  
  const [weekDays, setWeekDays] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (daysInMonth.length === 0) return;
    
    const monthIndex = Months.indexOf(selectedMonth);
    const firstDayOfMonth = new Date(selectedYear, monthIndex, 1);
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    const mondayOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
    const startDay = (selectedWeek - 1) * 7 + 1 - mondayOffset;
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const dayNum = startDay + i;
      
      if (dayNum < 1 || dayNum > daysInMonth.length) continue;
      
      const date = new Date(selectedYear, monthIndex, dayNum);
      
      if (date.getMonth() === monthIndex && date.getDate() === dayNum) {
        days.push({ 
          short: `${dayNum.toString().padStart(2, '0')} ${date.toLocaleString('en-US', { weekday: 'short' })}` 
        });
      }
    }
    
    setWeekDays(days);
  }, [selectedWeek, selectedMonth, selectedYear, daysInMonth]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await axios.get("http://localhost:8081/appointments/getAppointments/appointmentPage", {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched Appointments:", res.data);
        setAppointments(res.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const handleCloseClick = async (appointmentId) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      await axios.delete(`http://localhost:8081/appointments/cancelAppointment/${appointmentId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
      console.log('Appointment cancelled:', appointmentId);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const getAppointment = (time, day) => {
    // day format: "05 Fri", we need to extract day number and match with date
    const dayNum = parseInt(day.split(' ')[0]);
    const monthIndex = Months.indexOf(selectedMonth);
    const appointmentDate = `${selectedYear}-${(monthIndex + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    
    return appointments.find(a => {
      // Convert date from DB format (might be datetime object)
      const dbDate = typeof a.date === 'string' ? a.date.split('T')[0] : a.date;
      
      // Convert 24-hour time from DB to 12-hour format for comparison
      const dbTime = a.time; // e.g., "14:30:00" or "14:30"
      const [hours, minutes] = dbTime.split(':');
      let hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      const formattedTime = `${hour}:00 ${period}`; // Match format "2:00 PM"
      
      console.log('Comparing:', { dbDate, appointmentDate, formattedTime, time, match: dbDate === appointmentDate && formattedTime === time });
      
      return dbDate === appointmentDate && formattedTime === time;
    });
  };

  return (
    <div className="appointments">
      <Sidebar />

      <div className="inventory-content">
        <header>
          <h2>APPOINTMENT</h2>
          <div className="inventory-account">
            <Notification /> 

            <button onClick={() => setShowLogoutModal(true)}
            
              className="inventory-user-btn">
            <img src={user} alt="Admin Icon"/>
            
            <p>{role}</p>
            </button>
          </div>
        </header>

        <div className="appointment-main-content">
          {/* Header Controls */}
          <div className="appointment-header">
            <div className="left">
                {/* Passing object of the Month and Week */} 
                 
                 
                <h3>{selectedMonth} {selectedYear}</h3>
                {/* Month + selected year */}
                <div className="month">
                  <select id="choices" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    {Months.map((month, index) => (

                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  

                  {/* Pass if what number of the month is selected then will be passed on the backend(drop down the months)*/}


                </div>
                
                <div className="week">Week
                {/* Choose week number ( 1 - 4 or 5?) */}
                    <select name="week" id="week" value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
                      
                      {Week.map((weekNumber, index) => (
                        <option key={index} value={weekNumber}>{weekNumber}</option>
                      ))}
                    </select>
                </div>
                <div className="week">Year</div>
                <div className="week">
                  <select name="week"value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
            </div>
            <div className="search-bar">
             
              <RequestAppointment />
            </div>

          </div>

          {/* Calendar Table */}
          <div className="calendar-table">
            <div className="calendar-row calendar-head">
              <div className="calendar-cell time-header">Time</div>
              {weekDays.map(day => (
                <div key={day.short} className="calendar-cell day-header">
                  {day.short}
                </div>
              ))}
            </div>

            {timeSlots.map(time => (
              <div key={time} className="calendar-row">
                <div className="calendar-cell time-cell">{time}</div>
                {weekDays.map(day => {
                  const appointment = getAppointment(time, day.short);
                  return (
                    <div key={`${time}-${day.short}`} className="calendar-cell day-cell">
                      {appointment && (
                        <div
                          className="appointment-box"
                          style={{
                            backgroundColor: appointment.status === 'Scheduled' ? '#FCD34D' : appointment.status === 'Cancelled' ? 'rgba(206, 3, 3, 0.8)' : '#15803D',
                            color: appointment.status === 'Scheduled' ? '#333' : '#fff',
                          }}
                        >
                          <div className="close-button"><button onClick={() => handleCloseClick(appointment.id)}>X</button></div>
                          <div className="session">{appointment.sessionType}</div>
                          <div className="patient">{appointment.patientName}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {showLogoutModal && (
                <LogoutModal
                  open={showLogoutModal}
                  onCancel={() => setShowLogoutModal(false)}
                  onConfirm={() => {
                    sessionStorage.clear();
                    window.location.href = "/";
                  }}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
