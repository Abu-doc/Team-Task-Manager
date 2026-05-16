const prisma = require('../config/db');

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.id; 

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId 
      }
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        tasks: true
      }
    });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// 💡 ENSURE THIS OBJECT MATCHES THE ROUTER IMPORTS PERFECTLY
module.exports = { createProject, getProjects };