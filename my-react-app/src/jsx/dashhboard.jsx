import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import "../css/dashhboard.css";
import user from "../icons/user.svg";
import SalesChart from "./salesChart.jsx";
import TopProduct from "./topProduct.jsx";
import AppointmentCard from "./dashboardAppointment.jsx";
import RecentCard from "./dashboardRecent.jsx";
import axios from "axios";

function Dashhboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalProductSales: 0,
    totalServiceSales: 0,
    profitMargin: 0,
    salesTrends: { labels: [], sales: [], expenses: [] },
    topSellingServices: [],
    todayAppointments: [],
    recentSales: []
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");

      const res = await axios.get(
        "http://localhost:8081/dashboard/getDataMonthly",
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <header>
          <h2>DASHBOARD</h2>
          <div className="dashboard-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          </div>
        </header>

        <div className="dashboard-main-content">

          {/* TOP CARDS */}
          <div className="dashboard-bentoGrid">
            <div className="card-dashboard dashBox1">
              <p>Total Revenue</p>
              <h3>₱{data.totalRevenue.toLocaleString()}</h3>
            </div>

            <div className="card-dashboard dashBox2">
              <p>Total Product Sales</p>
              <h3>₱{data.totalProductSales.toLocaleString()}</h3>
            </div>

            <div className="card-dashboard dashBox3">
              <p>Total Service Sales</p>
              <h3>₱{data.totalServiceSales.toLocaleString()}</h3>
            </div>

            <div className="card-dashboard dashBox4">
              <p>Profit Margin</p>
              <h3>{data.profitMargin.toFixed(2)}%</h3>
            </div>
          </div>

          {/* CHARTS */}
          <div className="dashboard-barGraph-pieGraph">
            <div className="dashboard-Graph dashboard-barGraph">
              <SalesChart
  labels={data.salesTrends.labels}
  sales={data.salesTrends.sales}
  purchases={data.salesTrends.expenses}
/>

            </div>

            <div className="dashboard-Graph dashboard-pieGraph">
              <TopProduct products={data.topSellingServices} />
            </div>
          </div>

          {/* APPOINTMENTS + RECENT SALES */}
          <div className="appointment-recentSales">
            <div className="appointment">
              <div className="appointment-header">
                <h3>Today's Appointment</h3>
                <a href="#">View all</a>
              </div>

              <div className="appointment-content">
                {data.todayAppointments.map((a, i) => (
                  <AppointmentCard
                    key={i}
                    name={a.patientName}
                    treatment={a.serviceType}
                    time={a.appointmentTime}
                    status="Confirmed"
                  />
                ))}
              </div>
            </div>

            {/* RECENT SALES */}
            <div className="recentSales">
              <div className="recent-header">
                <h3>Recent Sales</h3>
                <a href="#">View all</a>
              </div>

              <div className="recent-content">
                {data.recentSales.map((s, i) => (
                  <RecentCard
                    key={i}
                    name={s.customerName}
                    product={s.reference}
                    amount={s.totalAmount}
                    status="paid"
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashhboard;
