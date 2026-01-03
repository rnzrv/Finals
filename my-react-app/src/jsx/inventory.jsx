import Sidebar from './Sidebar.jsx';
import '../css/inventory.css';
import user from "../icons/user.svg";
import date from "../icons/date.svg";
import dropDown from "../icons/drop_down.svg";
import search from "../icons/search.svg";
import eye from "../icons/eye.svg";
import check from "../icons/checkbook.svg";
import x from "../icons/x.svg";
import AddProduct from './modals/inventory-modal/modal-addProduct.jsx';
import React, { useState, useEffect } from 'react';
import InventoryDeleteAction from './modals/inventory-modal/inventory-action-delete.jsx';
import InventoryEditAction from './modals/inventory-modal/inventory-action-edit.jsx';
import axios from 'axios';
import Notification from './modals/notification/notification.jsx';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './modals/logout/logout.jsx';

function Inventory() {

  const [inventory, setInventory] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const role = sessionStorage.getItem("role") || localStorage.getItem("role");
  const test = showLogoutModal ? console.log("Logout Modal Opened") : null;
  

  const getInventoryData = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8081/inventory/getInventory', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined
        },
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(res.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  }

  useEffect(() => {
    getInventoryData();
  }, []);

  useEffect(() => {
    getInventoryData();
  }, [startDate, endDate]); 

  // for handling search
  const [searchQuery, setSearchQuery] = useState('');
  const filterItems = searchQuery
    ? inventory.filter(item => {
        const expiry = item.expiryDate ? item.expiryDate.slice(0, 10) : '';
        return (
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expiry.includes(searchQuery)
        );
      })
    : inventory;

  const maxItemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = filterItems.length;
  const totalPages = Math.ceil(totalItems / maxItemsPerPage);
  const startIndex = (currentPage - 1) * maxItemsPerPage;
  const endIndex = startIndex + maxItemsPerPage;

  const currentItems = filterItems.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  // Export function
  const exportInventoryCSV = () => {
    const rows = [
      ["Item", "Brand", "Code", "Cost Unit", "Selling Price", "Category", "Quantity", "Expiry Date"],
      ...filterItems.map(item => [
        item.itemName,
        item.brand,
        item.code,
        item.costUnit,
        item.sellingPrice,
        item.quantity,
        item.expiryDate || "N/A"
      ])
    ];

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="inventory">
      <Sidebar />

      <div className="inventory-content">
        <header>
          <h2>INVENTORY</h2>
          <div className="inventory-account">
            <Notification /> 

            <button onClick={() => setShowLogoutModal(true)}
            
              className="inventory-user-btn">
            <img src={user} alt="Admin Icon"/>
            
            <p>{role}</p>
            </button>
          </div>
        </header>

        <div className="inventory-main-content">
          <div className="inventory-utensil">
            <div className="inventory-select-period">
              <h3>Select Period:</h3>
              <div className="inventory-date">
                <img src={date} alt="Date Icon" />
                <div className="inventory-date-inputs">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span> - </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="inventory-export-product">


            
              {/* <AddProduct /> */}
                <button className="inventory-export-btn" onClick={exportInventoryCSV}>
                  Export <img src={dropDown} alt="Dropdown Icon" />
                </button>
            </div>
          </div>

          <div className="inventory-data">
            <div className="inventory-data-header">
              <h3>Inventory Overview</h3>

              <div className="inventory-search">
                <img src={search} alt="Search Icon" />
                <input type="text" placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Brand</th>
                    <th>Code</th>
                    <th>Cost Unit</th>
                    <th>Selling Price</th>
                    <th>Quantity</th>
                    <th>Expiry Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(item => ( 
                    <tr key={item.itemId}>
                      <td className="inventory-item-name">{item.itemName}</td>
                      <td className="inventory-item-text">{item.brand}</td>
                      <td className="inventory-item-text">{item.code}</td>
                      <td className="inventory-item-text">₱{item.costUnit}</td>
                      <td className="inventory-item-text">₱{item.sellingPrice}</td>
                      <td className="inventory-item-text">{item.quantity}</td>
                      <td className="inventory-item-text">{item.expiryDate}</td>
                      <td>
                        <div className="inventory-actions-cell">
                          <InventoryEditAction item={item} onUpdate={getInventoryData} />
                          <InventoryDeleteAction item={item} onDelete={getInventoryData} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="pagination">
            <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
            <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>  
          </div>
        </div>
      </div>

      {showLogoutModal && (
  <LogoutModal
    open={showLogoutModal}
    onCancel={() => setShowLogoutModal(false)}
    onConfirm={() => {
      sessionStorage.clear();
      window.location.href = "/login";
    }}
  />
)}

    </div>
  );
}

export default Inventory;