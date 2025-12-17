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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  // search + date filter
  const q = searchQuery.trim().toLowerCase();

  const filterItems = purchases.filter(item => {
    const name = String(item?.itemName ?? '').toLowerCase();
    const brandTxt = String(item?.brand ?? '').toLowerCase();
    const codeTxt = String(item?.code ?? '').toLowerCase();
    const cat = String(item?.category ?? '').toLowerCase();
    const ref = String(item?.reference ?? '').toLowerCase();
    const supp = String(item?.suppliers ?? '').toLowerCase();
    const dtRaw = item?.Date ?? item?.date ?? '';
    const expdt = String(item?.expiryDate ?? '').toLowerCase();

    // SEARCH FILTER
    const matchesSearch = q
      ? (
          name.includes(q) ||
          brandTxt.includes(q) ||
          codeTxt.includes(q) ||
          cat.includes(q) ||
          ref.includes(q) ||
          supp.includes(q) ||
          expdt.includes(q) ||
          String(dtRaw).toLowerCase().includes(q)
        )
      : true;

    // DATE FILTER
    let matchesDate = true;
    if (startDate || endDate) {
      const itemDate = new Date(dtRaw);
      if (startDate && itemDate < new Date(startDate)) matchesDate = false;
      if (endDate && itemDate > new Date(endDate)) matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  // reset to first page on search or date change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate]);

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

  // EXPORT FUNCTION - CSV
  const handleExportCSV = () => {
    if (filterItems.length === 0) {
      alert("No purchases to export.");
      return;
    }

    const headers = [
      "Item Name",
      "Date",
      "Reference",
      "Suppliers",
      "Quantity",
      "Grand Total",
      "Expiry Date",
      "Category"
    ];

    const rows = filterItems.map(item => [
      item?.itemName ?? '',
      item?.Date ?? item?.date ?? '',
      item?.reference ?? '',
      item?.suppliers ?? '',
      item?.quantity ?? 0,
      Number(item?.grandTotal ?? 0).toFixed(2),
      item?.expiryDate ?? '',
      item?.category ?? ''
    ]);

    const csvContent =
      [headers, ...rows].map(e => e.map(a => `"${a}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `purchases_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
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

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

              

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              
            </div>

            <AddProduct onProductAdded={handleGetPurchases} />

            <button className="inventory-export-btn" onClick={handleExportCSV}>
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
