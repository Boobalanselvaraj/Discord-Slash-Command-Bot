import React, { useMemo } from 'react';
import { Activity, ShieldAlert, MessageSquare } from 'lucide-react';
import type { CommandLog } from '../types';

interface StatsCardsProps {
  logs: CommandLog[];
}

const StatsCards = React.memo(({ logs }: StatsCardsProps) => {
  const totalInteractions = logs.length;
  const reportsReceived = useMemo(() => logs.filter((l) => l.commandName === 'report').length, [logs]);
  const statusChecks = useMemo(() => logs.filter((l) => l.commandName === 'status').length, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-zinc-400 text-sm font-medium">Total Interactions</p>
            <h3 className="text-4xl font-bold text-white mt-2 tracking-tight group-hover:text-yellow-400 transition-colors">
              {totalInteractions}
            </h3>
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
              {reportsReceived}
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
              {statusChecks}
            </h3>
          </div>
          <div className="p-3 bg-zinc-900 text-emerald-500 rounded-xl shadow-inner">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default StatsCards;
