import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar.jsx";
import AddPatients from "./modals/modal-addPatients.jsx";
import "../css/patients.css";
import user from "../icons/user.svg";
import search from "../icons/search.svg";
import calendar from "../icons/calendar.svg";
import telephone from "../icons/telephone.svg";
import email from "../icons/email.svg";
import EditPatients from "./modals/modal-EditPatients.jsx";
import DeletePatient from "./modals/modal-deletepatient.jsx";
import ModalSchedulePatient from "./modals/modal-schedulePatient.jsx";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 12;

  const colors = ["#6A5ACD", "#FF69B4", "#BDA55D", "#4CAF50", "#2196F3", "#FF9800"];
  const RandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  // 🧠 Fetch all patients
  const getPatients = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:8081/patients/getPatients", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error.response || error.message);
    }
  };

  useEffect(() => {
    getPatients();
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(patients.length / patientsPerPage);

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
          {/* ✅ Top Summary */}
          <div className="patients-grid-container-top">
            <div className="card-patients">
              <p>Total Patients</p>
              <h3>{patients.length}</h3>
            </div>
            <div className="card-patients">
              <p>Scheduled Today</p>
              <h3>8</h3>
            </div>
            <div className="card-patients">
              <p>New This Week</p>
              <h3>7</h3>
            </div>
            <div className="card-patients">
              <p>Pending Follow Ups</p>
              <h3>2</h3>
            </div>
          </div>
          {/* ✅ Search + Add Patient */}
          <div className="patients-middle">
            <div className="patient-search">
              <img src={search} alt="" />
              <input type="text" placeholder="Search for patients..." />
            </div>
            <div className="patient-right">
              <AddPatients onPatientAdded={getPatients} />
            </div>
          </div>
          {/* ✅ Dynamic Patient Cards */}
          <div className="patients-grid-container">
            {currentPatients.map((patient) => (
              <div key={patient.id} className="patients-info">
                <div className="patients-info-header">
                  <div
                    className="patients-info-header-left"
                    style={{ backgroundColor: RandomColor() }}
                  >
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
                      {patient.email}
                    </div>
                    <div className="data patients-num">
                      <img src={telephone} alt="" />
                      {patient.contact_number}
                    </div>
                    <div className="data patients-last-visit" >
                      <img src={calendar} alt="" />
                      <p className={isNaN(new Date(patient.last_visit).getTime()) ? "Invalid" : "Valid"}>
                          Last visit: {isNaN(new Date(patient.last_visit).getTime())
                          ? "Invalid date"
                          : new Date(patient.last_visit).toLocaleDateString()}
                      </p>

                    </div>
                  </div>
                  <div className="patients-card-button patients-btn">
                    <EditPatients patient={patient} onPatientUpdated={getPatients} />
                    <DeletePatient patient={patient} onPatientDeleted={getPatients} />
                    <ModalSchedulePatient patient = {patient}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* ✅ Pagination */}
          <div className="patients-pagination patients-btn">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
              Prev
            </button>
            <span style={{ margin: "0 10px" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="green"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Patients;