const Task = require('../models/task');
const { User } = require('../models/user');
const Project = require('../models/project');

// Create a new Task
exports.createTask = async (req, res) => {
  try {
      console.log(req.body, "this is req.body");
   const { title, description, status, userName, projectName } = req.body;
    // Validate required fields
    if (!title || !description || !status || !userName || !projectName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user by name
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find project by name
    const project = await Project.findOne({ name: projectName });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Create the task
    const task = await Task.create({
      title,
      description,
      status,
      assignedTo: user._id,
      projectId: project._id
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('Create Task Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    // Automatic pagination logic
    const page = parseInt(req.query.page) || 1;     // Default: page 1
    const limit = parseInt(req.query.limit) || 10;  // Default: 10 per page
    const skip = (page - 1) * limit;

    // Get total task count
    const totalTasks = await Task.countDocuments();

    const tasks = await Task.find()
      .populate('assignedTo', 'userName')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
      tasks,
    });
  } catch (err) {
    console.error('Get All Tasks Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userName } = req.query;
    const skip = (page - 1) * limit;
    const query = {};

    // If userName is provided, get user ID and filter
    if (userName) {
      const user = await User.findOne({ userName });
      if (!user) {
        return res.status(404).json({ message: 'User not found for assignedTo filter' });
      }
      query.assignedTo = user._id;
    }

    // If status is provided, validate and filter
    if (status) {
      const allowedStatus = ['1', '2', '3'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Allowed: 1, 2, 3' });
      }
      query.status = parseInt(status);
    }

    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate('assignedTo', 'userName')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: parseInt(page),
      tasks,
    });
  } catch (err) {
    console.error('Search Tasks Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete Task by ID
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    
    // Find the task by ID and delete it
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete Task Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get tasks assigned to the current user
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user._id; // Extract userId from the authentication token (via middleware)

    // Find tasks where the assignedTo field matches the user's ID
    const tasks = await Task.find({ assignedTo: userId });

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    res.status(200).json(tasks);
  } catch (err) {
    console.error('Get User Tasks Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Update Task Status (To-Do, In-Progress, Done)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params; // Task ID from URL
    const { status } = req.body; // Status from request body (e.g., "To-Do", "In-Progress", "Done")
    
    const userId = req.user._id; // Extract userId from the authentication token (via middleware)

    // Find the task by taskId
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the authenticated user is the one assigned to this task
    if (task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this task' });
    }

    // Update task status
    task.status = status; // Update the status (assuming status is valid: To-Do, In-Progress, Done)
    await task.save();

    res.status(200).json({ message: 'Task status updated successfully', task });
  } catch (err) {
    console.error('Update Task Status Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Update Task Details (title, description, status, assignedTo, projectId)

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, userName, projectName } = req.body;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find new assigned user if userName provided
    if (userName) {
      const assignedUser = await User.findOne({ userName });
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
      task.assignedTo = assignedUser._id;
    }

    // Find new project if projectName provided
    if (projectName) {
      const project = await Project.findOne({ name: projectName });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      task.projectId = project._id;
    }

    // Update provided fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    await task.save();

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (err) {
    console.error('Update Task Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


