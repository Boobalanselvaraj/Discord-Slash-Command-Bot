import React from 'react';
import { Link2, ExternalLink, RefreshCw, Save } from 'lucide-react';

interface DiscordConnectionSettingsProps {
  inviteLink: string;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  savingWebhook: boolean;
  saveWebhook: () => void;
}

const DiscordConnectionSettings = React.memo(({
  inviteLink,
  webhookUrl,
  setWebhookUrl,
  savingWebhook,
  saveWebhook
}: DiscordConnectionSettingsProps) => {
  return (
    <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
      <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Link2 className="w-5 h-5 text-yellow-400" />
        Discord Connection
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h5 className="font-semibold text-white mb-2">1. Add Bot to Server</h5>
          <p className="text-zinc-400 text-sm mb-4">Authorize this bot to join your Discord server and create slash commands.</p>
          <a 
            href={inviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            Add Bot to Discord
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        <div>
          <h5 className="font-semibold text-white mb-2">2. Notification Channel</h5>
          <p className="text-zinc-400 text-sm mb-4">Paste a Discord Webhook URL to define where the bot will mirror reports.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all text-sm"
            />
            <button
              onClick={saveWebhook}
              disabled={savingWebhook}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-4 py-2.5 rounded-lg transition-all disabled:opacity-70 whitespace-nowrap flex items-center gap-2"
            >
              {savingWebhook ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DiscordConnectionSettings;
