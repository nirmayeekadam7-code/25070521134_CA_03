const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  hostel: user.hostel,
  roomNumber: user.roomNumber,
});

// POST /api/auth/register  -> always creates a STUDENT
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, hostel, roomNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed, hostel, roomNumber, role: 'student',
    });

    res.status(201).json({ token: generateToken(user._id), user: userResponse(user) });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    res.json({ token: generateToken(user._id), user: userResponse(user) });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me  -> returns the logged-in user (used on page refresh)
exports.getMe = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};
