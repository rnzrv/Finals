import React, { useState, useEffect, useRef } from 'react';
import '../../../css/modal/notification.css';
import Inv from '../../../icons/inv-notif.svg';
import refresh from '../../../icons/refresh.svg';
import check from '../../../icons/check.svg';
import Appoint from '../../../icons/appoint.svg';
const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [lowInventory, setLowInventory] = useState([]);
  const [newAppointments, setNewAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, inventory, appointments
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('token');
  const API_URL = 'http://localhost:8081';

  // Fetch low inventory items (quantity <= 10)
  const fetchLowInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/lowInventory`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        setLowInventory(
          data.map((item) => ({
            id: item.itemId,
            type: 'inventory',
            title: `Low Stock: ${item.itemName}`,
            message: `Only ${item.quantity} units left`,
            quantity: item.quantity,
            itemName: item.itemName,
            brand: item.brand,
            icon: Inv,
            timestamp: new Date(),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // Fetch new/upcoming appointments
  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        setNewAppointments(
          data.map((appointment, index) => ({
            id: index,
            type: 'appointment',
            title: `Appointment: ${appointment.patientName}`,
            message: `${appointment.serviceName}`,
            date: appointment.date,
            time: appointment.time,
            patientName: appointment.patientName,
            doctorName: appointment.doctor,
            icon: Appoint,
            timestamp: new Date(appointment.date),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      await Promise.all([fetchLowInventory(), fetchAppointments()]);
      setLoading(false);
    };

    loadNotifications();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Combine notifications for "all" tab
  useEffect(() => {
    if (activeTab === 'all') {
      const combined = [...lowInventory, ...newAppointments].sort(
        (a, b) => b.timestamp - a.timestamp
      );
      setNotifications(combined);
    } else if (activeTab === 'inventory') {
      setNotifications(lowInventory);
    } else if (activeTab === 'appointments') {
      setNotifications(newAppointments);
    }
  }, [activeTab, lowInventory, newAppointments]);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchLowInventory(), fetchAppointments()]);
    setLoading(false);
  };

  const getNotificationCount = (tab) => {
    if (tab === 'all') return lowInventory.length + newAppointments.length;
    if (tab === 'inventory') return lowInventory.length;
    if (tab === 'appointments') return newAppointments.length;
    return 0;
  };

const totalCount = getNotificationCount('all');

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="View notifications"
      >
        <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {totalCount > 0 && <span className="notification-badge">{totalCount > 9 ? '9+' : totalCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-container">
            <div className="notification-header">
              <h2>Notifications</h2>
              <button 
                className="refresh-btn" 
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh notifications"
              >
                <img src={refresh} alt="Refresh" />
              </button>
            </div>

            <div className="notification-tabs">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({getNotificationCount('all')})
              </button>
              <button
                className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                Stock ({getNotificationCount('inventory')})
              </button>
              <button
                className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                Appointments ({getNotificationCount('appointments')})
              </button>
            </div>

            <div className="notification-content">
              {loading ? (
                <div className="notification-loading">
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                 <img src={check} alt="No notifications" /> <p>  No notifications at this time</p>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification, index) => (
                    <div
                      key={`${notification.type}-${notification.id}-${index}`}
                      className={`notification-item notification-${notification.type}`}
                    >
                      <div className="notification-icon">
                        {(notification.type === 'inventory' || notification.type === 'appointment') ? (
                          <img src={notification.icon} alt={`${notification.type} alert`} />
                        ) : (
                          notification.icon
                        )}
                      </div>
                      <div className="notification-details">
                        <h4 className="notification-title">{notification.title}</h4>
                        <p className="notification-message">{notification.message}</p>
                        {notification.type === 'inventory' && (
                          <div className="notification-meta">
                            <span className="brand">{notification.brand}</span>
                            <span className={`quantity ${notification.quantity <= 5 ? 'critical' : ''}`}>
                              Qty: {notification.quantity}
                            </span>
                          </div>
                        )}
                        {notification.type === 'appointment' && (
                          <div className="notification-meta">
                            <span className="date">{notification.date}</span>
                            <span className="time">{notification.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
