const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');

// 💡 Ensure this path correctly targets your authentication controllers!
const { register, login } = require('../controllers/auth.controller');

// 🌐 Auth Gateway Routes (Mounted relative to /api/auth)
router.post('/register', register); // Path: /api/auth/register
router.post('/login', login);       // Path: /api/auth/login

// 👷 Clear and direct endpoint for fetching team members
router.get('/team', requireAuth, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true 
      }
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

module.exports = router;