import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../shared/api/axios';
import { RefreshCw, List, Users as UsersIcon, Settings as SettingsIcon } from 'lucide-react';
import Settings from './Settings';
import Users from './Users';
import DashboardNav from './components/DashboardNav';
import StatsCards from './components/StatsCards';
import ActivityLogTable from './components/ActivityLogTable';
import type { CommandLog } from './types';

const Dashboard = () => {
  const { logout } = useAuth();
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'users' | 'settings'>('logs');
  const [filterCommand, setFilterCommand] = useState<string>('all');
  
  const filteredLogs = useMemo(() => {
    return filterCommand === 'all' ? logs : logs.filter(l => l.commandName === filterCommand);
  }, [logs, filterCommand]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/commands');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-yellow-400/30">
      <DashboardNav onLogout={logout} />

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
              <StatsCards logs={logs} />
              <ActivityLogTable 
                filteredLogs={filteredLogs} 
                filterCommand={filterCommand}
                setFilterCommand={setFilterCommand} 
              />
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
