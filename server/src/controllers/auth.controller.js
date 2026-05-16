const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password, name, adminKey } = req.body;

    // 1. Defend against duplicate registrations
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'System architecture alert: Email already registered.' });
    }

    // 2. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Dynamic Role Allocation Engine
    let assignedRole = 'MEMBER';
    if (adminKey && adminKey === process.env.ADMIN_REGISTRATION_KEY) {
      assignedRole = 'ADMIN';
    }

    // 4. Write securely to the PostgreSQL Database (Using your schema field: passwordHash)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword, // Fixed to match your database schema
        name,
        role: assignedRole
      }
    });

    // 5. Instantly issue a secure JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });

  } catch (error) {
    console.error("Registration engine failure:", error);
    res.status(500).json({ error: 'Internal system deployment error.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Look up the record
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 2. Compare using passwordHash from your schema
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash); // Fixed to use passwordHash
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 3. Generate fresh JWT credential token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });

  } catch (error) {
    console.error("Login verification engine failure:", error);
    res.status(500).json({ error: 'Internal system deployment error.' });
  }
};

module.exports = { register, login };