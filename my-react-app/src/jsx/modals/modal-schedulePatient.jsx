import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "../../css/modal/schedPatient.css";

function ModalSchedulePatient({ patient }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor: "",
    date: "",
    time: "",
    service_type: "",
    status: "",
    notes: "",
  });
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    email: "",
    contact: "",
  });
  const openButtonRef = useRef(null);

  // Map backend id to patient_id if needed
  const patientId = patient?.patient_id || patient?.id;

  // Fetch patient info when modal opens
  useEffect(() => {
    if (isOpen && patientId) {
      console.log("Fetching patient info for ID:", patientId);
      const fetchPatientInfo = async () => {
        try {
          const token = sessionStorage.getItem("accessToken");
          const response = await axios.get(
            `http://localhost:8081/patients/getPatientsdata/${patientId}`,
            { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
          );
          setPatientInfo({
            name: response.data.name,
            email: response.data.email,
            contact: response.data.contact_number,
          });
        } catch (error) {
          console.error("Error fetching patient info:", error.response?.data || error.message);
          setPatientInfo({ name: "Unknown", email: "", contact: "" });
        }
      };
      fetchPatientInfo();
    }
  }, [isOpen, patientId]);

  // Sync form with patient ID
  useEffect(() => {
    if (isOpen && patientId) {
      setFormData((prev) => ({ ...prev, patient_id: patientId }));
      setMessage(null);
      setMessageType(null);
    }
  }, [isOpen, patientId]);

  // Modal mount/unmount
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      const timeout = setTimeout(() => setIsMounted(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        openButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
    setMessageType(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      openButtonRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);

    if (
      !formData.patient_id ||
      !formData.doctor ||
      !formData.date ||
      !formData.time ||
      !formData.service_type ||
      !formData.status
    ) {
      setMessage("All fields except notes are required");
      setMessageType("error");
      return;
    }

    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      await axios.post(
        "http://localhost:8081/appointments/setAppointment",
        formData,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      setMessage("Appointment scheduled successfully");
      setMessageType("success");
      setFormData({
        patient_id: patientId,
        doctor: "",
        date: "",
        time: "",
        service_type: "",
        status: "",
        notes: "",
      });

      setTimeout(() => setIsOpen(false), 1000);
    } catch (error) {
      console.error("Scheduling error:", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.error || "An unexpected error occurred";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const modalContent = (
    <div
      className={`sched-modal-patient ${isOpen ? "open" : "closed"}`}
      onClick={handleOverlayClick}
    >
      <div className="sched-modal-content">
        <h2>Schedule Appointment</h2>
        {message && <p className={`message ${messageType}`}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="patient_id" value={formData.patient_id} />

          <label>
            Name
            <input type="text" value={patientInfo.name} readOnly />
          </label>
          <label>
            Email
            <input type="email" value={patientInfo.email} readOnly />
          </label>
          <label>
            Contact
            <input type="text" value={patientInfo.contact} readOnly />
          </label>

          <label>
            Doctor
            <input name="doctor" type="text" value={formData.doctor} onChange={handleInputChange} required />
          </label>
          <label>
            Date
            <input name="date" type="date" value={formData.date} onChange={handleInputChange} required />
          </label>
          <label>
            Time
            <input name="time" type="time" value={formData.time} onChange={handleInputChange} required />
          </label>
          <label>
            Service Type
            <input name="service_type" type="text" value={formData.service_type} onChange={handleInputChange} required />
          </label>
          <label>
            Status
            <input name="status" type="text" value={formData.status} onChange={handleInputChange} required />
          </label>
          <label>
            Notes
            <input name="notes" type="text" value={formData.notes} onChange={handleInputChange} />
          </label>

          <div className="modal-buttons">
            <button type="button" onClick={() => setIsOpen(false)}>Cancel</button>
            <button type="submit">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={openButtonRef}
        className="sched-patients-button"
        onClick={() => setIsOpen(true)}
      >
        Schedule
      </button>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  );
}

export default ModalSchedulePatient;
