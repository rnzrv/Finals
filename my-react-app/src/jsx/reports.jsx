import Sidebar from "./Sidebar.jsx";
import user from "../icons/user.svg";
import "../css/reports.css";
import calendar from "../icons/calendar.svg";

function Reports() {
  return (
    <div className="reports">
      <Sidebar />

      <div className="dashboard-content">
        <header>
          <h2>REPORTS</h2>
          <div className="dashboard-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          </div>
        </header>

        <div className="reports-container">
          <div className="reports-utilities">
            <div className="reports-util-left">
              <img src={calendar} alt="Calendar Icon" />
              <h1>Period:</h1>
              <input
                type="text"
                placeholder="10 April 2024 - 30 June 2024"
                className="period-input"
              />
            </div>

            <div className="reports-util-mid">
              <button>Weekly</button>
              <button>Monthly</button>
              <button>Quarterly</button>
              <button>Yearly</button>
            </div>

            <div className="reports-util-right">
              <button className="export-btn">Export</button>
            </div>

            
          </div>
          <div className="reports-performance">
                <h3>Financial Reports</h3>
                <h3>2024</h3>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
