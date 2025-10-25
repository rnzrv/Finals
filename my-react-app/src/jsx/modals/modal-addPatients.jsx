import React, { useState } from "react";
import axios from "axios";
import "../../css/modal/modal-addPatients.css";

function AddPatients({ onPatientAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [lastVisit, setLastVisit] = useState(""); // stores DD/MM/YYYY
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

  // ✅ Convert ISO (YYYY-MM-DD) → DD/MM/YYYY
  const formatToDMY = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  // ✅ Convert DD/MM/YYYY → ISO (YYYY-MM-DD)
  const formatToISO = (displayDate) => {
    if (!displayDate.includes("/")) return displayDate;
    const [day, month, year] = displayDate.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // ✅ Handle date input change
  const handleDateChange = (e) => {
    const isoValue = e.target.value; // always YYYY-MM-DD
    const dmyValue = formatToDMY(isoValue);
    setLastVisit(dmyValue);
  };

  // ✅ Set min and max date for current year
  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;

  const validateForm = () => {
    if (!name || !email || !number || !lastVisit) {
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
    if (!phoneRegex.test(number)) {
      return "Phone number must be in the format 09XXXXXXXXX or +639XXXXXXXXX";
    }

    const dateRegex = /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/; // DD/MM/YYYY
    if (!dateRegex.test(lastVisit)) {
      return "Please enter a valid date (DD/MM/YYYY)";
    }

    const [day, month, year] = lastVisit.split("/");
    const parsedDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid date value";
    }

    // ✅ Check if date is within the current year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    if (parsedDate < startOfYear || parsedDate > endOfYear) {
      return "Date must be within the current year (Jan 1 to Dec 31)";
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
        "http://localhost:8081/patients/addPatient",
        {
          name,
          email,
          number,
          last_visit: lastVisit, // send as DD/MM/YYYY
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
      setNumber("");
      setLastVisit("");
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
        + Add Patient
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
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />

              <label>Last Visit</label>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={formatToISO(lastVisit)}
                onChange={handleDateChange}
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
