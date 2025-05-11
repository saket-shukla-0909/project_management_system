const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/userControllers');
const {isAdmin, protect} = require('../middlewares/authPermission');

router.post('/register', protect, isAdmin,  userControllers.registerUser);
router.get('/getAllUser', protect, isAdmin,  userControllers.getAllUsers);
router.delete('/delete/:id', protect, isAdmin, userControllers.deleteUser);
router.post('/login', userControllers.loginUser);
router.post('/logout' , protect, userControllers.logoutUser);
router.put('/update/:id', protect, isAdmin, userControllers.updateUser);

module.exports = router;
