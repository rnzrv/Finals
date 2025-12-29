import React from "react";
import Sidebar from "./Sidebar.jsx";
import "../css/dashboard.css";
import user from "../icons/user.svg";
import SalesChart from "./salesChart.jsx"; // ✅ match correct capitalization
import TopProduct from "./topProduct.jsx";
import notificationIcon from "../icons/notification.svg";

function Dashboard() {
  return (
    <div className="dashboard">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content on the right */}
      <div className="dashboard-content">
        <header>
          <h2>DASHBOARD</h2>
          <div className="dashboard-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          
            <button className="dashboard-logout-button">Notification</button>
          </div>
        </header>

        {/* Main layout */}
        <div className="dashboard-main-content">
          <div className="dashboard-left">
            {/* Sales chart section */}
            <div className="dashboard-sales-chart">
              <SalesChart />
            </div>

            {/* Sales Overview + Appointments */}
            <div className="dashboard-sales-appointments">
              <div className="dashboard-sales-overview">
                <div className="sales-overview-top">
                   <p>Sales Overview</p> 
                   <a href="">View All</a>
                </div>

                <div className="sales-overview-body">
                  <div className="overview-left">
                    <div className="left overview-left-top">
                      <p>Total Service Sales</p>
                      <h1>23</h1>
                    </div>
                    <div className="left overview-left-middle">
                      <p>Total Product Sales</p>
                      <h1>58</h1>
                    </div>

                    <div className="left overview-left-bottom">
                      <p>Total Cost</p>
                      <h1>18965</h1>

                    </div>

                  </div>
                  <div className="overview-middle">
                    <hr className="vertical-divider"/>
                  </div>
                  <div className="overview-right">
                    <div className="right overview-top">
                      <p>Total Revenue</p>
                      <h1>₹ 1,34,000</h1>
                    </div>
                    <div className="right overview-bottom">
                      <p>Total Profit</p>
                      <h1>₹ 1,14,000</h1>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="dashboard-appointments">
                <div className="appointments-header">
                  <p>Appointments</p>
                  <a href="#">View All</a>
                </div>
                <div className="appointments-list">
                  <table className="appointments-table">
                    <tbody>
                      <tr>
                        <td>John Doe</td>
                        <td>Haircut</td>
                        
                      </tr>
                      
                      <tr>
                        <td>Jane Smith</td>
                        <td>Facial</td>
                      </tr>
                      <tr>
                        <td>Alex Johnson</td>
                        <td>Massage</td>
                      </tr>
                      <tr>
                        <td>Maria Garcia</td>
                        <td>IV Drip</td>
                      </tr>
                      <tr>
                        <td>David Lee</td>
                        <td>Skin Care</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Recent Sales */}
            <div className="dashboard-recent-sales">
              Recent Sales
            </div>
          </div>

          {/* Right section */}
          <div className="dashboard-right">
            {/* Top Products */}
              <TopProduct />
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
