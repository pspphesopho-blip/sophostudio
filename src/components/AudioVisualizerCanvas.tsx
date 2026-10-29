import React, { useEffect, useRef, useState } from "react";
import { SongTrack, VisualizerPreset, VisualizerStyle, CaptionMode, CoverPositionMode, PlatformBadgesConfig, BackgroundBrightnessMode } from "../types";
import {
  Disc,
  Sparkles,
  Zap,
  BarChart2,
  Layers,
  MessageSquare,
  Mic2,
  Radio,
  Waves,
  Disc3,
  Box,
  Activity,
  Sliders,
  Subtitles,
  ArrowDownUp,
  Video as VideoIcon,
  Loader2,
  Globe,
  Flame,
  Heart,
  Orbit,
  Sun,
  CloudRain,
  Gem,
  Dna,
  Binary,
  Target,
  CircleDot,
  SunMedium,
} from "lucide-react";
import { getDistinctCoverForTrack } from "../utils/audioSynthesizer";
import { VISUALIZER_STYLES } from "../utils/visualizerStyles";
import { renderRunningLyricsOnCanvas } from "../utils/lyricsCanvasRenderer";
import { renderPlatformBadgesOnCanvas } from "../utils/platformBadgesRenderer";
import { isExtendedVisualizerStyle, renderExtendedVisualizerStyle } from "../utils/visualizerAnimationStylesRenderer";
import { renderImageBackgroundOnCanvas, renderVideoBackgroundOnCanvas } from "../utils/backgroundRenderer";
import { parseLRC, getActiveLyric } from "../utils/lyricsParser";

interface AudioVisualizerCanvasProps {
  currentTrack: SongTrack | null;
  nextTrack: SongTrack | null;
  preset: VisualizerPreset;
  customBgUrl?: string;
  customBgVideoUrl?: string;
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  aspectRatio?: "16:9" | "1:1";
  showOverlayText?: boolean;
  visualizerStyle?: VisualizerStyle;
  onCycleVisualizerStyle?: () => void;
  showCaption?: boolean;
  captionMode?: CaptionMode;
  onToggleCaption?: () => void;
  onCycleCaptionMode?: () => void;
  onOpenLyricEditor?: () => void;
  showCover?: boolean;
  onToggleCover?: () => void;
  coverPositionMode?: CoverPositionMode;
  onCycleCoverPosition?: () => void;
  onGenerateCapCutCaption?: () => void;
  isGeneratingCaption?: boolean;
  platformBadgesConfig?: PlatformBadgesConfig;
  onOpenPlatformBadgesModal?: () => void;
  backgroundBrightnessMode?: BackgroundBrightnessMode;
  onCycleBackgroundBrightness?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  size: number;
  alpha: number;
  color: string;
  angle: number;
  dist: number;
  radialSpeed: number;
  pulsePhase: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  speed: number;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  currentTrack,
  nextTrack,
  preset,
  customBgUrl,
  customBgVideoUrl,
  analyser,
  isPlaying,
  currentTime,
  duration,
  canvasRef,
  showOverlayText = true,
  visualizerStyle = "bars",
  onCycleVisualizerStyle,
  showCaption = true,
  captionMode = "youtube_cc",
  onToggleCaption,
  onCycleCaptionMode,
  onOpenLyricEditor,
  showCover = true,
  onToggleCover,
  coverPositionMode: propCoverPositionMode,
  onCycleCoverPosition,
  onGenerateCapCutCaption,
  isGeneratingCaption,
  platformBadgesConfig,
  onOpenPlatformBadgesModal,
  backgroundBrightnessMode = "original",
  onCycleBackgroundBrightness,
}) => {
  const [internalCoverPosition, setInternalCoverPosition] = useState<CoverPositionMode>("glide_to_bottom");
  const coverPositionMode = propCoverPositionMode || internalCoverPosition;
  const coverPositionModeRef = useRef<CoverPositionMode>(coverPositionMode);
  coverPositionModeRef.current = coverPositionMode;

  const handleCycleCoverPosition = onCycleCoverPosition || (() => {
    setInternalCoverPosition((prev) =>
      prev === "glide_to_bottom"
        ? "bottom_fixed"
        : prev === "bottom_fixed"
        ? "center"
        : "glide_to_bottom"
    );
  });

  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const coverImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const tickerOffsetRef = useRef<number>(0);
  const rotationAngleRef = useRef<number>(0);
  const cyberHudAngleRef = useRef<number>(0);
  // Rhythmic floating & bobbing movement: Cover floats down all the way to the bottom and returns back
  const coverBobPhaseRef = useRef<number>(0);
  const currentCoverBobYRef = useRef<number | null>(null);

  // Persistent Particle & Effect Pools
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const lastShockwaveTimeRef = useRef<number>(0);
  const glitchTriggerRef = useRef<{ active: boolean; intensity: number; frame: number }>({
    active: false,
    intensity: 0,
    frame: 0,
  });

  // Sleek percentage calculation of active lyric line duration during playback
  const activeLyricProgressPct = React.useMemo(() => {
    if (!currentTrack) return 0;
    let lines = currentTrack.parsedLyrics || [];
    if (lines.length === 0 && currentTrack.lyrics) {
      lines = parseLRC(currentTrack.lyrics);
    }
    const info = getActiveLyric(lines, currentTime, duration);
    return Math.min(100, Math.max(0, Math.round(info.progress * 100)));
  }, [currentTrack, currentTime, duration]);

  // Background is strictly the stage/visual wallpaper (custom or preset)
  const activeBg = customBgUrl || preset.bgUrl;

  // Load Background Image (Landscape / Ambient Stage)
  useEffect(() => {
    if (!activeBg) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeBg;
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, [activeBg]);

  // Load & Manage Background Video Element
  useEffect(() => {
    if (!customBgVideoUrl) {
      if (bgVideoRef.current) {
        bgVideoRef.current.pause();
        bgVideoRef.current.removeAttribute("src");
        bgVideoRef.current.load();
        bgVideoRef.current = null;
      }
      return;
    }

    let vid = bgVideoRef.current;
    if (!vid) {
      vid = document.createElement("video");
      vid.crossOrigin = "anonymous";
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      vid.autoplay = true;
      bgVideoRef.current = vid;
    }

    vid.src = customBgVideoUrl;
    vid.load();
    if (isPlaying) {
      vid.play().catch(() => {});
    }

    return () => {
      if (vid) {
        vid.pause();
      }
    };
  }, [customBgVideoUrl]);

  // Synchronize Background Video play/pause with Audio
  useEffect(() => {
    const vid = bgVideoRef.current;
    if (!vid) return;
    if (isPlaying) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isPlaying]);

  // Load Album Cover Image (Singer / Song Art - always distinct from Background)
  useEffect(() => {
    const coverSrc = getDistinctCoverForTrack(currentTrack, activeBg);
    if (!coverSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = coverSrc;
    img.onload = () => {
      coverImageRef.current = img;
    };
  }, [currentTrack?.coverUrl, activeBg]);

  // Initialize particles once
  useEffect(() => {
    const particles: Particle[] = [];
    const colors = [
      preset.accentColor,
      preset.barColor || "#06b6d4",
      "#f59e0b",
      "#38bdf8",
      "#ec4899",
      "#a855f7",
    ];

    for (let i = 0; i < 90; i++) {
      const isRadial = i < 50;
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 450;
      particles.push({
        x: 640 + Math.cos(angle) * dist,
        y: 288 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        baseSize: Math.random() * 3.5 + 1.5,
        size: 3,
        alpha: Math.random() * 0.7 + 0.25,
        color: colors[i % colors.length],
        angle,
        dist,
        radialSpeed: Math.random() * 1.8 + 0.8,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;
  }, [preset]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let dataArray: Uint8Array;
    let bufferLength = 64;

    if (analyser) {
      analyser.fftSize = 128;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    } else {
      dataArray = new Uint8Array(bufferLength);
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const isVertical = height > width;

      // Vertical positions:
      // topCenterY: Upper area (height * 0.28 on landscape, height * 0.22 on portrait)
      // bottomCenterY: All the way down to bottom (height * 0.67), completely clearing background face!
      const topCenterY = isVertical ? height * 0.22 : height * 0.28;
      const bottomCenterY = isVertical ? height * 0.67 : height * 0.67;
      const fullTravelDistance = bottomCenterY - topCenterY;
      const coverSize = isVertical ? Math.min(width * 0.50, 300) : Math.min(160, height * 0.30);

      // Update ticker offset & rotation angles
      if (isPlaying) {
        tickerOffsetRef.current = (tickerOffsetRef.current + 1.8) % (width * 2);
        rotationAngleRef.current += 0.015;
        cyberHudAngleRef.current -= 0.01;
      }

      // 1. Audio Frequency Data Analysis
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray as any);
      } else if (isPlaying) {
        // Simulated rhythmic bounce if audio is running without Web Audio analyzer hookup
        const time = Date.now() / 180;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(
            55 + Math.sin(time + i * 0.3) * 45 + Math.cos(time * 0.7 + i * 0.2) * 35
          );
        }
      } else {
        // Idle gentle waveform
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 12;
        }
      }

      // Compute energy metrics
      let bassSum = 0;
      for (let i = 0; i < 6; i++) bassSum += dataArray[i] || 0;
      const bassEnergy = bassSum / 6; // 0 - 255
      const bassNormalized = Math.min(1, bassEnergy / 230);

      // 2. Rhythmic Floating / Traveling Oscillation: Cover travels all the way down to bottom (ដល់ក្រោម)
      // and returns to original place back and forth, preventing blocking the background face
      let targetCenterY: number;
      const activeMode = coverPositionModeRef.current;

      if (activeMode === "bottom_fixed") {
        // Stays fixed down at bottom (never covers background face) with gentle music breathing
        const pulse = isPlaying ? Math.sin(Date.now() / 360) * (3 + bassNormalized * 5) : 0;
        targetCenterY = bottomCenterY + pulse;
      } else if (activeMode === "center") {
        // Classic center
        const pulse = isPlaying ? Math.sin(Date.now() / 360) * (3 + bassNormalized * 5) : 0;
        targetCenterY = height * 0.40 + pulse;
      } else {
        // "glide_to_bottom" (default):
        // When playing music, smoothly glide all the way down to bottomCenterY (មកដល់ក្រោម)
        // and return back to topCenterY in a smooth, majestic cycle
        if (isPlaying) {
          // Period ~6.5s
          coverBobPhaseRef.current += 0.016 + bassNormalized * 0.005;
          // 0.0 (top) -> 1.0 (reaches all the way to the bottom!) -> 0.0 (top)
          const downwardProgress = (1 - Math.cos(coverBobPhaseRef.current)) / 2;
          targetCenterY = topCenterY + downwardProgress * fullTravelDistance;
        } else {
          // When paused, settle down at bottomCenterY so user can enjoy the unobstructed background face
          targetCenterY = bottomCenterY;
        }
      }

      if (currentCoverBobYRef.current === null) {
        currentCoverBobYRef.current = targetCenterY;
      } else {
        // Buttery smooth lerp
        currentCoverBobYRef.current += (targetCenterY - currentCoverBobYRef.current) * 0.10;
      }
      const centerY = currentCoverBobYRef.current;

      let totalSum = 0;
      for (let i = 0; i < bufferLength; i++) totalSum += dataArray[i] || 0;
      const avgEnergy = totalSum / bufferLength;

      // Update Glitch Trigger on Bass Transients
      if (visualizerStyle === "glitch" && isPlaying) {
        if (bassEnergy > 165 && Math.random() < 0.25) {
          glitchTriggerRef.current = {
            active: true,
            intensity: Math.min(1.5, bassNormalized * 1.8),
            frame: 6,
          };
        } else if (glitchTriggerRef.current.frame > 0) {
          glitchTriggerRef.current.frame--;
          if (glitchTriggerRef.current.frame === 0) {
            glitchTriggerRef.current.active = false;
          }
        }
      } else {
        glitchTriggerRef.current.active = false;
      }

      // 2. Draw Background (Video if active, otherwise Image Preset with full screen fit and 100% original brightness)
      let bgDrawn = false;

      if (customBgVideoUrl && bgVideoRef.current && bgVideoRef.current.readyState >= 2) {
        renderVideoBackgroundOnCanvas(ctx, bgVideoRef.current, width, height, backgroundBrightnessMode);
        bgDrawn = true;
      } else if (bgImageRef.current && bgImageRef.current.complete) {
        renderImageBackgroundOnCanvas(ctx, bgImageRef.current, width, height, backgroundBrightnessMode);
        bgDrawn = true;
      }

      if (!bgDrawn) {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, "#090d16");
        bgGrad.addColorStop(0.5, "#131b2e");
        bgGrad.addColorStop(1, "#08090d");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. STYLE: PARTICLES & NEBULA EFFECT (Active on 'particles' or 'hybrid')
      if (visualizerStyle === "particles" || visualizerStyle === "hybrid") {
        // Spawn Shockwave on strong bass kick
        const now = Date.now();
        if (
          isPlaying &&
          bassEnergy > 160 &&
          now - lastShockwaveTimeRef.current > 260 &&
          shockwavesRef.current.length < 5
        ) {
          lastShockwaveTimeRef.current = now;
          shockwavesRef.current.push({
            x: centerX,
            y: centerY,
            radius: coverSize / 2 + 5,
            maxRadius: width * 0.48,
            alpha: 0.85,
            color: preset.accentColor,
            speed: 5 + bassNormalized * 6,
          });
        }

        // Draw and update Shockwaves
        for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
          const sw = shockwavesRef.current[i];
          sw.radius += sw.speed;
          sw.alpha *= 0.94;

          if (sw.radius < sw.maxRadius && sw.alpha > 0.02) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = sw.color;
            ctx.globalAlpha = sw.alpha;
            ctx.lineWidth = Math.max(1, 4 * sw.alpha);
            ctx.shadowBlur = 15;
            ctx.shadowColor = sw.color;
            ctx.stroke();
            ctx.restore();
          } else {
            shockwavesRef.current.splice(i, 1);
          }
        }

        // Update and draw Particles
        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (isPlaying) {
            // Radial movement expanding from center
            p.dist += p.radialSpeed * (1 + bassNormalized * 2.2);
            p.angle += 0.003;
            if (p.dist > width * 0.58) {
              p.dist = coverSize / 2 + 10 + Math.random() * 40;
              p.angle = Math.random() * Math.PI * 2;
            }

            p.x = centerX + Math.cos(p.angle) * p.dist;
            p.y = centerY + Math.sin(p.angle) * p.dist * 0.75; // Oval perspective

            // Pulse particle size with local frequency
            const freqVal = dataArray[i % bufferLength] || 15;
            p.size = p.baseSize * (1 + (freqVal / 255) * 1.7);
          }

          // Draw Glowing Particle
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, p.alpha * (0.6 + bassNormalized * 0.6));
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();

          // Particle Constellation Connecting Lines (subtle glowing web)
          if (visualizerStyle === "particles" && i % 3 === 0) {
            for (let j = i + 1; j < Math.min(particles.length, i + 8); j++) {
              const p2 = particles[j];
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const distSq = dx * dx + dy * dy;
              if (distSq < 4800) {
                const lineAlpha = (1 - Math.sqrt(distSq) / 70) * 0.25 * (0.5 + bassNormalized);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = preset.accentColor;
                ctx.globalAlpha = Math.max(0, lineAlpha);
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;
              }
            }
          }
        }
      }

      // 4. STYLE: CYBER GLITCH EFFECT (Active on 'glitch')
      if (visualizerStyle === "glitch") {
        const isGlitching = glitchTriggerRef.current.active;
        const glitchIntensity = glitchTriggerRef.current.intensity;

        // Draw 360-Degree Radial Frequency Spikes around the Vinyl Core
        const radialBarCount = 64;
        const innerRadius = coverSize / 2 + 10;

        ctx.save();
        ctx.translate(centerX, centerY);

        for (let i = 0; i < radialBarCount; i++) {
          const angle = (i / radialBarCount) * Math.PI * 2 + cyberHudAngleRef.current;
          const bin = Math.floor((i / radialBarCount) * (bufferLength * 0.8));
          const val = dataArray[bin] || 10;
          const spikeLen = Math.max(4, (val / 255) * 65 * (1 + (isGlitching ? 0.4 : 0)));

          const x1 = Math.cos(angle) * innerRadius;
          const y1 = Math.sin(angle) * innerRadius;
          const x2 = Math.cos(angle) * (innerRadius + spikeLen);
          const y2 = Math.sin(angle) * (innerRadius + spikeLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = i % 2 === 0 ? preset.accentColor : "#06b6d4";
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
        }

        // Draw Rotating Cyber HUD Reticle Rings
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius + 75, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([14, 10, 4, 10]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Outer Cyber Bracket Arcs
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius + 95, -Math.PI * 0.25, Math.PI * 0.25);
        ctx.arc(0, 0, innerRadius + 95, Math.PI * 0.75, Math.PI * 1.25);
        ctx.strokeStyle = isGlitching ? "#ff0055" : "rgba(245, 158, 11, 0.6)";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        // Horizontal Glitch Scanlines & Slice Shifts
        if (isGlitching) {
          // Horizontal RGB Slice Displacement
          const numSlices = 3;
          for (let s = 0; s < numSlices; s++) {
            const sliceY = centerY - 100 + Math.random() * 200;
            const sliceH = 14 + Math.random() * 22;
            const sliceOffset = (Math.random() - 0.5) * 36 * glitchIntensity;

            ctx.fillStyle = s % 2 === 0 ? "rgba(0, 240, 255, 0.18)" : "rgba(255, 0, 85, 0.18)";
            ctx.fillRect(0, sliceY, width, sliceH);

            // Digital noise blocks
            const blockW = 40 + Math.random() * 120;
            const blockX = Math.random() * (width - blockW);
            ctx.fillStyle = s % 2 === 0 ? "rgba(0, 240, 255, 0.55)" : "rgba(255, 0, 85, 0.55)";
            ctx.fillRect(blockX + sliceOffset, sliceY, blockW, sliceH);
          }
        }

        // Cyber Scanlines Overlay across canvas
        ctx.fillStyle = "rgba(0, 240, 255, 0.03)";
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1);
        }

        // Cyber HUD Meta Labels
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = isGlitching ? "#ff0055" : "rgba(6, 182, 212, 0.85)";
        ctx.textAlign = "left";
        ctx.fillText(`[SYS.GLITCH_MOD // ${isGlitching ? "ANOMALY DETECTED" : "LOCKED"}]`, 20, height - 52);
        ctx.textAlign = "right";
        ctx.fillText(`FREQ: ${(bassEnergy * 2.4).toFixed(1)}Hz // RGB_SYNC: ON`, width - 20, height - 52);
      }

      // 5. STYLE: CLASSIC SPECTRUM BARS (Active on 'bars' or 'hybrid')
      if (visualizerStyle === "bars" || visualizerStyle === "hybrid") {
        const numBars = 48;
        const barWidth = Math.max(3, (width - numBars * 4) / numBars);
        const barSpacing = 4;
        const totalSpectrumWidth = numBars * (barWidth + barSpacing);
        const startX = (width - totalSpectrumWidth) / 2;
        const baseY = height * 0.76;

        ctx.shadowBlur = 12;
        ctx.shadowColor = preset.accentColor;

        for (let i = 0; i < numBars; i++) {
          const binIndex = Math.floor((i / numBars) * (bufferLength * 0.85));
          const val = dataArray[binIndex] || 10;
          const normalized = val / 255;
          const barHeight = Math.max(4, normalized * (height * (visualizerStyle === "hybrid" ? 0.24 : 0.32)));

          const x = startX + i * (barWidth + barSpacing);
          const y = baseY - barHeight;

          const barGrad = ctx.createLinearGradient(x, y, x, baseY);
          barGrad.addColorStop(0, preset.accentColor);
          barGrad.addColorStop(1, preset.barColor);

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Subtle reflection downward
          const reflGrad = ctx.createLinearGradient(x, baseY, x, baseY + barHeight * 0.25);
          reflGrad.addColorStop(0, "rgba(255, 255, 255, 0.2)");
          reflGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
          ctx.fillStyle = reflGrad;
          ctx.fillRect(x, baseY + 2, barWidth, barHeight * 0.25);
        }

        ctx.shadowBlur = 0;
      }

      // 6. STYLE: RADIAL PULSE 360° (Active on 'radial')
      if (visualizerStyle === "radial") {
        const numSpikes = 72;
        const innerRadius = showCover ? coverSize / 2 + 12 : 28;
        ctx.save();
        ctx.translate(centerX, centerY);

        for (let i = 0; i < numSpikes; i++) {
          const angle = (i / numSpikes) * Math.PI * 2 + rotationAngleRef.current * 0.4;
          const binIndex = Math.floor((i / numSpikes) * (bufferLength * 0.9));
          const val = dataArray[binIndex] || 15;
          const norm = val / 255;
          const spikeLen = Math.max(6, norm * (width * 0.16) + bassNormalized * 20);

          const x1 = Math.cos(angle) * innerRadius;
          const y1 = Math.sin(angle) * innerRadius;
          const x2 = Math.cos(angle) * (innerRadius + spikeLen);
          const y2 = Math.sin(angle) * (innerRadius + spikeLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = i % 2 === 0 ? preset.accentColor : preset.barColor;
          ctx.lineWidth = Math.max(2, (width / 1280) * 3);
          ctx.shadowBlur = 12;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();

          // Outer glowing orb tip
          if (norm > 0.4) {
            ctx.beginPath();
            ctx.arc(x2, y2, Math.max(2, norm * 4.5), 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 8;
            ctx.shadowColor = preset.accentColor;
            ctx.fill();
          }
        }

        // Inner glowing ring
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = preset.accentColor;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = preset.accentColor;
        ctx.stroke();
        ctx.restore();
      }

      // 7. STYLE: SMOOTH LIQUID WAVE (Active on 'wave')
      if (visualizerStyle === "wave") {
        const baseY = height * 0.74;
        const waveCount = 3;

        for (let w = 0; w < waveCount; w++) {
          const wavePhase = (currentTime * (1.2 + w * 0.5)) + w * 1.5;
          const waveAmp = (height * 0.08) * (1 + bassNormalized * 0.8) * (1 - w * 0.25);
          const freqOffset = w * 12;

          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(0, baseY);

          for (let x = 0; x <= width; x += 15) {
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

          const waveGrad = ctx.createLinearGradient(0, baseY - 80, 0, height);
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

        // Top wave glowing crest line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const normX = x / width;
          const binIdx = Math.floor(normX * (bufferLength * 0.7));
          const freqVal = (dataArray[binIdx % bufferLength] || 15) / 255;
          const y =
            baseY +
            Math.sin(normX * 9 + currentTime * 1.5) * (height * 0.08 * (1 + bassNormalized * 0.8)) -
            freqVal * (height * 0.14);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = preset.accentColor;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 8. STYLE: GOLDEN VINYL GROOVE (Active on 'vinyl')
      if (visualizerStyle === "vinyl" && showCover) {
        ctx.save();
        ctx.translate(centerX, centerY);

        const recordRadius = coverSize * 0.88;
        // Vinyl Record Disk Body (Glossy black grooves)
        ctx.beginPath();
        ctx.arc(0, 0, recordRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#0c0d12";
        ctx.shadowBlur = 24;
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.fill();

        // Metallic Gold outer rim
        ctx.strokeStyle = preset.accentColor;
        ctx.lineWidth = 3.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = preset.accentColor;
        ctx.stroke();

        // Vinyl concentric reflective sound grooves
        const numGrooves = 14;
        for (let g = 1; g <= numGrooves; g++) {
          const r = (coverSize / 2 + 8) + (g / numGrooves) * (recordRadius - coverSize / 2 - 12);
          const grooveVal = (dataArray[g % bufferLength] || 10) / 255;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + grooveVal * 0.14})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Turntable Tone-arm & needle indicator pointing at the vinyl
        const armAngle = Math.PI * 0.22 + (currentTime * 0.02) % 0.08;
        const armStartX = recordRadius + 45;
        const armStartY = -recordRadius * 0.5;
        const armNeedleX = Math.cos(armAngle) * (recordRadius * 0.65);
        const armNeedleY = Math.sin(armAngle) * (recordRadius * 0.65);

        ctx.beginPath();
        ctx.moveTo(armStartX, armStartY);
        ctx.lineTo(armNeedleX, armNeedleY);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 4;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#ffffff";
        ctx.stroke();

        // Tone-arm pivot base
        ctx.beginPath();
        ctx.arc(armStartX, armStartY, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#475569";
        ctx.fill();
        ctx.strokeStyle = preset.accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stylus cartridge tip
        ctx.beginPath();
        ctx.arc(armNeedleX, armNeedleY, 5, 0, Math.PI * 2);
        ctx.fillStyle = preset.accentColor;
        ctx.shadowBlur = 12;
        ctx.shadowColor = preset.accentColor;
        ctx.fill();

        ctx.restore();
      }

      // 9. STYLE: NEON CYBER TUNNEL 3D (Active on 'neon')
      if (visualizerStyle === "neon") {
        ctx.save();
        ctx.translate(centerX, centerY);

        const tunnelRings = 7;
        for (let r = 0; r < tunnelRings; r++) {
          const depth = (r + (currentTime * 1.5) % 1) / tunnelRings;
          const ringRadius = (coverSize / 2 + 15) + depth * (width * 0.38);
          const binVal = dataArray[(r * 8) % bufferLength] || 15;
          const ringAlpha = Math.min(1, depth * (0.8 + (binVal / 255) * 0.4));

          ctx.save();
          ctx.rotate((r % 2 === 0 ? 1 : -1) * (currentTime * 0.3 + r * 0.2));

          // Hexagonal 3D Tunnel Ring
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
          ctx.lineWidth = Math.max(1.5, 3.5 * depth);
          ctx.globalAlpha = ringAlpha;
          ctx.shadowBlur = 14;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
          ctx.restore();
        }

        // Perspective diagonal guide rails
        const railSides = 6;
        for (let s = 0; s < railSides; s++) {
          const sAngle = (s / railSides) * Math.PI * 2;
          const x1 = Math.cos(sAngle) * (coverSize / 2 + 15);
          const y1 = Math.sin(sAngle) * (coverSize / 2 + 15) * 0.8;
          const x2 = Math.cos(sAngle) * (width * 0.48);
          const y2 = Math.sin(sAngle) * (width * 0.48) * 0.8;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }

      // 10. STYLE: WATER BASS RIPPLES (Active on 'ripple')
      if (visualizerStyle === "ripple") {
        ctx.save();
        ctx.translate(centerX, centerY);

        const numRipples = 6;
        for (let k = 0; k < numRipples; k++) {
          const phase = ((currentTime * 1.8 + k * 1.2) % 6) / 6;
          const rRadius = (coverSize / 2 + 10) + phase * (width * 0.38);
          const rAlpha = Math.max(0, (1 - phase) * (0.65 + bassNormalized * 0.5));
          const waveDistort = (dataArray[(k * 6) % bufferLength] || 15) / 255;

          ctx.beginPath();
          const segments = 60;
          for (let s = 0; s <= segments; s++) {
            const sAngle = (s / segments) * Math.PI * 2;
            const wobble = Math.sin(sAngle * 8 + currentTime * 4) * (waveDistort * 14);
            const rx = Math.cos(sAngle) * (rRadius + wobble);
            const ry = Math.sin(sAngle) * (rRadius + wobble) * 0.78;
            if (s === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
          ctx.strokeStyle = k % 2 === 0 ? preset.accentColor : preset.barColor;
          ctx.lineWidth = Math.max(1.5, 3 * (1 - phase));
          ctx.globalAlpha = rAlpha;
          ctx.shadowBlur = 16;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
        }

        ctx.restore();
      }

      // 11. STYLE: DUAL STUDIO EQUALIZER (Active on 'equalizer')
      if (visualizerStyle === "equalizer") {
        const eqBands = 32;
        const eqWidth = width * 0.36;
        const bandWidth = Math.max(3, (eqWidth - eqBands * 3) / eqBands);
        const bandSpacing = 3;
        const baseY = height * 0.78;

        // Left Channel EQ
        const leftStartX = centerX - eqWidth - 40;
        // Right Channel EQ
        const rightStartX = centerX + 40;

        ctx.shadowBlur = 10;
        ctx.shadowColor = preset.accentColor;

        for (let i = 0; i < eqBands; i++) {
          const bin = Math.floor((i / eqBands) * (bufferLength * 0.85));
          const val = dataArray[bin] || 10;
          const norm = val / 255;
          const bandHeight = Math.max(4, norm * (height * 0.28));

          // Segmented Studio LED look
          const segments = Math.max(1, Math.floor(bandHeight / 7));
          for (let seg = 0; seg < segments; seg++) {
            const segY = baseY - (seg + 1) * 7;
            const segColor =
              seg > segments * 0.85
                ? "#ef4444" // Red peak
                : seg > segments * 0.65
                ? "#f59e0b" // Yellow high
                : preset.accentColor; // Green/Accent

            ctx.fillStyle = segColor;

            // Left side
            const leftX = leftStartX + i * (bandWidth + bandSpacing);
            ctx.fillRect(leftX, segY, bandWidth, 5);

            // Right side
            const rightX = rightStartX + i * (bandWidth + bandSpacing);
            ctx.fillRect(rightX, segY, bandWidth, 5);
          }
        }

        // Channel Labels
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.textAlign = "left";
        ctx.fillText("CH-L [LEFT STEREO]", leftStartX, baseY + 18);
        ctx.textAlign = "right";
        ctx.fillText("[RIGHT STEREO] CH-R", rightStartX + eqWidth, baseY + 18);

        ctx.shadowBlur = 0;
      }

      // 12. EXTENDED ADVANCED STYLES (Plasma Orb, Galaxy, Lasers, Heartbeat, DNA, Matrix, Flames, Crystal, LoFi Rain, Retrowave)
      if (isExtendedVisualizerStyle(visualizerStyle)) {
        renderExtendedVisualizerStyle({
          ctx,
          style: visualizerStyle,
          width,
          height,
          scale: height > width ? Math.max(0.95, width / 720) : Math.max(0.85, width / 1280),
          centerX,
          centerY,
          coverSize,
          currentTime,
          dataArray,
          bufferLength,
          bassEnergy,
          bassNormalized,
          preset,
          showCover,
          isPortrait: height > width,
        });
      }

      // 6. Draw Top Marquee Ticker (Song title banner for YouTube Video)
      const tickerHeight = 52;
      ctx.fillStyle = "rgba(10, 10, 16, 0.88)";
      ctx.fillRect(0, 0, width, tickerHeight);

      // Accent border under marquee
      const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
      lineGrad.addColorStop(0, "rgba(245, 158, 11, 0.2)");
      lineGrad.addColorStop(0.5, preset.accentColor);
      lineGrad.addColorStop(1, "rgba(6, 182, 212, 0.2)");
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, tickerHeight - 2, width, 2);

      // Draw Ticker Marquee Text
      const curTitle = currentTrack?.title || "បទចម្រៀងពិរោះៗ";
      const tickerText = `🎵 ${curTitle}   ✦   🎵 ${curTitle}   ✦   `;

      ctx.font = "bold 22px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";

      const textWidth = ctx.measureText(tickerText).width;
      const posX = width - (tickerOffsetRef.current % (textWidth + width));

      ctx.fillText(tickerText, posX, tickerHeight / 2);
      ctx.fillText(tickerText, posX + textWidth + 80, tickerHeight / 2);
      ctx.fillText(tickerText, posX - textWidth - 80, tickerHeight / 2);

      // Draw "ON AIR" badge on top left
      ctx.fillStyle = preset.accentColor;
      ctx.beginPath();
      ctx.roundRect(14, 12, 70, 28, 6);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ON AIR", 49, 26);
      ctx.textAlign = "left";

      // 6.1 Draw Streaming Platform Badges (YouTube, TikTok, Spotify, Apple Music, Amazon Music, LIVE)
      if (platformBadgesConfig && platformBadgesConfig.enabled) {
        ctx.save();
        const isPortrait = height > width;
        const badgeScale = isPortrait ? Math.max(0.95, width / 720) : Math.max(0.85, width / 1280);
        renderPlatformBadgesOnCanvas({
          ctx,
          width,
          height,
          scale: badgeScale,
          currentTime,
          config: platformBadgesConfig,
          isPortrait,
        });
        ctx.restore();
      }

      // 7. Center Album Art & Track Info Overlay
      if (showOverlayText) {
        if (showCover) {
          ctx.save();
          ctx.translate(centerX, centerY);

          // Circular glow
          ctx.shadowBlur = 30;
          ctx.shadowColor = preset.accentColor;

          // Clip Circle for album art
          ctx.beginPath();
          ctx.arc(0, 0, coverSize / 2, 0, Math.PI * 2);
          ctx.strokeStyle = preset.accentColor;
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.clip();

          // Draw cover image with rotation
          if (coverImageRef.current && coverImageRef.current.complete) {
            ctx.rotate(rotationAngleRef.current);
            ctx.drawImage(
              coverImageRef.current,
              -coverSize / 2,
              -coverSize / 2,
              coverSize,
              coverSize
            );
          } else {
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-coverSize / 2, -coverSize / 2, coverSize, coverSize);
          }

          ctx.restore();
          ctx.shadowBlur = 0;

          // Center vinyl spindle circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.strokeStyle = preset.accentColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // 8. Track Title & Artist Display (with Chromatic Jitter if Glitch is Active)
        const textY = showCover ? centerY + coverSize / 2 + 26 : centerY + 8;
        ctx.textAlign = "center";
        const titleSize = showCover ? 24 : 32;
        ctx.font = `bold ${titleSize}px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif`;

        if (visualizerStyle === "glitch" && glitchTriggerRef.current.active) {
          // RGB split text
          ctx.fillStyle = "#00f0ff";
          ctx.fillText(curTitle, centerX - 3, textY);
          ctx.fillStyle = "#ff0055";
          ctx.fillText(curTitle, centerX + 3, textY);
        }

        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.fillText(curTitle, centerX, textY);

        const artistSize = showCover ? 15 : 18;
        ctx.font = `500 ${artistSize}px 'Kantumruy Pro', sans-serif`;
        ctx.fillStyle = preset.accentColor;
        ctx.fillText(currentTrack?.artist || "Khmer Singer", centerX, textY + (showCover ? 22 : 28));
        ctx.shadowBlur = 0;

        // 8.1. Running Synchronized Karaoke Lyrics on Screen
        renderRunningLyricsOnCanvas({
          ctx,
          track: currentTrack,
          currentTime,
          duration,
          width,
          height,
          centerX,
          accentColor: preset.accentColor,
          bassEnergy,
          showLyrics: showCaption,
          captionMode,
          isPlaying,
        });

        // 9. Video Progress Bar at Bottom
        const progressWidth = width * 0.7;
        const progressHeight = 6;
        const progressX = (width - progressWidth) / 2;
        const progressY = height - 36;
        const percent = duration > 0 ? Math.min(1, currentTime / duration) : 0;

        // Background line
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.roundRect(progressX, progressY, progressWidth, progressHeight, 3);
        ctx.fill();

        // Active progress
        if (percent > 0) {
          ctx.fillStyle = preset.accentColor;
          ctx.beginPath();
          ctx.roundRect(progressX, progressY, progressWidth * percent, progressHeight, 3);
          ctx.fill();
        }

        // Time indicators
        const formatTime = (sec: number) => {
          const m = Math.floor(sec / 60);
          const s = Math.floor(sec % 60);
          return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        };

        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "left";
        ctx.fillText(formatTime(currentTime), progressX, progressY - 8);
        ctx.textAlign = "right";
        ctx.fillText(formatTime(duration), progressX + progressWidth, progressY - 8);

        // Next song teaser at bottom center
        if (nextTrack?.title) {
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.font = "13px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif";
          ctx.fillText(`Next: ${nextTrack.title}`, centerX, height - 12);
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    currentTrack,
    nextTrack,
    preset,
    analyser,
    isPlaying,
    currentTime,
    duration,
    showOverlayText,
    visualizerStyle,
    showCaption,
    captionMode,
  ]);

  const currentStyleMeta =
    VISUALIZER_STYLES.find((s) => s.id === visualizerStyle) || VISUALIZER_STYLES[0];

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 bg-neutral-950 group">
      <canvas
        ref={canvasRef as any}
        width={1280}
        height={720}
        className="w-full h-full object-cover"
      />

      {/* 1. TOP-RIGHT TOOLBAR: Lyrics, CC Caption & AI Actions (Clean, cohesive, perfectly spaced) */}
      <div className="absolute top-16 right-4 z-30 flex items-center gap-2">
        {/* YouTube CC Caption Toggle Button (Prominent & Clear) */}
        {onToggleCaption && (
          <div className="flex items-center bg-neutral-950/85 rounded-xl border border-neutral-700/70 backdrop-blur-md shadow-xl overflow-hidden hover:border-amber-500/50 transition">
            <button
              type="button"
              onClick={onToggleCaption}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold transition cursor-pointer active:scale-95 ${
                showCaption
                  ? "bg-red-600/30 text-white hover:bg-red-600/40"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-white"
              }`}
              title="ចុចដើម្បី បើក ឬ បិទ CC Captions Lyrics លើអេក្រង់"
            >
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider ${
                  showCaption ? "bg-red-600 text-white shadow-sm" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                CC
              </span>
              <span className="text-[11px] font-bold">
                {showCaption ? "បើក" : "បិទ"}
              </span>
            </button>

            {showCaption && onCycleCaptionMode && (
              <button
                type="button"
                onClick={onCycleCaptionMode}
                className="px-2.5 py-1.5 text-[10px] font-mono font-bold text-amber-300 hover:text-white border-l border-neutral-800 hover:bg-neutral-800/70 transition cursor-pointer"
                title="ប្តូរម៉ូត Caption: CapCut Bounce / Highlight / Kinetic / Glow / YouTube CC / Box / Clean"
              >
                {captionMode === "capcut_bounce"
                  ? "⚡ CAPCUT"
                  : captionMode === "capcut_highlight"
                  ? "HIGHLIGHT"
                  : captionMode === "capcut_tiktok_kinetic"
                  ? "KINETIC"
                  : captionMode === "capcut_karaoke_glow"
                  ? "GLOW"
                  : captionMode === "youtube_cc"
                  ? "YT CC"
                  : captionMode === "karaoke_box"
                  ? "BOX"
                  : "CLEAN"}
              </button>
            )}

            {/* Sleek Lyric Duration Progress Percentage during Playback */}
            {showCaption && isPlaying && (
              <div
                className="flex items-center space-x-1.5 px-2 py-1.5 text-[10px] font-mono font-bold text-amber-300 bg-neutral-900/90 border-l border-neutral-800"
                title="ភាគរយនៃថិរវេលាទំនុកច្រៀងបច្ចុប្បន្ន (Current Lyric Duration Progress)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{activeLyricProgressPct}%</span>
              </div>
            )}
          </div>
        )}

        {/* Lyric Editor Button */}
        {onOpenLyricEditor && (
          <button
            type="button"
            onClick={onOpenLyricEditor}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-950/85 hover:bg-neutral-900 text-amber-300 rounded-xl text-xs font-semibold border border-neutral-700/70 hover:border-amber-500/50 backdrop-blur-md shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
            title="បើកផ្ទាំងកែសម្រួលទំនុកច្រៀង Lyric & Timestamps"
          >
            <Mic2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold">Lyric</span>
          </button>
        )}

        {/* Generate Caption (CapCut Auto) Quick Action Button */}
        {onGenerateCapCutCaption && (
          <button
            type="button"
            onClick={onGenerateCapCutCaption}
            disabled={isGeneratingCaption}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/40 hover:border-amber-400/80 backdrop-blur-md shadow-lg shadow-amber-500/10 active:scale-95 transition cursor-pointer disabled:opacity-60"
            title="ចុចដើម្បី Generate Caption ដូចក្នុង Capcut ឱ្យអក្សរលោតតាមសម្លេងច្រៀង Auto លើវីដេអូ"
          >
            {isGeneratingCaption ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            )}
            <span className="text-[11px] font-bold">CapCut Auto</span>
          </button>
        )}
      </div>

      {/* 2. BOTTOM STUDIO DOCK: Visualizer FX, Cover, Lighting, Badges (Clean, Centered, Out of the Way) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-[96%] flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-neutral-950/85 backdrop-blur-md rounded-2xl border border-neutral-800/80 shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity">
        {/* Visualizer Style FX */}
        {onCycleVisualizerStyle && (
          <button
            type="button"
            onClick={onCycleVisualizerStyle}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold border border-neutral-700/60 hover:border-amber-500/50 hover:scale-105 active:scale-95 transition cursor-pointer"
            title="ចុចដើម្បីប្តូរស្ទីល Visualizer Animation (មាន 20 ម៉ូត)"
          >
            {visualizerStyle === "bars" && <BarChart2 className="w-3.5 h-3.5 text-amber-400" />}
            {visualizerStyle === "radial" && <Radio className="w-3.5 h-3.5 text-orange-400" />}
            {visualizerStyle === "wave" && <Waves className="w-3.5 h-3.5 text-sky-400" />}
            {visualizerStyle === "vinyl" && <Disc3 className="w-3.5 h-3.5 text-yellow-400" />}
            {visualizerStyle === "neon" && <Box className="w-3.5 h-3.5 text-purple-400" />}
            {visualizerStyle === "ripple" && <Activity className="w-3.5 h-3.5 text-teal-400" />}
            {visualizerStyle === "equalizer" && <Sliders className="w-3.5 h-3.5 text-lime-400" />}
            {visualizerStyle === "particles" && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            {visualizerStyle === "glitch" && <Zap className="w-3.5 h-3.5 text-fuchsia-400" />}
            {visualizerStyle === "hybrid" && <Layers className="w-3.5 h-3.5 text-emerald-400" />}
            {visualizerStyle === "orb_pulsar" && <CircleDot className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
            {visualizerStyle === "galaxy_spiral" && <Orbit className="w-3.5 h-3.5 text-violet-400" />}
            {visualizerStyle === "laser_beams" && <Target className="w-3.5 h-3.5 text-red-500" />}
            {visualizerStyle === "heartbeat" && <Heart className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
            {visualizerStyle === "dna_helix" && <Dna className="w-3.5 h-3.5 text-cyan-400" />}
            {visualizerStyle === "matrix_rain" && <Binary className="w-3.5 h-3.5 text-green-400" />}
            {visualizerStyle === "fire_flames" && <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
            {visualizerStyle === "crystal_poly" && <Gem className="w-3.5 h-3.5 text-pink-400" />}
            {visualizerStyle === "lofi_rain" && <CloudRain className="w-3.5 h-3.5 text-sky-300" />}
            {visualizerStyle === "retrowave_grid" && <Sun className="w-3.5 h-3.5 text-yellow-400" />}
            <span className="text-[11px] text-neutral-300">FX:</span>
            <span className="text-amber-300 font-bold">{currentStyleMeta.nameKhmer}</span>
          </button>
        )}

        {/* Song Cover Toggle (បិទ/បើក Cover ចម្រៀង) */}
        {onToggleCover && (
          <button
            type="button"
            onClick={onToggleCover}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer active:scale-95 ${
              showCover
                ? "bg-neutral-900/90 hover:bg-neutral-800 text-white border-neutral-700/60 hover:border-amber-500/50"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/40"
            }`}
            title="ចុចដើម្បី បិទ ឬ បើក រូប Cover ចម្រៀង (Hide / Show Song Cover)"
          >
            <Disc className={`w-3.5 h-3.5 ${showCover ? "text-amber-400" : "text-red-400"}`} />
            <span className="text-[11px] text-neutral-300">Cover:</span>
            <span className={`text-[11px] font-bold ${showCover ? "text-emerald-300" : "text-red-400"}`}>
              {showCover ? "បើក" : "បិទ"}
            </span>
          </button>
        )}

        {/* Cover Placement / Traveling Motion (Glide to bottom / Bottom fixed / Center) */}
        {showCover && (
          <button
            type="button"
            onClick={handleCycleCoverPosition}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold border border-neutral-700/60 hover:border-amber-500/50 transition cursor-pointer active:scale-95"
            title="ប្តូរទីតាំង Cover: រត់ចុះដល់ក្រោមទៅមក (មិនបាំងមុខ Background) / នៅខាងក្រោមរហូត / ចំកណ្តាល"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-neutral-300 hidden md:inline">ទីតាំង:</span>
            <span className="text-[11px] font-bold text-amber-300">
              {coverPositionMode === "glide_to_bottom"
                ? "រត់ដល់ក្រោម"
                : coverPositionMode === "bottom_fixed"
                ? "នៅក្រោមរហូត"
                : "ចំកណ្តាល"}
            </span>
          </button>
        )}

        {/* Background Brightness Toggle (ពន្លឺ Background: ពន្លឺដើម 100% / ស្រទន់ / Dimmed) */}
        {onCycleBackgroundBrightness && (
          <button
            type="button"
            onClick={onCycleBackgroundBrightness}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold border border-neutral-700/60 hover:border-amber-500/50 transition cursor-pointer active:scale-95"
            title="ប្តូរកម្រិតពន្លឺរូប Background: ពន្លឺដើមធម្មជាតិ 100% / ពន្លឺស្រទន់ / Focus Dim"
          >
            <SunMedium className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-neutral-300 hidden md:inline">ពន្លឺ BG:</span>
            <span className="text-[11px] font-bold text-amber-300">
              {backgroundBrightnessMode === "original"
                ? "ពន្លឺដើម 100%"
                : backgroundBrightnessMode === "soft"
                ? "ស្រទន់"
                : "Dimmed"}
            </span>
          </button>
        )}

        {/* Streaming Platform Badges & Live Button */}
        {onOpenPlatformBadgesModal && (
          <button
            type="button"
            onClick={onOpenPlatformBadgesModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer active:scale-95 ${
              platformBadgesConfig?.enabled
                ? "bg-neutral-900/90 hover:bg-neutral-800 text-white border-neutral-700/60 hover:border-amber-500/50"
                : "bg-neutral-900/50 text-neutral-400 border-neutral-800"
            }`}
            title="បន្ថែម / កែសម្រួល Icons YouTube, TikTok, Spotify, Apple Music, Amazon Music, LIVE"
          >
            <span className="flex items-center gap-1">
              {platformBadgesConfig?.showLive && platformBadgesConfig?.enabled && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              <Globe className="w-3.5 h-3.5 text-sky-400" />
            </span>
            <span className="text-[11px] text-neutral-300">Icons:</span>
            <span className={`text-[11px] font-bold ${platformBadgesConfig?.enabled ? "text-amber-300" : "text-neutral-500"}`}>
              {platformBadgesConfig?.enabled ? "បើក" : "បិទ"}
            </span>
          </button>
        )}

        {/* Video Background Active Badge */}
        {customBgVideoUrl && (
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-950/90 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/40 shadow-sm"
            title="វីដេអូផ្ទៃក្រោយកំពុងដំណើរការ (Video Background Active)"
          >
            <VideoIcon className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] hidden sm:inline">វីដេអូ</span>
          </div>
        )}
      </div>

      {/* Subtle bottom gradient for UI buttons */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
    </div>
  );
};
