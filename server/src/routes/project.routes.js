const express = require('express');
const router = express.Router();

// 💡 Destructure the controller methods
const { createProject, getProjects } = require('../controllers/project.controller');

// 🛡️ Destructure the exact middleware function name we fixed above
const { requireAuth } = require('../middleware/auth.middleware'); 

// 🌐 Project routing channels
router.post('/', requireAuth, createProject);
router.get('/', requireAuth, getProjects);

module.exports = router;