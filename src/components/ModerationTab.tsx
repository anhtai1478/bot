import React, { useState } from 'react';
import { BotStatus } from '../types';
import { 
  ShieldCheck, 
  UserX, 
  UserMinus, 
  Clock, 
  Trash2, 
  Info, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle,
  Lock
} from 'lucide-react';

interface ModerationTabProps {
  status: BotStatus;
}

export const ModerationTab: React.FC<ModerationTabProps> = ({ status }) => {
  const [testUser, setTestUser] = useState('@Member#1234');
  const [testReason, setTestReason] = useState('Vi phạm nội quy server');
  const [testMinutes, setTestMinutes] = useState('15');
  const [testClearCount, setTestClearCount] = useState('25');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Quản Trị Máy Chủ Server Hiệu Quả</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Hệ thống lệnh kiểm duyệt an toàn, trừng phạt vi phạm và dọn dẹp tin nhắn tức thì qua Discord.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Quyền Admin Đã Kích Hoạt
          </span>
        </div>
      </div>

      {/* Action Notification */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Moderation Command Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Command 1: Kick */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                !kick @user [lý do]
              </span>
              <UserMinus className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Đuổi Khỏi Server (Kick)</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Trục xuất thành viên khỏi máy chủ. Thành viên có thể tham gia lại bằng link mời hợp lệ.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#232535] space-y-2">
            <button
              onClick={() => triggerFeedback(`Đã thực thi mẫu: !kick ${testUser} ${testReason}`)}
              className="w-full py-2 bg-[#232638] hover:bg-[#2e324a] text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Chạy Thử Lệnh
            </button>
          </div>
        </div>

        {/* Command 2: Ban */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-rose-600/20 text-rose-300 font-mono font-bold text-xs">
                !ban @user [lý do]
              </span>
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cấm Vĩnh Viễn (Ban)</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Cấm thành viên vĩnh viễn không thể vào lại máy chủ cho đến khi được Admin gỡ cấm.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#232535] space-y-2">
            <button
              onClick={() => triggerFeedback(`Đã thực thi mẫu: !ban ${testUser} ${testReason}`)}
              className="w-full py-2 bg-[#232638] hover:bg-[#2e324a] text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Chạy Thử Lệnh
            </button>
          </div>
        </div>

        {/* Command 3: Timeout / Mute */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
                !timeout @user &lt;phút&gt;
              </span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Tạm Dừng / Cấm Chat (Timeout)</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Ngăn thành viên gửi tin nhắn, reaction hoặc nói chuyện trong voice trong khoảng thời gian chỉ định.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#232535] space-y-2">
            <button
              onClick={() => triggerFeedback(`Đã thực thi mẫu: !timeout ${testUser} ${testMinutes} phút`)}
              className="w-full py-2 bg-[#232638] hover:bg-[#2e324a] text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Chạy Thử Lệnh ({testMinutes}p)
            </button>
          </div>
        </div>

        {/* Command 4: Clear / Purge */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                !clear &lt;1-100&gt;
              </span>
              <Trash2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Xóa Tin Nhắn Rác (Purge)</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Dọn dẹp hàng loạt từ 1 đến 100 tin nhắn rác hoặc spam trong kênh chat chỉ bằng một lệnh duy nhất.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#232535] space-y-2">
            <button
              onClick={() => triggerFeedback(`Đã thực thi mẫu: !clear ${testClearCount} tin nhắn rác`)}
              className="w-full py-2 bg-[#232638] hover:bg-[#2e324a] text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Chạy Thử Xóa ({testClearCount} tin)
            </button>
          </div>
        </div>

        {/* Command 5: Server Info */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-mono font-bold text-xs">
                !serverinfo
              </span>
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Thông Tin Máy Chủ</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Hiển thị số lượng thành viên, chủ sở hữu, ngày tạo server và các kênh đang hoạt động dạng Embed.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#232535] space-y-2">
            <button
              onClick={() => triggerFeedback('Đã hiển thị thông tin máy chủ mẫu dạng Embed!')}
              className="w-full py-2 bg-[#232638] hover:bg-[#2e324a] text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Chạy Thử Lệnh
            </button>
          </div>
        </div>

        {/* Command 6: Ping & Latency */}
        <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-mono font-bold text-xs">
                !ping
              </span>
              <Wifi className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Độ Trễ & Trạng Thái Mạng</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Kiểm tra tốc độ phản hồi giữa bot và máy chủ Discord Gateway trong thời gian thực.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#232535] space-y-2">
            <button
              onClick={() => triggerFeedback(`🏓 Pong! Độ trễ hiện tại: ${status.ping}ms | Uptime: 24/7`)}
              className="w-full py-2 bg-[#232638] hover:bg-[#2e324a] text-zinc-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Chạy Thử Lệnh
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Guide */}
      <div className="bg-[#181926] border border-[#27293b] rounded-xl p-6">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#5865F2]" />
          Yêu Cầu Quyền Hạn (Bot Permissions) Khi Mời Vào Server
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#13141f] rounded-lg border border-[#232534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white">Kick Members</strong>
              <p className="text-[11px] text-zinc-400">Cho phép đuổi thành viên vi phạm</p>
            </div>
          </div>

          <div className="p-3 bg-[#13141f] rounded-lg border border-[#232534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white">Ban Members</strong>
              <p className="text-[11px] text-zinc-400">Cho phép cấm vĩnh viễn</p>
            </div>
          </div>

          <div className="p-3 bg-[#13141f] rounded-lg border border-[#232534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white">Moderate Members</strong>
              <p className="text-[11px] text-zinc-400">Cho phép timeout / cấm chat</p>
            </div>
          </div>

          <div className="p-3 bg-[#13141f] rounded-lg border border-[#232534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white">Manage Messages</strong>
              <p className="text-[11px] text-zinc-400">Xóa tin nhắn rác hàng loạt (!clear)</p>
            </div>
          </div>

          <div className="p-3 bg-[#13141f] rounded-lg border border-[#232534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white">Connect & Speak</strong>
              <p className="text-[11px] text-zinc-400">Vào phòng voice 24/7 và phát nhạc</p>
            </div>
          </div>

          <div className="p-3 bg-[#13141f] rounded-lg border border-[#232534] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white">Send Messages & Embeds</strong>
              <p className="text-[11px] text-zinc-400">Gửi bảng thông báo Embed đẹp mắt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
