import Sidebar from "./Sidebar";
import user from "../icons/user.svg";
import "../css/appointment.css"; // ✅ new CSS file for styling
import search from "../icons/search.svg"

function Appointments() {
  const timeSlots = [
    "10:00 PM", "9:00 PM", "8:00 PM", "7:00 PM", "6:00 PM", "5:00 PM",
    "4:00 PM", "3:00 PM", "2:00 PM", "1:00 PM", "12:00 PM", "11:00 AM",
    "10:00 AM", "9:00 AM"
  ];

  const weekDays = [
    { short: "01 Mon" },
    { short: "02 Tue" },
    { short: "03 Wed"},
    { short: "04 Thu" },
    { short: "05 Fri" },
    { short: "06 Sat" },
    { short: "07 Sun" }
  ];

  const appointments = [
    { id: 1, doctorName: "Dr. John Doe", sessionType: "Session 1", patient: "Marvelous Jaco",  time: "10:00 PM", day: "05 Fri", color: "#FCD34D", textColor: "#333" },
    { id: 2, doctorName: "Dr. John Doe", sessionType: "Session 1", patient: "Ronz Arvie Remoroza", time: "9:00 PM", day: "02 Tue", color: "#FCD34D", textColor: "#333" },
    { id: 3, doctorName: "Dr. John Doe", sessionType: "Session 1", patient: "Ronz Arvie Remoroza",time: "7:00 PM", day: "03 Wed", color: "#FCD34D", textColor: "#333" },
    { id: 4, doctorName: "Dr. John Doe", sessionType: "Session 1", patient: "Ronz Arvie Remoroza",time: "6:00 PM", day: "04 Thu", color: "#FCD34D", textColor: "#333" },
    { id: 5, doctorName: "Dr. John Doe", sessionType: "Session 1", patient: "Ronz Arvie Remoroza",time: "5:00 PM", day: "01 Mon", color: "#15803D", textColor: "#fff" },
    { id: 6, doctorName: "Dr. John Doe", sessionType: "Session 1", patient: "Ronz Arvie Remoroza",time: "2:00 PM", day: "01 Mon", color: "#15803D", textColor: "#fff" },
    { id: 7, doctorName: "Dr. John Doe", sessionType: "Session 1", patient: "Ronz Arvie Remoroza",time: "9:00 AM", day: "01 Mon", color: "#15803D", textColor: "#fff" }
  ];

  const getAppointment = (time, day) =>
    appointments.find(a => a.time === time && a.day === day);

  return (
    <div className="appointments">
      <Sidebar />

      <div className="inventory-content">
        <header>
          <h2>APPOINTMENT</h2>
          <div className="dashboard-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          </div>
        </header>

        <div className="appointment-main-content">
          {/* Header Controls */}
          <div className="appointment-header">
            <div className="left">
                <h3>August 2024</h3>
                <button className="month">Month</button>
                <button className="week">Week</button>  
            </div>
            <div className="search-bar">
              <input type="text" placeholder="Search by Appointment" />
              <span className="search-icon"><img src={search} alt="" /></span>
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
                            backgroundColor: appointment.color,
                            color: appointment.textColor,
                          }}
                        >
                          <div>{appointment.doctorName}</div>
                          <div className="session">{appointment.sessionType}</div>
                          <div className="patient">{appointment.patient}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
