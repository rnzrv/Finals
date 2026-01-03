import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import '../css/Sidebar.css';
import logo from '../assets/logo.png';
import dashboard from '../icons/dashboard.svg';
import inventory from '../icons/inventory.svg';
import sales from '../icons/sales.svg';
import purchases from '../icons/purchases.svg';
import reports from '../icons/reports.svg';
import appointments from '../icons/appointments.svg';
import patients from '../icons/patients.svg';
import settings from '../icons/settings.svg';
import logoutIcon from '../icons/logout.svg';
import LogoutModal from "./modals/logout/logout";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [logoUrl, setLogoUrl] = useState(logo);
  const userRole = sessionStorage.getItem("role"); // Get role

  useEffect(() => {
    const stored = localStorage.getItem('logoUrl');
    if (stored) {
      const normalized = stored.startsWith('http')
        ? stored
        : `http://localhost:8081${stored.startsWith('/') ? '' : '/'}${stored}`;
      setLogoUrl(normalized);
    }
  }, []);

  const handleLogoutConfirm = () => {
    sessionStorage.clear();
    localStorage.clear();
    setShowLogout(false);
    navigate("/", { replace: true });
  };

  const handleLogoutClick = () => {
    setShowLogout(true);
  };

  

  const isActive = (path) => location.pathname===path;

  // Menu items with role-based access
  const menuItems = [
    { name: "Dashboard", path: "/dashhboard", icon: dashboard, roles: ["ADMIN", "ceo"] },
    { name: "Inventory", path: "/inventory", icon: inventory, roles: ["ceo", "MANAGER", "ADMIN", "CASHIER"] },
    { name: "Sales", path: "/sales", icon: sales, roles: ["ADMIN", "ceo", "MANAGER", "CASHIER"] },
    { name: "SalesHistory", path: "/salesHistory", icon: sales, roles: ["ADMIN","ceo", "MANAGER", "CASHIER"] },
    { name: "Purchases", path: "/purchases", icon: purchases, roles: ["ADMIN", "ceo", "MANAGER"] },
    { name: "Reports", path: "/reports", icon: reports, roles: ["ceo", "ADMIN"] },
    { name: "Appointments", path: "/appointments", icon: appointments, roles: ["ADMIN","ceo", "MANAGER", "STAFF", "CASHIER"] },
    { name: "Patients", path: "/patients", icon: patients, roles: ["ADMIN","ceo", "MANAGER", "STAFF"] },
  ];

  const footerItems = [
    { name: "Settings", path: "/settings", icon: settings, roles: ["ceo", "ADMIN"] },
    { name: "Logout", path: "#", icon: logoutIcon, action: handleLogoutClick },
  ];
  return (

    
    <div className="sidebar">

      
      <header>
        <Link to="/dashhboard" className="logo-inline">
          <img src={logoUrl} alt="Logo" className="logo" />
          <span className="logo-inline-text">Beauwitty</span>
        </Link>
      </header>

      <div className="sidebar-main-content">
        <ul>
          {menuItems.map((item) => (
            item.roles.includes(userRole) && (
              <div
                key={item.name}
                className={`side sidebar-${item.name.toLowerCase()} ${isActive(item.path) ? "active" : ""}`}
              >
                <li>
                  <img src={item.icon} alt={`${item.name}-icon`} />
                  <Link to={item.path}>{item.name}</Link>
                </li>
              </div>
            )
          ))}
        </ul>
      </div>

      <footer>
        <ul>
          {footerItems.map((item) => (
            (!item.roles || item.roles.includes(userRole)) && (
              <div
                key={item.name}
                className={`side sidebar-${item.name.toLowerCase()}`}
              >
                <li onClick={item.action ? item.action : undefined} style={{ cursor: item.action ? "pointer" : "default" }}>
                  <img src={item.icon} alt={`${item.name}-icon`} />
                  {item.action ? item.name : <Link to={item.path}>{item.name}</Link>}
                </li>
              </div>
            )
          ))}
        </ul>
      </footer>

      <LogoutModal
        open={showLogout}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  );
}

export default Sidebar;