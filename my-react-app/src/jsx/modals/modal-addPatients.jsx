import React, { useState } from "react";
import axios from "axios";
import "../../css/modal/modal-addPatients.css";

function AddPatients({ onPatientAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact_number, setContactNumber] = useState("");
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState("");
  const [medical_notes, setMedicalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // "success" or "error"



  const openModal = () => {
    setIsOpen(true);
    setMessage(null);
    setMessageType(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setMessage(null);
    setMessageType(null);
  };

  // ✅ Validate form (removed date-related validation)
  const validateForm = () => {
    if (!name || !email || !contact_number) {
      return "All fields are required";
    }

    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name)) {
      return "Name can only contain letters, spaces, hyphens, or apostrophes";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    const phoneRegex = /^(?:\+639|09|639)\d{9}$/;
    if (!phoneRegex.test(contact_number)) {
      return "Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX";
    }

    if (isNaN(age) || age < 0 || age > 100) {
      return "Age must be a valid number between 0 and 100";
    }  

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8081/patients/addPatient", // Adjusted to match previous backend setup
        {
          name,
          email,
          contact_number,
          age,
          gender,
          medical_notes,
          status: "active" // Default status as per schema
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setMessage("Patient added successfully");
      setMessageType("success");
      if (onPatientAdded) onPatientAdded();
      setName("");
      setEmail("");
      setContactNumber("");
      setAge("");
      setGender("");
      setMedicalNotes("");
      setTimeout(closeModal, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "An unexpected error occurred";
      setMessage(errorMessage);
      setMessageType("error");
      console.error("Error adding patient:", error.response?.data || error.message);
    } finally {
    setIsLoading(false);
    }
  };

  return (
    <div className="addPatients">
      <button onClick={openModal} className="add-patient-btn">
          + Patient
      </button>

      {isOpen && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-labelledby="modal-title"
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 id="modal-title">Add New Patient</h2>

            <form className="modal-form" onSubmit={handleSubmit}>
              {message && <p className={`message ${messageType}`}>{message}</p>}

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
                value={contact_number}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />

              <label>Age</label>
              <input
                type="number"
                placeholder="Enter age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />

              <label>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <label>Medical Notes</label>
              <input
                type="text"
                placeholder="Enter medical notes"
                value={medical_notes}
                onChange={(e) => setMedicalNotes(e.target.value)}
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