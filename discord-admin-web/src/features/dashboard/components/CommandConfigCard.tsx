import React from 'react';
import { RefreshCw, Save } from 'lucide-react';
import type { CommandConfig } from '../types';

interface CommandConfigCardProps {
  config: CommandConfig;
  saving: string | null;
  onToggle: (command: string, current: boolean) => void;
  onTextChange: (command: string, text: string) => void;
  onPromptChange: (command: string, text: string) => void;
  onSave: (config: CommandConfig) => void;
}

const CommandConfigCard = React.memo(({
  config,
  saving,
  onToggle,
  onTextChange,
  onPromptChange,
  onSave
}: CommandConfigCardProps) => {
  return (
    <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center gap-3">
            <span className="font-mono text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-md text-sm border border-yellow-400/20">
              /{config.command}
            </span>
          </h4>
          <p className="text-zinc-400 text-sm mt-2">
            Configure behavior for the /{config.command} slash command.
          </p>
        </div>
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={config.isEnabled}
              onChange={() => onToggle(config.command, config.isEnabled)}
            />
            <div className={`block w-14 h-8 rounded-full transition-colors ${config.isEnabled ? 'bg-yellow-400' : 'bg-zinc-700 group-hover:bg-zinc-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-black w-6 h-6 rounded-full transition-transform ${config.isEnabled ? 'transform translate-x-6' : ''}`}></div>
          </div>
          <div className="ml-3 text-zinc-300 font-semibold w-16 text-right">
            {config.isEnabled ? 'Active' : 'Disabled'}
          </div>
        </label>
      </div>

      {config.command === 'status' && (
        <div className="mt-4 mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Custom Reply Text (Optional)</label>
          <input
            type="text"
            value={config.replyText || ''}
            onChange={(e) => onTextChange(config.command, e.target.value)}
            placeholder="Bot is online and fully operational."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
          />
        </div>
      )}

      {['report', 'leave', 'roastme'].includes(config.command) && (
        <div className="mt-4 mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">AI System Prompt (Optional)</label>
          <textarea
            value={config.systemPrompt || ''}
            onChange={(e) => onPromptChange(config.command, e.target.value)}
            placeholder={`Enter custom AI system instructions for /${config.command}`}
            rows={4}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-mono text-sm"
          />
          <p className="text-xs text-zinc-500 mt-2">Leave blank to use the default hard-coded AI instructions.</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-zinc-800/50 flex justify-end">
        <button
          onClick={() => onSave(config)}
          disabled={saving === config.command}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(250,204,21,0.15)] hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:-translate-y-0.5"
        >
          {saving === config.command ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
});

export default CommandConfigCard;
