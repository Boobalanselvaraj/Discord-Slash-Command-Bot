import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../shared/api/axios';
import { motion } from 'framer-motion';
import { LogOut, Activity, MessageSquare, ShieldAlert, RefreshCw, Settings as SettingsIcon, List, Users as UsersIcon, Shield, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Settings from './Settings';
import Users from './Users';

interface CommandLog {
  id: number;
  interactionId: string;
  commandName: string;
  userId: string;
  channelId: string;
  status: string;
  aiAnalysis?: string;
  createdAt: string;
  payload: any;
}

const Dashboard = () => {
  const { logout } = useAuth();
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'users' | 'settings'>('logs');
  const [filterCommand, setFilterCommand] = useState<string>('all');
  
  const filteredLogs = filterCommand === 'all' ? logs : logs.filter(l => l.commandName === filterCommand);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/commands');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-yellow-400/30">
      <nav className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.2)]">
            <Shield className="text-black w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">Discord Admin Pro</h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-yellow-400 hover:bg-zinc-900 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
        
        <div className="flex justify-between items-end mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Dashboard</h2>
            <p className="text-zinc-400 text-sm">Manage users, view live command logs, and configure bot settings.</p>
          </div>
          {activeTab === 'logs' && (
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg border border-zinc-800 transition-colors shadow-sm focus:ring-1 focus:ring-yellow-400/50 outline-none"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
              Refresh Logs
            </button>
          )}
        </div>

        <div className="flex gap-2 border-b border-zinc-900 mb-8 relative z-10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all rounded-t-lg ${activeTab === 'logs' ? 'bg-zinc-900/50 text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
              }`}
          >
            <List className="w-4 h-4" />
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all rounded-t-lg ${activeTab === 'users' ? 'bg-zinc-900/50 text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
              }`}
          >
            <UsersIcon className="w-4 h-4" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all rounded-t-lg ${activeTab === 'settings' ? 'bg-zinc-900/50 text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
              }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Configuration
          </button>
        </div>

        <div className="relative z-10">
          {activeTab === 'logs' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-zinc-400 text-sm font-medium">Total Interactions</p>
                      <h3 className="text-4xl font-bold text-white mt-2 tracking-tight group-hover:text-yellow-400 transition-colors">{logs.length}</h3>
                    </div>
                    <div className="p-3 bg-zinc-900 text-yellow-400 rounded-xl shadow-inner">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-zinc-400 text-sm font-medium">Reports Received</p>
                      <h3 className="text-4xl font-bold text-white mt-2 tracking-tight">
                        {logs.filter((l) => l.commandName === 'report').length}
                      </h3>
                    </div>
                    <div className="p-3 bg-zinc-900 text-red-500 rounded-xl shadow-inner">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-zinc-400 text-sm font-medium">Status Checks</p>
                      <h3 className="text-4xl font-bold text-white mt-2 tracking-tight">
                        {logs.filter((l) => l.commandName === 'status').length}
                      </h3>
                    </div>
                    <div className="p-3 bg-zinc-900 text-emerald-500 rounded-xl shadow-inner">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
                  <h3 className="text-sm font-medium text-zinc-300">Command History</h3>
                  <select
                    value={filterCommand}
                    onChange={(e) => setFilterCommand(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  >
                    <option value="all">All Commands</option>
                    <option value="report">/report</option>
                    <option value="status">/status</option>
                    <option value="leave">/leave</option>
                    <option value="roastme">/roastme</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/30 border-b border-zinc-900 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Command</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Extracted Details</th>
                        <th className="px-6 py-4 text-right">Raw Payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                            No interactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log, idx) => (
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            key={log.id}
                            className="hover:bg-zinc-900/40 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 text-yellow-400 border border-zinc-800">
                                /{log.commandName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-300">
                                  {log.payload?.member?.user?.username || log.payload?.user?.username || 'Unknown'}
                                </span>
                                <span className="text-xs text-zinc-500 font-mono">
                                  {log.userId}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${log.status === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {(() => {
                                const data = log.payload?.data;
                                if (!data) return <span className="text-zinc-600 italic text-sm">No data</span>;
                                
                                const values: Record<string, string> = {};
                                
                                if (data.components) {
                                  data.components.forEach((row: any) => {
                                    row.components.forEach((comp: any) => {
                                      values[comp.custom_id] = comp.value;
                                    });
                                  });
                                } else if (data.options) {
                                  data.options.forEach((opt: any) => {
                                    values[opt.name] = opt.value;
                                  });
                                }
                                
                                const entries = Object.entries(values);
                                if (entries.length === 0) return <span className="text-zinc-600 italic text-sm">No data</span>;
                                
                                return (
                                  <div className="flex flex-col gap-2 mt-2">
                                    <div className="flex flex-wrap gap-2">
                                      {entries.map(([k, v]) => (
                                        <div key={k} className="flex items-center text-xs border border-zinc-800 rounded-md overflow-hidden bg-zinc-950">
                                          <span className="bg-zinc-900 text-zinc-400 px-2 py-1 font-medium border-r border-zinc-800">
                                            {k.replace('_', ' ')}
                                          </span>
                                          <span className="text-zinc-200 px-2 py-1 truncate max-w-[150px]" title={v as string}>
                                            {v as string}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    {log.aiAnalysis && (
                                      <div className="flex items-start text-xs border border-yellow-500/30 rounded-md overflow-hidden bg-zinc-950 mt-1">
                                        <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 font-medium border-r border-yellow-500/30 flex items-center gap-1">
                                          🧠 AI Triage
                                        </span>
                                        <span className="text-zinc-300 px-2 py-1 flex-1">
                                          {log.aiAnalysis}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(log.payload, null, 2));
                                  toast.success('Payload copied to clipboard!', {
                                    style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' },
                                    iconTheme: { primary: '#facc15', secondary: '#000' }
                                  });
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-yellow-400 border border-zinc-800 hover:border-yellow-400/50 rounded-lg transition-all text-xs font-medium group"
                                title="Copy raw JSON payload"
                              >
                                <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                Copy JSON
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === 'settings' ? (
            <Settings />
          ) : (
            <Users />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
