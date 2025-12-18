import Sidebar from './Sidebar.jsx';
import '../css/salesHistory.css';
import user from "../icons/user.svg";
import date from "../icons/date.svg";
import search from "../icons/search.svg";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalesHistory() {
  const [salesData, setSalesData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSalesData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:8081/sales/getSales', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined
        },
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesData(res.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSalesData();
  }, []);

  useEffect(() => {
    getSalesData();
  }, [startDate, endDate]);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const filterItems = searchQuery
    ? salesData.filter(item => {
        const saleDate = item.date ? item.date.slice(0, 10) : '';
        return (
          item.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
          saleDate.includes(searchQuery)
        );
      })
    : salesData;

  // Pagination
  const maxItemsPerPage = 14;
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
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Export function
  const exportSalesCSV = () => {
    const rows = [
      ["Reference", "Date", "Customer Name", "Payment Method", "Sub Total", "Tax Amount", "Total Amount", "Total Payment", "Changes"],
      ...filterItems.map(item => [
        item.reference,
        item.saleDate || "N/A",
        item.customerName,
        item.paymentMethod,
        item.subTotal,
        item.taxAmount,
        item.totalAmount,
        item.totalPayment,
        item.changes || "0.00"
      ])
    ];

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="salesHistory">
      <Sidebar />

      <div className="salesHistory-content">
        <header>
          <h2>SALES HISTORY</h2>
          <div className="salesHistory-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          </div>
        </header>

        <div className="salesHistory-main-content">
          <div className="salesHistory-utensil">
            <div className="salesHistory-select-period">
              <h3>Select Period:</h3>
              <div className="salesHistory-date">
                <img src={date} alt="Date Icon" />
                <div className="salesHistory-date-inputs">
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

            <div className="salesHistory-export-product">
              <button className="salesHistory-export-btn" onClick={exportSalesCSV}>
                Export CSV
              </button>
            </div>
          </div>

          <div className="salesHistory-data">
            <div className="salesHistory-data-header">
              <h3>Sales Overview</h3>

              <div className="salesHistory-search">
                <img src={search} alt="Search Icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading && <p className="salesHistory-loading">Loading sales data...</p>}
            {error && <p className="salesHistory-error">⚠️ {error}</p>}

            {!loading && !error && (
              <div className="salesHistory-table-container">
                <table className="salesHistory-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Date</th>
                      <th>Customer Name</th>
                      <th>Payment Method</th>
                      <th>Sub Total</th>
                      <th>Tax Amount</th>
                      <th>Total Amount</th>
                      <th>Total Payment</th>
                      <th>Changes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item) => (
                        <tr key={item.id}>
                          <td className="salesHistory-reference">{item.reference}</td>
                          <td className="salesHistory-item-text">{item.saleDate ? item.saleDate.slice(0, 10) : "N/A"}</td>
                          <td className="salesHistory-item-text">{item.customerName}</td>
                          <td className="salesHistory-item-text">{item.paymentMethod}</td>
                          <td className="salesHistory-item-text">₱{parseFloat(item.subTotal).toFixed(2)}</td>
                          <td className="salesHistory-item-text">₱{parseFloat(item.taxAmount).toFixed(2)}</td>
                          <td className="salesHistory-amount">₱{parseFloat(item.totalAmount).toFixed(2)}</td>
                          <td className="salesHistory-amount">₱{parseFloat(item.totalPayment).toFixed(2)}</td>
                          <td className="salesHistory-item-text">₱{parseFloat(item.changes || 0).toFixed(2)}</td>
                          <td>
                            <div className="salesHistory-actions-cell">
                             
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="salesHistory-no-data">No sales data found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
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

export default SalesHistory;