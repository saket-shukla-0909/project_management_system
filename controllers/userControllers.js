const { User, Roles } = require('../models/user');
const bcrypt = require('bcryptjs');
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Company } = require('../models/company');

// Role map to convert string to number
const roleMap = {
  admin: 1,
  manager: 2,
  member: 3
};


// Register
exports.registerUser = async (req, res) => {
  const { userName, email, password, role, companyName, domain } = req.body;

  if (!userName || !email || !password || !role || !companyName || !domain) {
    return res.status(400).json({ message: 'All fields are required: userName, email, password, role, companyName, domain' });
  }

  const roleNumber = roleMap[role.toLowerCase()];
  if (!roleNumber) {
    return res.status(400).json({ message: 'Invalid role. Use admin, manager, or member' });
  }

  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Check if company exists
  let company = await Company.findOne({ companyName, domain });

  // If not, create it
  if (!company) {
    company = await Company.create({ companyName, domain });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with companyId
  const user = await User.create({
    userName,
    email,
    password: hashedPassword,
    role: roleNumber,
    companyId: company._id
  });

  res.status(201).json({
    id: user._id,
    userName: user.userName,
    email: user.email,
    role: roleNumber,
    company: {
      id: company._id,
      name: company.companyName,
      domain: company.domain
    }
  });
};


// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token with email only
    const token = jwt.sign(
      { email: user.email },  // Only include email
      process.env.JWT_SECRET,
      { expiresIn: '1d' }     // Token expires in 1 day
    );

    // Save token to user (optional)
    user.token = token;
    await user.save();

    res.status(200).json({
      id: user._id,
      userName: user.userName,
      email: user.email,
      token
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// logout   
exports.logoutUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user || user.token !== req.token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    user.token = null;
    await user.save();

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .select('-password -token'); // exclude password & token

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalUsers,
      users
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /users/:id
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /users/:id
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { userName, email, role } = req.body; // ⛔ exclude companyId

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: validate and convert role string to number using roleMap
    const roleMap = { admin: 1, manager: 2, member: 3 };
    if (role) {
      const roleNumber = roleMap[role.toLowerCase()];
      if (!roleNumber) {
        return res.status(400).json({ message: 'Invalid role. Use admin, manager, or member' });
      }
      user.role = roleNumber;
    }

    if (userName) user.userName = userName;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        companyId: user.companyId // returned but not updated
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
