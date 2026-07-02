import { useEffect, useState, useCallback } from 'react';
import api from '../../shared/api/axios';
import { Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CommandConfig } from './types';
import DiscordConnectionSettings from './components/DiscordConnectionSettings';
import CommandConfigCard from './components/CommandConfigCard';

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

      const defaultConfigs: CommandConfig[] = [
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

  const handleToggle = useCallback((command: string, current: boolean) => {
    setConfigs((prev) => prev.map(c => c.command === command ? { ...c, isEnabled: !current } : c));
  }, []);

  const handleTextChange = useCallback((command: string, text: string) => {
    setConfigs((prev) => prev.map(c => c.command === command ? { ...c, replyText: text } : c));
  }, []);

  const handlePromptChange = useCallback((command: string, text: string) => {
    setConfigs((prev) => prev.map(c => c.command === command ? { ...c, systemPrompt: text } : c));
  }, []);

  const saveConfig = useCallback(async (commandConfig: CommandConfig) => {
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
  }, []);

  const saveWebhook = useCallback(async () => {
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
  }, [webhookUrl]);

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
        <DiscordConnectionSettings
          inviteLink={inviteLink}
          webhookUrl={webhookUrl}
          setWebhookUrl={setWebhookUrl}
          savingWebhook={savingWebhook}
          saveWebhook={saveWebhook}
        />

        <div className="space-y-6">
          <h4 className="text-xl font-bold text-white flex items-center gap-2">
            Command Behaviors
          </h4>
          
          {configs.map((config) => (
            <CommandConfigCard
              key={config.command}
              config={config}
              saving={saving}
              onToggle={handleToggle}
              onTextChange={handleTextChange}
              onPromptChange={handlePromptChange}
              onSave={saveConfig}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
