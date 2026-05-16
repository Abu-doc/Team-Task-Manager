import api from './axios';

export const projectService = {
  getAll: async () => {
    const { data } = await api.get('/projects');
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/projects', payload);
    return data;
  }
};

export const taskService = {
  getDashboard: async () => {
    const { data } = await api.get('/tasks/dashboard');
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/tasks', payload);
    return data;
  },
  updateStatus: async (taskId, status) => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
    return data;
  }
};