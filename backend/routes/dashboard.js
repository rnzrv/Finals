const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/middleware');

// Promisified query helper
const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });


  // fix for monthly date grouping

router.get('/getDataMonthly', verifyToken, async(req, res) => {

    const revenueRow = await q(`SELECT COALESCE(SUM(totalAmount), 0) 
        AS totalRevenue FROM sales s WHERE saleDate > (CURDATE() - INTERVAL 30 DAY)`);

    const serviceSalesRow = await q(`SELECT COALESCE(SUM(ss.quantity * ss.price), 0) 
        AS totalServiceSales 
        FROM sale_services ss 
        JOIN sales s ON ss.saleId = s.saleId 
        WHERE s.saleDate > (CURDATE() - INTERVAL 30 DAY)`);

    const productSalesRow = await q(`SELECT COALESCE(SUM(si.qty * si.price), 0) 
        AS totalProductSales 
        FROM sale_items si 
        JOIN sales s ON si.saleId = s.saleId 
        WHERE s.saleDate > (CURDATE() - INTERVAL 30 DAY)`);

    const expensesRow = await q(`SELECT COALESCE(SUM(quantity * costUnit), 0) 
        AS totalExpenses 
        FROM purchases 
        WHERE created_at > (CURDATE() - INTERVAL 30 DAY)`);

    const cogsRow = await q(`SELECT COALESCE(SUM(si.qty * inv.costUnit), 0) 
        AS totalCOGS 
        FROM sale_items si 
        JOIN sales s ON si.saleId = s.saleId 
        JOIN inventory inv ON si.itemCode = inv.code 
        WHERE s.saleDate > (CURDATE() - INTERVAL 30 DAY)`);

    const profitMarginRow = await q(`SELECT COALESCE(SUM(si.qty * inv.costUnit), 0) 
        AS totalCost 
        FROM sale_items si 
        JOIN sales s ON si.saleId = s.saleId 
        JOIN inventory inv ON si.itemCode = inv.code 
        WHERE s.saleDate > (CURDATE() - INTERVAL 30 DAY)`);

    const salesTrends = await q(`SELECT 
        DATE_FORMAT(s.saleDate, '%Y-%m-%d') AS label, 
        SUM(s.totalAmount) AS sales, SUM(si.qty * inv.costUnit) AS expenses
        FROM sales s
        LEFT JOIN sale_items si ON s.saleId = si.saleId
        LEFT JOIN inventory inv ON si.itemCode = inv.code
        WHERE s.saleDate > (CURDATE() - INTERVAL 30 DAY)
        GROUP BY label
        ORDER BY label ASC`); 

    const topSellingServices = await q(`SELECT 
        ss.serviceId, ss.serviceName, 
        SUM(ss.quantity) AS totalSold,
        SUM(ss.quantity * ss.price) AS totalRevenue
        FROM sale_services ss
        JOIN sales s ON ss.saleId = s.saleId
        WHERE s.saleDate > (CURDATE() - INTERVAL 30 DAY)
        GROUP BY ss.serviceId, ss.serviceName
        ORDER BY totalSold DESC
        LIMIT 5`);

    const todayAppointments = await q(` SELECT 
        p.id AS patientId, p.name AS patientName, a.date AS appointmentDate, a.time AS appointmentTime, a.service_type AS serviceType
        FROM patients p
        JOIN appointments a ON p.id = a.patient_id
        WHERE DATE(a.date) = CURDATE()
        ORDER BY a.date ASC LIMIT 5
        `)

    const recentSales = await q(`SELECT 
        s.saleId, s.reference, s.customerName, s.totalAmount, s.saleDate
        FROM sales s
        LEFT JOIN sale_items si ON s.saleId = si.saleId
        LEFT JOIN sale_services ss ON s.saleId = ss.saleId
        WHERE s.saleDate > (CURDATE() - INTERVAL 7 DAY)
        GROUP BY s.saleId
        ORDER BY s.saleDate DESC
        LIMIT 5`);

    const totalRevenue = Number(revenueRow[0]?.totalRevenue || 0);

    const totalProductSales = Number(productSalesRow[0]?.totalProductSales || 0);
    const totalServiceSales = Number(serviceSalesRow[0]?.totalServiceSales || 0);
    const expenses = Number(expensesRow[0]?.totalExpenses || 0); // adjust if needed
    const cogs = Number(cogsRow[0]?.totalCOGS || 0);
    const netProfit = totalRevenue - cogs;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Queries to get total revenue, product sales, and service sales
    


    // Respond with the summary data
    res.status(200).json({
      totalRevenue,
      totalServiceSales,
      totalProductSales,
      profitMargin,
      salesTrends: {
        labels: salesTrends.map((s) => s.label),
        sales: salesTrends.map((s) => s.sales),
        expenses: salesTrends.map((s) => s.expenses),
      },
      topSellingServices,
      todayAppointments,
        recentSales,

    });
});

module.exports = router;