import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MemberDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch only the tasks allocated specifically to this logged-in member
  useEffect(() => {
    async function fetchAllocatedTasks() {
      try {
        const response = await api.get('/tasks'); // Hits your dynamic getDashboardTasks controller
        setTasks(response.data);
      } catch (err) {
        setError('Failed to securely gather your allocated task metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllocatedTasks();
  }, []);

  // Handler: Update Task Status on the fly (PENDING -> IN_PROGRESS -> COMPLETED)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      
      // Update the local component state array instantly so the UI shifts smoothly
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: response.data.status } : task
      ));
    } catch (err) {
      alert('Failed to synchronize status alteration with the main server.');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading your workspace matrix...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-emerald-500">MEMBER WORKSPACE CANVAS</h1>
          <p className="text-slate-400 mt-1">Track your operational targets and update live production progress states.</p>
        </div>

        {error && <div className="p-4 bg-red-950 border border-red-800 text-red-200 rounded-lg">{error}</div>}

        {/* 📋 TASKS GRID VIEW */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-200">📋 Your Assigned Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-500 italic">
              Excellent! No pending operational tasks have been assigned to your workspace profile yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map(task => (
                <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                  
                  {/* Top: Metadata and Content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {/* Project Parent Context */}
                      <span className="text-[10px] uppercase font-black tracking-wider text-blue-400 bg-blue-950/50 border border-blue-900 px-2 py-0.5 rounded">
                        📁 {task.project?.name || 'Unassigned Project'}
                      </span>
                      {/* Priority Tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === 'HIGH' ? 'bg-red-950 text-red-400 border border-red-900' :
                        task.priority === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100">{task.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-3">{task.description || 'No instruction breakdown provided for this task.'}</p>
                  </div>

                  {/* Bottom: Assigner & Status Pipeline Controller */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    {/* 💡 The core metadata showing EXACTLY who created it */}
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Assigned By</p>
                      <p className="font-semibold text-emerald-400 mt-0.5">{task.project?.owner?.name || 'System Admin'}</p>
                    </div>

                    {/* Interactive Action Status Sync Dropdown */}
                    <div className="space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider text-right">Status State</p>
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`bg-slate-950 border text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none ${
                          task.status === 'COMPLETED' ? 'border-emerald-800 text-emerald-400' :
                          task.status === 'IN_PROGRESS' ? 'border-amber-800 text-amber-400' :
                          'border-slate-700 text-slate-400'
                        }`}
                      >
                        <option value="PENDING">Pending Ops</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed Check</option>
                      </select>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}