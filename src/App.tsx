import React, { useState, useEffect, useCallback } from 'react';
import { BotStatus, BotConfig, CustomCommand, BotLog } from './types';
import { DEFAULT_CUSTOM_COMMANDS } from './data/presets';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { VoiceMusicTab } from './components/VoiceMusicTab';
import { ModerationTab } from './components/ModerationTab';
import { CustomCommandsTab } from './components/CustomCommandsTab';
import { DeployExportTab } from './components/DeployExportTab';
import { LogsTab } from './components/LogsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isStarting, setIsStarting] = useState(false);

  // Bot Status State
  const [status, setStatus] = useState<BotStatus>({
    isRunning: false,
    isDemoMode: false,
    ping: 0,
    uptime: 0,
    guildsCount: 0,
    membersCount: 0,
    currentVoiceChannel: null,
    music: {
      currentTrack: null,
      isPlaying: false,
      isPaused: false,
      volume: 80,
      loopMode: 'off',
      queue: [],
      stay247Mode: true,
      voiceChannelName: null
    }
  });

  // Bot Configuration State
  const [config, setConfig] = useState<BotConfig>({
    token: '',
    clientId: '',
    prefix: '!',
    stay247: true,
    voiceChannelId: '',
    guildId: '',
    activityType: 'Listening',
    activityName: 'YouTube & 24/7 Voice | !help',
    status: 'online',
    autoReconnect: true,
    welcomeChannelId: '',
    welcomeMessage: '',
    autoRoleId: ''
  });

  const [customCommands, setCustomCommands] = useState<CustomCommand[]>(DEFAULT_CUSTOM_COMMANDS);
  const [logs, setLogs] = useState<BotLog[]>([]);

  // Fetch initial status and config
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('Không thể kết nối API status:', err);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(prev => ({ ...prev, ...data.config }));
        }
      }
    } catch (err) {
      console.warn('Không thể lấy config:', err);
    }
  }, []);

  const fetchCommands = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/custom-commands');
      if (res.ok) {
        const data = await res.json();
        if (data.commands && data.commands.length > 0) {
          setCustomCommands(data.commands);
        }
      }
    } catch (err) {
      console.warn('Không thể lấy custom commands:', err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.warn('Không thể lấy logs:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchConfig();
    fetchCommands();
    fetchLogs();

    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchConfig, fetchCommands, fetchLogs]);

  // Actions
  const handleStartBot = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: config.token })
      });
      const data = await res.json();
      if (data.success) {
        fetchStatus();
        fetchLogs();
      }
    } catch (err) {
      console.error('Lỗi khởi động bot:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopBot = async () => {
    try {
      const res = await fetch('/api/bot/stop', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchStatus();
        fetchLogs();
      }
    } catch (err) {
      console.error('Lỗi dừng bot:', err);
    }
  };

  const handleUpdateConfig = (newConfig: Partial<BotConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleSaveConfig = async () => {
    try {
      await fetch('/api/bot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      fetchLogs();
    } catch (err) {
      console.error('Lỗi lưu config:', err);
    }
  };

  const handleTestToken = async () => {
    try {
      const res = await fetch('/api/bot/test-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: config.token })
      });
      const data = await res.json();
      fetchLogs();
      if (data.success && data.bot) {
        alert(`✅ Token Hợp Lệ!\nBot Tag: ${data.bot.tag}\nBot ID: ${data.bot.id}`);
      } else {
        alert(`❌ Token Không Hợp Lệ: ${data.error || 'Vui lòng kiểm tra lại'}`);
      }
    } catch (err: any) {
      alert(`❌ Lỗi kết nối: ${err.message}`);
    }
  };

  // Music & Voice Actions
  const handlePlayTrack = async (trackPayload: {
    presetId?: string;
    customUrl?: string;
    customTitle?: string;
    trackData?: any;
    queueOnly?: boolean;
  }) => {
    try {
      const res = await fetch('/api/bot/music/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackPayload)
      });
      const data = await res.json();
      if (data.success) {
        fetchStatus();
        fetchLogs();
      }
    } catch (err) {
      console.error('Lỗi phát bài hát:', err);
    }
  };

  const handleMusicControl = async (
    action: string,
    extra?: { volume?: number; loopMode?: string; queueIndex?: number }
  ) => {
    try {
      const res = await fetch('/api/bot/music/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra })
      });
      const data = await res.json();
      if (data.success && data.musicState) {
        setStatus(prev => ({ ...prev, music: data.musicState }));
        fetchLogs();
      }
    } catch (err) {
      console.error('Lỗi điều khiển nhạc:', err);
    }
  };

  const handleToggle247 = async (stay247: boolean, channelName?: string) => {
    try {
      const res = await fetch('/api/bot/voice/toggle-247', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stay247, channelName })
      });
      const data = await res.json();
      if (data.success) {
        fetchStatus();
        fetchLogs();
      }
    } catch (err) {
      console.error('Lỗi bật/tắt 24/7:', err);
    }
  };

  // Custom Commands CRUD
  const handleSaveCommand = async (cmd: Partial<CustomCommand>) => {
    try {
      const res = await fetch('/api/bot/custom-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmd)
      });
      const data = await res.json();
      if (data.success && data.commands) {
        setCustomCommands(data.commands);
        fetchLogs();
      }
    } catch (err) {
      console.error('Lỗi lưu command:', err);
    }
  };

  const handleDeleteCommand = async (id: string) => {
    try {
      const res = await fetch(`/api/bot/custom-commands/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success && data.commands) {
        setCustomCommands(data.commands);
        fetchLogs();
      }
    } catch (err) {
      console.error('Lỗi xóa command:', err);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/bot/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (err) {
      console.error('Lỗi xóa logs:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1017] text-zinc-100 flex flex-col font-sans selection:bg-[#5865F2] selection:text-white">
      {/* Top Header */}
      <Header
        status={status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartBot={handleStartBot}
        onStopBot={handleStopBot}
        isStarting={isStarting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            status={status}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onSaveConfig={handleSaveConfig}
            onStartBot={handleStartBot}
            onStopBot={handleStopBot}
            onTestToken={handleTestToken}
            isStarting={isStarting}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'voice-music' && (
          <VoiceMusicTab
            status={status}
            onPlayTrack={handlePlayTrack}
            onMusicControl={handleMusicControl}
            onToggle247={handleToggle247}
          />
        )}

        {activeTab === 'moderation' && (
          <ModerationTab status={status} />
        )}

        {activeTab === 'custom-commands' && (
          <CustomCommandsTab
            commands={customCommands}
            onSaveCommand={handleSaveCommand}
            onDeleteCommand={handleDeleteCommand}
          />
        )}

        {activeTab === 'deploy-export' && (
          <DeployExportTab config={config} />
        )}

        {activeTab === 'logs' && (
          <LogsTab logs={logs} onClearLogs={handleClearLogs} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2130] bg-[#12131d] py-4 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <p>Discord 24/7 Voice & YouTube Music Hub • Sẵn sàng chạy trên VPS / Render / Docker</p>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Discord.js v14</span>
            <span>•</span>
            <span>play-dl YouTube Engine</span>
            <span>•</span>
            <span>Express Keep-alive</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
