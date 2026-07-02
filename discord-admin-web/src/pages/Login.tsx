import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../shared/api/axios';
import { Lock, Shield, Zap, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // We use a loading toast which will be updated on success or error
    const loadingToast = toast.loading('Authenticating...', {
      style: {
        background: '#18181b', // zinc-900
        color: '#fff',
        border: '1px solid #27272a', // zinc-800
      },
      iconTheme: {
        primary: '#facc15', // yellow-400
        secondary: '#000',
      }
    });

    try {
      const response = await api.post('/auth/login', { username, password });
      toast.success('Login successful! Welcome back.', { 
        id: loadingToast,
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a',
        },
        iconTheme: {
          primary: '#facc15',
          secondary: '#000',
        }
      });
      login();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed. Please check your credentials.', { 
        id: loadingToast,
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #ef4444',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex text-white font-sans selection:bg-yellow-400/30">
      {/* Left Section - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 border-r border-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-500/20 rounded-full mix-blend-screen filter blur-[128px] opacity-50"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-yellow-600/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              <Shield className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Discord Admin Pro</h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h2 className="text-5xl font-extrabold mb-6 leading-tight">
              Command your <span className="text-yellow-400">community</span> <br/>with absolute precision.
            </h2>
            <p className="text-zinc-400 text-lg max-w-md mb-12 leading-relaxed">
              The ultimate toolkit for top-tier server administrators. Automate moderation, track deep analytics, and manage roles from one beautifully crafted, powerful dashboard.
            </p>
            
            <div className="space-y-8">
              <motion.div 
                className="flex items-start gap-4 text-zinc-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400 shrink-0 shadow-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Lightning Fast Actions</h3>
                  <p className="text-zinc-500 leading-relaxed">Execute bulk commands and update server settings with real-time synchronization.</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4 text-zinc-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-400 shrink-0 shadow-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Advanced Analytics</h3>
                  <p className="text-zinc-500 leading-relaxed">Gain deep insights into server engagement, member growth, and message activity over time.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        <div className="text-sm text-zinc-600 font-medium relative z-10">
          © {new Date().getFullYear()} Discord Admin Portal. Crafted with precision.
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative bg-black">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="mb-12 lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Discord Admin</h1>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Welcome back</h2>
              <p className="text-zinc-400">Enter your credentials to access the admin dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-zinc-300">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-zinc-600 transition-all outline-none"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300">Password</label>
                  <a href="#" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors">Forgot password?</a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-zinc-600 transition-all outline-none"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-4 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(250,204,21,0.15)] hover:shadow-[0_0_25px_rgba(250,204,21,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Sign In to Portal
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
