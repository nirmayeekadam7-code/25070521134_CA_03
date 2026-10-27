const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks the JWT sent in the "Authorization: Bearer <token>" header
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not logged in. Please login first.' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired. Please login again.' });
  }
};

// Allows only admin users
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access only.' });
};

// Allows only student users
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') return next();
  return res.status(403).json({ message: 'Student access only.' });
};

module.exports = { protect, adminOnly, studentOnly };
