import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCommand } from '../../context/CommandContext';
import { taskService, projectService } from '../../api/services';
import api from '../../api/axios'; // 💡 Direct axios instance for instant PUT syncing
import CommandPalette from '../../components/CommandPalette';
import { Terminal, Clock, Zap, CheckCircle, CircleDashed } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { setIsOpen } = useCommand();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [taskData, projectData] = await Promise.all([
        taskService.getDashboard(),
        projectService.getAll()
      ]);
      
      setTasks(Array.isArray(taskData) ? taskData : []);
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (error) {
      console.error("Failed to load pipeline context", error);
      setTasks([]);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handler: Click a card to instantly cycle its status forward in real-time
  const handleCycleStatus = async (taskId, currentStatus) => {
    let nextStatus = 'PENDING';
    if (currentStatus === 'PENDING') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else if (currentStatus === 'COMPLETED') nextStatus = 'PENDING';

    try {
      const response = await api.put(`/tasks/${taskId}`, { status: nextStatus });
      
      // 💡 Crucial: We refresh all dashboard metrics from the server right after the state changes 
      // so your swimlane counters at the top update instantly in real-time!
      await fetchDashboardData(); 
    } catch (err) {
      console.error("Failed to synchronize status pipeline alteration", err);
    }
  };

  const columns = {
    PENDING: Array.isArray(tasks) ? tasks.filter(t => t?.status === 'PENDING') : [],
    IN_PROGRESS: Array.isArray(tasks) ? tasks.filter(t => t?.status === 'IN_PROGRESS') : [],
    COMPLETED: Array.isArray(tasks) ? tasks.filter(t => t?.status === 'COMPLETED') : [],
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-accent">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <CircleDashed size={40} />
        </motion.div>
        <p className="mt-4 font-heading tracking-widest text-sm text-slate-400">INITIALIZING WORKSPACE</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 pb-10">
      
      {/* COMMAND PALETTE HEADER */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between bg-mineral-800/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl cursor-pointer hover:border-white/20 hover:bg-mineral-800/50 transition-all group"
      >
        <div className="flex items-center gap-4 w-full max-w-2xl select-none">
          <Terminal className="text-accent group-hover:scale-110 transition-transform" size={24} />
          <div className="text-slate-500 font-sans text-sm tracking-wide">
            Press <span className="text-slate-400 group-hover:text-slate-300 font-medium transition-colors">Ctrl+K</span> to open spotlight, or click here to execute a command...
          </div>
        </div>
        <div className="flex items-center gap-3 pr-2 text-sm text-slate-400 font-medium">
          <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5 shadow-inner text-xs font-mono group-hover:text-slate-200 transition-colors">Ctrl+K</span>
        </div>
      </motion.header>

      {/* THREE-COLUMN INTERACTIVE KANBAN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        
        <Swimlane 
          title="Backlog" 
          icon={<CircleDashed size={18} className="text-slate-400" />}
          tasks={columns.PENDING} 
          glowColor="hover:shadow-slate-500/5 hover:border-slate-500/30"
          onCardClick={handleCycleStatus}
        />

        <Swimlane 
          title="Active Pipeline" 
          icon={<Zap size={18} className="text-accent" />}
          tasks={columns.IN_PROGRESS} 
          glowColor="hover:shadow-accent/10 hover:border-accent/40"
          borderGlow="border-accent/20"
          onCardClick={handleCycleStatus}
        />

        <Swimlane 
          title="Verified Complete" 
          icon={<CheckCircle size={18} className="text-emerald-500" />}
          tasks={columns.COMPLETED} 
          glowColor="hover:shadow-emerald-500/10 hover:border-emerald-500/40"
          onCardClick={handleCycleStatus}
        />

      </div>

      <CommandPalette onDataRefresh={fetchDashboardData} />
      
    </div>
  );
}

function Swimlane({ title, icon, tasks = [], glowColor, borderGlow = "border-white/5", onCardClick }) {
  return (
    <div className="flex flex-col h-full bg-mineral-800/10 rounded-3xl border border-white/5 overflow-hidden shadow-inner backdrop-blur-sm">
      <div className={`p-5 flex items-center justify-between border-b ${borderGlow} bg-mineral-800/30`}>
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="font-heading font-semibold text-slate-200 tracking-wide">{title}</h2>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-white/5 rounded-full text-slate-400 border border-white/5">
          {tasks?.length || 0}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {Array.isArray(tasks) && tasks.map(task => {
            if (!task || !task.id) return null;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -10 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                key={task.id}
                onClick={() => onCardClick(task.id, task.status)} // 👈 Triggers state transformation on tap
                className={`group relative bg-mineral-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${glowColor} shadow-xl shadow-black/20`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-accent font-bold bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
                      📁 {task.project?.name || "Global Context"}
                    </span>
                    {task.project?.owner?.name && (
                      <span className="text-[9px] uppercase tracking-wide text-slate-500 font-mono bg-white/[0.02] border border-white/5 px-1.5 py-0.5 rounded">
                        by {task.project.owner.name.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    task.priority === 'HIGH' || task.priority === 'URGENT'
                      ? 'bg-alert/10 text-alert border-alert/20 shadow-lg shadow-alert/5' 
                      : 'bg-white/5 text-slate-400 border-white/5'
                  }`}>
                    {task.priority || 'MEDIUM'}
                  </span>
                </div>
                
                <h3 className="text-slate-100 font-medium mb-5 leading-snug tracking-wide group-hover:text-white transition-colors">
                  {task.title || 'Untitled Action Item'}
                </h3>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center text-[10px] text-white font-mono font-bold shadow-md shadow-accent/20">
                      {task.assignee?.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                      {task.assignee?.name || 'Unassigned'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock size={12} className="text-slate-600" />
                    {task.dueDate 
                      ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : 'No Date'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {(!tasks || tasks.length === 0) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-32 flex flex-col items-center justify-center text-slate-600 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]"
          >
            <p className="text-xs font-mono tracking-wider uppercase">Lanes Cleared</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}