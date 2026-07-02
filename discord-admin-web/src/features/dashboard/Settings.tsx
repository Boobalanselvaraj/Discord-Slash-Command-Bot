import { useEffect, useState } from 'react';
import api from '../../shared/api/axios';
import { Settings as SettingsIcon, Save, RefreshCw, Link2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface CommandConfig {
  command: string;
  isEnabled: boolean;
  replyText: string | null;
  systemPrompt: string | null;
}

const Settings = () => {
  const [configs, setConfigs] = useState<CommandConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // System Config
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savingWebhook, setSavingWebhook] = useState(false);

  // Discord Invite Config
  const [discordClientId, setDiscordClientId] = useState('');
  const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&permissions=2048&scope=bot%20applications.commands`;

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/config');

      const defaultConfigs = [
        { command: 'report', isEnabled: true, replyText: '', systemPrompt: '' },
        { command: 'status', isEnabled: true, replyText: 'Bot is online and fully operational.', systemPrompt: '' },
        { command: 'leave', isEnabled: true, replyText: '', systemPrompt: '' },
        { command: 'roastme', isEnabled: true, replyText: '', systemPrompt: '' }
      ];

      const dbConfigs = res.data;
      const merged = defaultConfigs.map(def => {
        const found = dbConfigs.find((c: any) => c.command === def.command);
        return found ? { ...found, replyText: found.replyText || '', systemPrompt: found.systemPrompt || '' } : def;
      });

      setConfigs(merged);
      
      // Fetch system config (webhook url)
      try {
        const sysRes = await api.get('/config/system/NOTIFICATION_WEBHOOK_URL');
        if (sysRes.data && sysRes.data.value) {
          setWebhookUrl(sysRes.data.value);
        }

        const discordRes = await api.get('/config/system/DISCORD_APPLICATION_ID');
        if (discordRes.data && discordRes.data.value) {
          setDiscordClientId(discordRes.data.value);
        }
      } catch (sysErr) {
        console.error('Failed to fetch system config', sysErr);
      }
      
    } catch (err) {
      console.error('Failed to fetch config', err);
      toast.error('Failed to load configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleToggle = (command: string, current: boolean) => {
    setConfigs(configs.map(c => c.command === command ? { ...c, isEnabled: !current } : c));
  };

  const handleTextChange = (command: string, text: string) => {
    setConfigs(configs.map(c => c.command === command ? { ...c, replyText: text } : c));
  };

  const handlePromptChange = (command: string, text: string) => {
    setConfigs(configs.map(c => c.command === command ? { ...c, systemPrompt: text } : c));
  };

  const saveConfig = async (commandConfig: CommandConfig) => {
    const loadingToast = toast.loading(`Saving /${commandConfig.command} config...`, {
      style: {
        background: '#18181b',
        color: '#fff',
        border: '1px solid #27272a',
      }
    });

    try {
      setSaving(commandConfig.command);
      await api.put(`/config/${commandConfig.command}`, {
        isEnabled: commandConfig.isEnabled,
        replyText: commandConfig.replyText || null,
        systemPrompt: commandConfig.systemPrompt || null
      });
      toast.success(`/${commandConfig.command} configuration saved!`, {
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
      // brief delay for UI feedback
      setTimeout(() => setSaving(null), 500);
    } catch (err) {
      console.error('Failed to save config', err);
      toast.error('Failed to save configuration.', {
        id: loadingToast,
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #ef4444',
        }
      });
      setSaving(null);
    }
  };

  const saveWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Please enter a valid webhook URL');
      return;
    }
    
    const loadingToast = toast.loading('Saving webhook configuration...', {
      style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
    });
    
    try {
      setSavingWebhook(true);
      await api.put('/config/system/NOTIFICATION_WEBHOOK_URL', {
        value: webhookUrl
      });
      toast.success('Webhook saved successfully!', {
        id: loadingToast,
        style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' },
        iconTheme: { primary: '#facc15', secondary: '#000' }
      });
    } catch (err) {
      console.error('Failed to save webhook', err);
      toast.error('Failed to save webhook configuration.', {
        id: loadingToast,
        style: { background: '#18181b', color: '#fff', border: '1px solid #ef4444' }
      });
    } finally {
      setSavingWebhook(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mb-4" />
        <p className="text-zinc-400 font-medium">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-sm p-8 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600"></div>
      
      <div className="flex items-center gap-3 mb-8 border-b border-zinc-900 pb-6">
        <div className="p-2 bg-yellow-400/10 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">System Configuration</h3>
          <p className="text-sm text-zinc-400 mt-1">Manage bot connections, global behavior, and responses.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Discord Connection Section */}
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

        {/* Command Configurations */}
        <div className="space-y-6">
          <h4 className="text-xl font-bold text-white flex items-center gap-2">
            Command Behaviors
          </h4>
          
          {configs.map((config) => (
            <div key={config.command} className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-3">
                    <span className="font-mono text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-md text-sm border border-yellow-400/20">/{config.command}</span>
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
                      onChange={() => handleToggle(config.command, config.isEnabled)}
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
                    onChange={(e) => handleTextChange(config.command, e.target.value)}
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
                    onChange={(e) => handlePromptChange(config.command, e.target.value)}
                    placeholder={`Enter custom AI system instructions for /${config.command}`}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-mono text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-2">Leave blank to use the default hard-coded AI instructions.</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-zinc-800/50 flex justify-end">
                <button
                  onClick={() => saveConfig(config)}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
