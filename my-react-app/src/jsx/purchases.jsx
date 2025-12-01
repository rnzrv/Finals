import Sidebar from './Sidebar.jsx';
import '../css/purchases.css';
import user from "../icons/user.svg";
import date from "../icons/date.svg";
import dropDown from "../icons/drop_down.svg";
import search from "../icons/search.svg";
import eye from "../icons/eye.svg";
import check from "../icons/checkbook.svg";
import x from "../icons/x.svg";
import PurchaseDeleteModal from "./modals/purchase-modal/delete.jsx";
import PurchaseEditModal from "./modals/purchase-modal/edit.jsx";
import React, {useState} from 'react';


function Purchases() {

  // create state for purchases
  // fetch purchases from backend
  // map through purchases and display in table
  const items = [{
    itemName: 'Item 1', date: '2024-06-01', reference: 'REF123', suppliers: 'Supplier A', quantity: 10, grandTotal: 5000, expiryDate: '2025-06-01'
  },
  {
    itemName: 'Item 2', date: '2024-06-05', reference: 'REF124', suppliers: 'Supplier B', quantity: 5, grandTotal: 2500, expiryDate: '2025-06-05'
  },
  {
    itemName: 'Item 3', date: '2024-06-10', reference: 'REF125', suppliers: 'Supplier C', quantity: 8, grandTotal: 4000, expiryDate: '2025-06-10'
  }];

  const [purchases, setPurchases] = useState([]);




  return (
    <div className="inventory">
      <Sidebar />

      <div className="inventory-content">
        <header>
          <h2>PURCHASES</h2>
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

            <button>Add purchases</button>

            <button className="inventory-export-btn">
                Export <img src={dropDown} alt="Dropdown Icon" />
            </button>
          </div>

          <div className="inventory-data">
            <div className="inventory-data-header">
              <h3>Purchase History</h3>
              <div className="inventory-search">
                <img src={search} alt="Search Icon" />
                <input type="text" placeholder = "Search..." />
              </div>
            </div>

            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Suppliers</th>
                    <th>Quantity</th>
                    <th>Grand Total</th>
                    <th>Expiry Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="inventory-item-name">{item.itemName}</td>
                      <td className="inventory-item-text">{item.date}</td>
                      <td className="inventory-item-text">{item.reference}</td>
                      <td className="inventory-item-text">{item.suppliers}</td>
                      <td className="inventory-item-text">{item.quantity}</td>
                      <td className="inventory-item-text">₱{item.grandTotal}</td>
                      <td className="inventory-item-text">{item.expiryDate}</td>
                      <td>
                        <div className="inventory-actions-cell">
                          <PurchaseEditModal item={item} />
                          <PurchaseDeleteModal item={item} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* <tr>
                    <td className="inventory-item-name">Shampoo</td>
                    <td className="inventory-item-text">Miniso</td>
                    <td className="inventory-item-text">C123</td>
                    <td className="inventory-item-text">₱50</td>
                    <td><span className="inventory-category-badge">Hair Care</span></td>
                    <td className="inventory-item-text">120</td>

                    <td>
                      <div className="inventory-actions-cell">
                       
                        <button className="inventory-action-btn inventory-action-edit">
                          <img src={check} alt="Edit" />
                        </button>
                        <button className="inventory-action-btn inventory-action-delete">
                          <img src={x} alt="Delete" />
                        </button>
                      </div>
                    </td>
                  </tr> */}
                  
                  {/* <tr>
                    <td className="inventory-item-name">Shampoo</td>
                    <td className="inventory-item-text">Miniso</td>
                    <td className="inventory-item-text">C123</td>
                    <td className="inventory-item-text">₱50</td>
                    <td><span className="inventory-category-badge">Hair Care</span></td>
                    <td className="inventory-item-text">120</td>
                    <td>
                      <div className="inventory-actions-cell">
                       
                        <PurchaseEditModal/>
                       <PurchaseDeleteModal/>
                      </div>
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Purchases;
