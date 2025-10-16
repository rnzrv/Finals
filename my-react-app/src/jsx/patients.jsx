import React, { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import "../css/patients.css";
import user from "../icons/user.svg";
import search from "../icons/search.svg";
import calendar from "../icons/calendar.svg";
import telephone from "../icons/telephone.svg";
import email from "../icons/email.svg";

function Patients() {
  const [patients, setPatients] = useState([

  ]);

  const colors = ["#6A5ACD", "#FF69B4", "#BDA55D", "#4CAF50", "#2196F3", "#FF9800"];
  const RandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];

  }

  const addPatient = () => {
    const newPatient = {
      id: patients.length + 1,
      name: `Patient ${patients.length + 1}`,
      age: Math.floor(Math.random() * 40) + 20,
      condition: "Check-up",
        colors:RandomColor(),
    };
    setPatients([...patients, newPatient]);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };


  return (
    <div className="patients">
      <Sidebar />

      <div className="dashboard-content">
        <header>
          <h2>PATIENTS</h2>
          <div className="dashboard-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          </div>
        </header>

        <div className="patients-main-content">
          {/* Top Summary Boxes */}
          <div className="patients-grid-container-top">
            <div className="card-patients">
              <p>Total Patients</p>
              <h3>{patients.length}</h3>
            </div>
            <div className="card-patients">
              <p>Admitted</p>
              <h3>8</h3>
            </div>
            <div className="card-patients">
              <p>Outpatients</p>
              <h3>7</h3>
            </div>
            <div className="card-patients">
              <p>Critical</p>
              <h3>2</h3>
            </div>
          </div>

          {/* Middle Controls */}
          <div className="patients-middle">
            <div className="patient-search">
              <img src={search} alt="" />
              <input type="text" placeholder="Search for patients..." />
            </div>
            <div className="patient-right">
              <button onClick={addPatient}>Add Patient</button>
            </div>
          </div>

          {/* 🧠 Dynamic Patient Cards */}
          <div className="patients-grid-container">
            {patients.map((patient) => (
              <div key={patient.id} className="patients-info">
                <div className="patients-info-header">
                    <div className="patients-info-header-left" style={{backgroundColor:patient.colors}}>
                        <h1>{getInitials(patient.name)}</h1>
                    </div>
                    <div className="patients-info-header-right">
                        <h1>{patient.name}</h1>
                        <h3>Status</h3>
                    </div>
                </div>
                <div className="patients-info-bottom">
                    <div className="patients-data">
                        <div className="data patients-email">
                            <img src={email} alt="" />
                            ralfabrau@gmail.com
                        </div>
                        <div className="data patients-num">
                            <img src={telephone} alt="" />
                            +63 354 456 789
                        </div>
                        <div className="data patients-last-visit">
                            <img src={calendar} alt="" />
                            Last visit: Sep 15, 2025
                        </div>
                    </div>
                    <div className="patients-card-button patients-btn">
                        <button>Edit</button>
                        <button>Delete</button>
                        <button className="green">Schedule</button>
                    </div>               
                </div>
                  
              </div>
              
            ))}
          </div>
            <div className="patients-pagination patients-btn">
                <button>Next</button>
                <button className="green">Prev</button>
            </div>
        </div>

      </div>
    </div>
  );
}

export default Patients;
