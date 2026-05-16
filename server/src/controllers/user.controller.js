const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTeamMembers = async (req, res) => {
  try {
    // Fetch users, but only grab safe public data (don't send password hashes!)
    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    res.status(200).json(members);
  } catch (error) {
    console.error("Failed to fetch team registry:", error);
    res.status(500).json({ error: "Internal server error gathering team metrics." });
  }
};

module.exports = { getTeamMembers };