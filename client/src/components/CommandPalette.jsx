import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommand } from '../context/CommandContext';
import { useAuth } from '../context/AuthContext'; // <-- Imported Auth to check roles
import { projectService, taskService } from '../api/services';
import { FolderPlus, FilePlus2, Search, X, ShieldAlert } from 'lucide-react';

export default function CommandPalette({ onDataRefresh }) {
  const { isOpen, setIsOpen } = useCommand();
  const { user } = useAuth(); // <-- Extracting user role context
  const [mode, setMode] = useState('search'); 
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form States
  const [projectTitle, setProjectTitle] = useState('');
  const [taskData, setTaskData] = useState({ title: '', priority: 'MEDIUM', dueDate: '', projectId: '' });
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      // Pre-fetch workspaces so the selection dropdown stays populated
      projectService.getAll()
        .then(data => setProjectsList(Array.isArray(data) ? data : []))
        .catch(console.error);
    } else {
      setMode('search');
      setProjectTitle('');
      setTaskData({ title: '', priority: 'MEDIUM', dueDate: '', projectId: '' });
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      await projectService.create({ name: projectTitle });
      onDataRefresh(); 
      setIsOpen(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to initialize workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Safety Catch: Prevent submission if no target project workspace exists
    if (!taskData.projectId) {
      setErrorMessage('Pipeline routing failure: A valid Project Workspace must be selected.');
      return;
    }

    setLoading(true);
    try {
      await taskService.create(taskData);
      onDataRefresh(); 
      setIsOpen(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to deploy system task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-mineral-950/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-xl bg-mineral-800/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-mineral-900/40 border-b border-white/5 text-xs text-slate-400 font-mono">
              <span>{mode === 'search' ? 'COMMAND PALETTE CORE' : mode.toUpperCase() + ' SUBSYSTEM'}</span>
              <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Global Error Banner Panel */}
            {errorMessage && (
              <div className="bg-alert/10 border-b border-alert/20 px-5 py-3 text-xs text-alert flex items-center gap-2 font-mono">
                <ShieldAlert size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mode A: Main Routing Engine */}
            {mode === 'search' && (
              <div className="p-2">
                <div className="flex items-center gap-3 px-3 py-2 text-slate-500">
                  <Search size={18} />
                  <span className="text-sm font-sans">Initialize target operational branch:</span>
                </div>
                
                {/* ROLE PROTECTION ENFORCEMENT */}
                {user?.role === 'ADMIN' ? (
                  <div className="mt-2 space-y-1">
                    <button 
                      onClick={() => setMode('project')}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-left text-slate-200 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FolderPlus size={18} className="text-accent" />
                        <span className="text-sm font-medium">Create New Project Workspace</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono group-hover:text-slate-400">/project</span>
                    </button>

                    <button 
                      onClick={() => setMode('task')}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-left text-slate-200 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FilePlus2 size={18} className="text-emerald-400" />
                        <span className="text-sm font-medium">Deploy System Task</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono group-hover:text-slate-400">/task</span>
                    </button>
                  </div>
                ) : (
                  /* Clean, bespoke fallback message for Team Members */
                  <div className="p-6 text-center text-slate-500 font-mono text-xs">
                    🔒 Command privileges restricted. System modifications require an administrative role level.
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Project Registration Subsystem */}
            {mode === 'project' && (
              <form onSubmit={handleCreateProject} className="p-5 space-y-4">
                <input
                  type="text"
                  placeholder="Project Title (e.g., Commercial Re-pipe)..."
                  required
                  autoFocus
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-mineral-900/50 border border-white/10 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent"
                />
                <div className="flex justify-end gap-2 text-sm pt-2">
                  <button type="button" onClick={() => setMode('search')} className="px-4 py-2 text-slate-400 hover:text-white">Back</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover font-medium">
                    {loading ? 'Generating...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            )}

            {/* Mode C: Task Deployment Subsystem */}
            {mode === 'task' && (
              <form onSubmit={handleCreateTask} className="p-5 space-y-4">
                <input
                  type="text"
                  placeholder="Task Assignment Description..."
                  required
                  autoFocus
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  className="w-full bg-mineral-900/50 border border-white/10 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <select
                    required
                    value={taskData.projectId}
                    onChange={(e) => setTaskData({ ...taskData, projectId: e.target.value })}
                    className="bg-mineral-900/50 border border-white/10 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-accent text-sm cursor-pointer"
                  >
                    <option value="">Select Target Project</option>
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    className="bg-mineral-900/50 border border-white/10 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-accent text-sm cursor-pointer"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Deployment</option>
                  </select>
                </div>

                <input
                  type="date"
                  required
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  className="w-full bg-mineral-900/50 border border-white/10 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-accent text-sm"
                />

                <div className="flex justify-end gap-2 text-sm pt-2">
                  <button type="button" onClick={() => setMode('search')} className="px-4 py-2 text-slate-400 hover:text-white">Back</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
                    {loading ? 'Deploying...' : 'Deploy Task'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}