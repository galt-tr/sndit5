const express = require('express');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// Mock database (replace with actual database in production)
let db = {
  users: [],
  invoices: []
};

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
app.post('/api/signup', async (req, res) => {
  const { email, password, phoneNumber, name } = req.body;
  if (db.users.find(u => u.email === email)) {
    return res.status(400).send({ message: 'Email already exists' });
  }
  const hashedPassword = bcrypt.hashSync(password, 8);
  const newUser = { 
    id: db.users.length + 1, 
    email, 
    password: hashedPassword,
    phoneNumber,
    name
  };
  db.users.push(newUser);
  res.status(201).send({ message: 'User created successfully' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).send({ message: 'User not found' });
  const passwordIsValid = bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
  const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 }); // expires in 24 hours
  res.status(200).send({ auth: true, token });
});

// Invoice routes (protected)
app.get('/api/invoices', verifyToken, (req, res) => {
  res.json(db.invoices.filter(invoice => invoice.userId === req.userId));
});

app.post('/api/invoices', verifyToken, async (req, res) => {
  const newInvoice = { ...req.body, id: db.invoices.length + 1, userId: req.userId };
  db.invoices.push(newInvoice);
  res.status(201).json(newInvoice);
});

app.put('/api/invoices/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.invoices.findIndex(invoice => invoice.id === id && invoice.userId === req.userId);
  if (index === -1) return res.status(404).send({ message: 'Invoice not found' });
  db.invoices[index] = { ...db.invoices[index], ...req.body };
  res.json(db.invoices[index]);
});

app.delete('/api/invoices/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.invoices.findIndex(invoice => invoice.id === id && invoice.userId === req.userId);
  if (index === -1) return res.status(404).send({ message: 'Invoice not found' });
  db.invoices.splice(index, 1);
  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports.handler = serverless(app);