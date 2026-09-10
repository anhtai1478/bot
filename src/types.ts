export interface BotConfig {
  token: string;
  clientId: string;
  prefix: string;
  stay247: boolean;
  voiceChannelId: string;
  guildId: string;
  activityType: 'Playing' | 'Listening' | 'Watching' | 'Streaming' | 'Competing';
  activityName: string;
  status: 'online' | 'idle' | 'dnd' | 'invisible';
  autoReconnect: boolean;
  welcomeChannelId: string;
  welcomeMessage: string;
  autoRoleId: string;
}

export interface BotStatus {
  isRunning: boolean;
  isDemoMode: boolean;
  user?: {
    id: string;
    username: string;
    discriminator: string;
    tag: string;
    avatar: string | null;
  };
  ping: number;
  uptime: number; // in seconds
  guildsCount: number;
  membersCount: number;
  currentVoiceChannel?: {
    id: string;
    name: string;
    guildName: string;
    membersInChannel: number;
    stay247Active: boolean;
  } | null;
  music: MusicState;
}

export interface MusicTrack {
  id: string;
  title: string;
  author?: string;
  url: string;
  duration: string;
  thumbnail?: string;
  requester: string;
  isLiveRadio?: boolean;
}

export interface MusicState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number; // 0 - 100
  loopMode: 'off' | 'track' | 'queue';
  queue: MusicTrack[];
  stay247Mode: boolean;
  voiceChannelName: string | null;
}

export interface CustomCommand {
  id: string;
  name: string;
  type: 'prefix' | 'slash';
  description: string;
  responseType: 'text' | 'embed';
  responseText: string;
  embedData?: {
    title: string;
    description: string;
    color: string;
    footer?: string;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  };
  requiredRole?: string;
  cooldownSeconds: number;
  enabled: boolean;
}

export interface BotLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'cmd';
  message: string;
  category: 'system' | 'voice' | 'music' | 'moderation' | 'gateway';
}

export interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  channels: Array<{
    id: string;
    name: string;
    type: 'text' | 'voice';
  }>;
}

export interface RadioStreamPreset {
  id: string;
  name: string;
  genre: string;
  description: string;
  url: string;
  badge: string;
  coverImage: string;
}
