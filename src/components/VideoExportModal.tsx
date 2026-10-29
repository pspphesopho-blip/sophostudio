import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  Download,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Share2,
  Film,
  Loader2,
  MessageSquare,
  Mic2,
  RotateCcw,
  Monitor,
  Smartphone,
  RefreshCw,
  Zap,
  Gauge,
  ArrowDownUp,
  Image as ImageIcon,
  Disc,
  Globe,
  SunMedium,
} from "lucide-react";
import { SongTrack, VisualizerPreset, VisualizerStyle, CaptionMode, VideoOrientation, CoverPositionMode, PlatformBadgesConfig, BackgroundBrightnessMode } from "../types";
import { formatDuration } from "../utils/audioDb";
import { PRESET_COVERS, getDistinctCoverForTrack } from "../utils/audioSynthesizer";
import { VISUALIZER_STYLES } from "../utils/visualizerStyles";
import { renderRunningLyricsOnCanvas } from "../utils/lyricsCanvasRenderer";
import { renderPlatformBadgesOnCanvas } from "../utils/platformBadgesRenderer";
import { isExtendedVisualizerStyle, renderExtendedVisualizerStyle } from "../utils/visualizerAnimationStylesRenderer";
import { renderImageBackgroundOnCanvas, renderVideoBackgroundOnCanvas } from "../utils/backgroundRenderer";

export type { VideoOrientation };
export type VideoResolution = "4k" | "2k" | "1080p" | "720p";

export interface VideoResolutionOption {
  id: VideoResolution;
  orientation: VideoOrientation;
  name: string;
  nameKhmer: string;
  resolutionText: string;
  width: number;
  height: number;
  bitrate: number;
  badge?: string;
  desc: string;
}

export const LANDSCAPE_RESOLUTIONS: VideoResolutionOption[] = [
  {
    id: "1080p",
    orientation: "landscape",
    name: "1080p Full HD",
    nameKhmer: "1080p Full HD (1920×1080)",
    resolutionText: "1920 × 1080 (16:9)",
    width: 1920,
    height: 1080,
    bitrate: 8000000, // 8 Mbps
    badge: "⚡ លឿន & ស្តង់ដារ (Recommended)",
    desc: "កម្រិតស្តង់ដារពេញនិយម YouTube Full HD Render លឿន រូបភាពច្បាស់",
  },
  {
    id: "4k",
    orientation: "landscape",
    name: "4K Ultra HD",
    nameKhmer: "4K Ultra HD (3840×2160)",
    resolutionText: "3840 × 2160 (4K UHD)",
    width: 3840,
    height: 2160,
    bitrate: 28000000, // 28 Mbps
    badge: "🌟 4K គុណភាពខ្ពស់បំផុត",
    desc: "កម្រិតច្បាស់ឥតខ្ចោះ 3840x2160 សម្រាប់ YouTube 4K (Standard PRO)",
  },
  {
    id: "2k",
    orientation: "landscape",
    name: "2K Quad HD",
    nameKhmer: "2K Quad HD (2560×1440)",
    resolutionText: "2560 × 1440 (1440p)",
    width: 2560,
    height: 1440,
    bitrate: 14000000, // 14 Mbps
    badge: "1440p QHD",
    desc: "កម្រិតច្បាស់ម៉ត់ 2560x1440 សាកសមសម្រាប់ TV & PC",
  },
  {
    id: "720p",
    orientation: "landscape",
    name: "720p HD",
    nameKhmer: "720p HD (1280×720)",
    resolutionText: "1280 × 720 (720p)",
    width: 1280,
    height: 720,
    bitrate: 3500000, // 3.5 Mbps
    badge: "🚀 លឿនបំផុត (Ultra Fast)",
    desc: "ទាញយកលឿនរហ័សទាន់ចិត្ត សន្សំសំចៃទំហំ និងពេលវេលា",
  },
];

export const PORTRAIT_RESOLUTIONS: VideoResolutionOption[] = [
  {
    id: "1080p",
    orientation: "portrait",
    name: "1080p Short / TikTok",
    nameKhmer: "1080p Shorts (1080×1920)",
    resolutionText: "1080 × 1920 (9:16 បញ្ឈរ)",
    width: 1080,
    height: 1920,
    bitrate: 8000000, // 8 Mbps
    badge: "🔥 ពេញនិយម Shorts (Recommended)",
    desc: "ស្តង់ដារពេញនិយម YouTube Shorts, TikTok & IG Reels ច្បាស់ម៉ត់ 1080p",
  },
  {
    id: "4k",
    orientation: "portrait",
    name: "4K Short Ultra HD",
    nameKhmer: "4K Short UHD (2160×3840)",
    resolutionText: "2160 × 3840 (4K បញ្ឈរ)",
    width: 2160,
    height: 3840,
    bitrate: 26000000, // 26 Mbps
    badge: "🌟 4K បញ្ឈរ PRO",
    desc: "កម្រិតច្បាស់ខ្ពស់បំផុត 4K បញ្ឈរ សម្រាប់ទូរស័ព្ទអេក្រង់ធំ OLED",
  },
  {
    id: "2k",
    orientation: "portrait",
    name: "2K Short Quad HD",
    nameKhmer: "2K Short QHD (1440×2560)",
    resolutionText: "1440 × 2560 (2K បញ្ឈរ)",
    width: 1440,
    height: 2560,
    bitrate: 14000000, // 14 Mbps
    badge: "1440p Vertical",
    desc: "កម្រិតម៉ត់ច្បាស់ខ្លាំង 2K Quad HD សម្រាប់វីដេអូខ្លី",
  },
  {
    id: "720p",
    orientation: "portrait",
    name: "720p Short HD",
    nameKhmer: "720p Short HD (720×1280)",
    resolutionText: "720 × 1280 (720p បញ្ឈរ)",
    width: 720,
    height: 1280,
    bitrate: 3500000, // 3.5 Mbps
    badge: "⚡ លឿនរហ័សទាន់ចិត្ត",
    desc: "បង្កើត និងទាញយក Shorts បានលឿនបំផុត ត្រឹមតែប៉ុន្មានវិនាទី",
  },
];

export const VIDEO_RESOLUTIONS = LANDSCAPE_RESOLUTIONS;

export const MAX_SHORTS_DURATION_SECONDS = 180; // 3 នាទី (YouTube Shorts Official Maximum Limit)

export interface ShortsDurationOption {
  seconds: number;
  label: string;
  sub: string;
  desc: string;
  isMax?: boolean;
}

export const SHORTS_DURATION_OPTIONS: ShortsDurationOption[] = [
  { seconds: 15, label: "15s", sub: "15 វិនាទី", desc: "Stories / TikTok" },
  { seconds: 30, label: "30s", sub: "30 វិនាទី", desc: "Shorts & Reels" },
  { seconds: 60, label: "60s (1m)", sub: "1 នាទី", desc: "Shorts Standard" },
  { seconds: 90, label: "90s (1.5m)", sub: "1 នាទី 30វិ", desc: "Shorts 1.5 នាទី" },
  { seconds: 120, label: "120s (2m)", sub: "2 នាទី", desc: "Shorts 2 នាទី" },
  { seconds: 180, label: "180s (3m)", sub: "3 នាទី (MAX)", desc: "អតិបរមា Shorts 🔥", isMax: true },
];

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: SongTrack[];
  currentTrack: SongTrack | null;
  preset: VisualizerPreset;
  customBgUrl?: string;
  customBgVideoUrl?: string;
  visualizerStyle?: VisualizerStyle;
  initialShowCaption?: boolean;
  initialCaptionMode?: CaptionMode;
  initialShowCover?: boolean;
  initialOrientation?: VideoOrientation;
  platformBadgesConfig?: PlatformBadgesConfig;
  initialBackgroundBrightness?: BackgroundBrightnessMode;
  onOpenYouTubeAutomation: (videoBlob?: Blob) => void;
}

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  tracks,
  currentTrack,
  preset,
  customBgUrl,
  customBgVideoUrl,
  visualizerStyle = "bars",
  initialShowCaption = true,
  initialCaptionMode = "capcut_bounce",
  initialShowCover = true,
  initialOrientation,
  platformBadgesConfig,
  initialBackgroundBrightness = "original",
  onOpenYouTubeAutomation,
}) => {
  // Default to 1080p Full HD / Shorts Full HD
  const [selectedResolution, setSelectedResolution] = useState<VideoResolution>("1080p");
  const [videoOrientation, setVideoOrientation] = useState<VideoOrientation>(
    initialOrientation || "portrait"
  );
  const [selectedStyle, setSelectedStyle] = useState<VisualizerStyle>(visualizerStyle);
  const [coverPositionMode, setCoverPositionMode] = useState<CoverPositionMode>("glide_to_bottom");
  const [showVideoCover, setShowVideoCover] = useState<boolean>(initialShowCover ?? true);
  const [exportBadges, setExportBadges] = useState<boolean>(platformBadgesConfig?.enabled ?? true);
  const [backgroundBrightness, setBackgroundBrightness] = useState<BackgroundBrightnessMode>(initialBackgroundBrightness || "original");
  const [showVideoCaption, setShowVideoCaption] = useState(true);
  const [videoCaptionMode, setVideoCaptionMode] = useState<CaptionMode>(initialCaptionMode || "capcut_bounce");
  const [exportMode, setExportMode] = useState<"current" | "short" | "mix" | "all">("short");
  const [quickShortSecs, setQuickShortSecs] = useState<number>(60);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetDuration, setTargetDuration] = useState(60);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentlyExportingIndex, setCurrentlyExportingIndex] = useState(0);

  // Synchronize cover, caption and style settings whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialShowCover !== undefined) {
        setShowVideoCover(initialShowCover);
      }
      if (initialShowCaption !== undefined) {
        setShowVideoCaption(initialShowCaption);
      }
      if (initialCaptionMode) {
        setVideoCaptionMode(initialCaptionMode);
      }
      if (visualizerStyle) {
        setSelectedStyle(visualizerStyle);
      }
    }
  }, [isOpen, initialShowCover, initialShowCaption, initialCaptionMode, visualizerStyle]);

  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const bgVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentResolutionList =
    videoOrientation === "portrait" ? PORTRAIT_RESOLUTIONS : LANDSCAPE_RESOLUTIONS;

  // Clean up url when modal unmounts
  useEffect(() => {
    return () => {
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (bgVideoElementRef.current) {
        bgVideoElementRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [recordedVideoUrl]);

  if (!isOpen) return null;

  const activeTrack = currentTrack || tracks[0];

  // Determine which tracks are included in the export
  const getTracksToExport = (): SongTrack[] => {
    if (exportMode === "current") {
      return activeTrack ? [activeTrack] : [];
    }
    if (exportMode === "short") {
      return activeTrack ? [activeTrack] : [];
    }
    if (exportMode === "mix") {
      return tracks.slice(0, 3);
    }
    // "all": Include every single track from the playlist into a single concatenated video
    return tracks.length > 0 ? tracks : activeTrack ? [activeTrack] : [];
  };

  // Calculate target duration based on mode
  const getSelectedDuration = () => {
    if (videoOrientation === "portrait") {
      // Strict rule for YouTube Shorts: must be <= 3 minutes (180 seconds)
      if (exportMode === "short") {
        return Math.min(quickShortSecs, MAX_SHORTS_DURATION_SECONDS);
      }
      if (exportMode === "current") {
        // Cap at 3 minutes max (180s) for YouTube Shorts compliance
        return Math.min(activeTrack?.duration || 180, MAX_SHORTS_DURATION_SECONDS);
      }
      if (exportMode === "mix") {
        // 3 tracks mix in Shorts mode: capped at 3 minutes (180s)
        const mixTotal = tracks.slice(0, 3).reduce((a, b) => a + (b.duration || 180), 0);
        return Math.min(mixTotal, MAX_SHORTS_DURATION_SECONDS);
      }
      // "all" in portrait / shorts:
      const totalAll = tracks.reduce((sum, t) => sum + (t.duration || 180), 0);
      return Math.min(totalAll, MAX_SHORTS_DURATION_SECONDS);
    }

    // Landscape orientation (Standard YouTube long video)
    if (exportMode === "short") return Math.min(quickShortSecs, MAX_SHORTS_DURATION_SECONDS);
    if (exportMode === "current") return Math.min(activeTrack?.duration || 180, 600);
    if (exportMode === "mix") {
      return Math.min(tracks.slice(0, 3).reduce((a, b) => a + (b.duration || 180), 0), 600);
    }
    // "all": Sum of all track durations
    const totalAll = tracks.reduce((sum, t) => sum + (t.duration || 180), 0);
    return Math.max(totalAll, 30);
  };

  const startExport = async () => {
    const exportTracks = getTracksToExport();
    if (exportTracks.length === 0) {
      alert("សូមជ្រើសរើស ឬ Upload បទចម្រៀងជាមុនសិន!");
      return;
    }

    const durationToRecord = getSelectedDuration();
    setTargetDuration(durationToRecord);
    setIsRecording(true);
    setProgress(0);
    setElapsedTime(0);
    setCurrentlyExportingIndex(0);
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setDownloadCount(0);

    const activeRes =
      currentResolutionList.find((r) => r.id === selectedResolution) || currentResolutionList[0];
    setStatusMessage(
      `កំពុងរៀបចំ Export ទម្រង់ ${videoOrientation === "portrait" ? "Shorts បញ្ឈរ (9:16)" : "ផ្តេក (16:9)"} កម្រិត ${activeRes.name} (${activeRes.resolutionText}) ចំនួន ${exportTracks.length} បទ...`
    );

    try {
      // 1. Setup Offscreen Render Canvas
      const canvas = exportCanvasRef.current;
      if (!canvas) throw new Error("Canvas element not found");
      canvas.width = activeRes.width;
      canvas.height = activeRes.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas 2d context");

      // 2. Setup Audio Source & Stream
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const audioDestination = audioCtx.createMediaStreamDestination();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;

      const audioEl = new Audio();
      audioElementRef.current = audioEl;
      audioEl.crossOrigin = "anonymous";

      const sourceNode = audioCtx.createMediaElementSource(audioEl);
      sourceNode.connect(analyser);
      analyser.connect(audioDestination);

      // Track index and current track pointer
      let currentTrackIndex = 0;
      let currentPlayingTrack = exportTracks[0];

      // Pre-cache cover images
      const activeBgUrl = customBgUrl || preset.bgUrl;
      const coverImagesCache = new Map<string, HTMLImageElement>();
      for (const tr of exportTracks) {
        const coverSrc = getDistinctCoverForTrack(tr, activeBgUrl);
        if (coverSrc && !coverImagesCache.has(coverSrc)) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = coverSrc;
          coverImagesCache.set(coverSrc, img);
        }
      }

      // Preload fallback singer cover art
      const fallbackCoverImg = new Image();
      fallbackCoverImg.crossOrigin = "anonymous";
      fallbackCoverImg.src = PRESET_COVERS[0].url;

      // Load Background Image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = activeBgUrl;

      // Load Background Video (if active)
      let exportBgVideo: HTMLVideoElement | null = null;
      if (customBgVideoUrl) {
        exportBgVideo = document.createElement("video");
        exportBgVideo.crossOrigin = "anonymous";
        exportBgVideo.loop = true;
        exportBgVideo.muted = true;
        exportBgVideo.playsInline = true;
        exportBgVideo.src = customBgVideoUrl;
        bgVideoElementRef.current = exportBgVideo;
        try {
          await exportBgVideo.play();
        } catch (e) {
          console.warn("Could not autoplay export background video:", e);
        }
      }

      // 3. Setup MediaRecorder with Canvas Stream + Audio Stream
      const canvasStream = canvas.captureStream(30); // 30 FPS
      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      let mimeType = "video/webm;codecs=vp9,opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8,opus";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: activeRes.bitrate,
      });
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (exportBgVideo) {
          exportBgVideo.pause();
        }
        const videoBlob = new Blob(chunks, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedBlob(videoBlob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);
        setStatusMessage(`ការបង្កើតវីដេអូរួមបញ្ចូល ${exportTracks.length} បទ បានសម្រេច 100%!`);
      };

      // Sequential Track Player Helper
      const playTrackAt = async (index: number) => {
        if (index >= exportTracks.length) return;
        currentTrackIndex = index;
        currentPlayingTrack = exportTracks[index];
        setCurrentlyExportingIndex(index);
        setStatusMessage(`កំពុង Render បទទី ${index + 1}/${exportTracks.length}: "${currentPlayingTrack.title}"...`);

        audioEl.src = currentPlayingTrack.audioUrl;
        audioEl.currentTime = 0;
        try {
          await audioEl.play();
        } catch (e) {
          console.warn("Audio play warning:", e);
        }
      };

      // Automatically advance to the next track when current finishes
      audioEl.onended = () => {
        if (currentTrackIndex + 1 < exportTracks.length && exportMode !== "short") {
          playTrackAt(currentTrackIndex + 1);
        }
      };

      recorder.start(500); // chunk every 500ms
      await playTrackAt(0);

      // 5. Canvas Render Loop
      const startTime = Date.now();
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let tickerX = 0;
      let rotation = 0;

      const renderFrame = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(elapsed);
        const currentProgress = Math.min(100, Math.round((elapsed / durationToRecord) * 100));
        setProgress(currentProgress);

        if (elapsed >= durationToRecord) {
          // Stop recording
          if (recorder.state === "recording") {
            recorder.stop();
          }
          audioEl.pause();
          return;
        }

        const width = canvas.width;
        const height = canvas.height;

        // Current distinct singer / track cover art (guaranteed not identical to background)
        const expectedCoverSrc = getDistinctCoverForTrack(currentPlayingTrack, activeBgUrl);
        let curCover = coverImagesCache.get(expectedCoverSrc);
        if (!curCover || !curCover.complete || curCover.naturalWidth === 0) {
          curCover = fallbackCoverImg;
        }

        // 1. Draw Background (Video if active, otherwise Image Preset with full screen fit and 100% original brightness)
        let bgDrawn = false;
        if (exportBgVideo && exportBgVideo.readyState >= 2) {
          renderVideoBackgroundOnCanvas(ctx, exportBgVideo, width, height, backgroundBrightness);
          bgDrawn = true;
        } else if (bgImg.complete && bgImg.naturalWidth > 0) {
          renderImageBackgroundOnCanvas(ctx, bgImg, width, height, backgroundBrightness);
          bgDrawn = true;
        }

        if (!bgDrawn) {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, width, height);
        }

        // Read frequency data
        analyser.getByteFrequencyData(dataArray as any);

        let bassEnergy = 0;
        for (let b = 0; b < 6; b++) bassEnergy += dataArray[b] || 0;
        bassEnergy /= 6;
        const bassNorm = Math.min(1, bassEnergy / 230);

        const isPortrait = height > width;
        const scale = isPortrait ? width / 720 : width / 1280;
        const centerX = width / 2;

        // Vertical positions:
        // topCenterY: Upper area (height * 0.28 landscape, height * 0.22 portrait)
        // bottomCenterY: All the way down to bottom (height * 0.67), completely clearing background face!
        const topCenterY = isPortrait ? height * 0.22 : height * 0.28;
        const bottomCenterY = isPortrait ? height * 0.67 : height * 0.67;
        const fullTravelDistance = bottomCenterY - topCenterY;
        const coverSize = isPortrait ? Math.min(width * 0.50, 300 * scale) : 160 * scale;

        let centerY: number;
        if (coverPositionMode === "bottom_fixed") {
          centerY = bottomCenterY + Math.sin(elapsed * 4) * (4 * scale);
        } else if (coverPositionMode === "center") {
          centerY = (isPortrait ? height * 0.38 : height * 0.40) + Math.sin(elapsed * 3) * (4 * scale);
        } else {
          // "glide_to_bottom" (default):
          // Smooth majestic travel down all the way to bottom (ដល់ក្រោម) and cycle back up
          const bobPhase = elapsed * 0.95; // ~6.6s full cycle
          const downwardProgress = (1 - Math.cos(bobPhase)) / 2;
          centerY = topCenterY + downwardProgress * fullTravelDistance;
        }

        // 2. PARTICLES STYLE / HYBRID: Draw floating glowing particles & shockwave
        if (selectedStyle === "particles" || selectedStyle === "hybrid") {
          const numParticles = isPortrait ? 36 : 44;
          for (let p = 0; p < numParticles; p++) {
            const pAngle = (p / numParticles) * Math.PI * 2 + elapsed * 0.4;
            const pDist =
              110 * scale +
              ((p * 17 * scale + elapsed * 60 * scale) % (width * (isPortrait ? 0.44 : 0.38)));
            const px = centerX + Math.cos(pAngle) * pDist;
            const py = centerY + Math.sin(pAngle) * pDist * 0.75;
            const pSize = (2 + (dataArray[p % bufferLength] / 255) * 4) * scale;

            ctx.save();
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fillStyle = p % 2 === 0 ? preset.accentColor : preset.barColor;
            ctx.shadowBlur = 8 * scale;
            ctx.shadowColor = ctx.fillStyle;
            ctx.globalAlpha = 0.75;
            ctx.fill();
            ctx.restore();
          }

          // Expanding bass ring
          if (bassEnergy > 160) {
            const shockR =
              coverSize / 2 + 10 * scale + ((elapsed * 120 * scale) % (200 * scale));
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, shockR, 0, Math.PI * 2);
            ctx.strokeStyle = preset.accentColor;
            ctx.lineWidth = 2 * scale;
            ctx.globalAlpha = Math.max(0, 1 - shockR / (280 * scale));
            ctx.stroke();
            ctx.restore();
          }
        }

        // 3. GLITCH STYLE: 360-degree radial frequency spikes & cyber HUD
        if (selectedStyle === "glitch") {
          const radialSpikes = isPortrait ? 52 : 64;
          const innerR = coverSize / 2 + 10 * scale;
          ctx.save();
          ctx.translate(centerX, centerY);

          for (let i = 0; i < radialSpikes; i++) {
            const spAngle = (i / radialSpikes) * Math.PI * 2 - elapsed * 0.5;
            const val = dataArray[i % bufferLength] || 12;
            const spikeH = Math.max(4 * scale, (val / 255) * (60 * scale));

            const x1 = Math.cos(spAngle) * innerR;
            const y1 = Math.sin(spAngle) * innerR;
            const x2 = Math.cos(spAngle) * (innerR + spikeH);
            const y2 = Math.sin(spAngle) * (innerR + spikeH);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = i % 2 === 0 ? preset.accentColor : "#06b6d4";
            ctx.lineWidth = 2.5 * scale;
            ctx.shadowBlur = 6 * scale;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.stroke();
          }

          // Cyber Reticle Ring
          ctx.beginPath();
          ctx.arc(0, 0, innerR + 75 * scale, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
          ctx.lineWidth = 1.5 * scale;
          ctx.setLineDash([12 * scale, 8 * scale]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          // Glitch scanline pulse
          if (bassEnergy > 165 && Math.floor(elapsed * 10) % 4 === 0) {
            ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
            ctx.fillRect(0, centerY - 60 * scale + Math.random() * 120 * scale, width, 18 * scale);
          }
        }

        // 4. SPECTRUM BARS (Active on 'bars' or 'hybrid')
        if (selectedStyle === "bars" || selectedStyle === "hybrid") {
          const numBars = isPortrait ? 32 : 48;
          const barWidth = (isPortrait ? 15 : 14) * scale;
          const barSpacing = (isPortrait ? 5 : 6) * scale;
          const totalW = numBars * (barWidth + barSpacing);
          const startX = (width - totalW) / 2;
          const baseY = isPortrait ? height * 0.68 : height * 0.78;

          for (let i = 0; i < numBars; i++) {
            const val = dataArray[i % bufferLength] || 15;
            const barH = Math.max(
              6 * scale,
              (val / 255) * (selectedStyle === "hybrid" ? 170 : 220) * scale
            );
            const x = startX + i * (barWidth + barSpacing);
            const y = baseY - barH;

            const barGrad = ctx.createLinearGradient(x, y, x, baseY);
            barGrad.addColorStop(0, preset.accentColor);
            barGrad.addColorStop(1, preset.barColor);
            ctx.fillStyle = barGrad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, [4 * scale, 4 * scale, 0, 0]);
            ctx.fill();
          }
        }

        // 5. RADIAL PULSE 360° (Active on 'radial')
        if (selectedStyle === "radial") {
          const numSpikes = isPortrait ? 60 : 72;
          const innerRadius = coverSize / 2 + 12 * scale;
          ctx.save();
          ctx.translate(centerX, centerY);

          for (let i = 0; i < numSpikes; i++) {
            const angle = (i / numSpikes) * Math.PI * 2 + elapsed * 0.4;
            const val = dataArray[i % bufferLength] || 15;
            const norm = val / 255;
            const spikeLen = Math.max(
              6 * scale,
              norm * (width * (isPortrait ? 0.22 : 0.16)) + (bassEnergy / 255) * 20 * scale
            );

            const x1 = Math.cos(angle) * innerRadius;
            const y1 = Math.sin(angle) * innerRadius;
            const x2 = Math.cos(angle) * (innerRadius + spikeLen);
            const y2 = Math.sin(angle) * (innerRadius + spikeLen);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = i % 2 === 0 ? preset.accentColor : preset.barColor;
            ctx.lineWidth = Math.max(2 * scale, 3 * scale);
            ctx.shadowBlur = 10 * scale;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.stroke();

            if (norm > 0.4) {
              ctx.beginPath();
              ctx.arc(x2, y2, Math.max(2 * scale, norm * 4.5 * scale), 0, Math.PI * 2);
              ctx.fillStyle = "#ffffff";
              ctx.shadowBlur = 6 * scale;
              ctx.shadowColor = preset.accentColor;
              ctx.fill();
            }
          }

          ctx.beginPath();
          ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
          ctx.strokeStyle = preset.accentColor;
          ctx.lineWidth = 2.5 * scale;
          ctx.shadowBlur = 12 * scale;
          ctx.shadowColor = preset.accentColor;
          ctx.stroke();
          ctx.restore();
        }

        // 6. LIQUID WAVE (Active on 'wave')
        if (selectedStyle === "wave") {
          const baseY = isPortrait ? height * 0.66 : height * 0.74;
          const waveCount = 3;

          for (let w = 0; w < waveCount; w++) {
            const wavePhase = elapsed * (1.2 + w * 0.5) + w * 1.5;
            const waveAmp = (height * 0.08) * (1 + (bassEnergy / 255) * 0.8) * (1 - w * 0.25);
            const freqOffset = w * 12;

            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(0, baseY);

            for (let x = 0; x <= width; x += 15 * scale) {
              const normX = x / width;
              const binIdx = Math.floor(normX * (bufferLength * 0.7)) + freqOffset;
              const freqVal = (dataArray[binIdx % bufferLength] || 15) / 255;
              const y =
                baseY +
                Math.sin(normX * 9 + wavePhase) * waveAmp +
                Math.cos(normX * 18 + wavePhase * 1.4) * (waveAmp * 0.45) -
                freqVal * (height * 0.14);
              ctx.lineTo(x, y);
            }

            ctx.lineTo(width, height);
            ctx.closePath();

            const waveGrad = ctx.createLinearGradient(0, baseY - 80 * scale, 0, height);
            if (w === 0) {
              waveGrad.addColorStop(0, preset.accentColor);
              waveGrad.addColorStop(1, "rgba(0, 0, 0, 0.7)");
              ctx.globalAlpha = 0.55;
            } else if (w === 1) {
              waveGrad.addColorStop(0, preset.barColor);
              waveGrad.addColorStop(1, "rgba(0, 0, 0, 0.8)");
              ctx.globalAlpha = 0.4;
            } else {
              waveGrad.addColorStop(0, "#38bdf8");
              waveGrad.addColorStop(1, "rgba(0, 0, 0, 0.9)");
              ctx.globalAlpha = 0.3;
            }

            ctx.fillStyle = waveGrad;
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          // Top wave crest line
          ctx.beginPath();
          for (let x = 0; x <= width; x += 10 * scale) {
            const normX = x / width;
            const binIdx = Math.floor(normX * (bufferLength * 0.7));
            const freqVal = (dataArray[binIdx % bufferLength] || 15) / 255;
            const y =
              baseY +
              Math.sin(normX * 9 + elapsed * 1.5) * (height * 0.08 * (1 + (bassEnergy / 255) * 0.8)) -
              freqVal * (height * 0.14);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5 * scale;
          ctx.shadowBlur = 10 * scale;
          ctx.shadowColor = preset.accentColor;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // 7. VINYL GROOVE (Active on 'vinyl')
        if (selectedStyle === "vinyl") {
          ctx.save();
          ctx.translate(centerX, centerY);

          const recordRadius = coverSize * (isPortrait ? 0.84 : 0.88);
          ctx.beginPath();
          ctx.arc(0, 0, recordRadius, 0, Math.PI * 2);
          ctx.fillStyle = "#0c0d12";
          ctx.shadowBlur = 20 * scale;
          ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
          ctx.fill();

          ctx.strokeStyle = preset.accentColor;
          ctx.lineWidth = 3.5 * scale;
          ctx.shadowBlur = 8 * scale;
          ctx.shadowColor = preset.accentColor;
          ctx.stroke();

          const numGrooves = 14;
          for (let g = 1; g <= numGrooves; g++) {
            const r =
              coverSize / 2 +
              8 * scale +
              (g / numGrooves) * (recordRadius - coverSize / 2 - 12 * scale);
            const grooveVal = (dataArray[g % bufferLength] || 10) / 255;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + grooveVal * 0.14})`;
            ctx.lineWidth = 1 * scale;
            ctx.stroke();
          }

          // Turntable Tone-arm
          const armAngle = Math.PI * 0.22 + ((elapsed * 0.02) % 0.08);
          const armStartX = recordRadius + 45 * scale;
          const armStartY = -recordRadius * 0.5;
          const armNeedleX = Math.cos(armAngle) * (recordRadius * 0.65);
          const armNeedleY = Math.sin(armAngle) * (recordRadius * 0.65);

          ctx.beginPath();
          ctx.moveTo(armStartX, armStartY);
          ctx.lineTo(armNeedleX, armNeedleY);
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 4 * scale;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(armStartX, armStartY, 14 * scale, 0, Math.PI * 2);
          ctx.fillStyle = "#475569";
          ctx.fill();
          ctx.strokeStyle = preset.accentColor;
          ctx.lineWidth = 2 * scale;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(armNeedleX, armNeedleY, 5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = preset.accentColor;
          ctx.fill();

          ctx.restore();
        }

        // 8. NEON CYBER TUNNEL 3D (Active on 'neon')
        if (selectedStyle === "neon") {
          ctx.save();
          ctx.translate(centerX, centerY);

          const tunnelRings = 7;
          for (let r = 0; r < tunnelRings; r++) {
            const depth = (r + ((elapsed * 1.5) % 1)) / tunnelRings;
            const ringRadius =
              coverSize / 2 + 15 * scale + depth * (width * (isPortrait ? 0.44 : 0.38));
            const binVal = dataArray[(r * 8) % bufferLength] || 15;
            const ringAlpha = Math.min(1, depth * (0.8 + (binVal / 255) * 0.4));

            ctx.save();
            ctx.rotate((r % 2 === 0 ? 1 : -1) * (elapsed * 0.3 + r * 0.2));

            ctx.beginPath();
            const sides = 6;
            for (let s = 0; s <= sides; s++) {
              const sAngle = (s / sides) * Math.PI * 2;
              const sx = Math.cos(sAngle) * ringRadius;
              const sy = Math.sin(sAngle) * ringRadius * 0.8;
              if (s === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.strokeStyle = r % 2 === 0 ? preset.accentColor : preset.barColor;
            ctx.lineWidth = Math.max(1.5 * scale, 3.5 * scale * depth);
            ctx.globalAlpha = ringAlpha;
            ctx.shadowBlur = 12 * scale;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.stroke();
            ctx.restore();
          }

          const railSides = 6;
          for (let s = 0; s < railSides; s++) {
            const sAngle = (s / railSides) * Math.PI * 2;
            const x1 = Math.cos(sAngle) * (coverSize / 2 + 15 * scale);
            const y1 = Math.sin(sAngle) * (coverSize / 2 + 15 * scale) * 0.8;
            const x2 = Math.cos(sAngle) * (width * 0.48);
            const y2 = Math.sin(sAngle) * (width * 0.48) * 0.8;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
            ctx.lineWidth = 1 * scale;
            ctx.stroke();
          }

          ctx.restore();
        }

        // 9. WATER BASS RIPPLES (Active on 'ripple')
        if (selectedStyle === "ripple") {
          ctx.save();
          ctx.translate(centerX, centerY);

          const numRipples = 6;
          for (let k = 0; k < numRipples; k++) {
            const phase = ((elapsed * 1.8 + k * 1.2) % 6) / 6;
            const rRadius =
              coverSize / 2 + 10 * scale + phase * (width * (isPortrait ? 0.44 : 0.38));
            const rAlpha = Math.max(0, (1 - phase) * (0.65 + (bassEnergy / 255) * 0.5));
            const waveDistort = (dataArray[(k * 6) % bufferLength] || 15) / 255;

            ctx.beginPath();
            const segments = 60;
            for (let s = 0; s <= segments; s++) {
              const sAngle = (s / segments) * Math.PI * 2;
              const wobble = Math.sin(sAngle * 8 + elapsed * 4) * (waveDistort * 14 * scale);
              const rx = Math.cos(sAngle) * (rRadius + wobble);
              const ry = Math.sin(sAngle) * (rRadius + wobble) * 0.78;
              if (s === 0) ctx.moveTo(rx, ry);
              else ctx.lineTo(rx, ry);
            }
            ctx.closePath();
            ctx.strokeStyle = k % 2 === 0 ? preset.accentColor : preset.barColor;
            ctx.lineWidth = Math.max(1.5 * scale, 3.5 * scale * (1 - phase));
            ctx.globalAlpha = rAlpha;
            ctx.shadowBlur = 14 * scale;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.stroke();
          }

          ctx.restore();
        }

        // 10. DUAL STUDIO EQUALIZER (Active on 'equalizer')
        if (selectedStyle === "equalizer") {
          const eqBands = isPortrait ? 18 : 32;
          const eqWidth = width * (isPortrait ? 0.42 : 0.36);
          const bandWidth = Math.max(3 * scale, (eqWidth - eqBands * 3 * scale) / eqBands);
          const bandSpacing = 3 * scale;
          const baseY = isPortrait ? height * 0.68 : height * 0.78;

          const leftStartX = centerX - eqWidth - (isPortrait ? 14 : 40) * scale;
          const rightStartX = centerX + (isPortrait ? 14 : 40) * scale;

          ctx.shadowBlur = 8 * scale;
          ctx.shadowColor = preset.accentColor;

          for (let i = 0; i < eqBands; i++) {
            const bin = Math.floor((i / eqBands) * (bufferLength * 0.85));
            const val = dataArray[bin] || 10;
            const norm = val / 255;
            const bandHeight = Math.max(4 * scale, norm * (height * (isPortrait ? 0.22 : 0.28)));

            const segments = Math.max(1, Math.floor(bandHeight / (7 * scale)));
            for (let seg = 0; seg < segments; seg++) {
              const segY = baseY - (seg + 1) * (7 * scale);
              const segColor =
                seg > segments * 0.85
                  ? "#ef4444"
                  : seg > segments * 0.65
                  ? "#f59e0b"
                  : preset.accentColor;

              ctx.fillStyle = segColor;
              ctx.fillRect(leftStartX + i * (bandWidth + bandSpacing), segY, bandWidth, 5 * scale);
              ctx.fillRect(rightStartX + i * (bandWidth + bandSpacing), segY, bandWidth, 5 * scale);
            }
          }

          ctx.font = `bold ${Math.round((isPortrait ? 10 : 11) * scale)}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.textAlign = "left";
          ctx.fillText("CH-L [STEREO]", leftStartX, baseY + 18 * scale);
          ctx.textAlign = "right";
          ctx.fillText("[STEREO] CH-R", rightStartX + eqWidth, baseY + 18 * scale);
          ctx.shadowBlur = 0;
        }

        // Extended Advanced Styles (Plasma Orb, Galaxy, Lasers, Heartbeat, DNA, Matrix, Flames, Crystal, LoFi Rain, Retrowave)
        if (isExtendedVisualizerStyle(selectedStyle)) {
          renderExtendedVisualizerStyle({
            ctx,
            style: selectedStyle,
            width,
            height,
            scale,
            centerX,
            centerY,
            coverSize,
            currentTime: elapsed,
            dataArray,
            bufferLength,
            bassEnergy,
            bassNormalized: bassEnergy / 255,
            preset,
            showCover: showVideoCover,
            isPortrait,
          });
        }

        // Top Marquee with Track Title
        const marqueeH = (isPortrait ? 56 : 52) * scale;
        tickerX = (tickerX + 2.2 * scale) % (width * 2.2);
        ctx.fillStyle = "rgba(10, 10, 16, 0.9)";
        ctx.fillRect(0, 0, width, marqueeH);

        ctx.fillStyle = preset.accentColor;
        ctx.fillRect(0, marqueeH - 2 * scale, width, 2 * scale);

        // Display ONLY the song title of each track
        const prefix = isPortrait ? "📱 #Shorts ✦ " : "";
        const marqueeStr = `${prefix}🎵 ${currentPlayingTrack.title}   ✦   ${prefix}🎵 ${currentPlayingTrack.title}   ✦   `;
        ctx.font = `bold ${Math.round((isPortrait ? 20 : 22) * scale)}px 'Kantumruy Pro', sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
          marqueeStr,
          width - (tickerX % (ctx.measureText(marqueeStr).width + width)),
          marqueeH / 2 + 5 * scale
        );

        // Draw Streaming Platform Badges (YouTube, TikTok, Spotify, Apple Music, Amazon Music, LIVE)
        if (platformBadgesConfig && exportBadges && platformBadgesConfig.enabled) {
          ctx.save();
          renderPlatformBadgesOnCanvas({
            ctx,
            width,
            height,
            scale,
            currentTime: elapsed,
            config: platformBadgesConfig,
            isPortrait,
          });
          ctx.restore();
        }

        // Center Album Art (Only if showVideoCover is true)
        if (showVideoCover) {
          rotation += 0.02;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.beginPath();
          ctx.arc(0, 0, coverSize / 2, 0, Math.PI * 2);
          ctx.strokeStyle = preset.accentColor;
          ctx.lineWidth = 4 * scale;
          ctx.stroke();
          ctx.clip();
          ctx.rotate(rotation);
          if (curCover.complete && curCover.naturalWidth > 0) {
            ctx.drawImage(curCover, -coverSize / 2, -coverSize / 2, coverSize, coverSize);
          } else {
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-coverSize / 2, -coverSize / 2, coverSize, coverSize);
          }
          ctx.restore();
        }

        // Song Title & Artist Text (with RGB split if glitch)
        ctx.textAlign = "center";
        const titleFontSize = showVideoCover
          ? (isPortrait ? Math.round(30 * scale) : Math.round(28 * scale))
          : (isPortrait ? Math.round(38 * scale) : Math.round(34 * scale));
        ctx.font = `bold ${titleFontSize}px 'Kantumruy Pro', sans-serif`;
        const titleY = showVideoCover
          ? (isPortrait ? centerY + coverSize / 2 + 36 * scale : centerY + coverSize / 2 + 26 * scale)
          : (isPortrait ? centerY + 12 * scale : centerY + 8 * scale);

        if (selectedStyle === "glitch" && bassEnergy > 160) {
          ctx.fillStyle = "#00f0ff";
          ctx.fillText(currentPlayingTrack.title, centerX - 3 * scale, titleY);
          ctx.fillStyle = "#ff0055";
          ctx.fillText(currentPlayingTrack.title, centerX + 3 * scale, titleY);
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillText(currentPlayingTrack.title, centerX, titleY);

        const artistFontSize = isPortrait ? Math.round(18 * scale) : Math.round(15 * scale);
        ctx.font = `${artistFontSize}px 'Kantumruy Pro', sans-serif`;
        ctx.fillStyle = preset.accentColor;
        ctx.fillText(
          `${currentPlayingTrack.artist} • Track ${currentTrackIndex + 1} of ${exportTracks.length}`,
          centerX,
          titleY + (isPortrait ? 24 : 22) * scale
        );

        // Running Synchronized Karaoke Lyrics on Exported Video (CapCut Dynamic Bounce / CC)
        const trackAudioTime =
          audioEl && audioEl.currentTime > 0
            ? audioEl.currentTime
            : elapsed % (currentPlayingTrack.duration || 180);

        renderRunningLyricsOnCanvas({
          ctx,
          track: currentPlayingTrack,
          currentTime: trackAudioTime,
          duration: currentPlayingTrack.duration || durationToRecord,
          width,
          height,
          centerX,
          accentColor: preset.accentColor,
          bassEnergy,
          showLyrics: showVideoCaption,
          captionMode: videoCaptionMode,
        });

        // Progress Bar
        const pWidth = width * (isPortrait ? 0.88 : 0.65);
        const pX = (width - pWidth) / 2;
        const pY = height - (isPortrait ? 28 : 35) * scale;
        const pH = Math.max(4, 6 * scale);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(pX, pY, pWidth, pH);
        ctx.fillStyle = preset.accentColor;
        ctx.fillRect(pX, pY, pWidth * (elapsed / durationToRecord), pH);

        animationFrameRef.current = requestAnimationFrame(renderFrame);
      };

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    } catch (err: any) {
      console.error("Video export error:", err);
      setIsRecording(false);
      setStatusMessage("មានបញ្ហាក្នុងការ Render: " + err.message);
    }
  };

  // Stop recording immediately and produce video from recorded duration
  const finishAndExportNow = () => {
    if (elapsedTime < 3) {
      alert("សូមរង់ចាំយ៉ាងហោច 3 វិនាទីដើម្បីទទួលបានវីដេអូដែលមានទិន្នន័យគ្រប់គ្រាន់!");
      return;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (bgVideoElementRef.current) {
      bgVideoElementRef.current.pause();
    }
    setStatusMessage("បានបញ្ចប់ការថត! កំពុងខ្ចប់វីដេអូរួចជាស្រេច...");
  };

  const cancelExport = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (bgVideoElementRef.current) {
      bgVideoElementRef.current.pause();
    }
    setIsRecording(false);
    setStatusMessage("បានបោះបង់ការ Export");
  };

  // Re-export or change quality settings
  const handleResetForReExport = () => {
    setIsRecording(false);
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setProgress(0);
    setElapsedTime(0);
    setDownloadCount(0);
    setStatusMessage("");
  };

  const downloadVideo = () => {
    if (!recordedBlob) return;
    const activeRes =
      currentResolutionList.find((r) => r.id === selectedResolution) || currentResolutionList[0];
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.href = url;
    const trackCount = getTracksToExport().length;
    const safeTitle = (activeTrack?.title || "Khmer_Music").replace(/\s+/g, "_");
    const orientationTag = videoOrientation === "portrait" ? "Shorts_9x16" : "Landscape_16x9";
    a.download =
      exportMode === "all"
        ? `Full_Playlist_${trackCount}_Tracks_${orientationTag}_${activeRes.name.replace(/\s+/g, "_")}.webm`
        : `${safeTitle}_${orientationTag}_${activeRes.name.replace(/\s+/g, "_")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadCount((prev) => prev + 1);
  };

  const activeResObj =
    currentResolutionList.find((r) => r.id === selectedResolution) || currentResolutionList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/90 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Film className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ទាញចេញជាវីដេអូ YouTube & Shorts (Video Exporter)
              </h3>
              <p className="text-xs text-neutral-400">
                ⚡ Turbo Fast 1080p / 4K • បញ្ឈរ 9:16 Shorts & ផ្តេក 16:9 • Spectrum Bars • Karaoke Lyrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Mode Selection */}
          {!isRecording && !recordedVideoUrl && (
            <div className="space-y-4">
              {/* Orientation Switcher (Shorts 9:16 vs Landscape 16:9) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                    <span>ជ្រើសរើសទម្រង់វីដេអូ (Video Orientation & Format):</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      videoOrientation === "portrait"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {videoOrientation === "portrait" ? "📱 បញ្ឈរ 9:16 (Shorts)" : "🖥️ ផ្តេក 16:9 (YouTube)"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoOrientation("portrait")}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden flex items-start gap-3 ${
                      videoOrientation === "portrait"
                        ? "bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        videoOrientation === "portrait"
                          ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                          : "bg-neutral-900 text-neutral-400"
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">📱 បញ្ឈរ 9:16 (Shorts Video)</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300">
                          SHORTS
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-300/90 font-medium mt-0.5 leading-snug">
                        សម្រាប់ YouTube Shorts, TikTok, Facebook & IG Reels
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        1080×1920 Full HD • គាំទ្រ Karaoke CC & Visualizer
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoOrientation("landscape")}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden flex items-start gap-3 ${
                      videoOrientation === "landscape"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        videoOrientation === "landscape"
                          ? "bg-amber-400 text-black shadow-md shadow-amber-500/30 font-bold"
                          : "bg-neutral-900 text-neutral-400"
                      }`}
                    >
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">🖥️ ផ្តេក 16:9 (YouTube Video)</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                          STANDARD
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-300/90 font-medium mt-0.5 leading-snug">
                        សម្រាប់វីដេអូ YouTube ស្តង់ដារ, Smart TV & Computer
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        1920×1080 Full HD • 4K UHD 3840×2160
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* YouTube Shorts Duration Compliance Notice (≤ 3 minutes) */}
              {videoOrientation === "portrait" && (
                <div className="p-3 bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-purple-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs shrink-0 flex items-center gap-1 shadow-md shadow-rose-500/20">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>≤ 3 នាទី</span>
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>ស្តង់ដារ YouTube Shorts (កំណត់ត្រឹម 3 នាទី / 180 វិនាទី)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-mono font-bold">
                          Official Shorts Rule
                        </span>
                      </p>
                      <p className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">
                        YouTube Shorts អនុញ្ញាតត្រឹមអតិបរមា 3 នាទីចុះក្រោម (≤ 180s)។ រាល់វីដេអូបញ្ឈរ 9:16 ត្រូវបានកំណត់ត្រឹម 3 នាទីចុះក្រោមដោយស្វ័យប្រវត្តិ។
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Mode */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 block">
                    ជ្រើសរើសរយៈពេល ឬ ចំនួនបទ (Export Mode):
                  </label>
                  {videoOrientation === "portrait" && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      ⚡ Shorts Cap: Max 180s (3 នាទី)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => {
                      setExportMode("short");
                      setVideoOrientation("portrait");
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden ${
                      exportMode === "short"
                        ? videoOrientation === "portrait"
                          ? "bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/10"
                          : "bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/20"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded absolute top-2 right-2 flex items-center gap-0.5 ${
                        videoOrientation === "portrait"
                          ? "bg-rose-500 text-white"
                          : "bg-amber-400 text-black"
                      }`}
                    >
                      <Zap className="w-2.5 h-2.5" /> លឿនបំផុត
                    </span>
                    <p className="text-xs font-bold text-white flex items-center gap-1">
                      <span>⚡ គំរូ Shorts / Quick</span>
                    </p>
                    <p
                      className={`text-[11px] font-bold mt-0.5 ${
                        videoOrientation === "portrait" ? "text-rose-300" : "text-amber-400"
                      }`}
                    >
                      {quickShortSecs}s ({formatDuration(quickShortSecs)}) • ≤ 3 នាទី
                    </p>
                  </button>

                  <button
                    onClick={() => setExportMode("current")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      exportMode === "current"
                        ? videoOrientation === "portrait"
                          ? "bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/30"
                          : "bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/20"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <p className="text-xs font-bold text-white">
                      🎵 {videoOrientation === "portrait" && (activeTrack?.duration || 180) > 180 ? "មួយបទ (កាត់ 3mn)" : "មួយបទពេញ"}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {videoOrientation === "portrait"
                        ? `${formatDuration(Math.min(activeTrack?.duration || 180, 180))} • ${(activeTrack?.duration || 180) > 180 ? "Shorts Max 3 នាទី" : "ក្រោម 3 នាទី"}`
                        : `${formatDuration(activeTrack?.duration || 180)} • បទបច្ចុប្បន្ន`}
                    </p>
                  </button>

                  <button
                    onClick={() => setExportMode("mix")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      exportMode === "mix"
                        ? videoOrientation === "portrait"
                          ? "bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/30"
                          : "bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/20"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <p className="text-xs font-bold text-white">
                      🔥 {videoOrientation === "portrait" ? "3 បទ Shorts Medley" : "3 បទដំបូង"}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {videoOrientation === "portrait"
                        ? `${formatDuration(Math.min(tracks.slice(0, 3).reduce((a, b) => a + (b.duration || 180), 0), 180))} (កំណត់ត្រឹម 3mn)`
                        : `${Math.min(tracks.length, 3)} បទ Nonstop`}
                    </p>
                  </button>

                  <button
                    onClick={() => setExportMode("all")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden ${
                      exportMode === "all"
                        ? videoOrientation === "portrait"
                          ? "bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/30"
                          : "bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/20"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 absolute top-2 right-2">
                      {videoOrientation === "portrait" ? "≤ 3MN" : "FULL"}
                    </span>
                    <p className="text-xs font-bold text-white">
                      🎬 {videoOrientation === "portrait" ? "Shorts Highlight (3mn)" : "គ្រប់បទទាំងអស់"}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {videoOrientation === "portrait"
                        ? `កាត់ត្រឹម 3 នាទី (ប្តូរ 16:9 បើចង់បានវែង)`
                        : `${tracks.length} បទ (${formatDuration(tracks.reduce((sum, t) => sum + (t.duration || 180), 0))})`}
                    </p>
                  </button>
                </div>
              </div>

              {/* Sub-duration selector for Shorts & Quick Clips (15s to 180s / 3 minutes max) */}
              {(exportMode === "short" || videoOrientation === "portrait") && (
                <div
                  className={`p-3.5 rounded-2xl border space-y-2.5 animate-fade-in ${
                    videoOrientation === "portrait"
                      ? "bg-rose-500/10 border-rose-500/30"
                      : "bg-amber-500/10 border-amber-500/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg text-white font-bold ${
                          videoOrientation === "portrait" ? "bg-rose-500" : "bg-amber-400 text-black"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>រយៈពេលទាញយក Shorts (ត្រឹម 3 នាទីចុះក្រោម):</span>
                          <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-white font-mono font-bold">
                            ≤ 180 វិនាទី
                          </span>
                        </p>
                        <p className="text-[10px] text-neutral-300">
                          កំណត់ត្រឹម 3 នាទីចុះក្រោមសម្រាប់ YouTube Shorts, TikTok & IG Reels
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded border ${
                          videoOrientation === "portrait"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {quickShortSecs} វិនាទី ({formatDuration(quickShortSecs)})
                      </span>
                    </div>
                  </div>

                  {/* 6 Quick Preset Buttons up to 180s (3 minutes) */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {SHORTS_DURATION_OPTIONS.map((opt) => {
                      const isSelected = quickShortSecs === opt.seconds;
                      return (
                        <button
                          key={opt.seconds}
                          type="button"
                          onClick={() => setQuickShortSecs(opt.seconds)}
                          className={`p-2 rounded-xl text-center transition cursor-pointer border relative ${
                            isSelected
                              ? videoOrientation === "portrait"
                                ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30 scale-105 font-black ring-1 ring-white/40"
                                : "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/30 scale-105 font-black"
                              : "bg-neutral-900/90 text-neutral-300 border-neutral-700 hover:border-neutral-500 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-black">{opt.label}</div>
                          <div className="text-[9px] opacity-80 mt-0.5">{opt.sub}</div>
                          {opt.isMax && (
                            <span className="absolute -top-1.5 -right-1 text-[8px] bg-amber-400 text-black font-extrabold px-1 rounded-full shadow">
                              MAX
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Duration Slider (10s to 180s) */}
                  <div className="pt-2 border-t border-white/10 flex items-center gap-3">
                    <span className="text-[10px] text-neutral-400 font-mono">10s</span>
                    <input
                      type="range"
                      min={10}
                      max={MAX_SHORTS_DURATION_SECONDS}
                      step={5}
                      value={quickShortSecs}
                      onChange={(e) => setQuickShortSecs(Number(e.target.value))}
                      className={`flex-1 cursor-pointer h-1.5 rounded-lg bg-neutral-800 ${
                        videoOrientation === "portrait" ? "accent-rose-500" : "accent-amber-400"
                      }`}
                    />
                    <span className="text-[10px] text-neutral-300 font-mono font-bold">
                      180s (3mn MAX)
                    </span>
                  </div>
                </div>
              )}

              {/* Visualizer Animation Style for Export */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 block">
                    ម៉ូត Visualizer Animation ក្នុងវីដេអូ ({VISUALIZER_STYLES.length} Styles):
                  </label>
                  <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {VISUALIZER_STYLES.find((s) => s.id === selectedStyle)?.nameKhmer}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {VISUALIZER_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                        selectedStyle === style.id
                          ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/10"
                          : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                          {style.badge}
                        </span>
                      </div>
                      <div className="text-xs font-bold truncate text-white">
                        {style.nameKhmer}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {style.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Placement / Traveling Motion Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>ទីតាំង និងចលនារូប Cover (មិនបាំងមុខ Background):</span>
                  </label>
                  <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {coverPositionMode === "glide_to_bottom"
                      ? "រត់ចុះដល់ក្រោមទៅមក"
                      : coverPositionMode === "bottom_fixed"
                      ? "នៅខាងក្រោមរហូត"
                      : "នៅចំកណ្តាល"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoverPositionMode("glide_to_bottom")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                      coverPositionMode === "glide_to_bottom"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/10"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        ⚡ ណែនាំ (RECOMMENDED)
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      រត់ចុះដល់ក្រោមទៅមក
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      អណ្តែតចុះដល់ក្រោម មិនបាំងមុខ Background
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoverPositionMode("bottom_fixed")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                      coverPositionMode === "bottom_fixed"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/10"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                        ⬇️ FIXED
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      នៅខាងក្រោមរហូត
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      នៅផ្នែកខាងក្រោម 100% ឃើញមុខច្បាស់
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoverPositionMode("center")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                      coverPositionMode === "center"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/10"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                        ⏹️ CLASSIC
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      នៅចំកណ្តាល
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      ស្ទីលធម្មតានៅចំកណ្តាលអេក្រង់
                    </div>
                  </button>
                </div>
              </div>

              {/* Background Media Status (Video vs Image) */}
              <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {customBgVideoUrl ? (
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Film className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <ImageIcon className="w-4 h-4" />
                    </span>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>ផ្ទាំងសាវតារវីដេអូ:</span>
                      {customBgVideoUrl ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span>🎬 ផ្ទៃខាងក្រោយវីដេអូមានចលនា</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                            VIDEO MOTION
                          </span>
                        </span>
                      ) : (
                        <span className="text-amber-300 font-bold flex items-center gap-1.5">
                          <span>🖼️ រូបភាពសន្លឹក ({preset.nameKhmer})</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                            IMAGE
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {customBgVideoUrl
                        ? "វីដេអូផ្ទៃក្រោយមានចលនានឹងត្រូវ Render ចូលក្នុងវីដេអូដែល Export ចេញ 100% ស្អាតឥតខ្ចោះ"
                        : "រូបភាពសាវតារទេសភាពនឹងត្រូវដាក់ជាផ្ទៃខាងក្រោយវីដេអូ"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Brightness & Lighting Mode */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                    <span>កម្រិតពន្លឺរូប Background (Brightness & Clarity):</span>
                  </label>
                  <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {backgroundBrightness === "original"
                      ? "🌟 ពន្លឺដើម 100% (Original)"
                      : backgroundBrightness === "soft"
                      ? "🎬 ពន្លឺស្រទន់ (Soft)"
                      : "🌙 Focus Dim"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBackgroundBrightness("original")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                      backgroundBrightness === "original"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/10"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>🌟</span>
                      <span>ពន្លឺដើម 100%</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      រក្សាពន្លឺ និងពណ៌ធម្មជាតិដូចរូបថតដើម 100%
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBackgroundBrightness("soft")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                      backgroundBrightness === "soft"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/10"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>🎬</span>
                      <span>ពន្លឺស្រទន់</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      ពន្លឺបែបភាពយន្តស្រាលៗ
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBackgroundBrightness("dimmed")}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                      backgroundBrightness === "dimmed"
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/10"
                        : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>🌙</span>
                      <span>Focus Dim</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      បន្ថយពន្លឺសម្រាប់ Neon Glow
                    </div>
                  </button>
                </div>
              </div>

              {/* Resolution Quality Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    {videoOrientation === "portrait" ? (
                      <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Monitor className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>
                      កម្រិតគុណភាពវីដេអូ ({videoOrientation === "portrait" ? "Shorts បញ្ឈរ" : "វីដេអូផ្តេក"}):
                    </span>
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      videoOrientation === "portrait"
                        ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {activeResObj.name} ({activeResObj.resolutionText})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentResolutionList.map((res) => {
                    const isSelected = selectedResolution === res.id;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setSelectedResolution(res.id)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer relative ${
                          isSelected
                            ? videoOrientation === "portrait"
                              ? "bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/30 shadow-md shadow-rose-500/15"
                              : "bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/25 shadow-md shadow-amber-500/10"
                            : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                        }`}
                      >
                        {res.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded absolute top-1.5 right-1.5 ${
                              res.id === "1080p"
                                ? videoOrientation === "portrait"
                                  ? "bg-rose-500 text-white shadow-sm font-black"
                                  : "bg-amber-400 text-black shadow-sm font-black"
                                : "bg-neutral-800 text-neutral-300"
                            }`}
                          >
                            {res.badge}
                          </span>
                        )}
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>{res.name}</span>
                        </div>
                        <div className="text-[10px] text-neutral-300 font-mono mt-0.5">
                          {res.resolutionText}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1 line-clamp-2">
                          {res.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Song Lyric Karaoke & CapCut Auto Captions on Video Toggle */}
              <div className="p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40">
                      <Zap className="w-4 h-4 fill-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Caption ទំនុកច្រៀងលើវីដេអូ (CapCut Auto Subtitle)</span>
                        <span className="text-[10px] bg-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded font-mono font-black border border-amber-500/30">
                          {showVideoCaption ? "✓ ជាប់លើវីដេអូ 100%" : "បិទ"}
                        </span>
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        អក្សរលោតតាមសម្លេងច្រៀងជាក់ស្តែង Render ជាប់លើវីដេអូស្រេច (Burned-in Captions)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVideoCaption(!showVideoCaption)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer active:scale-95 ${
                      showVideoCaption
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 shadow-md shadow-amber-500/20"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                    }`}
                  >
                    {showVideoCaption ? "✓ បើក (ON)" : "បិទ (OFF)"}
                  </button>
                </div>

                {showVideoCaption && (
                  <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                    <span className="text-[11px] text-neutral-400 block font-semibold">
                      ម៉ូត Caption & ស្ទីលលោត CapCut លើវីដេអូ:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full">
                      {[
                        { id: "capcut_bounce" as CaptionMode, label: "⚡ CapCut Bounce", desc: "លោតតាមពាក្យច្រៀង" },
                        { id: "capcut_highlight" as CaptionMode, label: "🟨 CapCut Highlight", desc: "ប្រអប់លោតតាមពាក្យ" },
                        { id: "capcut_tiktok_kinetic" as CaptionMode, label: "🔥 TikTok Kinetic", desc: "អក្សរធំលោតខ្លាំង" },
                        { id: "capcut_karaoke_glow" as CaptionMode, label: "✨ Neon Glow", desc: "រលកពន្លឺរត់តាមពាក្យ" },
                        { id: "youtube_cc" as CaptionMode, label: "YouTube CC", desc: "ប្រអប់ខ្មៅ YouTube" },
                        { id: "karaoke_box" as CaptionMode, label: "Studio Box", desc: "កាតកញ្ចក់ Glow" },
                        { id: "subtitles_clean" as CaptionMode, label: "Cinematic", desc: "អក្សរស្រមោលគ្មានប្រអប់" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setVideoCaptionMode(mode.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-left transition cursor-pointer ${
                            videoCaptionMode === mode.id
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10"
                              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="text-[11px]">{mode.label}</div>
                          <div className="text-[9px] opacity-75">{mode.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Song Cover (Album Art Disc) on Video Toggle */}
              <div className="p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40">
                    <Disc className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>រូប Cover ចម្រៀងលើវីដេអូ (Album Art Disc)</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-black border ${showVideoCover ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`}>
                        {showVideoCover ? "✓ បើក (Show)" : "✕ បិទ (Hide)"}
                      </span>
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {showVideoCover
                        ? "បង្ហាញរូបថាសចម្រៀងវិលជុំវិញលើវីដេអូ"
                        : "លាក់រូប Cover បង្ហាញតែ Background, អក្សរ និងរលកភ្លេង (Minimal / Clean Background)"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVideoCover(!showVideoCover)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer active:scale-95 ${
                    showVideoCover
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-black border-cyan-300 shadow-md shadow-cyan-500/20"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                  }`}
                >
                  {showVideoCover ? "✓ បើក (ON)" : "បិទ (OFF)"}
                </button>
              </div>

              {/* Streaming Platform Badges on Video Toggle */}
              {platformBadgesConfig && (
                <div className="p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 via-pink-500/20 to-sky-500/20 text-white border border-neutral-700">
                      <Globe className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Streaming Badges (YouTube, TikTok, Spotify, Apple Music, LIVE)</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-black border ${exportBadges && platformBadgesConfig.enabled ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
                          {exportBadges && platformBadgesConfig.enabled ? "✓ ជាប់លើវីដេអូ" : "✕ បិទ"}
                        </span>
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Render ឡូហ្គោបណ្តាញសង្គម និងស្លាកផ្សាយផ្ទាល់ ជាប់លើវីដេអូ Export ស្រេច
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExportBadges(!exportBadges)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer active:scale-95 ${
                      exportBadges && platformBadgesConfig.enabled
                        ? "bg-gradient-to-r from-red-500 via-pink-500 to-sky-400 text-black border-pink-300 shadow-md shadow-pink-500/20"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                    }`}
                  >
                    {exportBadges && platformBadgesConfig.enabled ? "✓ បើក (ON)" : "បិទ (OFF)"}
                  </button>
                </div>
              )}

              {/* Tracks to Export Summary */}
              <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    {getTracksToExport()
                      .slice(0, 4)
                      .map((t, idx) => (
                        <img
                          key={idx}
                          src={t.coverUrl}
                          alt={t.title}
                          className="w-8 h-8 rounded-full border-2 border-neutral-900 object-cover"
                        />
                      ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {exportMode === "all"
                        ? `បញ្ចូល ${getTracksToExport().length} បទទាំងអស់ ចូលគ្នាតែមួយវីដេអូ`
                        : activeTrack?.title}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {exportMode === "all"
                        ? `វីដេអូរួមចម្រៀងពេញលេញសម្រាប់ Playlist Compilation`
                        : `${activeTrack?.artist} • ទម្រង់ ${videoOrientation === "portrait" ? "Shorts បញ្ឈរ" : "វីដេអូផ្តេក"}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
                  {formatDuration(getSelectedDuration())}
                </span>
              </div>
            </div>
          )}

          {/* Hidden export canvas where rendering happens */}
          <canvas
            ref={exportCanvasRef}
            width={activeResObj.width}
            height={activeResObj.height}
            className="hidden"
          />

          {/* Recording in Progress */}
          {isRecording && (
            <div className="p-6 bg-neutral-950 rounded-2xl border border-amber-500/30 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {videoOrientation === "portrait"
                    ? "កំពុង Render វីដេអូបញ្ឈរ YouTube Shorts / TikTok..."
                    : "កំពុង Render វីដេអូសម្រាប់ YouTube..."}
                </h4>
                <p className="text-xs text-neutral-400 mt-1">{statusMessage}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    videoOrientation === "portrait"
                      ? "bg-gradient-to-r from-rose-500 to-red-400"
                      : "bg-gradient-to-r from-amber-500 to-amber-300"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs font-mono text-neutral-400">
                <span>ដំណើរការ: {progress}%</span>
                <span>
                  {formatDuration(elapsedTime)} / {formatDuration(targetDuration)}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={finishAndExportNow}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  title="ទាញយកវីដេអូភ្លាមៗតាមរយៈពេលដែលបាន Render រួច"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>រួចរាល់ & ទាញយកភ្លាម (Finish & Download Now)</span>
                </button>

                <button
                  onClick={cancelExport}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
              </div>
            </div>
          )}

          {/* Completed Video Preview */}
          {recordedVideoUrl && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>វីដេអូបាន Render រួចរាល់! ត្រៀមរួចជាស្រេចសម្រាប់ទាញយក និងបង្ហោះ YouTube</span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                    videoOrientation === "portrait"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {videoOrientation === "portrait" ? "📱 Shorts (9:16)" : "🖥️ 16:9"} • {activeResObj.name}
                </span>
              </div>

              <div
                className={`relative rounded-2xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center ${
                  videoOrientation === "portrait"
                    ? "aspect-[9/16] max-h-[460px] mx-auto shadow-2xl shadow-rose-950/20"
                    : "aspect-video w-full shadow-2xl"
                }`}
              >
                <video
                  src={recordedVideoUrl}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                />
              </div>

              {/* Re-download notice if already downloaded */}
              {downloadCount > 0 && (
                <div className="p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>បានទាញយកវីដេអូ {downloadCount} ដងរួចរាល់។ អ្នកអាចចុច <b>ទាញយកម្ដងទៀត</b> បានគ្រប់ពេល។</span>
                  </div>
                  <button
                    onClick={downloadVideo}
                    className="text-amber-400 hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>ទាញម្តងទៀត</span>
                  </button>
                </div>
              )}

              {/* Action buttons with Re-download and Re-export */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={downloadVideo}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 text-black font-bold rounded-2xl text-sm transition shadow-lg active:scale-95 cursor-pointer ${
                    videoOrientation === "portrait"
                      ? "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 shadow-rose-500/20 text-white"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20"
                  }`}
                >
                  {downloadCount > 0 ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>ទាញយកម្ដងទៀត ({videoOrientation === "portrait" ? "Shorts Video" : "Re-download"})</span>
                      <span className="text-[10px] bg-black/25 font-extrabold px-1.5 py-0.5 rounded font-mono">
                        #{downloadCount + 1}
                      </span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>ទាញយកវីដេអូ {videoOrientation === "portrait" ? "Shorts (9:16)" : "(Download Video)"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetForReExport}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-2xl text-xs border border-neutral-700 transition cursor-pointer active:scale-95"
                  title="កំណត់ និង Export វីដេអូម្ដងទៀត"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Export ម្ដងទៀត (Re-Export)</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenYouTubeAutomation(recordedBlob || undefined);
                  }}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 font-semibold rounded-2xl text-xs border border-neutral-700 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI SEO & បង្ហោះ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isRecording && !recordedVideoUrl && (
          <div className="sticky bottom-0 z-10 px-6 py-4 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              បិទ
            </button>
            <button
              onClick={startExport}
              className={`flex items-center space-x-2 px-5 py-2.5 font-bold rounded-xl text-xs transition shadow-lg active:scale-95 cursor-pointer ${
                videoOrientation === "portrait"
                  ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/20"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20"
              }`}
            >
              {videoOrientation === "portrait" ? (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>ចាប់ផ្តើមទាញចេញវីដេអូ Shorts (9:16)</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>ចាប់ផ្តើមទាញចេញវីដេអូ (Start Export 16:9)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
