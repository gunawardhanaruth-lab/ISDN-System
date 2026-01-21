const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'isdn.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeTables();
    }
});

function initializeTables() {
    db.serialize(() => {
        // Users Table - Added contactNo, address, department
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            contact_no TEXT,
            address TEXT,
            department TEXT
        )`);

        // Products Table - Removed stock columns (moved to inventory)
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT
        )`);

        // Inventory Table - Link Product to Location (Region)
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            location TEXT NOT NULL, -- Region: North, South, East, West, Central
            stock_level INTEGER DEFAULT 0,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`);

        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            total_amount REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            region TEXT NOT NULL, -- Region where order is placed/fulfilled
            FOREIGN KEY (customer_id) REFERENCES users(id)
        )`);

        // Order Items Table (Many-to-Many link for Orders <-> Products)
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL, -- Price at time of purchase
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`);

        // Deliveries Table
        db.run(`CREATE TABLE IF NOT EXISTS deliveries (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            vehicle_no TEXT,
            delivery_date DATETIME,
            status TEXT NOT NULL DEFAULT 'Scheduled',
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )`);

        // Invoices Table
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            amount REAL NOT NULL,
            invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Unpaid',
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )`);

        // Check if data exists, if not seed
        db.get("SELECT count(*) as count FROM users", (err, row) => {
            if (row.count === 0) {
                seedData();
            }
        });
    });
}

function seedData() {
    console.log("Seeding initial data...");

    // Helper to run query
    const insertUser = (name, email, pass, role, region = null, dept = null) => {
        const id = uuidv4();
        const hash = bcrypt.hashSync(pass, 10);
        db.run(`INSERT INTO users (id, name, email, password, role, address, department) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, hash, role, region ? `Region: ${region}` : 'Head Office', dept]);
        return id;
    };

    // 1. Users
    insertUser('Admin User', 'admin@isdn.com', 'admin123', 'admin', null, 'Management');
    insertUser('RDC Central', 'central@isdn.com', 'rdc123', 'rdc', 'Central', 'Operations');
    insertUser('Logistics User', 'driver@isdn.com', 'logistics123', 'logistics', 'Central', 'Transport');
    insertUser('Retail Customer', 'shop@gmail.com', 'shop123', 'customer', 'Central', null);

    // 2. Products & Inventory
    const products = [
        { name: 'Sunlight Soap', category: 'Household', price: 150, image: '/images/sunlight.png' },
        { name: 'Maggie Noodles', category: 'Food', price: 120, image: '/images/maggie.png' },
        { name: 'Munchee Biscuits', category: 'Food', price: 200, image: '/images/munchee.png' },
        { name: 'Signal Toothpaste', category: 'Personal Care', price: 250, image: '/images/signal.png' },
        { name: 'Anchor Milk Powder', category: 'Food', price: 1800, image: '/images/anchor.png' }
    ];

    const regions = ['Central', 'North', 'South', 'East', 'West'];

    products.forEach(p => {
        const prodId = uuidv4();
        db.run(`INSERT INTO products (id, name, category, price, image) VALUES (?, ?, ?, ?, ?)`,
            [prodId, p.name, p.category, p.price, p.image]);

        // Seed stock for each region
        regions.forEach(region => {
            db.run(`INSERT INTO inventory (id, product_id, location, stock_level) VALUES (?, ?, ?, ?)`,
                [uuidv4(), prodId, region, Math.floor(Math.random() * 500) + 50]);
        });
    });

    console.log("Seeding completed.");
}

module.exports = db;
