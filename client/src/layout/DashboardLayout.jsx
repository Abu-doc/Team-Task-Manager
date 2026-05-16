import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FolderKanban, CheckCircle2, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DOCK_ITEMS = [
  { id: 'home', path: '/', icon: Home, label: 'Overview' },
  { id: 'projects', path: '/projects', icon: FolderKanban, label: 'Projects' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <div className="min-h-screen bg-mineral-900 overflow-hidden relative selection:bg-accent selection:text-white">
      {/* 🌌 Atmospheric Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[150px] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-alert/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 👤 Top Nav (Minimalist User Profile) */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-mineral-800 border border-white/10 flex items-center justify-center text-accent shadow-lg shadow-accent/10">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest">{user?.role}</p>
          </div>
        </motion.div>
      </header>

      {/* 📦 Main Content Area (Dynamic Router Content Frame) */}
      <main className="relative z-10 w-full h-screen pt-24 pb-32 px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto h-full">
          {/* 💡 The Outlet dynamically renders whichever nested route view is active */}
          <Outlet />
        </div>
      </main>

      {/* 🚀 The Floating Action Dock */}
      <div className="absolute bottom-8 w-full flex justify-center z-50 pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 bg-mineral-800/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50"
        >
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            
            // Matches active tab highlight directly to the active browser route path
            const isActive = location.pathname === item.path;
            const isHovered = hoveredTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.8 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-mineral-800 text-xs text-white rounded-lg whitespace-nowrap border border-white/10 shadow-xl"
                    >
                      {item.label}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onMouseEnter={() => setHoveredTab(item.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  onClick={() => navigate(item.path)}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-3 rounded-2xl transition-colors duration-300 ${
                    isActive ? 'bg-accent text-white shadow-lg shadow-accent/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              </div>
            );
          })}

          <div className="w-px h-8 bg-white/10 mx-2" /> {/* Divider */}

          {/* Logout Trigger */}
          <motion.button
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="p-3 rounded-2xl text-slate-400 hover:text-alert hover:bg-alert/10 transition-colors duration-300"
          >
            <LogOut size={22} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}