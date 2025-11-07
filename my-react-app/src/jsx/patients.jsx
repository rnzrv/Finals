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
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [latestVisitData, setLastVisitData] = useState({});
  const [stats, setStats] = useState({
    total_patients: 0,
    scheduled_today: 0,
    new_this_week: 0,
  });

  const patientsPerPage = 12;
  const colors = ["#6A5ACD", "#FF69B4", "#BDA55D", "#4CAF50", "#2196F3", "#FF9800"];

  // ✅ Fetch patients
  const getPatients = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:8081/patients/getPatients", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assign fixed colors to patients
      const coloredPatients = res.data.map((p) => ({
        ...p,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      setPatients(coloredPatients);
      setFilteredPatients(coloredPatients);
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

  // ✅ Fetch latest visit per patient
  const latestVisit = async (patientId) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await axios.get(`http://localhost:8081/appointments/lastVisit/${patientId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setLastVisitData((prev) => ({
        ...prev,
        [patientId]: res.data,
      }));
    } catch (err) {
      console.error("Error fetching last visit:", err);
    }
  };

  // ✅ Fetch stats
  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await axios.get(`http://localhost:8081/appointments/stats`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    getPatients();
    getAppointments();
  }, []);

  // ✅ Fetch last visit when patients load
  useEffect(() => {
    if (patients.length > 0) {
      patients.forEach((p) => latestVisit(p.id));
    }
  }, [patients]);

  // ✅ Fetch stats automatically when patients or appointments change
  useEffect(() => {
    fetchStats();
  }, [patients, appointments]);

  // ✅ Search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.contact_number.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered);
    setCurrentPage(1); // Reset to first page on search
  };

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
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

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
              <h3>{stats.total_patients}</h3>
            </div>
            <div className="card-patients">
              <p>Scheduled Today</p>
              <h3>{stats.scheduled_today}</h3>
            </div>
            <div className="card-patients">
              <p>New This Week</p>
              <h3>{stats.new_this_week}</h3>
            </div>
          </div>

          {/* ✅ Search + Add Patient */}
          <div className="patients-middle">
            <div className="patient-search">
              <img src={search} alt="" />
              <input type="text" placeholder="Search for patients..." onChange={handleSearch} />
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
                    style={{ backgroundColor: patient.color }}
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
                        {latestVisitData[patient.id]?.last_visit
                          ? new Date(latestVisitData[patient.id].last_visit).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="patients-card-button patients-btn">
                    <EditPatients patient={patient} onPatientUpdated={getPatients} />
                    <DeletePatient patient={patient} onPatientDeleted={getPatients} />
                    <ModalSchedulePatient
                      patient={patient}
                      onScheduleUpdated={() => {
                        getAppointments();
                        latestVisit(patient.id);
                      }}
                    />
                    <ModalPatientHistory patient={patient} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Pagination */}
          <div className="patients-pagination patients-btn">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>Prev</button>
            <span style={{ margin: "0 10px", fontSize: "12px"}}>
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
