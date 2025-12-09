const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');

// Promisified query helper
const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

function buildDateFilter({ periodType, startDate, endDate }) {
  const dateCol = 'saleDate';
  const hasRange = startDate && endDate;
  if (hasRange) {
    return {
      where: `WHERE DATE(s.${dateCol}) BETWEEN ? AND ?`,
      params: [startDate, endDate],
      groupMask: '%Y-%m-%d'
    };
  }
  switch (periodType) {
    case 'weekly':
      return {
        where: `WHERE DATE(s.${dateCol}) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        params: [],
        groupMask: '%Y-%m-%d'
      };
    case 'quarterly':
      return {
        where: `WHERE DATE(s.${dateCol}) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)`,
        params: [],
        groupMask: '%Y-%m'
      };
    case 'yearly':
      return {
        where: `WHERE DATE(s.${dateCol}) >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)`,
        params: [],
        groupMask: '%Y-%m'
      };
    case 'monthly':
    default:
      return {
        where: `WHERE DATE(s.${dateCol}) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
        params: [],
        groupMask: '%Y-%m-%d'
      };
  }
}

router.get('/summary', verifyToken, async (req, res) => {
  try {
    const { periodType = 'monthly', startDate, endDate } = req.query;
    const { where, params, groupMask } = buildDateFilter({ periodType, startDate, endDate });

    // Total revenue
    const revenueRow = await q(
      `SELECT COALESCE(SUM(s.totalAmount), 0) AS totalRevenue
       FROM sales s
       ${where}`,
      params
    );

    // COGS (products) from inventory costUnit; services assumed zero cost here
    const cogsRow = await q(
      `SELECT COALESCE(SUM(si.qty * inv.costUnit), 0) AS cogs
       FROM sale_items si
       JOIN sales s ON si.saleId = s.saleId
       JOIN inventory inv ON inv.code = si.itemCode
       ${where}`,
      params
    );

    const totalRevenue = Number(revenueRow[0]?.totalRevenue || 0);
    const cogs = Number(cogsRow[0]?.cogs || 0);
    const expenses = 0; // Adjust if you track expenses elsewhere
    const netProfit = totalRevenue - cogs - expenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Revenue by service
    const revenueByService = await q(
      `SELECT ss.serviceId,
              ss.serviceName,
              SUM(ss.quantity * ss.price) AS revenue
       FROM sale_services ss
       JOIN sales s ON ss.saleId = s.saleId
       ${where}
       GROUP BY ss.serviceId, ss.serviceName
       ORDER BY revenue DESC`,
      params
    );

    // Top customers (by sales count and revenue)
    const topCustomers = await q(
      `SELECT s.customerName,
              COUNT(*) AS orders,
              SUM(s.totalAmount) AS revenue
       FROM sales s
       ${where}
       GROUP BY s.customerName
       ORDER BY revenue DESC
       LIMIT 10`,
      params
    );

    // Sales trends
    const salesTrends = await q(
      `SELECT DATE_FORMAT(s.saleDate, ?) AS label,
              SUM(s.totalAmount) AS revenue
       FROM sales s
       ${where}
       GROUP BY label
       ORDER BY MIN(s.saleDate)`,
      [groupMask, ...params]
    );

    return res.json({
      totalRevenue,
      netProfit,
      expenses,
      profitMargin,
      revenueByService,
      topCustomers,
      salesTrends
    });
  } catch (err) {
    console.error('Summary error:', err);
    return res.status(500).json({ error: 'Failed to load summary', detail: err.message });
  }
});

module.exports = router;