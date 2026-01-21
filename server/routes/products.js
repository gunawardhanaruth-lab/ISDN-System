const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all products with aggregated stock or specific region stock
router.get('/', (req, res) => {
    const { region } = req.query;

    let query = `
        SELECT p.*, 
        (SELECT SUM(stock_level) FROM inventory WHERE product_id = p.id) as total_stock
        FROM products p
    `;

    if (region) {
        // If region specified, get stock for that region
        query = `
            SELECT p.*, i.stock_level 
            FROM products p
            LEFT JOIN inventory i ON p.id = i.product_id AND i.location = ?
        `;
    }

    const params = region ? [region] : [];

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
