// models/companyModel.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);

module.exports = { Company };
