import { useEffect, useState } from 'react';
import api from '../../shared/api/axios';
import { User, Trash2, UserPlus, RefreshCw, Shield, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface AppUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole] = useState<'admin' | 'user'>('admin');
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error('Failed to load users. Ensure backend is configured.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast.error('Username and password are required.');
      return;
    }

    const loadingToast = toast.loading('Creating user...', {
      style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
    });

    try {
      setCreating(true);
      await api.post('/users', { username: newUsername, password: newPassword, role: newRole });
      toast.success('User created successfully!', {
        id: loadingToast,
        style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' },
        iconTheme: { primary: '#facc15', secondary: '#000' }
      });
      setIsFormOpen(false);
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to create user', err);
      toast.error(err.response?.data?.error || 'Failed to create user.', {
        id: loadingToast,
        style: { background: '#18181b', color: '#fff', border: '1px solid #ef4444' }
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    const loadingToast = toast.loading('Deleting user...', {
      style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
    });

    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully!', {
        id: loadingToast,
        style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' },
        iconTheme: { primary: '#facc15', secondary: '#000' }
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      toast.error('Failed to delete user.', {
        id: loadingToast,
        style: { background: '#18181b', color: '#fff', border: '1px solid #ef4444' }
      });
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mb-4" />
        <p className="text-zinc-400 font-medium">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-sm p-8 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400/10 rounded-lg">
            <User className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">User Management</h3>
            <p className="text-sm text-zinc-400 mt-1">Add or remove admins and regular users.</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(250,204,21,0.15)] hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          {isFormOpen ? 'Cancel' : 'Create New User'}
        </button>
      </div>

      {isFormOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8 overflow-hidden"
        >
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Add User</h4>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-zinc-600 transition-all outline-none"
                    placeholder="New username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-zinc-600 transition-all outline-none"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Confirm & Create Admin
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/30 border-b border-zinc-900 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No users found. Create one above!
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={user.id}
                    className="hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-200">
                      {user.username}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                          <UserIcon className="w-3 h-3" />
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
