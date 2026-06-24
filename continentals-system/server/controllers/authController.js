const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const data = require('../data/seed');
require('dotenv').config();

let nextUserId = data.users.length + 1;

const register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = data.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: nextUserId++,
    name,
    email,
    password: hashedPassword,
    role: 'guest',
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = data.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

const getProfile = (req, res) => {
  const user = data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
};

module.exports = { register, login, getProfile };
