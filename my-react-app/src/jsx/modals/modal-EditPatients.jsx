import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "../../css/modal/editPatient.css";

function EditPatients({ patient, onPatientUpdated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // "success" or "error"
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setMessage(null);
      setMessageType(null);
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    name: patient?.name || "",
    email: patient?.email || "",
    number: patient?.number || "",
    last_visit: patient?.last_visit || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
    setMessageType(null);
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.number || !formData.last_visit) {
      return 'All fields are required';
    }

    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(formData.name)) {
      return 'Name can only contain letters, spaces, hyphens, or apostrophes';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    const phoneRegex = /^(?:\+639|09|639)\d{9}$/;
    if (!phoneRegex.test(formData.number)) {
      return 'Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX';
    }

    if (isNaN(new Date(formData.last_visit).getTime())) {
      return 'Please enter a valid date';
    }

    return null; // Valid input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      console.log('Client-side validation error:', validationError);
      setMessage(validationError);
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    console.log('Sending request to backend:', { ...formData, id: patient.id });
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await axios.put(
        `http://localhost:8081/patients/updatePatient/${patient.id}`,
        {
          name: formData.name,
          email: formData.email,
          number: formData.number,
          last_visit: formData.last_visit,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Backend response (success):', response.data);
      setMessage("Patient updated successfully");
      setMessageType("success");
      onPatientUpdated();
      setTimeout(() => setIsOpen(false), 1000); // Close modal after 1 second
    } catch (error) {
      console.log('Backend error - Full error object:', error);
      console.log('Backend error - Response:', error.response);
      console.log('Backend error - Response data:', error.response?.data);
      console.log('Backend error - Error message:', error.message);
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      console.log('Backend error - Displayed error message:', errorMessage);
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className={`edit-modal-overlay ${isMounted ? "open" : ""}`}>
      <div className="edit-modal-content">
        <h2>Edit Patient</h2>
        {message && (
          <p className={`message ${messageType}`}>{message}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="number">Phone Number</label>
            <input
              type="tel"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="last_visit">Last Visit</label>
            <input
              type="date"
              id="last_visit"
              name="last_visit"
              value={formData.last_visit}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="edit-modal-buttons">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="green"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="patients-card-button"
        onClick={() => setIsOpen(true)}
      >
        Edit
      </button>
      {isOpen && isMounted && document.body
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}

export default EditPatients;