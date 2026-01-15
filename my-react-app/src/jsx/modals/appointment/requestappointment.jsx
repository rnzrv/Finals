import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import '../../../css/modal/appointment/requestAppointment.css';
import x from '../../../icons/x.svg';

function RequestAppointmentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null); // { text, type }

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [isOpen]);

  // Show popup inside modal
  const showPopup = (text, type = 'success') => {
    setPopupMessage({ text, type });
    setTimeout(() => setPopupMessage(null), 3000); // auto-hide after 3 seconds
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('accessToken');

      const res = await axios.get(
        'http://localhost:8081/web/appointments/getPendingRequests',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
      showPopup(err.response?.data?.message || 'Failed to fetch appointment requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (id) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:8081/web/appointments/updateRequestStatus/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showPopup('Appointment request approved', 'success');
      fetchAppointments();
    } catch (err) {
      console.error('Failed to accept request', err);
      showPopup(err.response?.data?.error || err.response?.data?.message || 'Failed to approve appointment request', 'error');
    }
  };

  const declineRequest = async (id) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:8081/web/appointments/declineRequest/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showPopup('Appointment request declined', 'success');
      fetchAppointments();
    } catch (err) {
      console.error('Failed to decline request', err);
      showPopup(err.response?.data?.message || 'Failed to decline appointment request', 'error');
    }
  };

  const openModal = () => {
    setIsOpen(true);
    fetchAppointments();
  };

  const modal = (
    <div className="request-appointment">
      <div className="request-appointment-container large" style={{ position: 'relative' }}>
        <div className="request-appointment-title">
          <h2>Appointment Requests</h2>
          <img src={x} alt="close" onClick={() => setIsOpen(false)} />
        </div>

        {/* Popup Message inside modal */}
        {popupMessage && (
          <div className={`modal-popup-message ${popupMessage.type}`}>
            {popupMessage.text}
          </div>
        )}

        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <table className="appointment-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">
                    No appointment requests
                  </td>
                </tr>
              ) : (
                appointments.map((a, i) => (
                  <tr key={a.request_id}>
                    <td>{i + 1}</td>
                    <td>{a.name}</td>
                    <td>{a.service}</td>
                    <td>{a.service_date}</td>
                    <td>{a.service_time}</td>
                    <td>
                      <button
                        className="approve-btn"
                        onClick={() => acceptRequest(a.request_id)}
                      >
                        Approve
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() => declineRequest(a.request_id)}
                      >
                        Decline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button className="request-appointment-btn" onClick={openModal}>
        View Appointment Requests
      </button>

      {isOpen && createPortal(modal, document.body)}
    </>
  );
}

export default RequestAppointmentModal;
