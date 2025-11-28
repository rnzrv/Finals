import Sidebar from './Sidebar.jsx';
import '../css/inventory.css';
import user from "../icons/user.svg";
import date from "../icons/date.svg";
import dropDown from "../icons/drop_down.svg";
import search from "../icons/search.svg";
import eye from "../icons/eye.svg";
import check from "../icons/checkbook.svg";
import x from "../icons/x.svg";
import AddProduct from './modals/modal-addProduct.jsx';
import React, { useState, useEffect } from 'react';
import InventoryDeleteAction from './modals/inventory-modal/inventory-action-delete.jsx';
import InventoryEditAction from './modals/inventory-modal/inventory-action-edit.jsx';
import axios from 'axios';

function Inventory() {

  const [inventory, setInventory] = useState([]);

  const getInventoryData = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8081/inventory/getInventory', {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(res.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  }

  const deleteInventoryData = async () => {
    try{
      const token = sessionStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8081/inventory/deleteInventory/:id', {
        withCredentials: true,
        header: {Authorization : `Bearer ${token}`},
      });
      setInventory(res.data);

    } catch(error){
      console.error('Error deleting item')
    }
  }
  
  useEffect(() => {
    getInventoryData();
  }, []);

     

  // for handling search
  const [searchQuery, setSearchQuery] = useState('');
  const filterItems = searchQuery ? inventory.filter(item =>
    
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) : inventory;



  const maxItemsPerPage = 10; // Maximum items to display per page
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = (itemId) => {
  setInventory(inventory.filter(item => item.id !== itemId));
  
  // Optional: Reset to page 1 if current page becomes empty after deletion
  const newInventory = inventory.filter(item => item.id !== itemId);
  const newTotalPages = Math.ceil(newInventory.length / maxItemsPerPage);
  if (currentPage > newTotalPages && newTotalPages > 0) {
    setCurrentPage(newTotalPages);
  }
};

  const totalItems = filterItems.length; // Example total items, replace with actual data length
  const totalPages = Math.ceil(totalItems/maxItemsPerPage);
  const startIndex = (currentPage - 1) * maxItemsPerPage;
  const endIndex = startIndex + maxItemsPerPage;


  const currentItems = filterItems.slice(startIndex, endIndex); // Replace with actual data slice: data.slice(startIndex, endIndex);

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

  return (
    <div className="inventory">
      <Sidebar />

      <div className="inventory-content">
        <header>
          <h2>INVENTORY</h2>
          <div className="inventory-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          </div>
        </header>

        <div className="inventory-main-content">
          <div className="inventory-utensil">
            <div className="inventory-select-period">
              <h3>Select Period:</h3>
              <div className="inventory-date">
                <img src={date} alt="Date Icon" />
                <h6>10 April 2024 - 30 June 2024</h6>
              </div>
            </div>

            <div className="inventory-export-product">
              <AddProduct />
              <button className="inventory-export-btn">
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
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Expiry Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(item => ( 
                  <tr key={item.id}>
                    <td className="inventory-item-name">{item.itemName}</td>
                    <td className="inventory-item-text">{item.brand}</td>
                    <td className="inventory-item-text">{item.code}</td>
                    <td className="inventory-item-text">₱{item.price}</td>
                    <td className="inventory-item-text">₱{item.sellingPrice}</td>
                    <td><span className="inventory-category-badge">{item.category}</span></td>
                    <td className="inventory-item-text">{item.quantity}</td>
                    <td className="inventory-item-text">expiry date</td>
                    <td>
                      <div className="inventory-actions-cell">
                        
                        <InventoryEditAction />
                        
                        <InventoryDeleteAction item={item} onDelete={handleDelete} />
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
    </div>
  );
}

export default Inventory;
