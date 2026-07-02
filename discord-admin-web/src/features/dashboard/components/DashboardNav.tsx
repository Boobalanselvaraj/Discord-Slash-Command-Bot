import { LogOut, Shield } from 'lucide-react';

interface DashboardNavProps {
  onLogout: () => void;
}

const DashboardNav = ({ onLogout }: DashboardNavProps) => {
  return (
    <nav className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.2)]">
          <Shield className="text-black w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-wide text-white">Discord Admin Pro</h1>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-yellow-400 hover:bg-zinc-900 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </nav>
  );
};

export default DashboardNav;
