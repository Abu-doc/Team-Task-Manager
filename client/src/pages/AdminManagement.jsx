import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminManagement() {
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form States
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Load projects and team members from backend
  const loadData = async () => {
    try {
      const [projectRes, teamRes] = await Promise.all([
        api.get('/projects'),
        api.get('/auth/team') // 👈 Points directly to our new clean backend route
      ]);
      
      setProjects(projectRes.data);
      setTeam(teamRes.data.filter(user => user.role === 'MEMBER')); // Only show workers
      
      if (projectRes.data.length > 0) {
        setSelectedProject(projectRes.data[0].id);
      }
    } catch (err) {
      setError('Could not connect to the server data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Action: Create a Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    try {
      await api.post('/projects', { name: projectName, description: projectDesc });
      setProjectName('');
      setProjectDesc('');
      alert('Project created successfully!');
      loadData(); // Refresh the list automatically
    } catch (err) {
      alert('Failed to create project.');
    }
  };

  // Action: Create and Assign a Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedProject || !selectedAssignee) {
      alert('Please fill out the title, select a project, and choose a team member.');
      return;
    }
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        projectId: selectedProject,
        assigneeId: selectedAssignee
      });
      setTaskTitle('');
      setTaskDesc('');
      alert('Task assigned successfully!');
      loadData(); // Refresh the list automatically
    } catch (err) {
      alert('Failed to assign task.');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading data...</div>;

  return (
    <div className="p-6 text-slate-100 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-500">Admin Panel</h1>
        <p className="text-slate-400 text-sm">Create projects and assign tasks to your team.</p>
      </div>

      {error && <div className="p-3 bg-red-950 text-red-400 border border-red-900 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FORMS SECTION */}
        <div className="space-y-6">
          
          {/* Create Project Form */}
          <form onSubmit={handleCreateProject} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h2 className="text-lg font-semibold">Create New Project</h2>
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project Name" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            <input type="text" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Description (Optional)" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-medium py-2 rounded-lg transition-colors">Create Project</button>
          </form>

          {/* Assign Task Form */}
          <form onSubmit={handleCreateTask} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h2 className="text-lg font-semibold">Assign a Task</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg p-2">
                <option value="">Select Team Member</option>
                {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task Title" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2" />
            <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Task Details..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2" rows="2" />
            
            <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2">
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-medium py-2 rounded-lg transition-colors">Assign Task</button>
          </form>

        </div>

        {/* LIVE PREVIEW LIST SECTION */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 overflow-y-auto max-h-[600px]">
          <h2 className="text-lg font-semibold border-b border-slate-800 pb-2">Active Projects & Tasks</h2>
          {projects.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No projects created yet.</p>
          ) : (
            projects.map(proj => (
              <div key={proj.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2">
                <h3 className="font-bold text-blue-400">{proj.name}</h3>
                <div className="pl-2 space-y-1">
                  {proj.tasks?.map(task => (
                    <div key={task.id} className="text-xs bg-slate-900 p-2 rounded flex justify-between items-center border border-slate-800">
                      <div>
                        <p className="text-slate-200 font-medium">{task.title}</p>
                        <p className="text-[10px] text-slate-500">Assigned to: {task.assignee?.name || 'Unassigned'}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-amber-500">{task.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}