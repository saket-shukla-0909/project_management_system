const { User } = require('../models/user');
const Project = require('../models/project');

// Create new project
exports.createProject = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(req.body,"this is req.body")
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      createdBy: userId,
      companyId: user.companyId,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Create Project Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get all projects (Admin/Manager only)
exports.getAllProjects = async (req, res) => {
  try {
    // Get page and limit from query parameters (default to page 1 and limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;  // Calculate the number of items to skip

    // Get total count of projects for pagination
    const totalProjects = await Project.countDocuments();

    // Fetch projects with pagination
    const projects = await Project.find()
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'userName email')
      .populate('companyId', 'companyName domain');

    // Calculate total pages
    const totalPages = Math.ceil(totalProjects / limit);

    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      totalProjects: totalProjects,
      projects: projects
    });
  } catch (err) {
    console.error('Get All Projects Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Get all projects created by the logged-in user
exports.getProjectsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({ createdBy: userId })
      .populate('companyId', 'companyName domain');

    res.status(200).json(projects);
  } catch (err) {
    console.error('Get User Projects Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Find the project by its ID
    const project = await Project.findById(projectId);

    // Check if the project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete the project
    await project.remove();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete Project Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Update a project
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { name, description } = req.body;

    // Find the project by its ID
    const project = await Project.findById(projectId);

    // Check if the project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update project fields
    project.name = name || project.name;
    project.description = description || project.description;

    // Save updated project
    await project.save();

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (err) {
    console.error('Update Project Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
