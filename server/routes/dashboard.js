const express = require('express');
const router = express.Router();
const db = require('../database');

// GET Sales and Inventory Stats
router.get('/stats', (req, res) => {
    const stats = {};

    // 1. Total Sales
    db.get('SELECT SUM(total_amount) as totalSales, COUNT(id) as totalOrders FROM orders', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalSales = row.totalSales || 0;
        stats.totalOrders = row.totalOrders || 0;

        // 2. Low Stock Items
        db.get('SELECT COUNT(*) as lowStock FROM inventory WHERE stock_level < 20', (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.lowStockItems = row.lowStock || 0;

            // 3. Pending Deliveries
            db.get("SELECT COUNT(*) as pending FROM orders WHERE status != 'Delivered'", (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.pendingDeliveries = row.pending || 0;

                res.json(stats);
            });
        });
    });
});

module.exports = router;
