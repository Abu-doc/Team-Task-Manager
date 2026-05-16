import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function MemberProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectPipelines() {
      try {
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error("Failed to load project details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectPipelines();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading your project directories...</div>;

  return (
    <div className="p-6 text-slate-100 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-emerald-500">Project Workspace Directories</h1>
        <p className="text-slate-400 text-sm">Review high-level tracking timelines for active workspaces you belong to.</p>
      </div>

      {projects.length === 0 ? (
        <p className="text-slate-500 text-sm italic">You are not currently assigned to any active project tracks.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(proj => {
            // Calculate progress bars dynamically for the member on the fly
            const memberTasks = proj.tasks || [];
            const completedCount = memberTasks.filter(t => t.status === 'COMPLETED').length;
            const progressPercentage = memberTasks.length > 0 
              ? Math.round((completedCount / memberTasks.length) * 100) 
              : 0;

            return (
              <div key={proj.id} className="bg-mineral-800/40 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                <div>
                  <h3 className="font-bold text-lg text-slate-200">📁 {proj.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{proj.description || 'No descriptive pipeline notes provided.'}</p>
                </div>

                {/* Progress bar metrics tracker */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Task Track Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-accent transition-all duration-500" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex gap-4">
                  <span>Total Tasks: {memberTasks.length}</span>
                  <span className="text-emerald-400">Completed: {completedCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}