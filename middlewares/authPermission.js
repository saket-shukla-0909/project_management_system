const protect = require('../middlewares/authMiddleware');

// middleware/isAdmin.js
const isAdmin = (req, res, next) => {
  if (req.user.role !== 1) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Allow admins (1) and managers (2)
const isAdminOrManager = (req, res, next) => {
  if (![1, 2].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admins or Managers only.' });
  }
  next();
};

module.exports = {protect, isAdmin, isAdminOrManager};
