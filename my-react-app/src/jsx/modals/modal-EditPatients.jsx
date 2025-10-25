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
    number: "",
    last_visit: "",
  });

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const ANIMATION_MS = 300;
  const openButtonRef = useRef(null);

  // Current year for date input restrictions
  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;

  // Keep form in sync with patient when modal opens
  useEffect(() => {
    if (isOpen && patient) {
      console.log("Patient prop:", patient); // Debug
      const normalizedDate = patient.last_visit?.includes("T")
        ? patient.last_visit.slice(0, 10)
        : patient.last_visit || "";
      setFormData({
        name: patient.name || "",
        email: patient.email || "",
        number: patient.number || "",
        last_visit: normalizedDate,
      });
      setMessage(null);
      setMessageType(null);
    }
  }, [isOpen, patient]);

  // Manage mount/unmount for smooth transitions
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

  // Allow closing via Escape key
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

  // Form input handler
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
    // Validate date on blur
    if (name === "last_visit" && value) {
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      if (!dateRegex.test(value) || isNaN(new Date(value).getTime())) {
        setMessage(`Please enter a valid date in YYYY-MM-DD format (e.g., ${currentYear}-01-01)`);
        setMessageType("error");
      } else if (new Date(value).getFullYear() !== currentYear) {
        setMessage(`Date must be within ${currentYear}`);
        setMessageType("error");
      }
    }
  };

  // Validation logic
  const validateForm = () => {
    const { name, email, number, last_visit } = formData;
    if (!name || !email || !number || !last_visit) {
      console.log("Empty fields:", { name, email, number, last_visit }); // Debug
      return "All fields are required";
    }

    if (!/^[a-zA-Z\s'-]+$/.test(name))
      return "Name can only contain letters, spaces, hyphens, or apostrophes";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address";

    if (!/^(?:\+639|09|639)\d{9}$/.test(number))
      return "Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX";

    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!last_visit || !dateRegex.test(last_visit) || isNaN(new Date(last_visit).getTime())) {
      return `Please enter a valid date in YYYY-MM-DD format (e.g., ${currentYear}-01-01)`;
    }

    if (new Date(last_visit).getFullYear() !== currentYear) {
      return `Date must be within ${currentYear}`;
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
      onPatientUpdated(response.data);
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
    if (!patient || !patient.id || !patient.name || !patient.email || !patient.number || !patient.last_visit) {
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
            Phone Number
            <input
              name="number"
              type="tel"
              value={formData.number}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
              required
            />
          </label>

          <label>
            Last Visit
            <input
              name="last_visit"
              type="date"
              value={formData.last_visit}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isLoading}
              min={minDate}
              max={maxDate}
              required
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