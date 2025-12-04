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
import React, {useState, useEffect} from 'react';
import AddProduct from './modals/inventory-modal/modal-addProduct.jsx';
import axios from 'axios';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleGetPurchases = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8081/inventory/Purchases/inventory', {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(Array.isArray(res.data) ? res.data : []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setPurchases([]);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    handleGetPurchases();
  }, []);

  // search (safe lowercasing)
  const q = searchQuery.trim().toLowerCase();
  const filterItems = q
    ? purchases.filter(item => {
        const name = String(item?.itemName ?? '').toLowerCase();
        const brandTxt = String(item?.brand ?? '').toLowerCase();
        const codeTxt = String(item?.code ?? '').toLowerCase();
        const cat = String(item?.category ?? '').toLowerCase();
        const ref = String(item?.reference ?? '').toLowerCase();
        const supp = String(item?.suppliers ?? '').toLowerCase();
        const dt = String(item?.Date ?? item?.date ?? '').toLowerCase();
        return (
          name.includes(q) ||
          brandTxt.includes(q) ||
          codeTxt.includes(q) ||
          cat.includes(q) ||
          ref.includes(q) ||
          supp.includes(q) ||
          dt.includes(q)
        );
      })
    : purchases;

  // reset to first page on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // pagination slice
  const totalItems = filterItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filterItems.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

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

            <AddProduct onProductAdded={handleGetPurchases} />
            <button className="inventory-export-btn">
              Export <img src={dropDown} alt="Dropdown Icon" />
            </button>
          </div>

          <div className="inventory-data">
            <div className="inventory-data-header">
              <h3>Purchase History</h3>
              <div className="inventory-search">
                <img src={search} alt="Search Icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                    <th>Category</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <td className="inventory-item-name">{item?.itemName ?? ''}</td>
                      <td className="inventory-item-text">{item?.Date ?? item?.date ?? ''}</td>
                      <td className="inventory-item-text">{item?.reference ?? ''}</td>
                      <td className="inventory-item-text">{item?.suppliers ?? ''}</td>
                      <td className="inventory-item-text">{item?.quantity ?? 0}</td>
                      <td className="inventory-item-text">₱{Number(item?.grandTotal ?? 0).toFixed(2)}</td>
                      <td className="inventory-item-text">{item?.expiryDate ?? ''}</td>
                      <td className="inventory-item-text">{item?.category ?? ''}</td>
                      <td>
                        <div className="inventory-actions-cell">
                          <PurchaseEditModal item={item} />
                          <PurchaseDeleteModal item={item} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center' }}>No purchases found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
          <div className="pagination">
            <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
            <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Purchases;