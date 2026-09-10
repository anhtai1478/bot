import React, { useState } from 'react';
import { BotConfig } from '../types';
import { 
  Download, 
  Server, 
  Cloud, 
  Laptop, 
  Container, 
  ExternalLink, 
  Check, 
  Copy, 
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal,
  FileCode
} from 'lucide-react';

interface DeployExportTabProps {
  config: BotConfig;
}

export const DeployExportTab: React.FC<DeployExportTabProps> = ({ config }) => {
  const [activeDeployGuide, setActiveDeployGuide] = useState<'vps' | 'cloud' | 'local' | 'docker' | 'token'>('vps');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const vpsCommands = `# 1. Cập nhật hệ thống & cài Node.js 20 (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs ffmpeg

# 2. Giải nén mã nguồn vừa tải về vào thư mục
mkdir -p /root/discord-bot && cd /root/discord-bot
# (Tải file zip hoặc clone code vào thư mục này)

# 3. Cài đặt các thư viện cần thiết (bao gồm play-dl cho YouTube)
npm install

# 4. Cài đặt PM2 để bot chạy nền 24/7 vĩnh viễn
npm install -g pm2

# 5. Khởi động bot với PM2
pm2 start pm2.config.cjs

# 6. Thiết lập tự động khởi động cùng VPS khi reboot
pm2 startup
pm2 save

# 7. Xem nhật ký log trực tiếp của bot
pm2 logs discord-247-bot`;

  const dockerCommands = `# Khởi chạy bot nền với Docker Compose
docker compose up -d --build

# Xem log bot chạy 24/7
docker compose logs -f

# Khởi động lại hoặc dừng bot
docker compose restart
docker compose down`;

  const localCommands = `# 1. Mở Terminal / Command Prompt tại thư mục bot
npm install

# 2. Khởi chạy bot
npm start`;

  return (
    <div className="space-y-6">
      {/* Download Source Code Banner */}
      <div className="bg-gradient-to-r from-[#1d1f2e] via-[#1a1c2a] to-[#161723] border border-[#2d3044] rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#5865F2]/20 text-[#5865F2]">
              <FileCode className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">Xuất Trọn Bộ Mã Nguồn Bot Độc Lập (.ZIP)</h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Tải về bộ mã nguồn Node.js hoàn chỉnh độc lập: đã tích hợp sẵn tính năng Treo Voice 24/7 không ngắt, 
            phát nhạc từ link YouTube (play-dl), quản lý server, cấu hình PM2, Docker và web server ping UptimeRobot.
          </p>
          {config.token && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Token của bạn đã được đóng gói sẵn vào file .env trong gói tải về!
            </p>
          )}
        </div>

        <a
          id="btn-download-bot-zip"
          href="/api/bot/export-zip"
          download="discord-247-bot-source.zip"
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#5865F2]/30 transition cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          Tải Bộ Mã Nguồn (.ZIP)
        </a>
      </div>

      {/* Guide Tabs */}
      <div className="bg-[#181926] border border-[#27293b] rounded-xl p-6 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-[#242637] pb-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDeployGuide('vps')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeDeployGuide === 'vps'
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#141520] text-zinc-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              1. Máy Chủ VPS Linux (PM2 24/7)
            </button>

            <button
              onClick={() => setActiveDeployGuide('cloud')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeDeployGuide === 'cloud'
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#141520] text-zinc-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              2. Đám Mây Miễn Phí (Render + UptimeRobot)
            </button>

            <button
              onClick={() => setActiveDeployGuide('local')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeDeployGuide === 'local'
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#141520] text-zinc-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              3. Máy Tính Cá Nhân (PC / Laptop)
            </button>

            <button
              onClick={() => setActiveDeployGuide('docker')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeDeployGuide === 'docker'
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#141520] text-zinc-400 hover:text-white'
              }`}
            >
              <Container className="w-3.5 h-3.5" />
              4. Docker & Compose
            </button>

            <button
              onClick={() => setActiveDeployGuide('token')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeDeployGuide === 'token'
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#141520] text-zinc-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              5. Hướng Dẫn Tạo Token & Intents
            </button>
          </div>
        </div>

        {/* GUIDE CONTENT 1: VPS LINUX */}
        {activeDeployGuide === 'vps' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Chạy 24/7 Vĩnh Viễn Trên VPS Linux Với PM2</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Áp dụng cho mọi nhà cung cấp VPS: DigitalOcean, Linode, AWS, Google Cloud, Vultr, VietPN, BKHost, v.v.
                </p>
              </div>
              <button
                onClick={() => handleCopy(vpsCommands, 'vps')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25283b] hover:bg-[#32364e] text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                {copiedSection === 'vps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Sao chép lệnh
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#0f1018] border border-[#232535] text-zinc-300 font-mono text-xs overflow-x-auto leading-relaxed">
              {vpsCommands}
            </pre>

            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <strong className="font-semibold block">⚡ Lợi thế khi dùng PM2:</strong>
              <p className="text-[11px] text-zinc-400">
                Nếu VPS bị restart hoặc bot gặp sự cố rớt mạng, PM2 sẽ tự động bật lại bot ngay lập tức, và bot sẽ tự động vào lại phòng voice 24/7 ban đầu!
              </p>
            </div>
          </div>
        )}

        {/* GUIDE CONTENT 2: CLOUD FREE (RENDER + UPTIMEROBOT) */}
        {activeDeployGuide === 'cloud' && (
          <div className="space-y-4 animate-fadeIn text-xs text-zinc-300">
            <div>
              <h4 className="text-sm font-bold text-white">Triển Khai Miễn Phí Trên Đám Mây (Render.com + UptimeRobot)</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Chạy 24/7 không tốn tiền thuê VPS bằng cách kết hợp Web Service miễn phí với UptimeRobot.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[#141520] border border-[#232534] space-y-2">
                <span className="font-bold text-white">Bước 1: Tải mã nguồn lên GitHub</span>
                <p className="text-zinc-400">
                  Tải file ZIP về, giải nén và đưa vào một kho lưu trữ GitHub của bạn (Public hoặc Private đều được).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#141520] border border-[#232534] space-y-2">
                <span className="font-bold text-white">Bước 2: Tạo Web Service trên Render.com</span>
                <p className="text-zinc-400">
                  Đăng ký tài khoản miễn phí tại <a href="https://render.com" target="_blank" rel="noreferrer" className="text-[#5865F2] underline">Render.com</a>, chọn <strong>New +</strong> -&gt; <strong>Web Service</strong> -&gt; Kết nối với repo GitHub vừa tạo.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                  <div className="p-2 bg-[#0c0d15] rounded border border-zinc-800">
                    <span className="text-zinc-500">Build Command:</span> <span className="text-emerald-400">npm install</span>
                  </div>
                  <div className="p-2 bg-[#0c0d15] rounded border border-zinc-800">
                    <span className="text-zinc-500">Start Command:</span> <span className="text-emerald-400">npm start</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#141520] border border-[#232534] space-y-2">
                <span className="font-bold text-white">Bước 3: Thêm Biến Môi Trường (Environment Variables)</span>
                <p className="text-zinc-400">
                  Vào tab <strong>Environment</strong> trên Render, thêm biến:
                </p>
                <div className="p-2 bg-[#0c0d15] rounded border border-zinc-800 font-mono text-[11px] text-zinc-300">
                  DISCORD_TOKEN = {config.token || 'chuỗi_token_bot_của_bạn'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-300">Bước 4: Treo 24/7 với UptimeRobot (Giữ bot không bao giờ ngủ)</span>
                <p className="text-zinc-300">
                  Render miễn phí sẽ ngủ đông nếu không có truy cập web sau 15 phút. Mã nguồn của bot đã tích hợp sẵn một Web server keep-alive tại cổng 3000!
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400">
                  <li>Vào <a href="https://uptimerobot.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">UptimeRobot.com</a> (miễn phí) -&gt; Bấm <strong>Add New Monitor</strong>.</li>
                  <li>Monitor Type: Chọn <strong>HTTP(s)</strong>.</li>
                  <li>URL: Nhập URL Render của bạn (ví dụ: <code>https://your-bot-name.onrender.com/ping</code>).</li>
                  <li>Monitoring Interval: Chọn <strong>5 minutes</strong>.</li>
                </ol>
                <p className="text-[11px] text-emerald-400 font-medium">
                  🎉 Xong! UptimeRobot sẽ tự động gửi tín hiệu mỗi 5 phút, giữ bot thức và online trong voice Discord 24/7 vĩnh viễn!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GUIDE CONTENT 3: LOCAL PC / LAPTOP */}
        {activeDeployGuide === 'local' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Chạy Trên Máy Tính Cá Nhân (Windows / Mac / Linux)</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Thích hợp cho việc thử nghiệm, phát triển thêm tính năng hoặc chạy khi bật máy.
                </p>
              </div>
              <button
                onClick={() => handleCopy(localCommands, 'local')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25283b] hover:bg-[#32364e] text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                {copiedSection === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Sao chép lệnh
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-3 text-xs text-zinc-300">
              <li className="p-3 bg-[#141520] rounded-lg border border-[#232534]">
                Cài đặt <strong>Node.js phiên bản 18 hoặc 20 LTS</strong> từ trang chủ <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-[#5865F2] underline">nodejs.org</a>.
              </li>
              <li className="p-3 bg-[#141520] rounded-lg border border-[#232534]">
                Giải nén file ZIP vừa tải về vào bất kỳ thư mục nào trên máy (ví dụ: <code>C:\discord-bot</code>).
              </li>
              <li className="p-3 bg-[#141520] rounded-lg border border-[#232534]">
                Mở file <code>.env</code> bằng Notepad hoặc VS Code, kiểm tra xem Token đã được điền chưa.
              </li>
              <li className="p-3 bg-[#141520] rounded-lg border border-[#232534]">
                Mở CMD / PowerShell hoặc Terminal trong thư mục đó và chạy 2 lệnh sau:
                <pre className="mt-2 p-3 bg-[#0c0d15] rounded border border-zinc-800 text-emerald-400 font-mono text-xs">
                  {localCommands}
                </pre>
              </li>
            </ol>
          </div>
        )}

        {/* GUIDE CONTENT 4: DOCKER */}
        {activeDeployGuide === 'docker' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Chạy Bằng Docker & Docker Compose</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Bộ mã nguồn đã bao gồm sẵn file <code>Dockerfile</code> và <code>docker-compose.yml</code> tối ưu.
                </p>
              </div>
              <button
                onClick={() => handleCopy(dockerCommands, 'docker')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25283b] hover:bg-[#32364e] text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                {copiedSection === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Sao chép lệnh
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#0f1018] border border-[#232535] text-zinc-300 font-mono text-xs overflow-x-auto leading-relaxed">
              {dockerCommands}
            </pre>
          </div>
        )}

        {/* GUIDE CONTENT 5: TOKEN & INTENTS */}
        {activeDeployGuide === 'token' && (
          <div className="space-y-4 animate-fadeIn text-xs text-zinc-300">
            <div>
              <h4 className="text-sm font-bold text-white">Hướng Dẫn Lấy Discord Bot Token & Bật Quyền Intents</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Các bước chuẩn chỉnh từ trang quản trị ứng dụng của Discord để bot hoạt động 100% không bị lỗi.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-[#141520] rounded-lg border border-[#232534] space-y-1">
                <strong className="text-white">1. Truy cập Discord Developer Portal</strong>
                <p className="text-zinc-400">
                  Mở trang <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-[#5865F2] underline">Discord Developer Portal</a> và đăng nhập tài khoản Discord của bạn.
                </p>
              </div>

              <div className="p-3.5 bg-[#141520] rounded-lg border border-[#232534] space-y-1">
                <strong className="text-white">2. Tạo Ứng Dụng (Application) Mới</strong>
                <p className="text-zinc-400">
                  Bấm nút <strong>New Application</strong> ở góc phải, đặt tên cho bot (ví dụ: <code>Music 24/7 Bot</code>) và đồng ý điều khoản.
                </p>
              </div>

              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg space-y-1.5">
                <strong className="text-rose-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 3. BẬT 3 QUYỀN INTENTS (CỰC KỲ QUAN TRỌNG)
                </strong>
                <p className="text-zinc-300">
                  Đi tới menu <strong>Bot</strong> ở thanh bên trái. Kéo xuống mục <strong>Privileged Gateway Intents</strong> và bật TẤT CẢ 3 công tắc:
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 font-mono">
                  <li>✅ Presence Intent</li>
                  <li>✅ Server Members Intent</li>
                  <li>✅ Message Content Intent (Bắt buộc để bot đọc được lệnh <code>!play</code>, <code>!247</code>)</li>
                </ul>
              </div>

              <div className="p-3.5 bg-[#141520] rounded-lg border border-[#232534] space-y-1">
                <strong className="text-white">4. Lấy Token</strong>
                <p className="text-zinc-400">
                  Vẫn ở tab <strong>Bot</strong>, bấm <strong>Reset Token</strong> -&gt; Bấm <strong>Copy</strong> để lưu mã Token.
                </p>
              </div>

              <div className="p-3.5 bg-[#141520] rounded-lg border border-[#232534] space-y-1">
                <strong className="text-white">5. Mời Bot Vào Server Discord Của Bạn</strong>
                <p className="text-zinc-400">
                  Vào tab <strong>OAuth2</strong> -&gt; <strong>URL Generator</strong>:
                  <br />- Scopes: Tích chọn <code>bot</code>, <code>applications.commands</code>.
                  <br />- Bot Permissions: Tích chọn <code>Administrator</code>.
                  <br />- Kéo xuống dưới cùng Copy liên kết URL và mở trên trình duyệt để chọn Server muốn mời bot vào!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
