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
import ModalPatientHistory from "./modals/modal-patientHistory.jsx";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 12;

  const colors = ["#6A5ACD", "#FF69B4", "#BDA55D", "#4CAF50", "#2196F3", "#FF9800"];
  const RandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  // ✅ Fetch patients
  const getPatients = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:8081/patients/getPatients", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  // ✅ Fetch appointments
  const getAppointments = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:8081/appointments/getAppointments", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    getPatients();
    getAppointments();
  }, []);

  // ✅ Derived stats
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday start
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday end

  const scheduledToday = appointments.filter((a) => {
    const date = new Date(a.date);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }).length;

  const newThisWeek = patients.filter((p) => {
    const created = new Date(p.created_at);
    return created >= startOfWeek && created <= endOfWeek;
  }).length;

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
              <h3>{scheduledToday}</h3>
            </div>
            <div className="card-patients">
              <p>New This Week</p>
              <h3>{newThisWeek}</h3>
            </div>
            <div className="card-patients">
              <p>Pending Follow Ups</p>
              <h3>—</h3>
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

          {/* ✅ Patient Cards */}
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
                    <div className="data patients-last-visit">
                      <img src={calendar} alt="" />
                      <p>
                        Last visit:{" "}
                        {patient.last_visit
                          ? new Date(patient.last_visit).toLocaleDateString()
                          : "No record"}
                      </p>
                    </div>
                  </div>
                  <div className="patients-card-button patients-btn">
                    <EditPatients patient={patient} onPatientUpdated={getPatients} />
                    <DeletePatient patient={patient} onPatientDeleted={getPatients} />
                    <ModalSchedulePatient patient={patient} />
                    <ModalPatientHistory patient={patient} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Pagination */}
          <div className="patients-pagination patients-btn">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>Prev</button>
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
