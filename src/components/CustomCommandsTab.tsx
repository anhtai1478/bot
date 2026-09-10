import React, { useState } from 'react';
import { CustomCommand } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Terminal, 
  Sparkles, 
  Check, 
  Copy, 
  Code, 
  CheckCircle2, 
  X
} from 'lucide-react';

interface CustomCommandsTabProps {
  commands: CustomCommand[];
  onSaveCommand: (command: Partial<CustomCommand>) => Promise<void>;
  onDeleteCommand: (id: string) => Promise<void>;
}

export const CustomCommandsTab: React.FC<CustomCommandsTabProps> = ({
  commands,
  onSaveCommand,
  onDeleteCommand
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CustomCommand>>({
    name: '',
    type: 'prefix',
    description: '',
    responseType: 'text',
    responseText: '',
    embedData: {
      title: '',
      description: '',
      color: '#5865F2',
      footer: ''
    },
    cooldownSeconds: 3,
    enabled: true
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditForm({
      name: '',
      type: 'prefix',
      description: 'Lệnh tùy chỉnh mới',
      responseType: 'embed',
      responseText: '',
      embedData: {
        title: '🌟 TIÊU ĐỀ THÔNG BÁO',
        description: 'Nội dung chi tiết thông báo gửi đến các thành viên...',
        color: '#5865F2',
        footer: 'Server Discord • 24/7'
      },
      cooldownSeconds: 5,
      enabled: true
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (cmd: CustomCommand) => {
    setEditForm({
      ...cmd,
      embedData: cmd.embedData || {
        title: '',
        description: '',
        color: '#5865F2',
        footer: ''
      }
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name) return;
    await onSaveCommand(editForm);
    setIsEditing(false);
  };

  const handleCopyCommand = (name: string, id: string) => {
    navigator.clipboard.writeText(`!${name}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#181926] border border-[#27293b] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Quản Lý Lệnh Tùy Chỉnh (Custom Commands)</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tạo phản hồi tự động, thông báo nội quy, liên kết mạng xã hội hoặc trả lời câu hỏi thường gặp dạng Discord Embed.
            </p>
          </div>
        </div>

        <button
          id="btn-add-custom-command"
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-lg text-xs font-semibold shadow-md shadow-[#5865F2]/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo Lệnh Mới
        </button>
      </div>

      {/* Editor Modal / Drawer */}
      {isEditing && (
        <div className="p-6 rounded-xl bg-[#161723] border border-[#2d3044] shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#242637] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5865F2]" />
              <h4 className="text-sm font-bold text-white">
                {editForm.id ? `Chỉnh Sửa Lệnh: !${editForm.name}` : 'Tạo Lệnh Chat Mới'}
              </h4>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Tên Lệnh (không cần gõ dấu !) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value.replace(/^[!/]/, '') })}
                  placeholder="ví dụ: rules, socials, ip"
                  className="w-full bg-[#10111a] border border-[#2c2f44] focus:border-[#5865F2] rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Kiểu Phản Hồi</label>
                <select
                  value={editForm.responseType}
                  onChange={(e) => setEditForm({ ...editForm, responseType: e.target.value as any })}
                  className="w-full bg-[#10111a] border border-[#2c2f44] focus:border-[#5865F2] rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="embed">Bảng Discord Rich Embed (Đẹp mắt)</option>
                  <option value="text">Văn Bản Thuần (Plain Text)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Thời Gian Chờ Cooldown (giây)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={editForm.cooldownSeconds || 3}
                  onChange={(e) => setEditForm({ ...editForm, cooldownSeconds: parseInt(e.target.value) || 3 })}
                  className="w-full bg-[#10111a] border border-[#2c2f44] focus:border-[#5865F2] rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Mô Tả Lệnh</label>
              <input
                type="text"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Hiển thị nội quy hoặc liên kết máy chủ..."
                className="w-full bg-[#10111a] border border-[#2c2f44] focus:border-[#5865F2] rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            {/* Plain Text Response */}
            {editForm.responseType === 'text' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nội Dung Tin Nhắn Phản Hồi</label>
                <textarea
                  rows={3}
                  value={editForm.responseText || ''}
                  onChange={(e) => setEditForm({ ...editForm, responseText: e.target.value })}
                  placeholder="Nhập nội dung bot sẽ gửi lại khi người dùng gõ lệnh này..."
                  className="w-full bg-[#10111a] border border-[#2c2f44] focus:border-[#5865F2] rounded-lg p-3 text-xs text-white outline-none"
                />
              </div>
            )}

            {/* Embed Response Fields */}
            {editForm.responseType === 'embed' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 rounded-xl bg-[#12131d] border border-[#242637]">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-300 block">Thiết Kế Embed:</span>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Tiêu Đề Embed</label>
                    <input
                      type="text"
                      value={editForm.embedData?.title || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        embedData: { ...editForm.embedData!, title: e.target.value }
                      })}
                      placeholder="📜 NỘI QUY SERVER"
                      className="w-full bg-[#0d0e17] border border-[#26283b] rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Màu Sắc Viền (Color Hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editForm.embedData?.color || '#5865F2'}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          embedData: { ...editForm.embedData!, color: e.target.value }
                        })}
                        className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={editForm.embedData?.color || '#5865F2'}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          embedData: { ...editForm.embedData!, color: e.target.value }
                        })}
                        className="w-28 bg-[#0d0e17] border border-[#26283b] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nội Dung Chi Tiết (Description)</label>
                    <textarea
                      rows={4}
                      value={editForm.embedData?.description || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        embedData: { ...editForm.embedData!, description: e.target.value }
                      })}
                      placeholder="1. Tôn trọng mọi người&#10;2. Không spam tin nhắn..."
                      className="w-full bg-[#0d0e17] border border-[#26283b] rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Chân Trang (Footer)</label>
                    <input
                      type="text"
                      value={editForm.embedData?.footer || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        embedData: { ...editForm.embedData!, footer: e.target.value }
                      })}
                      placeholder="Ban Quản Trị • 24/7"
                      className="w-full bg-[#0d0e17] border border-[#26283b] rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Discord Live Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300 block">Xem Trước Trên Discord:</span>
                  <div className="bg-[#2b2d31] p-4 rounded-lg border border-[#1e1f22] text-xs font-sans space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs">
                        BOT
                      </div>
                      <div>
                        <span className="font-semibold text-white">Discord 24/7 Bot</span>
                        <span className="ml-1.5 px-1 py-0.2 rounded bg-[#5865F2] text-[10px] text-white uppercase font-semibold">BOT</span>
                        <span className="ml-2 text-[10px] text-zinc-400">Hôm nay lúc 12:00</span>
                      </div>
                    </div>

                    {/* Embed Box */}
                    <div 
                      className="rounded p-3 bg-[#1e1f22] space-y-2"
                      style={{ borderLeft: `4px solid ${editForm.embedData?.color || '#5865F2'}` }}
                    >
                      {editForm.embedData?.title && (
                        <h5 className="font-bold text-white text-xs">{editForm.embedData.title}</h5>
                      )}
                      <p className="text-zinc-300 text-[11px] whitespace-pre-line leading-relaxed">
                        {editForm.embedData?.description || 'Nội dung tin nhắn...'}
                      </p>
                      {editForm.embedData?.footer && (
                        <p className="text-[10px] text-zinc-400 border-t border-zinc-700/50 pt-1.5">
                          {editForm.embedData.footer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242637]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-[#25283b] text-zinc-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
              >
                Lưu Lệnh
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Commands List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commands.map((cmd) => (
          <div
            key={cmd.id}
            className="bg-[#181926] border border-[#27293b] hover:border-[#383c54] rounded-xl p-5 shadow-md flex flex-col justify-between transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-indigo-400">
                    !{cmd.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#25283c] text-zinc-300 border border-[#373a54]">
                    {cmd.responseType === 'embed' ? 'Rich Embed' : 'Plain Text'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyCommand(cmd.name, cmd.id)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded cursor-pointer"
                    title="Copy cú pháp lệnh"
                  >
                    {copiedId === cmd.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cmd)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded cursor-pointer"
                    title="Chỉnh sửa lệnh"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCommand(cmd.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded cursor-pointer"
                    title="Xóa lệnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-400">{cmd.description}</p>

              {cmd.responseType === 'embed' && cmd.embedData && (
                <div 
                  className="p-2.5 rounded bg-[#12131d] text-[11px] space-y-1"
                  style={{ borderLeft: `3px solid ${cmd.embedData.color || '#5865F2'}` }}
                >
                  <strong className="text-white block">{cmd.embedData.title}</strong>
                  <p className="text-zinc-400 line-clamp-2">{cmd.embedData.description}</p>
                </div>
              )}

              {cmd.responseType === 'text' && (
                <p className="p-2 rounded bg-[#12131d] text-zinc-300 text-[11px] font-mono line-clamp-2">
                  {cmd.responseText}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#232535] flex items-center justify-between text-[11px] text-zinc-500">
              <span>Cooldown: {cmd.cooldownSeconds}s</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sẵn sàng hoạt động
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
