const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');

// Promisified query helper
const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });


  

// Build date filter based on period
function buildDateFilter({ periodType, startDate, endDate }) {
  const dateCol = 'saleDate';
  if (startDate && endDate) {
    return {
      where: `WHERE DATE(s.${dateCol}) BETWEEN ? AND ?`,
      params: [startDate, endDate],
      groupMask: '%Y-%m-%d',
    };
  }

  switch (periodType) {
    case 'weekly':
      return { where: `WHERE DATE(s.${dateCol}) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`, params: [], groupMask: '%Y-%m-%d' };
    case 'quarterly':
      return { where: `WHERE DATE(s.${dateCol}) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)`, params: [], groupMask: '%Y-%m' };
    case 'yearly':
      return { where: `WHERE DATE(s.${dateCol}) >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)`, params: [], groupMask: '%Y-%m' };
    case 'monthly':
    default:
      return { where: `WHERE DATE(s.${dateCol}) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`, params: [], groupMask: '%Y-%m-%d' };
  }
}

router.get('/summary', verifyToken, async (req, res) => {
  try {
    const { periodType = 'monthly', startDate, endDate } = req.query;
    const { where, params, groupMask } = buildDateFilter({ periodType, startDate, endDate });

    // Total revenue
    const revenueRow = await q(`SELECT COALESCE(SUM(totalAmount), 0) AS totalRevenue FROM sales s ${where}`, params);

    // COGS (products)
    const cogsRow = await q(
      `SELECT COALESCE(SUM(si.qty * inv.costUnit), 0) AS cogs
       FROM sale_items si
       JOIN sales s ON si.saleId = s.saleId
       JOIN inventory inv ON inv.code = si.itemCode
       ${where}`,
      params
    );

   
    // Revenue by service
    const revenueByService = await q(
      `SELECT ss.serviceId, ss.serviceName, SUM(ss.quantity * ss.price) AS revenue, COUNT(DISTINCT s.saleId) AS transactions
       FROM sale_services ss
       JOIN sales s ON ss.saleId = s.saleId
       ${where}
       GROUP BY ss.serviceId, ss.serviceName
       ORDER BY revenue DESC
       LIMIT 4`,
      params
    );

    // Customer segmentation
    const regularCustomers = await q(
      `SELECT COUNT(DISTINCT p.id) AS count, COALESCE(SUM(s.totalAmount),0) AS revenue
       FROM patients p
       JOIN sales s ON s.customerName = p.name`,
      []
    );
    const newCustomers = await q(
      `SELECT COUNT(DISTINCT p.id) AS count, COALESCE(SUM(s.totalAmount),0) AS revenue
       FROM patients p
       LEFT JOIN sales s ON s.customerName = p.name`,
      []
    );
    const inactiveCustomers = await q(
      `SELECT COUNT(DISTINCT s.customerName) AS count, COALESCE(SUM(s.totalAmount),0) AS revenue
       FROM sales s
       LEFT JOIN patients p ON s.customerName = p.name
       WHERE p.id IS NULL`,
      []
    );

    // Growth metrics
    const totalCustomersRow = await q(`SELECT COUNT(DISTINCT customerName) AS totalCustomers FROM sales s ${where}`, params);
    const retentionRateRow = await q(
      `SELECT (COUNT(DISTINCT CASE WHEN s.customerName IN 
        (SELECT s2.customerName FROM sales s2 ${where} GROUP BY s2.customerName HAVING COUNT(*) > 1)
      THEN s.customerName END) / NULLIF(COUNT(DISTINCT s.customerName),0)) * 100 AS retentionRate
       FROM sales s
       ${where}`,
      params
    );
    const averageTransactionValueRow = await q(`SELECT AVG(totalAmount) AS avgTransaction FROM sales s ${where}`, params);

    // Sales trends
    const salesTrendsRaw = await q(
      `SELECT DATE_FORMAT(s.saleDate, ?) AS label, SUM(s.totalAmount) AS sales, SUM(si.qty * inv.costUnit) AS expenses
       FROM sales s
       LEFT JOIN sale_items si ON si.saleId = s.saleId
       LEFT JOIN inventory inv ON inv.code = si.itemCode
       ${where}
       GROUP BY label
       ORDER BY MIN(s.saleDate)`,
      [groupMask, ...params]
    );

    const totalExpenses = await q(
      `SELECT COALESCE(SUM(quantity * costUnit), 0) AS totalExpenses
       FROM purchases `
    );

     const totalRevenue = Number(revenueRow[0]?.totalRevenue || 0);
    const cogs = Number(cogsRow[0]?.cogs || 0);
    const expenses = Number(totalExpenses[0]?.totalExpenses || 0); // adjust if needed
    const netProfit = totalRevenue - cogs - expenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;


    return res.json({
      totalRevenue,
      netProfit,
      totalExpenses: totalExpenses[0]?.totalExpenses || 0,
      profitMargin,
      revenueByService,
      customerSegmentation: {
        regular: {
          count: regularCustomers[0]?.count || 0,
          revenue: regularCustomers[0]?.revenue || 0,
          avgSpend: regularCustomers[0]?.count ? regularCustomers[0].revenue / regularCustomers[0].count : 0,
        },
        new: {
          count: newCustomers[0]?.count || 0,
          revenue: newCustomers[0]?.revenue || 0,
          avgSpend: newCustomers[0]?.count ? newCustomers[0].revenue / newCustomers[0].count : 0,
        },
        inactive: {
          count: inactiveCustomers[0]?.count || 0,
          revenue: inactiveCustomers[0]?.revenue || 0,
          avgSpend: inactiveCustomers[0]?.count ? inactiveCustomers[0].revenue / inactiveCustomers[0].count : 0,
        },
      },
      growthMetrics: {
        totalCustomers: totalCustomersRow[0]?.totalCustomers || 0,
        newCustomers: newCustomers[0]?.count || 0,
        retentionRate: retentionRateRow[0]?.retentionRate || 0,
        avgTransaction: averageTransactionValueRow[0]?.avgTransaction || 0,
      },
      topServices: revenueByService.map((s) => ({
        name: s.serviceName,
        revenue: s.revenue,
        transactions: s.transactions,
      })),
      
      salesTrends: {
        labels: salesTrendsRaw.map((s) => s.label),
        datasets: [
          { label: "Sales", data: salesTrendsRaw.map((s) => Number(s.sales || 0)) },
          { label: "Expenses", data: salesTrendsRaw.map((s) => Number(s.expenses || 0)) },
        ],
      },
    });
  } catch (err) {
    console.error('Summary error:', err);
    return res.status(500).json({ error: 'Failed to load summary', detail: err.message });
  }
});




module.exports = router;
