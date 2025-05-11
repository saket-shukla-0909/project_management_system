const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectControllers');
const { protect, isAdminOrManager } = require('../middlewares/authPermission');

router.post('/create', protect, isAdminOrManager, projectController.createProject);
router.get('/getAllProject', protect, isAdminOrManager, projectController.getAllProjects);
router.get('/my-projects', protect, projectController.getProjectsByUser);
router.delete('/delete/:id', protect, isAdminOrManager, projectController.deleteProject);
router.put('/update/:id', protect, isAdminOrManager, projectController.updateProject);

module.exports = router;
