import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "../../css/modal/patientHistory.css"; // make sure this file exists

function ModalPatientHistory({ patient }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const openButtonRef = useRef(null);

  // Open modal
  const openModal = () => {
    document.body.classList.add("modal-open");
    setIsOpen(true);
    setIsMounted(true);
  };

  // Close modal
  const closeModal = () => {
    document.body.classList.remove("modal-open");
    setIsOpen(false);
  };

  // Close when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
      openButtonRef.current?.focus();
    }
  };

  // Fetch patient history when modal opens
  useEffect(() => {
    if (isOpen && patient?.id) {
      axios
        .get(`http://localhost:8081/appointments/history/${patient.id}`)
        .then((res) => {
          setHistory(res.data || []);
          setCurrentPage(1);
        })
        .catch((err) => console.error("Error fetching history:", err));
    }
  }, [isOpen, patient]);

  // Reset page when history changes from outside or modal reopens
  useEffect(() => {
    setCurrentPage(1);
  }, [history.length]);

  const totalPages = Math.max(1, Math.ceil((history?.length || 0) / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedHistory = history.slice(startIndex, startIndex + PAGE_SIZE);

  // Modal JSX
  const modalContent = (
    <div
      className={`patient-history-overlay ${isOpen ? "open" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="patient-history-modal">
        <div className="modal-header">
          <h2>History</h2>
          <button className="close-btn" onClick={closeModal}>
            ✕
          </button>
        </div>

        <p>
          <strong>Name:</strong>{" "}
          <span className="patient-name">{patient?.name}</span>
        </p>

        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type of Service</th>
            </tr>
          </thead>
          <tbody>
            {pagedHistory.length > 0 ? (
              pagedHistory.map((item, index) => (
                <tr key={index}>
                  <td>
                    {new Date(item.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    {new Date(`1970-01-01T${item.time}`).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </td>
                  <td>{item.service_name || item.service_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">
                  No history available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {history.length > PAGE_SIZE && (
          <div className="history-pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render modal via portal
  return (
    <>
      <button
        ref={openButtonRef}
        onClick={openModal}
        className="view-history-btn history"
      >
        View History
      </button>

      {isMounted && createPortal(modalContent, document.body)}
    </>
  );
}

export default ModalPatientHistory;
