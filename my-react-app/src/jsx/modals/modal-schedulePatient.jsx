import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "../../css/modal/schedPatient.css";

function ModalSchedulePatient({ patient, onScheduleUpdated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    date: "",
    time: "",
    service_type: "",
    notes: "",
  });
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    email: "",
    contact: "",
  });
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);


  const today = new Date().toISOString().split("T")[0];
  
  const openButtonRef = useRef(null);


  const patientId = patient?.patient_id || patient?.id;

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8081/services/services", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setServices(response.data || []);
        setFilteredServices(response.data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (isOpen && patientId) {
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

  useEffect(() => {
    if (isOpen && patientId) {
      setFormData((prev) => ({ ...prev, patient_id: patientId }));
      setSearchTerm("");
      setShowDropdown(false);
      setMessage(null);
      setMessageType(null);
    }
  }, [isOpen, patientId]);

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

  const handleServiceSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    if (value.trim() === "") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((service) =>
        service.serviceName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  };

  const handleServiceSelect = (service) => {
    setSearchTerm(service.serviceName);
    setFormData((prev) => ({ ...prev, service_type: service.serviceId }));
    setShowDropdown(false);
    setMessage(null);
    setMessageType(null);
  };

  const handleServiceFocus = () => {
    setShowDropdown(true);
    if (searchTerm.trim() === "") {
      setFilteredServices(services);
    }
  };

  const handleServiceBlur = (e) => {
    // Delay to allow click event to fire first
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
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
    !formData.date ||
    !formData.time ||
    !formData.service_type
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

    setMessage("Appointment booked successfully");
    setMessageType("success");
    setFormData({
      patient_id: patientId,
      date: "",
      time: "",
      service_type: "",
      notes: "",
    });

    // ✅ Trigger parent to refresh
    if (typeof onScheduleUpdated === "function") onScheduleUpdated();

    setTimeout(() => setIsOpen(false), 1000);
  } catch (error) {
    console.error("Booking error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || "An unexpected error occurred";
    setMessage(errorMessage);
    setMessageType("error");
  }
};


  const modalContent = (
    <div
      className={`book-appointment-modal ${isOpen ? "open" : "closed"}`}
      onClick={handleOverlayClick}
    >
      <div className="book-appointment-content">
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
            Date
            <input name="date" min={today} type="date" value={formData.date} onChange={handleInputChange} required />
          </label>
          <label>
            Time
            <select name="time" value={formData.time} onChange={handleInputChange} required>
              <option value="">Select time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
              <option value="18:00">6:00 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="20:00">8:00 PM</option>
              <option value="21:00">9:00 PM</option>
            </select>
          </label>
          <label>
            Service Type
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleServiceSearch}
                onFocus={handleServiceFocus}
                onBlur={handleServiceBlur}
                placeholder="Search service..."
                autoComplete="off"
                required
                style={{width: "100%"}}
              />
              {showDropdown && filteredServices.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    marginTop: "4px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  {filteredServices.map((service) => (
                    <div
                      key={service.serviceId}
                      onClick={() => handleServiceSelect(service)}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
                      onMouseLeave={(e) => (e.target.style.background = "#fff")}
                    >
                      {service.serviceName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </label>
          
          <label>
            Notes
            <input name="notes" type="text" value={formData.notes} onChange={handleInputChange} />
          </label>

          <div className="book-appointment-buttons">
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
        className="book-appointment-button sched"
        onClick={() => setIsOpen(true)}
      >
        Schedule
      </button>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  );
}


export default ModalSchedulePatient;
