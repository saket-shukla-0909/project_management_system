// routes/companyRoutes.js
const express = require('express');
const router = express.Router();


const companiesController = require('../controllers/companyControllers');
const {isAdmin, protect} = require('../middlewares/authPermission');

// Route to create a new company (admin only)
router.post('/create', protect, isAdmin,  companiesController.createCompany);
router.get('/viewAllCompany', protect, isAdmin, companiesController.getAllCompany);
router.get('/viewById/:id', protect, isAdmin, companiesController.getById);
router.delete('/delete/:id', protect, isAdmin, companiesController.deleteCompany);
router.put('/update/:id', protect, isAdmin, companiesController.updateCompany); 

module.exports = router;