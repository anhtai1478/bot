import React, { useState } from 'react';
import { BotStatus, MusicTrack, RadioStreamPreset } from '../types';
import { RADIO_PRESETS } from '../data/presets';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Square, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Plus, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Search,
  ListMusic,
  ShieldCheck,
  Disc3
} from 'lucide-react';

interface VoiceMusicTabProps {
  status: BotStatus;
  onPlayTrack: (trackData: { presetId?: string; customUrl?: string; customTitle?: string; trackData?: any; queueOnly?: boolean }) => Promise<void>;
  onMusicControl: (action: string, extra?: { volume?: number; loopMode?: string; queueIndex?: number }) => Promise<void>;
  onToggle247: (stay247: boolean, channelName?: string) => Promise<void>;
}

export const VoiceMusicTab: React.FC<VoiceMusicTabProps> = ({
  status,
  onPlayTrack,
  onMusicControl,
  onToggle247
}) => {
  const [youtubeInput, setYoutubeInput] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedPreview, setResolvedPreview] = useState<MusicTrack | null>(null);
  const [voiceChannelName, setVoiceChannelName] = useState('Phòng Âm Nhạc 24/7');
  const [isUpdatingVoice, setIsUpdatingVoice] = useState(false);

  const { music } = status;

  // Resolve YouTube URL or Search term via server API
  const handleResolveYouTube = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = youtubeInput.trim();
    if (!query) return;

    setIsResolving(true);
    try {
      const res = await fetch('/api/bot/youtube-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: query, query })
      });
      const data = await res.json();
      if (data.success && data.track) {
        setResolvedPreview(data.track);
      }
    } catch (err) {
      console.error('Lỗi phân tích link YouTube:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const handlePlayResolved = async (queueOnly: boolean = false) => {
    if (!resolvedPreview) {
      if (youtubeInput.trim()) {
        await onPlayTrack({ customUrl: youtubeInput.trim(), customTitle: youtubeInput.trim(), queueOnly });
        setYoutubeInput('');
      }
      return;
    }

    await onPlayTrack({ trackData: resolvedPreview, queueOnly });
    setResolvedPreview(null);
    setYoutubeInput('');
  };

  const handleQuickPlayPreset = async (preset: RadioStreamPreset, queueOnly: boolean = false) => {
    await onPlayTrack({ presetId: preset.id, queueOnly });
  };

  const handleVoiceToggle = async () => {
    setIsUpdatingVoice(true);
    const newStay = !(status.currentVoiceChannel?.stay247Active);
    await onToggle247(newStay, voiceChannelName);
    setIsUpdatingVoice(false);
  };

  const nextLoopMode = () => {
    const modes: Array<'off' | 'track' | 'queue'> = ['off', 'track', 'queue'];
    const currentIdx = modes.indexOf(music.loopMode || 'off');
    const next = modes[(currentIdx + 1) % modes.length];
    onMusicControl('loop', { loopMode: next });
  };

  return (
    <div className="space-y-6">
      {/* 24/7 Voice Channel Connection Banner */}
      <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Chế Độ Treo Voice 24/7 (Phòng Trống Vẫn Online)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {status.currentVoiceChannel?.stay247Active ? 'ĐANG BẬT 24/7' : 'TẠM TẮT'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Bot duy trì phiên âm thanh liên tục không bao giờ ngắt kết nối kể cả khi trong phòng có 0 thành viên.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              id="input-voice-channel-name"
              type="text"
              value={voiceChannelName}
              onChange={(e) => setVoiceChannelName(e.target.value)}
              placeholder="Tên kênh voice (ví dụ: Voice 24/7)"
              className="bg-[#12131d] border border-[#2e3146] focus:border-[#5865F2] rounded-lg px-3 py-1.5 text-xs text-white outline-none w-full md:w-48"
            />
            <button
              id="btn-toggle-247-voice"
              onClick={handleVoiceToggle}
              disabled={isUpdatingVoice}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                status.currentVoiceChannel?.stay247Active
                  ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              {status.currentVoiceChannel?.stay247Active ? 'Tắt Chế Độ 24/7' : 'Bật Treo Voice 24/7'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: ADD YOUTUBE MUSIC */}
      <div className="bg-[#181926] border border-[#27293b] rounded-xl p-6 shadow-md space-y-4">
        <div className="border-b border-[#242637] pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Disc3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Thêm Link Nhạc Từ YouTube</h3>
                <p className="text-xs text-zinc-400">
                  Hỗ trợ link video YouTube, livestream 24/7, YouTube Shorts, YouTube Music hoặc tìm kiếm bài hát theo tên
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-1 bg-[#12131d] rounded border border-[#2b2e42] text-zinc-400">
              Lệnh chat: !play &lt;link&gt;
            </span>
          </div>
        </div>

        {/* Search / Input Bar */}
        <form onSubmit={handleResolveYouTube} className="space-y-3">
          <div className="relative">
            <input
              id="input-youtube-url"
              type="text"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              placeholder="Dán link YouTube (ví dụ: https://www.youtube.com/watch?v=... hoặc gõ tên bài hát)"
              className="w-full bg-[#12131d] border border-[#2e3146] focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl pl-4 pr-32 py-3 text-xs text-white placeholder-zinc-500 outline-none transition"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="submit"
                id="btn-check-youtube-url"
                disabled={isResolving || !youtubeInput.trim()}
                className="px-3 py-1.5 bg-[#26283b] hover:bg-[#32354e] text-zinc-200 border border-[#3b3f5b] rounded-lg text-xs font-medium cursor-pointer transition disabled:opacity-40 flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                {isResolving ? 'Đang tải...' : 'Kiểm tra'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-play-youtube-now"
                onClick={() => handlePlayResolved(false)}
                disabled={!youtubeInput.trim() && !resolvedPreview}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Phát Ngay Lập Tức
              </button>

              <button
                type="button"
                id="btn-queue-youtube"
                onClick={() => handlePlayResolved(true)}
                disabled={!youtubeInput.trim() && !resolvedPreview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25283b] hover:bg-[#32364e] text-zinc-100 border border-[#3d425c] rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm Vào Danh Sách Chờ (Queue)
              </button>
            </div>

            <span className="text-[11px] text-zinc-400">
              💡 Bạn có thể dán link video thường, link playlist hoặc luồng live 24/7.
            </span>
          </div>
        </form>

        {/* Resolved YouTube Preview Card */}
        {resolvedPreview && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#1c1d2c] to-[#161723] border border-[#2e3146] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {resolvedPreview.thumbnail && (
                <img 
                  src={resolvedPreview.thumbnail} 
                  alt="YouTube Preview" 
                  className="w-20 h-14 object-cover rounded-lg border border-zinc-700 shadow-md shrink-0" 
                />
              )}
              <div>
                <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                  ĐÃ XÁC NHẬN LINK YOUTUBE
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-1">{resolvedPreview.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kênh: <strong className="text-zinc-300">{resolvedPreview.author || 'YouTube'}</strong> • {resolvedPreview.duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handlePlayResolved(false)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Phát Bài Này
              </button>
              <button
                onClick={() => handlePlayResolved(true)}
                className="px-3 py-1.5 bg-[#292c3f] hover:bg-[#353952] text-zinc-200 border border-[#3d425a] rounded-lg text-xs transition cursor-pointer"
              >
                + Queue
              </button>
            </div>
          </div>
        )}

        {/* Quick YouTube & Radio Presets Chips */}
        <div className="pt-2">
          <span className="text-xs font-medium text-zinc-400 block mb-2">
            Gợi Ý Luồng YouTube Live & Nhạc 24/7 Phổ Biến:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RADIO_PRESETS.map((preset) => (
              <div 
                key={preset.id}
                className="p-3 rounded-lg bg-[#141520] border border-[#232535] hover:border-[#383c54] transition flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={preset.coverImage} 
                    alt={preset.name} 
                    className="w-10 h-10 rounded-md object-cover border border-zinc-700 shrink-0" 
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{preset.name}</p>
                    <span className="text-[10px] text-zinc-400 truncate block">{preset.genre}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleQuickPlayPreset(preset, false)}
                    title="Phát ngay"
                    className="p-1.5 bg-red-600/20 text-red-300 hover:bg-red-600/40 rounded cursor-pointer transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleQuickPlayPreset(preset, true)}
                    title="Thêm vào hàng đợi"
                    className="p-1.5 bg-[#25283b] text-zinc-300 hover:bg-[#32364e] rounded cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: ACTIVE PLAYER & CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Player Interface */}
        <div className="lg:col-span-2 bg-[#181926] border border-[#27293b] rounded-xl p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#242637] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Disc3 className={`w-5 h-5 text-[#5865F2] ${music.isPlaying && !music.isPaused ? 'animate-spin' : ''}`} />
              Trình Phát Âm Nhạc 24/7
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              music.isPlaying && !music.isPaused
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : music.isPaused
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/40'
            }`}>
              {music.isPlaying && !music.isPaused ? 'Đang Phát' : music.isPaused ? 'Tạm Dừng' : 'Đang Chờ'}
            </span>
          </div>

          {/* Now Playing Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#141522] to-[#191b29] border border-[#292c3f] flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-zinc-700 shrink-0 bg-black/40 flex items-center justify-center">
              {music.currentTrack?.thumbnail ? (
                <img 
                  src={music.currentTrack.thumbnail} 
                  alt={music.currentTrack.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Radio className="w-10 h-10 text-zinc-600" />
              )}
              {music.isPlaying && !music.isPaused && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center gap-1">
                  <span className="w-1 h-5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1 h-8 bg-emerald-400 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-150" />
                  <span className="w-1 h-7 bg-emerald-400 rounded-full animate-pulse delay-100" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-[#5865F2] tracking-wider">
                {music.currentTrack?.isLiveRadio ? 'LIVE STREAM 24/7' : 'BÀI HÁT HIỆN TẠI'}
              </span>
              <h4 className="text-base font-bold text-white truncate">
                {music.currentTrack ? music.currentTrack.title : 'Chưa chọn bài hát nào'}
              </h4>
              <p className="text-xs text-zinc-400">
                {music.currentTrack ? (
                  <span>
                    Kênh: <strong className="text-zinc-300">{music.currentTrack.author || 'YouTube'}</strong> • Thời lượng: {music.currentTrack.duration || '24/7'}
                  </span>
                ) : (
                  'Dán link YouTube ở trên hoặc chọn 1 luồng mẫu để nghe nhạc'
                )}
              </p>
              {music.currentTrack && (
                <p className="text-[11px] text-zinc-500">
                  Yêu cầu bởi: <span className="text-zinc-300">{music.currentTrack.requester}</span>
                </p>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              {/* Loop Mode */}
              <button
                id="btn-music-loop"
                onClick={nextLoopMode}
                className={`p-2.5 rounded-lg border transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                  music.loopMode !== 'off'
                    ? 'bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/40'
                    : 'bg-[#181926] text-zinc-400 border-[#2a2d3e] hover:text-zinc-200'
                }`}
                title={`Chế độ lặp: ${music.loopMode}`}
              >
                <Repeat className="w-4 h-4" />
                <span className="capitalize">{music.loopMode === 'track' ? 'Bài này' : music.loopMode === 'queue' ? 'Cả Queue' : 'Tắt Lặp'}</span>
              </button>

              {/* Play / Pause Toggle */}
              {music.isPlaying && !music.isPaused ? (
                <button
                  id="btn-music-pause"
                  onClick={() => onMusicControl('pause')}
                  className="w-12 h-12 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white flex items-center justify-center shadow-lg shadow-[#5865F2]/30 transition cursor-pointer"
                >
                  <Pause className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button
                  id="btn-music-resume"
                  onClick={() => onMusicControl('resume')}
                  className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              )}

              {/* Skip */}
              <button
                id="btn-music-skip"
                onClick={() => onMusicControl('skip')}
                className="p-2.5 rounded-lg bg-[#202231] hover:bg-[#2c2f42] text-zinc-200 border border-[#30344b] transition cursor-pointer"
                title="Bỏ qua bài này (!skip)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Stop */}
              <button
                id="btn-music-stop"
                onClick={() => onMusicControl('stop')}
                className="p-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                title="Dừng phát (!stop)"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 max-w-sm mx-auto bg-[#12131d] border border-[#27293a] px-4 py-2.5 rounded-xl">
              <button
                onClick={() => onMusicControl('volume', { volume: music.volume === 0 ? 80 : 0 })}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                {music.volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <input
                id="slider-music-volume"
                type="range"
                min="0"
                max="100"
                value={music.volume}
                onChange={(e) => onMusicControl('volume', { volume: parseInt(e.target.value) })}
                className="w-full accent-[#5865F2] cursor-pointer"
              />
              <span className="text-xs font-mono text-zinc-300 w-9 text-right">{music.volume}%</span>
            </div>
          </div>
        </div>

        {/* Right Col: Music Queue */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#242637] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-[#5865F2]" />
                <h4 className="text-sm font-bold text-white">Danh Sách Chờ ({music.queue.length})</h4>
              </div>

              {music.queue.length > 0 && (
                <button
                  id="btn-clear-queue"
                  onClick={() => onMusicControl('clear-queue')}
                  className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                >
                  Xóa hết
                </button>
              )}
            </div>

            {music.queue.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 space-y-2">
                <Disc3 className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">Hàng đợi phát nhạc hiện đang trống.</p>
                <p className="text-[11px]">Dán link YouTube và bấm <strong>+ Thêm vào Queue</strong> để tạo playlist.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {music.queue.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className="p-2.5 rounded-lg bg-[#141522] border border-[#232535] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-zinc-500 font-mono text-[10px] w-4">{idx + 1}.</span>
                      {track.thumbnail && (
                        <img src={track.thumbnail} alt="" className="w-8 h-8 rounded object-cover border border-zinc-700 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{track.title}</p>
                        <span className="text-[10px] text-zinc-400">{track.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onMusicControl('remove-queue', { queueIndex: idx })}
                      className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                      title="Xóa bài này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#242637] text-[11px] text-zinc-400">
            <span className="text-zinc-300 font-semibold block mb-1">Cú pháp chat Discord:</span>
            <code>!queue</code> xem hàng đợi • <code>!skip</code> qua bài • <code>!volume 80</code>
          </div>
        </div>
      </div>
    </div>
  );
};
