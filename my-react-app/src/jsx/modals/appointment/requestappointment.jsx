import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import '../../../css/modal/appointment/requestAppointment.css';
import x from '../../../icons/x.svg';

function RequestAppointmentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [isOpen]);

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
        { headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAppointments();
    } catch (err) {
      console.error('Failed to accept request', err);
    }
  };


  const declineRequest = async (id) => {
  try {
    const token = sessionStorage.getItem('accessToken');

    await axios.put(
      `http://localhost:8081/web/appointments/declineRequest/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
    });

    fetchAppointments(); // refresh table
  } catch (err) {
    console.error('Failed to decline request', err);
  }
};


  const openModal = () => {
    setIsOpen(true);
    fetchAppointments();
  };

  const modal = (
    <div className="request-appointment">
      <div className="request-appointment-container large">
        <div className="request-appointment-title">
          <h2>Appointment Requests</h2>
          <img src={x} alt="close" onClick={() => setIsOpen(false)} />
        </div>

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
