export interface LyricLine {
  time: number; // in seconds (e.g. 12.5)
  text: string;
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  fileBlob?: Blob | File;
  audioUrl: string;
  coverUrl: string;
  caption?: string; // song caption or subtitle note
  lyrics?: string; // Raw LRC format (e.g. [00:12.50] ឱ! ដងស្ទឹងសៀមរាប...)
  parsedLyrics?: LyricLine[]; // Parsed timestamped lines
  addedAt: number;
  fileSize?: number;
  sizeFormatted?: string;
  isDemo?: boolean;
}

export interface TimestampChapter {
  time: string;
  title: string;
}

export interface SEOData {
  recommendedTitle: string;
  titleOptions: string[];
  description: string;
  timestampChapters: TimestampChapter[];
  tags: string[];
  hashtags: string[];
  thumbnailIdea: string;
  musicFormat?: string;
}

export interface VisualizerPreset {
  id: string;
  name: string;
  nameKhmer: string;
  bgUrl: string;
  accentColor: string;
  barColor: string;
  glowColor: string;
}

export interface YouTubePublishRecord {
  id: string;
  videoUrl: string;
  url?: string;
  embedUrl?: string;
  studioUrl: string;
  title: string;
  description: string;
  tags: string[];
  privacyStatus: 'public' | 'unlisted' | 'private';
  category: string;
  channelName: string;
  publishedAt: string;
  thumbnailUrl?: string;
  views?: number;
  durationFormatted?: string;
  status?: 'processing' | 'published' | 'ready';
}

export type PlayerRepeatMode = 'off' | 'all' | 'one';

export type CaptionMode =
  | 'capcut_bounce'
  | 'capcut_highlight'
  | 'capcut_karaoke_glow'
  | 'capcut_tiktok_kinetic'
  | 'youtube_cc'
  | 'karaoke_box'
  | 'subtitles_clean';

export type VideoOrientation = 'landscape' | 'portrait';

export type VisualizerStyle =
  | 'bars'
  | 'particles'
  | 'glitch'
  | 'hybrid'
  | 'radial'
  | 'wave'
  | 'vinyl'
  | 'neon'
  | 'ripple'
  | 'equalizer'
  | 'orb_pulsar'
  | 'galaxy_spiral'
  | 'laser_beams'
  | 'heartbeat'
  | 'dna_helix'
  | 'matrix_rain'
  | 'fire_flames'
  | 'crystal_poly'
  | 'lofi_rain'
  | 'retrowave_grid';

export type CoverPositionMode = 'glide_to_bottom' | 'bottom_fixed' | 'center';

export type BackgroundMode = 'image' | 'video';

export type BackgroundBrightnessMode = 'original' | 'soft' | 'dimmed';

export type PlatformBadgeId =
  | 'live'
  | 'youtube'
  | 'tiktok'
  | 'spotify'
  | 'apple_music'
  | 'amazon_music';

export interface PlatformBadgesConfig {
  enabled: boolean;
  showLive: boolean;
  showYouTube: boolean;
  showTikTok: boolean;
  showSpotify: boolean;
  showAppleMusic: boolean;
  showAmazonMusic: boolean;
  position: 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left';
  customHandle: string;
  labelStyle: 'icons_only' | 'icons_with_text' | 'stream_bar';
}

export interface VideoBackgroundPreset {
  id: string;
  name: string;
  nameKhmer: string;
  thumbnailUrl: string;
  accentColor: string;
  description: string;
}
