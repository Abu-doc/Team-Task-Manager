import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, KeyRound, Lock, Mail, User } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchronized field metric states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminGate, setShowAdminGate] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Defensive Verification Loop
    if (!email || !password) {
      setError('Please input your operational credentials before authenticating.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Fires flat string credentials straight to the verified context
        await login(email, password);
      } else {
        // Compiles registration payload variables cleanly
        await register({ 
          name, 
          email, 
          password, 
          adminKey: showAdminGate ? adminKey : '' 
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication clearance failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mineral-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Aurora Ambient Background Accents */}
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-mineral-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Initialize Profile'}
          </h1>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Access your administrative operational workspace' : 'Deploy a new team terminal account'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-alert/10 border border-alert/20 rounded-xl text-xs text-alert font-mono"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-mineral-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent font-sans text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input
              type="email"
              placeholder="Operational Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-mineral-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent font-sans text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input
              type="password"
              placeholder="Security Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-mineral-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent font-sans text-sm"
            />
          </div>

          {/* 🔑 THE ADMINISTRATIVE ACCESS GATEWAY */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                {!showAdminGate ? (
                  <button
                    type="button"
                    onClick={() => setShowAdminGate(true)}
                    className="text-xs text-slate-500 hover:text-purple-400 font-mono flex items-center gap-1.5 transition-colors duration-200 mx-auto"
                  >
                    <Shield size={12} /> Apply for Administrative Clearance?
                  </button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative bg-purple-500/[0.02] border border-purple-500/20 p-4 rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-center text-[10px] text-purple-400 font-mono font-bold tracking-wider">
                      <span>ADMIN AUTH PRIVILEGES</span>
                      <button 
                        type="button" 
                        onClick={() => { setShowAdminGate(false); setAdminKey(''); }} 
                        className="text-slate-500 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 text-purple-400/60" size={16} />
                      <input
                        type="password"
                        placeholder="Enter Administrative Key..."
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="w-full bg-mineral-950/60 border border-purple-500/10 rounded-lg py-2.5 pl-10 pr-4 text-purple-200 placeholder-purple-900 focus:outline-none focus:border-purple-500 font-mono text-xs"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3.5 rounded-xl font-medium text-sm hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 font-sans mt-4"
          >
            {loading ? 'Processing Clearance...' : isLogin ? 'Authenticate Terminal' : 'Deploy Terminal Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setShowAdminGate(false);
              setAdminKey('');
              setName('');
              setEmail('');
              setPassword('');
            }}
            className="text-xs text-slate-500 hover:text-slate-300 font-sans transition-colors"
          >
            {isLogin ? "Don't have an operational account? Register here" : 'Already verified? Authenticate profile'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}