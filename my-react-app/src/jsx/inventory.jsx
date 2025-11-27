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

function Inventory() {


     const [inventory, setInventory] = useState([
    { id: 1, itemName: 'Shampoo', brand: 'Miniso', code: 'C123', price: 50, sellingPrice: 70, category: 'Hair Care', quantity: 120 },
    { id: 2, itemName: 'Conditioner', brand: 'Dove', code: 'C124', price: 65, sellingPrice: 85, category: 'Hair Care', quantity: 85 },
    { id: 3, itemName: 'Soap', brand: 'Safeguard', code: 'C125', price: 30, sellingPrice: 50, category: 'Body Care', quantity: 200 },
    { id: 4, itemName: 'Lotion', brand: 'Nivea', code: 'C126', price: 120, sellingPrice: 150, category: 'Body Care', quantity: 60 },
    { id: 5, itemName: 'Toothpaste', brand: 'Colgate', code: 'C127', price: 45, sellingPrice: 65, category: 'Oral Care', quantity: 150 },
    { id: 6, itemName: 'Toothbrush', brand: 'Oral-B', code: 'C128', price: 80, sellingPrice: 100, category: 'Oral Care', quantity: 90 },
    { id: 7, itemName: 'Face Wash', brand: 'Cetaphil', code: 'C129', price: 250, sellingPrice: 300, category: 'Face Care', quantity: 40 },
    { id: 8, itemName: 'Moisturizer', brand: 'Olay', code: 'C130', price: 350, sellingPrice: 400, category: 'Face Care', quantity: 35 },
    { id: 9, itemName: 'Deodorant', brand: 'Rexona', code: 'C131', price: 95, sellingPrice: 110, category: 'Body Care', quantity: 110 },
    { id: 10, itemName: 'Sunscreen', brand: 'Biore', code: 'C132', price: 280, sellingPrice: 320, category: 'Face Care', quantity: 50 },
    { id: 11, itemName: 'Hair Gel', brand: 'Gatsby', code: 'C133', price: 120, sellingPrice: 140, category: 'Hair Care', quantity: 75 },
    { id: 12, itemName: 'Face Mask', brand: 'The Face Shop', code: 'C134', price: 80, sellingPrice: 100, category: 'Face Care', quantity: 65 },
    { id: 13, itemName: 'Body Wash', brand: 'Dove', code: 'C135', price: 150, sellingPrice: 180, category: 'Body Care', quantity: 95 },
    { id: 14, itemName: 'Hair Spray', brand: 'Tresemme', code: 'C136', price: 200, sellingPrice: 230, category: 'Hair Care', quantity: 45 },
    { id: 15, itemName: 'Cotton Pads', brand: 'Watson', code: 'C137', price: 60, sellingPrice: 80, category: 'Accessories', quantity: 180 },
    { id: 5, itemName: 'Toothpaste', brand: 'Colgate', code: 'C127', price: 45, sellingPrice: 65, category: 'Oral Care', quantity: 150 },
    { id: 6, itemName: 'Toothbrush', brand: 'Oral-B', code: 'C128', price: 80, sellingPrice: 100, category: 'Oral Care', quantity: 90 },
    { id: 7, itemName: 'Face Wash', brand: 'Cetaphil', code: 'C129', price: 250, sellingPrice: 300, category: 'Face Care', quantity: 40 },
    { id: 8, itemName: 'Moisturizer', brand: 'Olay', code: 'C130', price: 350, sellingPrice: 400, category: 'Face Care', quantity: 35 },
    { id: 9, itemName: 'Deodorant', brand: 'Rexona', code: 'C131', price: 95, sellingPrice: 110, category: 'Body Care', quantity: 110 },
    { id: 10, itemName: 'Sunscreen', brand: 'Biore', code: 'C132', price: 280, sellingPrice: 320, category: 'Face Care', quantity: 50 },
    { id: 11, itemName: 'Hair Gel', brand: 'Gatsby', code: 'C133', price: 120, sellingPrice: 140, category: 'Hair Care', quantity: 75 },
    { id: 12, itemName: 'Face Mask', brand: 'The Face Shop', code: 'C134', price: 80, sellingPrice: 100, category: 'Face Care', quantity: 65 },
    { id: 13, itemName: 'Body Wash', brand: 'Dove', code: 'C135', price: 150, sellingPrice: 180, category: 'Body Care', quantity: 95 },
    { id: 14, itemName: 'Hair Spray', brand: 'Tresemme', code: 'C136', price: 200, sellingPrice: 230, category: 'Hair Care', quantity: 45 },
    { id: 15, itemName: 'Cotton Pads', brand: 'Watson', code: 'C137', price: 60, sellingPrice: 80, category: 'Accessories', quantity: 180 },
  ]);

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
