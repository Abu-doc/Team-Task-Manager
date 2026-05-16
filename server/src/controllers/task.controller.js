const prisma = require('../config/db');

// 🎯 CREATE AND ALLOCATE TASK
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, projectId, assigneeId } = req.body;

    const taskPayload = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null, // 💡 Maps directly to your schema field
      },
      include: {
        project: {
          select: {
            name: true,
            owner: { select: { name: true, email: true } } // 💡 Includes the manager who created it
          }
        },
        assignee: { select: { name: true, email: true } }
      }
    });

    res.status(201).json(taskPayload);
  } catch (error) {
    next(error);
  }
};

// 👁️ FETCH DASHBOARD TASKS Matrix
const getDashboardTasks = async (req, res, next) => {
  try {
    // ADMINS look up tasks via project ownerId; MEMBERS look up tasks via assigneeId
    const queryFilter = req.user.role === 'ADMIN'
      ? { project: { ownerId: req.user.id } }
      : { assigneeId: req.user.id };

    const taskMatrix = await prisma.task.findMany({
      where: queryFilter,
      include: {
        project: { 
          select: { 
            name: true,
            owner: { select: { name: true, email: true } } // 👈 Displays who assigned the task
          } 
        },
        assignee: { select: { name: true, email: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.status(200).json(taskMatrix);
  } catch (error) {
    next(error);
  }
};

// 🔄 UPDATE TASK STATUS
const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        project: {
          select: {
            name: true,
            owner: { select: { name: true } }
          }
        }
      }
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getDashboardTasks, updateTaskStatus };