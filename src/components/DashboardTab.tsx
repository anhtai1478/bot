import React, { useState } from 'react';
import { BotStatus, BotConfig } from '../types';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Play, 
  Square, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  Wifi, 
  Clock, 
  Users, 
  ExternalLink,
  HelpCircle,
  PlayCircle
} from 'lucide-react';

interface DashboardTabProps {
  status: BotStatus;
  config: BotConfig;
  onUpdateConfig: (newConfig: Partial<BotConfig>) => void;
  onSaveConfig: () => Promise<void>;
  onStartBot: () => Promise<void>;
  onStopBot: () => Promise<void>;
  onTestToken: () => Promise<void>;
  isStarting: boolean;
  onNavigateTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  status,
  config,
  onUpdateConfig,
  onSaveConfig,
  onStartBot,
  onStopBot,
  onTestToken,
  isStarting,
  onNavigateTab
}) => {
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveConfig();
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    await onTestToken();
    setIsTesting(false);
  };

  const formatUptime = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / System Summary */}
      <div className="bg-gradient-to-r from-[#1c1e2d] via-[#1a1b28] to-[#161722] border border-[#2b2e40] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Bảng Điều Khiển Discord Bot 24/7</h2>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                status.isRunning
                  ? status.isDemoMode
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50'
              }`}>
                {status.isRunning 
                  ? (status.isDemoMode ? 'Chế độ Thử Nghiệm (Demo Mode)' : 'Online 24/7 (Đã gắn kết)') 
                  : 'Bot Đang Tắt'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Bot được thiết kế để duy trì kết nối âm thanh liên tục không bao giờ out phòng thoại, 
              kết hợp tính năng phát nhạc từ link YouTube và hệ thống quản trị server bằng lệnh tiện lợi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {status.isRunning ? (
              <button
                id="btn-stop-bot-main"
                onClick={onStopBot}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Dừng Hoạt Động
              </button>
            ) : (
              <button
                id="btn-start-bot-main"
                onClick={onStartBot}
                disabled={isStarting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-xs font-semibold shadow-lg shadow-[#5865F2]/30 transition cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                {isStarting ? 'Đang kết nối...' : 'Khởi Động Bot 24/7'}
              </button>
            )}

            <button
              id="btn-go-to-deploy"
              onClick={() => onNavigateTab('deploy-export')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#252838] hover:bg-[#2e3146] text-zinc-200 border border-[#383c52] rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              Tải Mã Nguồn Cho VPS
            </button>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Connection Status */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Trạng Thái Kết Nối</span>
            <span className={`w-2.5 h-2.5 rounded-full ${
              status.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
            }`} />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-white block">
              {status.isRunning ? 'Online 24/7' : 'Offline'}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">
              {status.user ? status.user.tag : 'Chưa kết nối tài khoản Bot'}
            </span>
          </div>
        </div>

        {/* Metric 2: Uptime */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Thời Gian Treo 24/7</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-white font-mono block">
              {formatUptime(status.uptime)}
            </span>
            <span className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" /> Tự kết nối lại khi rớt mạng
            </span>
          </div>
        </div>

        {/* Metric 3: Ping Latency */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Độ Trễ WebSocket</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-white font-mono block">
              {status.ping} <span className="text-xs text-zinc-400 font-normal">ms</span>
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">
              Kết nối trực tiếp tới Discord Gateway
            </span>
          </div>
        </div>

        {/* Metric 4: Servers & Members */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Server Đang Phục Vụ</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-white block">
              {status.guildsCount} <span className="text-xs text-zinc-400 font-normal">máy chủ</span>
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">
              {status.membersCount} thành viên trong server
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Bot Token Setup & Active Voice State */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Token & Settings Form */}
        <div className="lg:col-span-2 bg-[#181926] border border-[#27293b] rounded-xl p-6 shadow-md space-y-5">
          <div className="border-b border-[#242637] pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#5865F2]" />
                <h3 className="text-base font-semibold text-white">Cấu Hình Discord Bot Token</h3>
              </div>
              <a 
                href="https://discord.com/developers/applications" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-[#5865F2] hover:underline flex items-center gap-1"
              >
                Lấy Token trên Discord Portal
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Nhập mã Token của Bot để khởi chạy bot trực tiếp từ giao diện web hoặc để xuất ra file .env cho VPS/Server.
            </p>
          </div>

          <div className="space-y-4">
            {/* Input Token */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Discord Bot Token <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-bot-token"
                  type={showToken ? 'text' : 'password'}
                  value={config.token}
                  onChange={(e) => onUpdateConfig({ token: e.target.value })}
                  placeholder="MTAyODk2... (Dán token bot của bạn vào đây)"
                  className="w-full bg-[#12131d] border border-[#2e3146] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono tracking-wide pr-24 outline-none transition"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer transition"
                    title={showToken ? 'Ẩn Token' : 'Hiện Token'}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={!config.token || isTesting}
                    className="px-2 py-1 bg-[#25283b] hover:bg-[#32364e] text-[11px] font-medium text-zinc-200 border border-[#3b3f5c] rounded cursor-pointer disabled:opacity-40 transition"
                  >
                    {isTesting ? 'Đang test...' : 'Kiểm tra'}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-zinc-400" />
                Nếu chưa có token thật, bạn vẫn có thể ấn <strong>Khởi Động Bot</strong> để chạy thử nghiệm chế độ Giả lập (Demo Mode)!
              </p>
            </div>

            {/* Prefix & Default Voice ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Tiền Tố Lệnh (Command Prefix)
                </label>
                <input
                  id="input-bot-prefix"
                  type="text"
                  value={config.prefix}
                  onChange={(e) => onUpdateConfig({ prefix: e.target.value })}
                  placeholder="!"
                  className="w-full bg-[#12131d] border border-[#2e3146] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono outline-none"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Ví dụ: !247, !play, !kick</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  ID Phòng Voice 24/7 Mặc Định (Tùy chọn)
                </label>
                <input
                  id="input-voice-channel-id"
                  type="text"
                  value={config.voiceChannelId}
                  onChange={(e) => onUpdateConfig({ voiceChannelId: e.target.value })}
                  placeholder="Ví dụ: 102938475618293041"
                  className="w-full bg-[#12131d] border border-[#2e3146] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono outline-none"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Tự động join phòng này khi khởi động</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#242637]">
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu cấu hình thành công!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="btn-save-config"
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#292c3f] hover:bg-[#34384f] text-zinc-100 border border-[#3e435e] rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
                </button>

                {!status.isRunning && (
                  <button
                    id="btn-start-demo-mode"
                    type="button"
                    onClick={onStartBot}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Chạy Demo Trực Tiếp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: 24/7 Voice & YouTube Quick Card */}
        <div className="space-y-4">
          {/* 24/7 Voice Channel Card */}
          <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#242637]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Chế Độ Treo Voice 24/7</h4>
                  <p className="text-[11px] text-zinc-400">Không bao giờ out phòng thoại</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-[#12131d] border border-[#26283b] space-y-1">
                <span className="text-[11px] text-zinc-400">Phòng thoại đang treo:</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">
                    🔊 {status.currentVoiceChannel ? status.currentVoiceChannel.name : 'Phòng Âm Nhạc 24/7 #1'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Sẵn sàng</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  ⚡ Cơ chế: Luôn giữ kết nối âm thanh ngay cả khi có 0 thành viên trong phòng.
                </p>
              </div>

              {/* YouTube Now Playing Quick Card */}
              <div className="p-3 rounded-lg bg-gradient-to-br from-[#1b1c2b] to-[#141522] border border-[#2d3044] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5" /> Nhạc YouTube Đang Phát
                  </span>
                  <button
                    onClick={() => onNavigateTab('voice-music')}
                    className="text-[10px] text-[#5865F2] hover:underline"
                  >
                    Xem Chi Tiết
                  </button>
                </div>

                {status.music.currentTrack ? (
                  <div className="flex items-center gap-2.5">
                    {status.music.currentTrack.thumbnail && (
                      <img 
                        src={status.music.currentTrack.thumbnail} 
                        alt="Thumbnail" 
                        className="w-10 h-10 rounded object-cover border border-zinc-700" 
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {status.music.currentTrack.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {status.music.currentTrack.duration} • Âm lượng: {status.music.volume}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-400 italic">
                    Chưa phát bài hát nào. Hãy mở tab <strong>24/7 Voice & Nhạc</strong> để dán link YouTube!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Discord Command Cheat-sheet */}
          <div className="bg-[#181926] border border-[#27293b] rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-semibold text-zinc-200">Lệnh Discord Nhanh:</h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-1.5 bg-[#12131d] rounded border border-[#26283b] flex items-center justify-between">
                <span className="text-indigo-300">!247</span>
                <span className="text-zinc-400">Khóa phòng thoại 24/7</span>
              </div>
              <div className="p-1.5 bg-[#12131d] rounded border border-[#26283b] flex items-center justify-between">
                <span className="text-rose-400">!play &lt;link YouTube&gt;</span>
                <span className="text-zinc-400">Phát nhạc YouTube</span>
              </div>
              <div className="p-1.5 bg-[#12131d] rounded border border-[#26283b] flex items-center justify-between">
                <span className="text-emerald-400">!skip / !pause / !resume</span>
                <span className="text-zinc-400">Điều khiển nhạc</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Quick Start Guide */}
      <div className="bg-[#181926] border border-[#27293b] rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-4">
          Hướng Dẫn 4 Bước Thiết Lập Bot Discord Hoàn Hảo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#141520] border border-[#232535] space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h4 className="text-xs font-semibold text-white">Tạo Bot Trên Discord</h4>
            <p className="text-[11px] text-zinc-400">
              Truy cập Discord Developer Portal, tạo New Application, vào mục Bot và Copy Token.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#141520] border border-[#232535] space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h4 className="text-xs font-semibold text-white">Bật 3 Quyền Intents</h4>
            <p className="text-[11px] text-zinc-400">
              Bắt buộc bật <strong>Message Content Intent</strong> để bot đọc được lệnh chat !play và !247.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#141520] border border-[#232535] space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#5865F2] text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h4 className="text-xs font-semibold text-white">Mời Bot Vào Server</h4>
            <p className="text-[11px] text-zinc-400">
              Vào OAuth2 URL Generator, chọn scope <code>bot</code> với quyền Administrator hoặc Voice.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#141520] border border-[#232535] space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              4
            </div>
            <h4 className="text-xs font-semibold text-white">Treo 24/7 & Phát Nhạc</h4>
            <p className="text-[11px] text-zinc-400">
              Vào phòng thoại gõ <code>!247</code> rồi <code>!play &lt;link YouTube&gt;</code> để thưởng thức!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
