const express = require('express');
const router = express.Router();
const { getTeamMembers } = require('../controllers/user.controller');
const { createProject, getProjects } = require('../controllers/project.controller');
const { createTask, getMemberTasks } = require('../controllers/task.controller');

// Team Registry Route
router.get('/team', getTeamMembers);

// Project Pipelines
router.post('/projects', createProject);
router.get('/projects', getProjects);

// Task Allocations
router.post('/tasks', createTask);
router.get('/tasks/member', getMemberTasks); // For members to see their dashboard arrays

module.exports = router;