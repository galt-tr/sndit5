import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import twilio from 'twilio';
import { getDb } from './db.js';

dotenv.config()
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const ENABLE_2FA = process.env.ENABLE_2FA === 'true';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    next();
  });
};

// User routes
router.post('/signup', async (req, res) => {
  const db = await getDb();
  const { email, password, phoneNumber, name } = req.body;
  
  try {
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).send({ message: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const twoFactorSecret = speakeasy.generateSecret({ length: 32 });

    const result = await db.run(
      'INSERT INTO users (email, password, phoneNumber, name, twoFactorSecret) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, phoneNumber, name, JSON.stringify(twoFactorSecret)]
    );

    res.status(201).send({ message: 'User created successfully', userId: result.lastID });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  const db = await getDb();
  const { email, password } = req.body;

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).send({ message: 'User not found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    if (ENABLE_2FA) {
      const twoFactorSecret = JSON.parse(user.twoFactorSecret);
      const twoFactorCode = speakeasy.totp({
        secret: twoFactorSecret.base32,
        encoding: 'base32'
      });

      twilioClient.messages.create({
        body: `Your 2FA code is: ${twoFactorCode}`,
        from: TWILIO_PHONE_NUMBER,
        to: user.phoneNumber
      }).then(() => {
        res.status(200).send({ userId: user.id, message: '2FA code sent to your phone' });
      }).catch(error => {
        console.error('Error sending 2FA code:', error);
        res.status(500).send({ message: 'Error sending 2FA code' });
      });
    } else {
      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 });
      res.status(200).send({ auth: true, token });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error on login' });
  }
});

router.post('/verify-2fa', async (req, res) => {
  if (!ENABLE_2FA) {
    return res.status(400).send({ message: '2FA is currently disabled' });
  }

  const db = await getDb();
  const { userId, code } = req.body;

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).send({ message: 'User not found' });

    const twoFactorSecret = JSON.parse(user.twoFactorSecret);
    const verified = speakeasy.totp.verify({
      secret: twoFactorSecret.base32,
      encoding: 'base32',
      token: code
    });

    if (verified) {
      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 });
      res.status(200).send({ auth: true, token });
    } else {
      res.status(401).send({ auth: false, message: 'Invalid 2FA code' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error verifying 2FA code' });
  }
});

// Invoice routes
router.get('/invoices', verifyToken, async (req, res) => {
  const db = await getDb();
  try {
    const invoices = await db.all('SELECT * FROM invoices WHERE userId = ?', [req.userId]);
    for (let invoice of invoices) {
      invoice.items = await db.all('SELECT * FROM invoice_items WHERE invoiceId = ?', [invoice.id]);
      invoice.customer = await db.get('SELECT * FROM customers WHERE id = ?', [invoice.customerId]);
    }
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching invoices' });
  }
});

router.post('/invoices', verifyToken, async (req, res) => {
  const db = await getDb();
  const { customer, date, dueDate, items, total, status, taxPercentage } = req.body;

  try {
    const result = await db.run(
      'INSERT INTO invoices (userId, customerId, date, dueDate, total, status, taxPercentage) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, customer.id, date, dueDate, total, status, taxPercentage]
    );

    const invoiceId = result.lastID;

    for (let item of items) {
      await db.run(
        'INSERT INTO invoice_items (invoiceId, description, quantity, price) VALUES (?, ?, ?, ?)',
        [invoiceId, item.description, item.quantity, item.price]
      );
    }

    const newInvoice = await db.get('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    newInvoice.items = await db.all('SELECT * FROM invoice_items WHERE invoiceId = ?', [invoiceId]);
    newInvoice.customer = customer;

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error creating invoice' });
  }
});

// Customer routes
router.get('/customers', verifyToken, async (req, res) => {
  const db = await getDb();
  try {
    const customers = await db.all('SELECT * FROM customers WHERE userId = ?', [req.userId]);
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching customers' });
  }
});

router.post('/customers', verifyToken, async (req, res) => {
  const db = await getDb();
  const { name, companyName, phoneNumber, email, address } = req.body;

  try {
    const result = await db.run(
      'INSERT INTO customers (userId, name, companyName, phoneNumber, email, address) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, name, companyName, phoneNumber, email, address]
    );

    const newCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error creating customer' });
  }
});

export default router;