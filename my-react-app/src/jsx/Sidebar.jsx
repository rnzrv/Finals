import { Link, useLocation } from "react-router-dom";
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
import logout from '../icons/logout.svg';

function Sidebar() {
  const location = useLocation();

  // Flexible active route checker
  const isActive = (path) => location.pathname.startsWith(path);

  // Sidebar items list
  const menuItems = [
    { name: "Dashboard", path: "/dashhboard", icon: dashboard },
    { name: "Inventory", path: "/inventory", icon: inventory },
    { name: "Sales", path: "/sales", icon: sales },
    { name: "Purchases", path: "/purchases", icon: purchases },
    { name: "Reports", path: "/reports", icon: reports },
    { name: "Appointments", path: "/appointments", icon: appointments },
    { name: "Patients", path: "/patients", icon: patients },
  ];

  const footerItems = [
    { name: "Settings", path: "/settings", icon: settings },
    { name: "Logout", path: "/logout", icon: logout },
  ];

  return (
    <div className="sidebar">
      <header>
        <Link to="/dashhboard">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
        <h2>Beauwitty</h2>
      </header>

      <div className="sidebar-main-content">
        <ul>
          {menuItems.map((item) => (
            <div key={item.name} className={`side sidebar-${item.name.toLowerCase()} ${isActive(item.path) ? "active" : ""}`}>
              <li>
                <img src={item.icon} alt={`${item.name}-icon`} />
                <Link to={item.path}>{item.name}</Link>
              </li>
            </div>
          ))}
        </ul>
      </div>

      <footer>
        <ul>
          {footerItems.map((item) => (
            <div key={item.name} className={`side sidebar-${item.name.toLowerCase()} ${isActive(item.path) ? "active" : ""}`}>
              <li>
                <img src={item.icon} alt={`${item.name}-icon`} />
                <Link to={item.path}>{item.name}</Link>
              </li>
            </div>
          ))}
        </ul>
      </footer>
    </div>
  );
}

export default Sidebar;
