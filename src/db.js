import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

async function initializeDatabase() {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        phoneNumber TEXT,
        name TEXT,
        twoFactorSecret TEXT
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        customerId INTEGER,
        date TEXT,
        dueDate TEXT,
        total REAL,
        status TEXT,
        taxPercentage REAL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (customerId) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER,
        description TEXT,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id)
      );

      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        name TEXT,
        companyName TEXT,
        phoneNumber TEXT,
        email TEXT,
        address TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
  }
  return db;
}

export async function getDb() {
  if (!db) {
    await initializeDatabase();
  }
  return db;
}