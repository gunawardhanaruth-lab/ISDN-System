const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// GET all orders (Filter by User or Region)
router.get('/', (req, res) => {
    const { userId, region, role } = req.query;

    let query = `
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        JOIN users u ON o.customer_id = u.id
    `;
    const params = [];

    if (role === 'customer' && userId) {
        query += ` WHERE o.customer_id = ?`;
        params.push(userId);
    } else if (role === 'rdc' && region) {
        query += ` WHERE o.region = ?`;
        params.push(region);
    }

    query += ` ORDER BY o.order_date DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET Order Details including Items
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT o.*, u.name as customer_name, u.email as customer_email, u.address as customer_address
            FROM orders o 
            JOIN users u ON o.customer_id = u.id
            WHERE o.id = ?`, [id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        db.all(`SELECT oi.*, p.name as product_name 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?`, [id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...order, items });
        });
    });
});

// POST Create Order
router.post('/', (req, res) => {
    const { customerId, items, totalAmount, region } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ error: 'No items in order' });

    const orderId = uuidv4();

    // Transaction-like approach (SQLite serialized)
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare(`INSERT INTO orders (id, customer_id, total_amount, region) VALUES (?, ?, ?, ?)`);
        stmt.run(orderId, customerId, totalAmount, region, function (err) {
            if (err) {
                console.error(err);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Failed to create order' });
            }

            const itemStmt = db.prepare(`INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)`);

            items.forEach(item => {
                // Determine item price - assuming frontend sends it or we verify it. For prototype, taking from frontend but safer to query DB.
                // Optimally: Deduct stock here too.
                itemStmt.run(uuidv4(), orderId, item.id, item.quantity, item.price);
            });

            itemStmt.finalize();

            db.run('COMMIT');
            res.status(201).json({ message: 'Order created successfully', orderId });
        });
    });
});

// PUT Update Status (RDC/Logistics)
router.put('/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order status updated' });
    });
});

module.exports = router;
