import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar.jsx";

import user from "../icons/user.svg";
import "../css/reports.css";
import calendar from "../icons/calendar.svg";
import uptrend from "../icons/uptrend.svg";
import downtrend from "../icons/downtrend.svg";
import percent from "../icons/percent.svg";
import group from "../icons/group.svg";
import groupBlue from "../icons/group-blue.svg";
import groupPurple from "../icons/group-purple.svg";
import groupAdd from "../icons/group-add.svg";
import retention from "../icons/retention.svg";
import star from "../icons/star.svg";
import ReportsChart from "./reportsChart.jsx";
import Notification from "./modals/notification/notification";
import LogoutModal from './modals/logout/logout.jsx';

function fmtCurrency(num) {
  if (num == null) return "₱0";
  return "₱ " + Number(num).toLocaleString();
}

function fmtNumber(num) {
  if (num == null) return "0";
  return Number(num).toLocaleString();
}

function percentString(n) {
  if (n == null) return "0%";
  const val = Number(n);
  if (val <= 1) return (val * 100).toFixed(2) + "%";
  return val.toFixed(2) + "%";
}

function Reports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    netProfit: 0,
    totalExpenses: 0,
    profitMargin: 0,
    revenueByService: [],
    customerSegmentation: {
      regular: { count: 0, revenue: 0, avgSpend: 0 },
      new: { count: 0, revenue: 0, avgSpend: 0 },
      inactive: { count: 0, revenue: 0, avgSpend: 0 },
    },
    growthMetrics: {
      totalCustomers: 0,
      newCustomers: 0,
      retentionRate: 0,
      avgTransaction: 0,
    },
    paymentMethods: {
      cash: { transactions: 0, revenue: 0, avgTransaction: 0, percentOfTotal: 0 },
      gcash: { transactions: 0, revenue: 0, avgTransaction: 0, percentOfTotal: 0 },
      card: { transactions: 0, revenue: 0, avgTransaction: 0, percentOfTotal: 0 },
    },
    topServices: [],
    salesTrends: { labels: [], datasets: [] },
  });

  const [periodType, setPeriodType] = useState("monthly");

  const fetchSummary = async (opts = {}) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const pType = opts.periodType ?? periodType;
      const url = "http://localhost:8081/summary/summary";

      console.log("📡 FETCHING SUMMARY", { periodType: pType });

      setLoading(true);
      setError(null);

      const res = await axios.get(url, {
        params: { periodType: pType },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Response:", res.data);

      const data = res.data || {};

      setSummary({
        totalRevenue: data.totalRevenue ?? 0,
        netProfit: data.netProfit ?? 0,
        totalExpenses: data.totalExpenses ?? 0,
        profitMargin: data.profitMargin ?? 0,
        revenueByService: data.revenueByService ?? [],
        customerSegmentation: data.customerSegmentation ?? {
          regular: { count: 0, revenue: 0, avgSpend: 0 },
          new: { count: 0, revenue: 0, avgSpend: 0 },
          inactive: { count: 0, revenue: 0, avgSpend: 0 },
        },
        growthMetrics: data.growthMetrics ?? {
          totalCustomers: 0,
          newCustomers: 0,
          retentionRate: 0,
          avgTransaction: 0,
        },
        paymentMethods: data.paymentMethods ?? {
          cash: { transactions: 0, revenue: 0, avgTransaction: 0, percentOfTotal: 0 },
          gcash: { transactions: 0, revenue: 0, avgTransaction: 0, percentOfTotal: 0 },
          card: { transactions: 0, revenue: 0, avgTransaction: 0, percentOfTotal: 0 },
        },
        topServices: data.topServices ?? [],
        salesTrends: data.salesTrends ?? { labels: [], datasets: [] },
      });
    } catch (err) {
      console.error("❌ ERROR FETCHING SUMMARY:", err);
      setError(err?.response?.data?.message || err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const totalRevenue = Number(summary.totalRevenue || 0);
  const revenueServiceWithPct = (summary.revenueByService || []).map((s) => {
    const rev = Number(s.revenue || 0);
    const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
    return { ...s, revenue: rev, transactions: s.transactions ?? 0, pct };
  });

  const exportTopServicesCSV = () => {
    const rows = [
      ["Rank", "Service Name", "Revenue", "Transactions"],
      ...(summary.topServices || []).map((t, i) => [
        `#${i + 1}`,
        t.name,
        t.revenue,
        t.transactions ?? 0,
      ]),

      ["Total Services", (summary.topServices || []).length],
      ["Total Revenue", Number(totalRevenue)],
      ["Net Profit", Number(summary.netProfit || 0)],
      ["Total Expenses", Number(summary.totalExpenses || 0)],
      ["Profit Margin", Number(summary.profitMargin || 0)]
      
    ];

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `top-services-${periodType}.csv`;
    link.click();
  };

  const role = sessionStorage.getItem("role") || localStorage.getItem("role");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  return (
    <div className="reports">
      <Sidebar />

      <div className="dashboard-content">
        <header>
          <h2>REPORTS</h2>
          <div className="dashboard-account">
            <div className="inventory-account">
            <Notification /> 

            <button onClick={() => setShowLogoutModal(true)}
            
              className="inventory-user-btn">
            <img src={user} alt="Admin Icon"/>
            
            <p>{role}</p>
            </button>
          </div>
          </div>
        </header>

        <div className="reports-container">
          <div className="reports-utilities">

            <div className="reports-util-mid">
              <h1>Select Period:</h1> 
              <button
                className={periodType === "weekly" ? "active" : ""}
                onClick={() => {
                  setPeriodType("weekly");
                  fetchSummary({ periodType: "weekly" });
                }}
              >
                Weekly
              </button>
              <button
                className={periodType === "monthly" ? "active" : ""}
                onClick={() => {
                  setPeriodType("monthly");
                  fetchSummary({ periodType: "monthly" });
                }}
              >
                Monthly
              </button>
              <button
                className={periodType === "quarterly" ? "active" : ""}
                onClick={() => {
                  setPeriodType("quarterly");
                  fetchSummary({ periodType: "quarterly" });
                }}
              >
                Quarterly
              </button>
              <button
                className={periodType === "yearly" ? "active" : ""}
                onClick={() => {
                  setPeriodType("yearly");
                  fetchSummary({ periodType: "yearly" });
                }}
              >
                Yearly
              </button>
            </div>

            <div className="reports-util-right">
              <button className="export-btn" onClick={exportTopServicesCSV}>
                Export Top Services CSV
              </button>
            </div>
          </div>

          <div className="reports-performance">
            <h3>Financial Reports</h3>
          </div>

          <div className="reports-essentials">
            <div className="reports-essential-container">
              <div className="reports-essential-item1 reports-essential-item">
                <div className="reports-essential-item1-logo">
                  <h1>₱</h1>
                </div>
                <div className="reports-essential-item1-title">
                  <h3>Total Revenue</h3>
                  <h2>{fmtCurrency(summary.totalRevenue)}</h2>
                  <h1>vs from last {periodType}</h1>
                </div>
              </div>

              <div className="reports-essential-item2 reports-essential-item">
                <div className="reports-essential-item2-logo">
                  <img src={uptrend} alt="" />
                </div>
                <div className="reports-essential-item2-title">
                  <h3>Net Profit</h3>
                  <h2>{fmtCurrency(summary.netProfit)}</h2>
                  <h1>
                    {totalRevenue > 0
                      ? ((Number(summary.netProfit) / totalRevenue) * 100).toFixed(2) + "% from revenue"
                      : ""}
                  </h1>
                </div>
              </div>

              <div className="reports-essential-item3 reports-essential-item">
                <div className="reports-essential-item3-logo">
                  <img src={downtrend} alt="" />
                </div>
                <div className="reports-essential-item3-title">
                  <h3>Total Expenses</h3>
                  <h2>{fmtCurrency(summary.totalExpenses)}</h2>
                  <h1>
                    {totalRevenue > 0
                      ? ((Number(summary.totalExpenses) / totalRevenue) * 100).toFixed(2) + "% of revenue"
                      : ""}
                  </h1>
                </div>
              </div>

              <div className="reports-essential-item4 reports-essential-item">
                <div className="reports-essential-item4-logo">
                  <img src={percent} alt="" />
                </div>
                <div className="reports-essential-item4-title">
                  <h3>Profit Margin</h3>
                  <h2>{percentString(summary.profitMargin)}</h2>
                  <h1>vs from last {periodType}</h1>
                </div>
              </div>

              <div className="revenue-by-service-type reports-essential-item5">
                <div className="revenue-by-service-type-title">
                  <h3>Revenue by Service Type</h3>
                  <h1>Performances</h1>
                </div>

                <div className="revenue-by-service-type-chart">
                  {revenueServiceWithPct.length === 0 && <p>No service revenue data</p>}
                  {revenueServiceWithPct.map((svc, idx) => (
                    <div className="progress-container" key={svc.name + idx}>
                      <div className="progress-top">
                        <h1>{svc.serviceName}</h1>
                        <h2>{fmtCurrency(svc.revenue)}</h2>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${Math.min(100, svc.pct).toFixed(1)}%` }}
                        >
                          <span className="progress-text">{svc.pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="progress-bottom">
                        <h1>{fmtNumber(svc.transactions)} Transactions</h1>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="customer-segmentation reports-essential-item6">
                <div className="customer-segmentation-title">
                  <h3>Customer Segmentation</h3>
                  <h1>Revenue Distribution by customer type</h1>
                </div>

                <div className="customer-segmentation-body">
                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img">
                        <img src={group} alt="" />
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>Regular Customers</h3>
                        <h2>{fmtNumber(summary.customerSegmentation?.regular?.count)}</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>{fmtCurrency(summary.customerSegmentation?.regular?.revenue)}</h3>
                      <h2>
                        {totalRevenue > 0
                          ? ((summary.customerSegmentation?.regular?.revenue / totalRevenue) * 100).toFixed(1) +
                            "% of Total Revenue"
                          : "0% of Total Revenue"}
                      </h2>
                      <h5>{fmtCurrency(summary.customerSegmentation?.regular?.avgSpend)}</h5>
                    </div>
                  </div>

                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img-new">
                        <img src={groupBlue} alt="" />
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>New Customers</h3>
                        <h2>{fmtNumber(summary.customerSegmentation?.new?.count)}</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>{fmtCurrency(summary.customerSegmentation?.new?.revenue)}</h3>
                      <h2>
                        {totalRevenue > 0
                          ? ((summary.customerSegmentation?.new?.revenue / totalRevenue) * 100).toFixed(1) +
                            "% of Total Revenue"
                          : "0% of Total Revenue"}
                      </h2>
                      <h5>{fmtCurrency(summary.customerSegmentation?.new?.avgSpend)}</h5>
                    </div>
                  </div>

                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img-inactive">
                        <img src={groupBlue} alt="" />
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>Inactive</h3>
                        <h2>{fmtNumber(summary.customerSegmentation?.inactive?.count)}</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>{fmtCurrency(summary.customerSegmentation?.inactive?.revenue)}</h3>
                      <h2>
                        {totalRevenue > 0
                          ? ((summary.customerSegmentation?.inactive?.revenue / totalRevenue) * 100).toFixed(1) +
                            "% of Total Revenue"
                          : "0% of Total Revenue"}
                      </h2>
                      <h5>{fmtCurrency(summary.customerSegmentation?.inactive?.avgSpend)}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reports-performance">
              <h3>Business Growth Metrics</h3>
            </div>

            <div className="business-growth-metrics">
              <div className="business-growth-metrics-item1 business-growth-metrics-item">
                <div className="business-growth-metrics-left">
                  <img src={groupPurple} alt="" />
                </div>
                <div className="business-growth-metrics-right">
                  <h3>Total Customers</h3>
                  <h1>{fmtNumber(summary.growthMetrics?.totalCustomers)}</h1>
                </div>
              </div>

              <div className="business-growth-metrics-item2 business-growth-metrics-item">
                <div className="business-growth-metrics-left">
                  <img src={groupAdd} alt="" />
                </div>
                <div className="business-growth-metrics-right">
                  <h3>New Customers</h3>
                  <h1>{fmtNumber(summary.growthMetrics?.newCustomers)}</h1>
                </div>
              </div>

              <div className="business-growth-metrics-item3 business-growth-metrics-item">
                <div className="business-growth-metrics-left">
                  <img src={retention} alt="" />
                </div>
                <div className="business-growth-metrics-right">
                  <h3>Retention Rate</h3>
                  <h1>{fmtNumber(summary.growthMetrics?.retentionRate)}%</h1>
                </div>
              </div>

              <div className="business-growth-metrics-item4 business-growth-metrics-item">
                <div className="business-growth-metrics-left">
                  <h1>₱</h1>
                </div>
                <div className="business-growth-metrics-right">
                  <h3>Avg Transaction</h3>
                  <h1>{fmtCurrency(summary.growthMetrics?.avgTransaction)}</h1>
                </div>
              </div>

              <div className="business-growth-metrics-item5 business-growth-metrics-item">
                <div className="business-growth-metrics-item5-table-title">
                  <img src={star} alt="" />
                  <h3>Top Performing Services</h3>
                </div>

                <div className="business-growth-metrics-item5-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Service Name</th>
                        <th>Revenue</th>
                        <th>Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(summary.topServices || []).length === 0 && (
                        <tr>
                          <td colSpan="4">No services</td>
                        </tr>
                      )}
                      {(summary.topServices || []).map((t, i) => (
                        <tr key={t.name + i}>
                          <td>#{i + 1}</td>
                          <td>{t.name}</td>
                          <td>{fmtCurrency(t.revenue)}</td>
                          <td>{fmtNumber(t.transactions)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="business-growth-metrics-item7 business-growth-metrics-item">
                <div className="payment-methods-container">
                  <div className="payment-methods-title">
                    <h3>Payment Methods Breakdown</h3>
                    <p>Revenue distribution by payment type</p>
                  </div>
                  
                  <div className="payment-methods-cards">
                    <div className="payment-method-card cash-payment">
                      <div className="payment-method-info">
                        <h4 className="Cash"> Cash </h4>
                        <h2>{fmtCurrency(summary.paymentMethods?.cash?.revenue)}</h2>
                        <p className="payment-percent">{summary.paymentMethods?.cash?.percentOfTotal?.toFixed(1)}% of total revenue</p>
                      </div>
                      <div className="payment-method-stats">
                        <div className="stat-row">
                          <span className="stat-label">Transactions</span>
                          <span className="stat-value">{fmtNumber(summary.paymentMethods?.cash?.transactions)}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Avg. Amount</span>
                          <span className="stat-value">{fmtCurrency(summary.paymentMethods?.cash?.avgTransaction)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="payment-method-card gcash-payment">
                      <div className="payment-method-info">
                        <h4 className="GCash">GCash</h4>
                        <h2>{fmtCurrency(summary.paymentMethods?.gcash?.revenue)}</h2>
                        <p className="payment-percent">{summary.paymentMethods?.gcash?.percentOfTotal?.toFixed(1)}% of total revenue</p>
                      </div>
                      <div className="payment-method-stats">
                        <div className="stat-row">
                          <span className="stat-label">Transactions</span>
                          <span className="stat-value">{fmtNumber(summary.paymentMethods?.gcash?.transactions)}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Avg. Amount</span>
                          <span className="stat-value">{fmtCurrency(summary.paymentMethods?.gcash?.avgTransaction)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="payment-method-card card-payment">
                      <div className="payment-method-info">
                        <h4 className="Card">Card</h4>
                        <h2>{fmtCurrency(summary.paymentMethods?.card?.revenue)}</h2>
                        <p className="payment-percent">{summary.paymentMethods?.card?.percentOfTotal?.toFixed(1)}% of total revenue</p>
                      </div>
                      <div className="payment-method-stats">
                        <div className="stat-row">
                          <span className="stat-label">Transactions</span>
                          <span className="stat-value">{fmtNumber(summary.paymentMethods?.card?.transactions)}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Avg. Amount</span>
                          <span className="stat-value">{fmtCurrency(summary.paymentMethods?.card?.avgTransaction)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="business-growth-metrics-item6 reports-sales-purchase-trends business-growth-metric-item">
                <div className="business-growth-metrics-item6-title">
                  <h3>Sales and Purchase Trends</h3>

                  <div className="business-growth-metric-item6-title-right">
                    <div className="business-growth-metric-item6-legend">
                      <span className="legend-color sales-color"></span> <h1>Sales</h1>
                    </div>
                    <div className="business-growth-metric-item6-legend">
                      <span className="legend-color expenses-color"></span> <h1>Expenses</h1>
                    </div>
                  </div>
                </div>

                <div className="business-growth-metrics-item6-chart">
                  <ReportsChart data={summary.salesTrends || { labels: [], datasets: [] }} />

                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "12px" }}>
            {loading && <p>Loading report...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
          </div>
          {showLogoutModal && (
                <LogoutModal
                  open={showLogoutModal}
                  onCancel={() => setShowLogoutModal(false)}
                  onConfirm={() => {
                    sessionStorage.clear();
                    window.location.href = "/";
                  }}
                />
              )}
        </div>
      </div>
    </div>
  );
}

export default Reports;