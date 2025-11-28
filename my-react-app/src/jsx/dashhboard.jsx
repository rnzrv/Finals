import React from "react";
import Sidebar from "./Sidebar.jsx";
import "../css/dashhboard.css";
import user from "../icons/user.svg";
import SalesChart from "./salesChart.jsx";
import TopProduct from "./topProduct.jsx";
import AppointmentCard from "./dashboardAppointment.jsx"; // ✅ Added import
import RecentCard from "./dashboardRecent.jsx";

function Dashhboard() {
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
          </div>
        </header>

        {/* Main layout */}
        <div className="dashboard-main-content">

          <div className="dashboard-bentoGrid">
            <div className="card-dashboard dashBox1">
              <p>Total Revenue</p>
              <h3>$25,000</h3>
            </div>
            <div className="card-dashboard dashBox2">
              <p>Total Product Sales</p>
              <h3>$30,145</h3>
            </div>
            <div className="card-dashboard dashBox3">
              <p>Total Service Sales</p>
              <h3>$12,500</h3>
            </div>
            <div className="card-dashboard dashBox4">
              <p>Profit Margin</p>
              <h3>$6,325</h3>
            </div>
          </div>

          <div className="dashboard-barGraph-pieGraph">
            <div className="dashboard-Graph dashboard-barGraph">
              <SalesChart />
            </div>
            <div className="dashboard-Graph dashboard-pieGraph">
              <TopProduct />
            </div>
          </div>

          <div className="appointment-recentSales">
            <div className="appointment">
              <div className="appointment-header">
                <h3>Today's Appointment</h3>
                <a href="#">View all</a>
              </div>
              <div className="appointment-content">
                <AppointmentCard
                  name="John Doe"
                  treatment="IV Treatment"
                  time="11:30 AM"
                  status="Confirmed"
                />
                <AppointmentCard
                  name="aric buya"
                  treatment="Laser Treatment"
                  time="1:30 PM"
                  status="Confirmed"
                />
                <AppointmentCard
                  name="Rahlf Arabau"
                  treatment="IV Treatment"
                  time="3:00 PM"
                  status="Confirmed"
                />

                <AppointmentCard
                  name="Rahlf Arabau"
                  treatment="IV Treatment"
                  time="3:00 PM"
                  status="Confirmed"
                />
                <AppointmentCard
                  name="Rahlf Arabau"
                  treatment="IV Treatment"
                  time="3:00 PM"
                  status="Confirmed"
                />
                
              </div>
            </div>

            <div className="recentSales">
              <div className="recent-header">
                <h3>Recent Sales</h3>
                <a href="#">View all</a>

              

              </div>
              <div className="recent-content">
                <RecentCard
                  name="Janli Arbues"
                  product="{sample product}"
                  amount="300"
                  status="paid"
                />
                <RecentCard
                  name="Janli Arbues"
                  product="{sample product}"
                  amount="300"
                  status="paid"
                />
                <RecentCard
                  name="Janli Arbues"
                  product="{sample product}"
                  amount="300"
                  status="paid"
                />
                <RecentCard
                  name="Janli Arbues"
                  product="{sample product}"
                  amount="300"
                  status="paid"
                />
                <RecentCard
                  name="Janli Arbues"
                  product="{sample product}"
                  amount="300"
                  status="paid"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashhboard;
