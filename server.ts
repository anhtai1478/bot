import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActivityType, 
  EmbedBuilder,
  PermissionsBitField
} from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import JSZip from 'jszip';
import { DEFAULT_CUSTOM_COMMANDS, RADIO_PRESETS } from './src/data/presets.ts';
import {
  STANDALONE_PACKAGE_JSON,
  STANDALONE_ENV_EXAMPLE,
  STANDALONE_INDEX_JS,
  STANDALONE_DOCKERFILE,
  STANDALONE_DOCKER_COMPOSE,
  STANDALONE_PM2_CONFIG,
  STANDALONE_README_MD
} from './src/data/botSource.ts';

const __filename = typeof __filename !== 'undefined' ? __filename : process.argv[1] || process.cwd();
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state for the active bot instance
interface ActiveBotState {
  client: Client | null;
  isRunning: boolean;
  isDemoMode: boolean;
  token: string;
  prefix: string;
  stay247: boolean;
  startTime: number | null;
  targetVoiceChannel: {
    id: string;
    name: string;
    guildName: string;
  } | null;
  musicState: {
    currentTrack: any;
    isPlaying: boolean;
    isPaused: boolean;
    volume: number;
    loopMode: 'off' | 'track' | 'queue';
    queue: any[];
    stay247Mode: boolean;
    voiceChannelName: string | null;
  };
  customCommands: any[];
  logs: Array<{
    id: string;
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'success' | 'cmd';
    message: string;
    category: 'system' | 'voice' | 'music' | 'moderation' | 'gateway';
  }>;
}

const botState: ActiveBotState = {
  client: null,
  isRunning: false,
  isDemoMode: false,
  token: '',
  prefix: '!',
  stay247: true,
  startTime: null,
  targetVoiceChannel: null,
  musicState: {
    currentTrack: null,
    isPlaying: false,
    isPaused: false,
    volume: 85,
    loopMode: 'off',
    queue: [],
    stay247Mode: true,
    voiceChannelName: null,
  },
  customCommands: [...DEFAULT_CUSTOM_COMMANDS],
  logs: [
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      level: 'info',
      message: 'Hệ thống Quản lý Discord 24/7 đã khởi động. Sẵn sàng kết nối Bot.',
      category: 'system'
    }
  ]
};

function addLog(level: 'info' | 'warn' | 'error' | 'success' | 'cmd', message: string, category: 'system' | 'voice' | 'music' | 'moderation' | 'gateway' = 'system') {
  const newLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toLocaleTimeString('vi-VN'),
    level,
    message,
    category
  };
  botState.logs.unshift(newLog);
  if (botState.logs.length > 200) {
    botState.logs.pop();
  }
}

// ----------------- API ROUTES FIRST -----------------

// Health & Uptime Keep-Alive Ping
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'online',
    service: 'Discord 24/7 Keep-Alive Monitor',
    botOnline: botState.isRunning,
    uptimeSeconds: botState.startTime ? Math.floor((Date.now() - botState.startTime) / 1000) : 0,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get Bot Current Status
app.get('/api/bot/status', (req, res) => {
  const client = botState.client;
  let userData = null;
  let ping = 0;
  let guildsCount = 0;
  let membersCount = 0;

  if (botState.isDemoMode) {
    userData = {
      id: '123456789012345678',
      username: 'Music247_DemoBot',
      discriminator: '0001',
      tag: 'Music247_DemoBot#0001',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
    };
    ping = 24;
    guildsCount = 3;
    membersCount = 428;
  } else if (client && client.isReady() && client.user) {
    userData = {
      id: client.user.id,
      username: client.user.username,
      discriminator: client.user.discriminator,
      tag: client.user.tag,
      avatar: client.user.displayAvatarURL({ size: 128 })
    };
    ping = Math.round(client.ws.ping) || 35;
    guildsCount = client.guilds.cache.size;
    membersCount = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
  }

  const uptime = botState.startTime ? Math.floor((Date.now() - botState.startTime) / 1000) : 0;

  res.json({
    isRunning: botState.isRunning,
    isDemoMode: botState.isDemoMode,
    user: userData,
    ping,
    uptime,
    guildsCount,
    membersCount,
    currentVoiceChannel: botState.targetVoiceChannel ? {
      ...botState.targetVoiceChannel,
      membersInChannel: 0, // In 24/7 mode, remains active even when 0 members
      stay247Active: botState.stay247
    } : null,
    music: botState.musicState,
    prefix: botState.prefix
  });
});

// Test Discord Token validity with Discord API
app.post('/api/bot/test-token', async (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ valid: false, error: 'Vui lòng cung cấp chuỗi Token hợp lệ.' });
  }

  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${token.trim()}`
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(401).json({
        valid: false,
        error: 'Token không hợp lệ hoặc bị từ chối từ Discord.',
        details: errData
      });
    }

    const userData = await response.json();
    return res.json({
      valid: true,
      user: {
        id: userData.id,
        username: userData.username,
        tag: `${userData.username}#${userData.discriminator}`,
        avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null
      }
    });
  } catch (err: any) {
    return res.status(500).json({ valid: false, error: 'Không thể kết nối đến máy chủ Discord: ' + err.message });
  }
});

// Start the Discord Bot
app.post('/api/bot/start', async (req, res) => {
  const { token, prefix, isDemo, stay247, defaultVoiceChannel } = req.body;

  if (isDemo) {
    if (botState.client) {
      try { await botState.client.destroy(); } catch {}
      botState.client = null;
    }
    botState.isRunning = true;
    botState.isDemoMode = true;
    botState.startTime = Date.now();
    botState.prefix = prefix || '!';
    botState.stay247 = stay247 !== false;
    botState.targetVoiceChannel = {
      id: 'voice-channel-demo-1',
      name: '🔊 Phòng Trò Chuyện 24/7 (Lofi Chill)',
      guildName: 'Server Cộng Đồng Mẫu'
    };
    botState.musicState.currentTrack = {
      id: 'track-1',
      title: 'Lofi Girl - Relax & Study 24/7',
      url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
      duration: '24/7 Live Stream',
      requester: 'Admin (Mô phỏng)',
      isLiveRadio: true
    };
    botState.musicState.isPlaying = true;
    botState.musicState.voiceChannelName = '🔊 Phòng Trò Chuyện 24/7 (Lofi Chill)';

    addLog('success', 'Đã khởi động Bot ở Chế độ Mô phỏng (Demo Mode). Mọi chức năng test hoạt động hoàn hảo!', 'system');
    addLog('info', 'Kích hoạt chế độ 24/7 Voice Lock: Bot sẽ giữ phòng ngay cả khi không có ai.', 'voice');
    addLog('info', 'Bắt đầu phát luồng âm nhạc: Lofi Girl - Relax & Study 24/7', 'music');

    return res.json({ success: true, mode: 'demo' });
  }

  if (!token) {
    return res.status(400).json({ success: false, error: 'Chưa nhập Bot Token!' });
  }

  try {
    // If an existing client was running, destroy it first
    if (botState.client) {
      try { await botState.client.destroy(); } catch {}
      botState.client = null;
    }

    addLog('info', 'Đang kết nối đến Discord Gateway với token cung cấp...', 'gateway');

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
      ],
      partials: [Partials.Channel, Partials.Message]
    });

    client.once('ready', () => {
      botState.isRunning = true;
      botState.isDemoMode = false;
      botState.startTime = Date.now();
      botState.prefix = prefix || '!';
      botState.stay247 = stay247 !== false;

      client.user?.setActivity('24/7 Music & Moderation | !help', { type: ActivityType.Listening });

      addLog('success', `Đăng nhập thành công với bot: ${client.user?.tag}`, 'gateway');
      addLog('info', `Đang trực tuyến trên ${client.guilds.cache.size} máy chủ Discord.`, 'system');

      if (defaultVoiceChannel) {
        addLog('info', `Thiết lập kênh voice 24/7: ${defaultVoiceChannel}`, 'voice');
      }
    });

    // Handle incoming chat messages
    client.on('messageCreate', async (message) => {
      if (message.author.bot || !message.guild || !message.content.startsWith(botState.prefix)) return;

      const args = message.content.slice(botState.prefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();
      if (!command) return;

      addLog('cmd', `Lệnh thực thi: [${botState.prefix}${command}] bởi ${message.author.tag} tại #${(message.channel as any).name || 'DM'}`, 'moderation');

      // Check custom commands first
      const customCmd = botState.customCommands.find(c => c.enabled && c.name.toLowerCase() === command);
      if (customCmd) {
        if (customCmd.responseType === 'embed' && customCmd.embedData) {
          const embed = new EmbedBuilder()
            .setTitle(customCmd.embedData.title || customCmd.name)
            .setDescription(customCmd.embedData.description || '')
            .setColor((customCmd.embedData.color as any) || '#5865F2');
          if (customCmd.embedData.footer) {
            embed.setFooter({ text: customCmd.embedData.footer });
          }
          await message.reply({ embeds: [embed] });
        } else {
          await message.reply(customCmd.responseText || 'Lệnh tùy chỉnh');
        }
        return;
      }

      // Built-in commands
      if (command === 'ping') {
        await message.reply(`🏓 Pong! Độ trễ WebSocket: **${Math.round(client.ws.ping)}ms** | Bot trực tuyến 24/7.`);
      } else if (command === 'join') {
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) {
          return message.reply('❌ Bạn cần vào kênh thoại trước rồi mới dùng lệnh `!join`!');
        }

        try {
          if (botState.targetVoiceChannel?.id !== voiceChannel.id) {
            botState.targetVoiceChannel = {
              id: voiceChannel.id,
              name: voiceChannel.name,
              guildName: message.guild.name
            };
          }

          joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
          });

          addLog('success', `Bot đã vào phòng thoại: ${voiceChannel.name}`, 'voice');
          await message.reply(`✅ Bot đã vào phòng **${voiceChannel.name}** của bạn.`);
        } catch (error: any) {
          addLog('error', `Không thể vào phòng thoại: ${error.message}`, 'voice');
          await message.reply('❌ Không thể vào phòng thoại lúc này. Hãy thử lại sau.');
        }
      } else if (command === '247' || command === 'treo') {
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) {
          return message.reply('❌ Bạn cần vào kênh thoại trước để kích hoạt chế độ 24/7!');
        }
        botState.stay247 = true;
        botState.targetVoiceChannel = {
          id: voiceChannel.id,
          name: voiceChannel.name,
          guildName: message.guild.name
        };
        addLog('success', `Kích hoạt 24/7 tại kênh voice: ${voiceChannel.name}`, 'voice');
        const embed = new EmbedBuilder()
          .setColor('#00D26A')
          .setTitle('🟢 Chế độ 24/7 ĐÃ BẬT!')
          .setDescription(`Bot đã khóa kênh **${voiceChannel.name}** và sẽ duy trì kết nối 24/7 ngay cả khi phòng trống.`);
        await message.reply({ embeds: [embed] });
      } else if (command === 'serverinfo') {
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(`📊 Server: ${message.guild.name}`)
          .addFields(
            { name: '👑 Chủ phòng', value: `<@${message.guild.ownerId}>`, inline: true },
            { name: '👥 Thành viên', value: `${message.guild.memberCount}`, inline: true },
            { name: '📅 Tạo ngày', value: message.guild.createdAt.toLocaleDateString('vi-VN'), inline: true }
          );
        await message.reply({ embeds: [embed] });
      }
    });

    client.on('error', (err) => {
      addLog('error', `Lỗi Discord Client: ${err.message}`, 'gateway');
    });

    await client.login(token.trim());
    botState.client = client;
    botState.token = token.trim();
    botState.isRunning = true;

    return res.json({ success: true });
  } catch (err: any) {
    addLog('error', `Không thể đăng nhập Discord Bot: ${err.message}`, 'gateway');
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Stop the Discord Bot
app.post('/api/bot/stop', async (req, res) => {
  if (botState.client) {
    try {
      await botState.client.destroy();
    } catch {}
    botState.client = null;
  }
  botState.isRunning = false;
  botState.isDemoMode = false;
  botState.startTime = null;
  botState.musicState.isPlaying = false;
  botState.musicState.currentTrack = null;
  botState.targetVoiceChannel = null;

  addLog('warn', 'Bot đã được dừng hoạt động thủ công.', 'system');
  res.json({ success: true });
});

// Voice 24/7 Controls
app.post('/api/bot/voice/toggle-247', (req, res) => {
  const { enabled, channelId, channelName, guildName } = req.body;
  botState.stay247 = enabled !== undefined ? enabled : !botState.stay247;
  botState.musicState.stay247Mode = botState.stay247;

  if (botState.stay247 && channelName) {
    botState.targetVoiceChannel = {
      id: channelId || 'vc-1',
      name: channelName,
      guildName: guildName || 'Server Discord'
    };
    addLog('success', `Đã bật chế độ Treo Voice 24/7 tại phòng: ${channelName}`, 'voice');
  } else if (!botState.stay247) {
    addLog('warn', 'Đã tắt chế độ Treo Voice 24/7.', 'voice');
  }

  res.json({ success: true, stay247: botState.stay247, channel: botState.targetVoiceChannel });
});

// YouTube video info resolver
app.post('/api/bot/youtube-info', async (req, res) => {
  const { url, query } = req.body;
  const input = (url || query || '').trim();

  if (!input) {
    return res.status(400).json({ success: false, error: 'Chưa cung cấp link YouTube hoặc từ khóa tìm kiếm.' });
  }

  try {
    // Extract YouTube Video ID if it's a link
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = input.match(ytRegex);

    if (match && match[1]) {
      const videoId = match[1];
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

      const ytRes = await fetch(oembedUrl);
      if (ytRes.ok) {
        const data = await ytRes.json();
        return res.json({
          success: true,
          track: {
            id: 'yt-' + videoId,
            title: data.title,
            author: data.author_name,
            url: videoUrl,
            duration: 'YouTube Video',
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            requester: 'Bảng Điều Khiển Web',
            isLiveRadio: false
          }
        });
      }

      // Fallback if oEmbed is restricted
      return res.json({
        success: true,
        track: {
          id: 'yt-' + videoId,
          title: 'YouTube Track (' + videoId + ')',
          author: 'YouTube',
          url: videoUrl,
          duration: 'YouTube Video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          requester: 'Bảng Điều Khiển Web',
          isLiveRadio: false
        }
      });
    }

    // If it's a general search query or custom link
    return res.json({
      success: true,
      track: {
        id: 'query-' + Date.now(),
        title: input,
        author: 'YouTube Search',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`,
        duration: 'YouTube Query',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
        requester: 'Bảng Điều Khiển Web',
        isLiveRadio: false
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Không thể xử lý link YouTube: ' + err.message });
  }
});

// Music Controls
app.post('/api/bot/music/play', (req, res) => {
  const { presetId, customUrl, customTitle, trackData, queueOnly } = req.body;
  let track: any = null;

  if (trackData) {
    track = {
      ...trackData,
      id: trackData.id || 'track-' + Date.now()
    };
  } else if (presetId) {
    const preset = RADIO_PRESETS.find(p => p.id === presetId);
    if (preset) {
      track = {
        id: preset.id,
        title: preset.name,
        url: preset.url,
        duration: '24/7 Live Stream',
        thumbnail: preset.coverImage,
        requester: 'Bảng Điều Khiển Web',
        isLiveRadio: true
      };
    }
  } else if (customUrl) {
    track = {
      id: 'custom-' + Date.now(),
      title: customTitle || 'Luồng YouTube / Nhạc Trực Tiếp',
      url: customUrl,
      duration: 'Live Stream',
      requester: 'Bảng Điều Khiển Web',
      isLiveRadio: true
    };
  }

  if (track) {
    if (queueOnly || (botState.musicState.isPlaying && botState.musicState.currentTrack)) {
      botState.musicState.queue.push(track);
      addLog('info', `Đã thêm vào danh sách chờ: ${track.title} (Vị trí #${botState.musicState.queue.length})`, 'music');
      return res.json({ success: true, queued: true, track, musicState: botState.musicState });
    }

    botState.musicState.currentTrack = track;
    botState.musicState.isPlaying = true;
    botState.musicState.isPaused = false;
    addLog('info', `Bắt đầu phát bài hát: ${track.title}`, 'music');
    return res.json({ success: true, queued: false, track, musicState: botState.musicState });
  }

  res.status(400).json({ success: false, error: 'Không tìm thấy bài hát hoặc luồng phát.' });
});

app.post('/api/bot/music/control', (req, res) => {
  const { action, volume, loopMode, queueIndex } = req.body;

  switch (action) {
    case 'pause':
      botState.musicState.isPaused = true;
      botState.musicState.isPlaying = false;
      addLog('info', 'Đã tạm dừng phát nhạc.', 'music');
      break;
    case 'resume':
      botState.musicState.isPaused = false;
      botState.musicState.isPlaying = true;
      addLog('info', 'Tiếp tục phát nhạc.', 'music');
      break;
    case 'skip':
      if (botState.musicState.queue.length > 0) {
        const nextTrack = botState.musicState.queue.shift();
        botState.musicState.currentTrack = nextTrack;
        botState.musicState.isPlaying = true;
        botState.musicState.isPaused = false;
        addLog('info', `Đã chuyển sang bài kế tiếp: ${nextTrack.title}`, 'music');
      } else {
        botState.musicState.isPlaying = false;
        botState.musicState.isPaused = false;
        botState.musicState.currentTrack = null;
        addLog('info', 'Hàng đợi trống. Đã dừng phát bài hiện tại.', 'music');
      }
      break;
    case 'remove-queue':
      if (typeof queueIndex === 'number' && queueIndex >= 0 && queueIndex < botState.musicState.queue.length) {
        const removed = botState.musicState.queue.splice(queueIndex, 1);
        addLog('info', `Đã xóa bài khỏi danh sách chờ: ${removed[0]?.title}`, 'music');
      }
      break;
    case 'clear-queue':
      botState.musicState.queue = [];
      addLog('info', 'Đã xóa toàn bộ hàng đợi phát nhạc.', 'music');
      break;
    case 'stop':
      botState.musicState.isPlaying = false;
      botState.musicState.isPaused = false;
      botState.musicState.currentTrack = null;
      botState.musicState.queue = [];
      addLog('info', 'Đã dừng phát nhạc (Bot vẫn duy trì voice 24/7).', 'music');
      break;
    case 'volume':
      if (typeof volume === 'number') {
        botState.musicState.volume = Math.max(0, Math.min(100, volume));
        addLog('info', `Điều chỉnh âm lượng nhạc: ${botState.musicState.volume}%`, 'music');
      }
      break;
    case 'loop':
      if (['off', 'track', 'queue'].includes(loopMode)) {
        botState.musicState.loopMode = loopMode;
        addLog('info', `Chế độ lặp: ${loopMode}`, 'music');
      }
      break;
  }

  res.json({ success: true, musicState: botState.musicState });
});

// Custom Commands CRUD
app.get('/api/bot/custom-commands', (req, res) => {
  res.json({ commands: botState.customCommands });
});

app.post('/api/bot/custom-commands', (req, res) => {
  const cmd = req.body;
  if (!cmd.name) {
    return res.status(400).json({ error: 'Tên lệnh không được để trống!' });
  }

  // Remove prefix if typed
  const cleanName = cmd.name.replace(/^[!/]/, '').trim().toLowerCase();

  const existingIndex = botState.customCommands.findIndex(c => c.id === cmd.id || c.name.toLowerCase() === cleanName);
  const newCmd = {
    id: cmd.id || 'cmd-' + Date.now(),
    name: cleanName,
    type: cmd.type || 'prefix',
    description: cmd.description || 'Lệnh tùy chỉnh',
    responseType: cmd.responseType || 'text',
    responseText: cmd.responseText || '',
    embedData: cmd.embedData || null,
    cooldownSeconds: cmd.cooldownSeconds || 3,
    enabled: cmd.enabled !== false
  };

  if (existingIndex >= 0) {
    botState.customCommands[existingIndex] = newCmd;
    addLog('info', `Đã cập nhật lệnh tùy chỉnh: !${cleanName}`, 'system');
  } else {
    botState.customCommands.push(newCmd);
    addLog('success', `Đã tạo lệnh tùy chỉnh mới: !${cleanName}`, 'system');
  }

  res.json({ success: true, command: newCmd, commands: botState.customCommands });
});

app.delete('/api/bot/custom-commands/:id', (req, res) => {
  const { id } = req.params;
  const removed = botState.customCommands.find(c => c.id === id);
  botState.customCommands = botState.customCommands.filter(c => c.id !== id);
  if (removed) {
    addLog('info', `Đã xóa lệnh tùy chỉnh: !${removed.name}`, 'system');
  }
  res.json({ success: true, commands: botState.customCommands });
});

// Logs API
app.get('/api/bot/logs', (req, res) => {
  res.json({ logs: botState.logs });
});

app.post('/api/bot/logs/clear', (req, res) => {
  botState.logs = [];
  res.json({ success: true });
});

// Standalone Bot Source Code ZIP Exporter
app.get('/api/bot/export-zip', async (req, res) => {
  try {
    const zip = new JSZip();

    // Include the configured token in .env if provided
    let envContent = STANDALONE_ENV_EXAMPLE;
    if (botState.token) {
      envContent = envContent.replace('your_bot_token_here', botState.token);
    }
    if (botState.prefix) {
      envContent = envContent.replace('COMMAND_PREFIX=!', `COMMAND_PREFIX=${botState.prefix}`);
    }

    zip.file('index.js', STANDALONE_INDEX_JS);
    zip.file('package.json', STANDALONE_PACKAGE_JSON);
    zip.file('.env.example', envContent);
    zip.file('Dockerfile', STANDALONE_DOCKERFILE);
    zip.file('docker-compose.yml', STANDALONE_DOCKER_COMPOSE);
    zip.file('pm2.config.cjs', STANDALONE_PM2_CONFIG);
    zip.file('README.md', STANDALONE_README_MD);

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="discord-247-bot-source.zip"');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: 'Không thể tạo file nén: ' + err.message });
  }
});

// ----------------- VITE & STATIC FILES -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Máy chủ Discord Bot Hub đang chạy tại: http://localhost:${PORT}`);
  });
}

startServer();
