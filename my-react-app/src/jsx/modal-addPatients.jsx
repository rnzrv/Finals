import React, { useState } from "react";
import axios from "axios";
import "../css/modal-addPatients.css";

function AddPatients({ onPatientAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [lastVisit, setLastVisit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // "success" or "error"

  const openModal = () => {
    setIsOpen(true);
    setMessage(null); // Clear message when opening modal
    setMessageType(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setMessage(null); // Clear message when closing modal
    setMessageType(null);
  };

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\+?[\d\s-]{10,11}$/;
    return phoneRegex.test(number);
  };


  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(name);
  }

  const validateDate = (date) => {
    return !isNaN(new Date(date).getTime());
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous message
    setMessageType(null);

    if (!validatePhoneNumber(number)) {
      setMessage("Invalid phone number format (must be 10-11 digits, allowing +, spaces, or hyphens)");
      setMessageType("error");
      return;
    }

    if (!validateName(name)) {
      setMessage("Invalid name format (only letters, spaces, hyphens, and apostrophes are allowed)");
      setMessageType("error");
      return;
    }

    if (!validateDate(lastVisit)) {
      setMessage("Invalid date format for Last Visit");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("http://localhost:8081/addPatient", {
        name,
        email,
        number,
        last_visit: lastVisit,
      });
      setMessage("✅ Patient added successfully!");
      setMessageType("success");
      if (onPatientAdded) onPatientAdded();
      setName("");
      setEmail("");
      setNumber("");
      setLastVisit("");
      setTimeout(closeModal, 1000); // Close modal after 1s for success
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Unknown error occurred";
      setMessage(`❌ ${errorMessage}`);
      setMessageType("error");
      console.error("Error adding patient:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="addPatients">
      <button onClick={openModal} className="add-patient-btn">
        + Add Patient
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-labelledby="modal-title">
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title">Add New Patient</h2>

            <form className="modal-form" onSubmit={handleSubmit}>
              {message && (
                <p className={`message ${messageType}`}>{message}</p>
              )}

              <label>Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />

              <label>Last Visit</label>
              <input
                type="date"
                value={lastVisit}
                onChange={(e) => setLastVisit(e.target.value)}
                required
              />

              <div className="modal-buttons">
                <button type="submit" className="save-btn" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPatients;