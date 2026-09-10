import React from 'react';
import { BotStatus } from '../types';
import { Bot, Radio, Wifi, Clock, Play, Square, ExternalLink, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  status: BotStatus;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onStartBot: () => void;
  onStopBot: () => void;
  isStarting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeTab,
  setActiveTab,
  onStartBot,
  onStopBot,
  isStarting
}) => {
  const formatUptime = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: Bot },
    { id: 'voice-music', label: '24/7 Voice & Nhạc', icon: Radio },
    { id: 'moderation', label: 'Quản Trị Server', icon: ShieldCheck },
    { id: 'custom-commands', label: 'Lệnh Tùy Chỉnh', icon: ExternalLink },
    { id: 'deploy-export', label: 'Mã Nguồn & Deploy VPS', icon: ExternalLink },
    { id: 'logs', label: 'Console Logs', icon: Clock }
  ];

  return (
    <header className="border-b border-[#2e303e] bg-[#161720]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & controls bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/25">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Discord 24/7 Hub</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  status.isRunning
                    ? status.isDemoMode
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-700/40 text-zinc-400 border border-zinc-700/50'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    status.isRunning 
                      ? status.isDemoMode 
                        ? 'bg-amber-400 animate-pulse' 
                        : 'bg-emerald-400 animate-pulse' 
                      : 'bg-zinc-500'
                  }`} />
                  {status.isRunning ? (status.isDemoMode ? 'Chế độ Thử nghiệm (Demo)' : 'Đang Online 24/7') : 'Đã ngắt kết nối'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Bot Treo Voice 24/7 • Phát Nhạc Không Ngắt • Quản Trị Server & Lệnh Tùy Chỉnh
              </p>
            </div>
          </div>

          {/* Quick Metrics and Actions */}
          <div className="flex items-center gap-4">
            {status.isRunning && (
              <div className="hidden md:flex items-center gap-4 bg-[#1e202e] border border-[#2e303e] px-3.5 py-1.5 rounded-lg text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ping: <strong className="text-white font-mono">{status.ping}ms</strong></span>
                </div>
                <div className="w-px h-3.5 bg-zinc-700" />
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Uptime: <strong className="text-white font-mono">{formatUptime(status.uptime)}</strong></span>
                </div>
                {status.currentVoiceChannel && (
                  <>
                    <div className="w-px h-3.5 bg-zinc-700" />
                    <div className="flex items-center gap-1.5 text-indigo-300">
                      <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span className="truncate max-w-[150px]">24/7: {status.currentVoiceChannel.name}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {status.isRunning ? (
              <button
                id="btn-stop-bot-header"
                onClick={onStopBot}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Dừng Bot
              </button>
            ) : (
              <button
                id="btn-start-bot-header"
                onClick={onStartBot}
                disabled={isStarting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-xs font-semibold shadow-md shadow-[#5865F2]/30 transition cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isStarting ? 'Đang kết nối...' : 'Khởi Động Bot'}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-[#232533]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#282a3a] text-white border border-[#3e4256] shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1c1e2a]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#5865F2]' : 'text-zinc-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
