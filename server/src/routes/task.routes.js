const express = require('express');
const { createTask, getDashboardTasks, updateTaskStatus } = require('../controllers/task.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole(['ADMIN']), createTask);
router.get('/dashboard', getDashboardTasks);
router.patch('/:taskId/status', updateTaskStatus); // Both Admins and Members can update status

module.exports = router;