// controllers/companyController.js
const { Company } = require('../models/company');
const { User } = require('../models/user');


exports.createCompany = async (req, res) => {
  try {
    const { companyName, domain } = req.body;

    // Create a new company
    const company = new Company({ companyName, domain });
    await company.save();

    // Update the user's document with the created companyId
    req.user.companyId = company._id;
    await req.user.save();

    res.status(201).json({
      message: 'Company created successfully',
      company,
      user: {
        id: req.user._id,
        companyId: req.user.companyId
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllCompany = async (req, res) => {
  try {
    const companies = await Company.find();

    res.status(200).json({
      message: 'Companies fetched successfully',
      companies
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params; 

  try {
    // Find the company by ID
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      message: 'Company found',
      company
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};


exports.deleteCompany = async (req, res) => {
  const { id } = req.params; // Get the company ID from request parameters

  try {
    const company = await Company.findByIdAndDelete(id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      message: 'Company deleted successfully',
      company
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

exports.updateCompany = async (req, res) => {
  const { id } = req.params; // Get the company ID from request parameters
  const { companyName, domain } = req.body; // Get the new data from the request body

  try {
    // Find the company by ID and update the name and domain
    const company = await Company.findByIdAndUpdate(id, {
      companyName,
      domain
    }, { new: true }); // The 'new' option ensures the updated document is returned

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      message: 'Company updated successfully',
      company
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};
