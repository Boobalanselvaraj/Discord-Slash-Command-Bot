import React from 'react';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CommandLog } from '../types';

interface ActivityLogTableProps {
  filteredLogs: CommandLog[];
  filterCommand: string;
  setFilterCommand: (val: string) => void;
}

const ActivityLogTable = React.memo(({ filteredLogs, filterCommand, setFilterCommand }: ActivityLogTableProps) => {
  return (
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
  );
});

export default ActivityLogTable;
