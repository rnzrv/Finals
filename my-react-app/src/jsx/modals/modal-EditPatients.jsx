import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "../../css/modal/editPatient.css";

function EditPatients({ patient, onPatientUpdated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    age: "",
    gender: "",
    medical_notes: "",
    status: "",
  });

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const ANIMATION_MS = 300;
  const openButtonRef = useRef(null);

  // Sync form with patient data when modal opens
  useEffect(() => {
    if (isOpen && patient) {
      console.log("Patient prop:", patient); // Debug
      setFormData({
        name: patient.name || "",
        email: patient.email || "",
        contact_number: patient.contact_number || "", // Match backend field name
        age: patient.age || "",
        gender: patient.gender || "",
        medical_notes: patient.medical_notes || "",
        status: patient.status || "",
      });
      setMessage(null);
      setMessageType(null);
    }
  }, [isOpen, patient]);

  // Manage mount/unmount for transitions
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setIsMounted(false), ANIMATION_MS);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        openButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
    setMessageType(null);
  };

  // Prevent empty inputs
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    if (!value && patient[name]) {
      setFormData((prev) => ({ ...prev, [name]: patient[name] || "" }));
    }
  };

  // Validation logic (aligned with backend)
  const validateForm = () => {
    const { name, email, contact_number, age, gender, medical_notes, status } = formData;
    if (!name || !email || !contact_number) {
      console.log("Empty fields:", { name, email, contact_number });
      return "Name, email, and contact number are required";
    }

    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return "Name can only contain letters, spaces, hyphens, or apostrophes";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }

    if (!/^(?:\+639|09|639)\d{9}$/.test(contact_number)) {
      return "Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX";
    }

    if (age && (isNaN(age) || age < 0 || age > 150)) {
      return "Age must be a valid number between 0 and 150";
    }

    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      return "Gender must be Male, Female, or Other";
    }

    return null;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);

    const error = validateForm();
    if (error) {
      setMessage(error);
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      const response = await axios.put(
        `http://localhost:8081/patients/updatePatient/${patient.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setMessage("Patient updated successfully");
      setMessageType("success");
      onPatientUpdated(response.data); // Backend returns { message: ... }
      setTimeout(() => setIsOpen(false), 1000);
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      const errMsg = err.response?.data?.error || "An unexpected error occurred";
      setMessage(errMsg);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Overlay click closes modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      openButtonRef.current?.focus();
    }
  };

  // Modal open with validation
  const handleOpenModal = () => {
    if (!patient || !patient.id || !patient.name || !patient.email || !patient.contact_number) {
      setMessage("Invalid patient data");
      setMessageType("error");
      return;
    }
    setIsOpen(true);
  };

  // Modal structure
  const modalContent = (
    <div
      className={`edit-modal-overlay ${isOpen ? "open" : "closed"}`}
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      <div className="edit-modal-content" role="dialog" aria-modal="true">
        <h2>Edit Patient</h2>

        {message && <p className={`message ${messageType}`}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
              required
            />
          </label>

          <label>
            Contact Number
            <input
              name="contact_number" // Updated to match backend
              type="tel"
              value={formData.contact_number}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
              required
            />
          </label>

          <label>
            Age
            <input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
            />
          </label>

          <label>
            Gender
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Medical Notes
            <input
              name="medical_notes"
              type="text"
              value={formData.medical_notes}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
            />
          </label>

          <label>
            Status
            <input
              name="status"
              type="text"
              value={formData.status}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
            />
          </label>

          <div className="edit-modal-buttons">
            <button type="button" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="green" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button ref={openButtonRef} className="patients-card-button" onClick={handleOpenModal}>
        Edit
      </button>

      {isMounted && createPortal(modalContent, document.body)}
    </>
  );
}

export default EditPatients;