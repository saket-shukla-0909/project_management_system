const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskControllers');
const { protect, isAdminOrManager } = require('../middlewares/authPermission');

router.post('/create', protect, isAdminOrManager, taskController.createTask);
router.get('/getAllTasks', protect, isAdminOrManager, taskController.getAllTasks);
router.get('/search', protect, taskController.searchTasks);
router.delete('/delete/:taskId', protect, isAdminOrManager, taskController.deleteTask);
router.get('/my-tasks', protect, taskController.getUserTasks);
router.patch('/update-status/:taskId', protect, taskController.updateTaskStatus);
router.put('/update/:taskId', protect, isAdminOrManager , taskController.updateTask);



module.exports = router;
