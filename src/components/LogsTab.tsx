import React, { useState, useEffect, useRef } from 'react';
import { BotLog } from '../types';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  Filter, 
  Clock, 
  ArrowDownCircle 
} from 'lucide-react';

interface LogsTabProps {
  logs: BotLog[];
  onClearLogs: () => Promise<void>;
}

export const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs }) => {
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    return true;
  });

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.category.toUpperCase()}] [${l.level.toUpperCase()}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400 font-semibold';
      case 'warn':
        return 'text-amber-400 font-semibold';
      case 'error':
        return 'text-rose-400 font-bold';
      case 'cmd':
        return 'text-purple-400 font-semibold';
      default:
        return 'text-cyan-400';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'voice':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'music':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'moderation':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'gateway':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-zinc-700/30 text-zinc-300 border-zinc-700/40';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Control Bar */}
      <div className="bg-[#181926] border border-[#27293b] rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#5865F2]" />
          <div>
            <h3 className="text-sm font-bold text-white">Console Logs Trực Tiếp</h3>
            <p className="text-[11px] text-zinc-400">Theo dõi hoạt động 24/7, lệnh nhạc YouTube và trạng thái kết nối</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-[#12131d] border border-[#2e3146] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none cursor-pointer"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="cmd">Lệnh Chat (Cmd)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#12131d] border border-[#2e3146] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none cursor-pointer"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="voice">Treo Voice 24/7</option>
            <option value="music">Nhạc & YouTube</option>
            <option value="moderation">Quản Trị Server</option>
            <option value="gateway">Discord Gateway</option>
            <option value="system">Hệ Thống</option>
          </select>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
              autoScroll 
                ? 'bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/30' 
                : 'bg-[#12131d] text-zinc-400 border-[#2e3146]'
            }`}
          >
            Tự cuộn: {autoScroll ? 'Bật' : 'Tắt'}
          </button>

          <button
            onClick={handleCopyLogs}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25283b] hover:bg-[#32364e] text-zinc-200 border border-[#3c415c] rounded-lg text-xs font-medium cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            Sao chép
          </button>

          <button
            onClick={onClearLogs}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa Logs
          </button>
        </div>
      </div>

      {/* Terminal Display */}
      <div className="rounded-xl bg-[#0d0e16] border border-[#242637] p-4 font-mono text-xs shadow-2xl h-[520px] overflow-y-auto space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 italic">
            Chưa có log ghi nhận nào khớp với bộ lọc.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed hover:bg-white/[0.02] p-0.5 rounded">
              <span className="text-zinc-500 shrink-0 select-none">
                [{log.timestamp}]
              </span>
              <span className={`px-1.5 py-0.2 rounded border text-[10px] uppercase font-bold shrink-0 ${getCategoryBadge(log.category)}`}>
                {log.category}
              </span>
              <span className={`uppercase font-bold shrink-0 ${getLevelColor(log.level)}`}>
                [{log.level}]
              </span>
              <span className="text-zinc-200 whitespace-pre-wrap break-all flex-1">
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
