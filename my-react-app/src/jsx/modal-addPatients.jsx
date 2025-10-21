import React, { useState } from "react";
import axios from "axios";
import "../css/modal-addPatients.css";

function AddPatients({ onPatientAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [lastVisit, setLastVisit] = useState("");

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8081/addPatient", {
        name,
        email,
        number,
        last_visit: lastVisit, // match DB column name
      });

      alert("✅ Patient added successfully!");

      // Refresh the list in Patients.jsx
      if (onPatientAdded) onPatientAdded();

      // Clear form
      setName("");
      setEmail("");
      setNumber("");
      setLastVisit("");
      closeModal();
    } catch (error) {
      alert("❌ Error adding patient. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="addPatients">
      {/* 🟢 Button to open modal */}
      <button onClick={openModal} className="add-patient-btn">
        + Add Patient
      </button>

      {/* 🧠 Modal structure */}
      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <h2>Add New Patient</h2>

            <form className="modal-form" onSubmit={handleSubmit}>
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
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
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
