import { SongTrack, LyricLine, CaptionMode } from "../types";
import { getActiveLyric, parseLRC, getDefaultLyricsForTrack, isKhmerText } from "./lyricsParser";

interface RenderLyricsOptions {
  ctx: CanvasRenderingContext2D;
  track: SongTrack | null;
  currentTime: number;
  duration: number;
  width: number;
  height: number;
  centerX: number;
  accentColor: string;
  bassEnergy: number;
  showLyrics?: boolean;
  captionMode?: CaptionMode;
  isPlaying?: boolean;
}

interface LyricProgressBarProps {
  ctx: CanvasRenderingContext2D;
  centerX: number;
  y: number;
  contentWidth: number;
  progress: number; // 0 to 1
  accentColor: string;
  scale: number;
  width: number;
  isVertical: boolean;
  isPlaying?: boolean;
}

/**
 * Renders a sleek, non-intrusive progress line beneath the active lyric line during playback,
 * showing the percentage of the current lyric duration with luminous glassmorphism styling.
 */
function renderLyricLineProgressBar({
  ctx,
  centerX,
  y,
  contentWidth,
  progress,
  accentColor,
  scale,
  width,
  isVertical,
}: LyricProgressBarProps): void {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const pct = Math.round(clampedProgress * 100);

  // Proportional sizing: sleek, non-intrusive line
  const maxBarWidth = width * (isVertical ? 0.75 : 0.52);
  const targetBarWidth = Math.max(130 * scale, Math.min(contentWidth * 0.92, maxBarWidth));
  const barHeight = Math.max(2.8, 3.4 * scale);
  const barRadius = barHeight / 2;

  const barX = centerX - targetBarWidth / 2;
  const barY = y;

  ctx.save();

  // 1. Sleek frosted dark background capsule track (high contrast against any video/canvas background)
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.roundRect(barX - 1.5, barY - 1.5, targetBarWidth + 3, barHeight + 3, (barHeight + 3) / 2);
  ctx.fill();

  // 2. Faint translucent guide track
  ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, targetBarWidth, barHeight, barRadius);
  ctx.fill();

  // 3. Active progress fill (luminous gradient matching audio visualizer theme)
  if (clampedProgress > 0) {
    const fillWidth = Math.max(barHeight, targetBarWidth * clampedProgress);
    const grad = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    grad.addColorStop(0, accentColor || "#f59e0b");
    grad.addColorStop(0.65, "#facc15");
    grad.addColorStop(1, "#38bdf8");

    ctx.shadowColor = accentColor || "#facc15";
    ctx.shadowBlur = 6 * scale;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, barRadius);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing head point indicator at the leading edge
    if (clampedProgress > 0.03 && clampedProgress < 0.98) {
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 6 * scale;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(barX + fillWidth, barY + barHeight / 2, barHeight * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // 4. Sleek Percentage badge: showing the percentage of current lyric duration
  const pctText = `${pct}%`;
  const fontSize = Math.max(9, Math.round(10 * scale));
  ctx.font = `bold ${fontSize}px 'JetBrains Mono', 'Plus Jakarta Sans', monospace`;
  ctx.textBaseline = "middle";

  const rightSpace = width - (barX + targetBarWidth);
  if (rightSpace >= 48 * scale) {
    // Non-intrusive percentage right after the bar
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 4 * scale;
    ctx.fillStyle = clampedProgress > 0.85 ? "#38bdf8" : (clampedProgress > 0.25 ? "#facc15" : "rgba(255, 255, 255, 0.85)");
    ctx.fillText(pctText, barX + targetBarWidth + 7 * scale, barY + barHeight / 2);

    // Subtle mini label on the left for elegant DAW balance
    const leftSpace = barX;
    if (leftSpace >= 45 * scale) {
      ctx.font = `600 ${Math.max(8.5, Math.round(8.5 * scale))}px 'JetBrains Mono', monospace`;
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillText("LYRIC", barX - 7 * scale, barY + barHeight / 2);
    }
  } else {
    // If tight space, render percentage centered beneath the progress line
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 4 * scale;
    ctx.fillStyle = "#facc15";
    ctx.fillText(pctText, centerX, barY + barHeight + 7 * scale);
  }

  ctx.restore();
}

/**
 * Intelligent word/phrase splitter that handles both spaced text (English/Khmer)
 * and unspaced Khmer phrases with graceful fallback chunks.
 */
function splitIntoWordsOrPhrases(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const spaceParts = trimmed.split(/\s+/).filter(Boolean);
  if (spaceParts.length > 1) {
    return spaceParts;
  }
  // If no spaces, chunk every 3-5 characters or by punctuation
  const chunks: string[] = [];
  let remaining = trimmed;
  while (remaining.length > 0) {
    const chunkSize = Math.min(remaining.length, remaining.length > 8 ? 4 : remaining.length);
    chunks.push(remaining.substring(0, chunkSize));
    remaining = remaining.substring(chunkSize);
  }
  return chunks.length > 0 ? chunks : [trimmed];
}

/**
 * Renders CapCut-style animated dynamic bouncy captions, YouTube CC, or Studio Karaoke
 * onto any canvas (used synchronously by AudioVisualizerCanvas and VideoExportModal).
 */
export function renderRunningLyricsOnCanvas({
  ctx,
  track,
  currentTime,
  duration,
  width,
  height,
  centerX,
  accentColor,
  bassEnergy,
  showLyrics = true,
  captionMode = "capcut_bounce",
  isPlaying = true,
}: RenderLyricsOptions): void {
  // If explicitly disabled or no track at all, skip
  if (!showLyrics || !track) return;

  // Retrieve or dynamically parse lyrics
  let lines: LyricLine[] = track.parsedLyrics || [];
  if (lines.length === 0 && track.lyrics) {
    lines = parseLRC(track.lyrics);
  }

  // Fallback 1: if no LRC lyrics, but caption has text, split lines and auto-distribute
  if (lines.length === 0 && track.caption) {
    const rawLines = track.caption
      .split(/[\n|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (rawLines.length > 0) {
      const interval = Math.max(3, (duration || 60) / rawLines.length);
      lines = rawLines.map((text, i) => ({
        time: i * interval,
        text,
      }));
    }
  }

  // Fallback 2: if song STILL has no lyrics, auto-generate language-appropriate lyrics
  // (English for English songs, Khmer for Khmer)
  if (lines.length === 0) {
    const defaultData = getDefaultLyricsForTrack(track.title, track.artist, duration || 180);
    lines = defaultData.parsed;
  }

  // Calculate active singing line & upcoming line
  const activeInfo = getActiveLyric(lines, currentTime, duration);
  const currentLine = activeInfo.currentLine;
  const nextLine = activeInfo.nextLine;
  const progress = activeInfo.progress; // 0 to 1

  // Resolve raw text so it is NEVER blank, even during intro or outro!
  let rawText = currentLine?.text?.trim() || "";
  let isIntro = false;
  const isKm = isKhmerText((track.title || "") + " " + (track.artist || "") + " " + (currentLine?.text || ""));
  if (!rawText) {
    if (currentTime < (lines[0]?.time || 2.5)) {
      rawText = isKm
        ? `🎵 [Intro] ~ ${track.title || "បទចម្រៀង"} • ${track.artist || "ចម្រៀងខ្មែរ"} ~ 🎵`
        : `🎵 [Intro] ~ ${track.title || "Now Playing"} • ${track.artist || "Melodic Music"} ~ 🎵`;
      isIntro = true;
    } else {
      rawText = isKm
        ? `✨ [Outro] ~ ${track.title || "បទចម្រៀង"} ~ ✨`
        : `✨ [Outro] ~ ${track.title || "Music"} ~ ✨`;
    }
  }

  // Active sweep progress
  let activeProgress = progress;
  if (isIntro) {
    const introSpan = lines[0]?.time || 2.5;
    activeProgress = Math.min(1, Math.max(0, currentTime / introSpan));
  } else if (!currentLine) {
    activeProgress = 1.0;
  }

  // Dynamic scale factor: responsive for both 16:9 Landscape and 9:16 Vertical (Shorts/TikTok/Reels)
  const isVertical = height > width;
  const scale = isVertical ? Math.max(0.95, width / 720) : Math.max(0.85, width / 1280);

  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.globalCompositeOperation = "source-over";

  // Common timing variables
  const phraseAge = currentLine ? Math.max(0, currentTime - currentLine.time) : (isIntro ? currentTime : 0);
  // Entrance elastic bounce (លោតចូល) during first 0.35s
  let entrancePop = 1.0;
  let entranceJumpY = 0;
  if (phraseAge < 0.35) {
    const t = phraseAge / 0.35;
    entrancePop = 1.0 + Math.sin(t * Math.PI) * 0.16;
    entranceJumpY = -Math.sin(t * Math.PI) * 8 * scale;
  } else {
    // Subtle rhythmic pulse on music bass energy
    entrancePop = 1.0 + Math.min(0.04, (bassEnergy / 255) * 0.05);
  }

  // Target Y position (bottom area, safely positioned above progress bar)
  const baseY = (isVertical ? height * 0.77 : height - 92 * scale) + entranceJumpY;

  // -------------------------------------------------------------------------
  // CAPCUT STYLE 1: CAPCUT DYNAMIC WORD BOUNCE (លោតពាក្យ CapCut ប៉ោងពណ៌លឿង)
  // -------------------------------------------------------------------------
  if (captionMode === "capcut_bounce") {
    const words = splitIntoWordsOrPhrases(rawText);
    const totalWords = Math.max(1, words.length);
    const activeWordIdx = Math.min(totalWords - 1, Math.floor(activeProgress * totalWords));

    const fontSize = Math.round((isVertical ? 28 : 26) * scale * entrancePop);
    ctx.font = `900 ${fontSize}px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif`;
    ctx.textBaseline = "middle";

    // Measure words and total width
    const spaceWidth = ctx.measureText(" ").width;
    const wordMetrics = words.map((w) => ctx.measureText(w).width);
    let totalLineWidth =
      wordMetrics.reduce((sum, w) => sum + w, 0) + (totalWords - 1) * spaceWidth;

    // Auto-scale if text exceeds max allowed width
    let lineScale = 1.0;
    const maxW = width * (isVertical ? 0.92 : 0.86);
    if (totalLineWidth > maxW) {
      lineScale = maxW / totalLineWidth;
      ctx.font = `900 ${Math.round(fontSize * lineScale)}px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif`;
    }

    const finalSpaceW = spaceWidth * lineScale;
    const finalWordWidths = wordMetrics.map((w) => w * lineScale);
    const finalTotalW =
      finalWordWidths.reduce((sum, w) => sum + w, 0) + (totalWords - 1) * finalSpaceW;

    let curX = centerX - finalTotalW / 2;

    // Render Word-by-Word with CapCut Bouncing Dynamics
    for (let i = 0; i < totalWords; i++) {
      const word = words[i];
      const wWidth = finalWordWidths[i];
      const isCurrentWord = i === activeWordIdx;
      const isPastWord = i < activeWordIdx;

      // Word bouncing animation calculation
      const wordSubProgress = (activeProgress * totalWords) - i;
      const wordBounce = isCurrentWord
        ? Math.sin(Math.max(0, Math.min(1, wordSubProgress)) * Math.PI) * 9 * scale
        : 0;

      ctx.save();

      if (isCurrentWord) {
        // ACTIVE WORD: Scale up 1.15x, Electric CapCut Yellow, Neon Glow, Jump upwards!
        const wordCenterX = curX + wWidth / 2;
        const wordCenterY = baseY - wordBounce;

        ctx.translate(wordCenterX, wordCenterY);
        ctx.scale(1.15, 1.15);

        // Deep outline
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 7 * scale;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeText(word, -wWidth / 2, 0);

        // Electric yellow fill with intense bloom glow
        ctx.shadowColor = "#ffe600";
        ctx.shadowBlur = 18 * scale;
        ctx.fillStyle = "#ffe600";
        ctx.fillText(word, -wWidth / 2, 0);

        // Second pass for ultra-crisp interior
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(word, -wWidth / 2, 0);
      } else {
        // INACTIVE WORDS: Crisp white text with black drop outline
        const wordY = baseY;

        ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
        ctx.lineWidth = 5.5 * scale;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeText(word, curX, wordY);

        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = 8 * scale;
        ctx.fillStyle = isPastWord ? "#ffffff" : "rgba(255, 255, 255, 0.78)";
        ctx.fillText(word, curX, wordY);
      }

      ctx.restore();
      curX += wWidth + finalSpaceW;
    }

    // Sleek progress line beneath the active lyric line showing duration percentage
    const lineBottom = baseY + (fontSize * 0.45) + 12 * scale;
    renderLyricLineProgressBar({
      ctx,
      centerX,
      y: lineBottom,
      contentWidth: finalTotalW,
      progress: activeProgress,
      accentColor,
      scale,
      width,
      isVertical,
      isPlaying,
    });

    ctx.restore();
    return;
  }

  // -------------------------------------------------------------------------
  // CAPCUT STYLE 2: CAPCUT NEON HIGHLIGHT PILL (ប្រអប់លោតតាមពាក្យ)
  // -------------------------------------------------------------------------
  if (captionMode === "capcut_highlight") {
    const words = splitIntoWordsOrPhrases(rawText);
    const totalWords = Math.max(1, words.length);
    const activeWordIdx = Math.min(totalWords - 1, Math.floor(activeProgress * totalWords));

    const fontSize = Math.round((isVertical ? 26 : 24) * scale * entrancePop);
    ctx.font = `900 ${fontSize}px 'Kantumruy Pro', sans-serif`;
    ctx.textBaseline = "middle";

    const spaceWidth = ctx.measureText(" ").width;
    const wordMetrics = words.map((w) => ctx.measureText(w).width);
    let totalLineWidth =
      wordMetrics.reduce((sum, w) => sum + w, 0) + (totalWords - 1) * spaceWidth;

    let curX = centerX - totalLineWidth / 2;

    for (let i = 0; i < totalWords; i++) {
      const word = words[i];
      const wWidth = wordMetrics[i];
      const isCurrentWord = i === activeWordIdx;

      if (isCurrentWord) {
        // Draw Neon Yellow Pill Box around active word
        const pillPadX = 10 * scale;
        const pillPadY = 6 * scale;
        const pillW = wWidth + pillPadX * 2;
        const pillH = fontSize + pillPadY * 2;
        const pillX = curX - pillPadX;
        const pillY = baseY - pillH / 2 - 2 * scale;

        ctx.save();
        ctx.shadowColor = "#ffe600";
        ctx.shadowBlur = 14 * scale;
        ctx.fillStyle = "#ffe600";
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 8 * scale);
        ctx.fill();
        ctx.restore();

        // Black text inside yellow pill
        ctx.fillStyle = "#000000";
        ctx.fillText(word, curX, baseY);
      } else {
        // Standard white with dark stroke
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 5 * scale;
        ctx.strokeText(word, curX, baseY);

        ctx.fillStyle = i < activeWordIdx ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
        ctx.fillText(word, curX, baseY);
      }

      curX += wWidth + spaceWidth;
    }

    // Sleek progress line beneath the active lyric line showing duration percentage
    const lineBottom = baseY + (fontSize * 0.5) + 14 * scale;
    renderLyricLineProgressBar({
      ctx,
      centerX,
      y: lineBottom,
      contentWidth: totalLineWidth,
      progress: activeProgress,
      accentColor,
      scale,
      width,
      isVertical,
      isPlaying,
    });

    ctx.restore();
    return;
  }

  // -------------------------------------------------------------------------
  // CAPCUT STYLE 3: CAPCUT TIKTOK VIRAL KINETIC POP (អក្សរធំលោតចំកណ្តាល)
  // -------------------------------------------------------------------------
  if (captionMode === "capcut_tiktok_kinetic") {
    const words = splitIntoWordsOrPhrases(rawText);
    const activeWordIdx = Math.min(words.length - 1, Math.floor(activeProgress * words.length));
    const startIdx = Math.max(0, activeWordIdx - 1);
    const endIdx = Math.min(words.length, activeWordIdx + 2);
    const displayPhrase = words.slice(startIdx, endIdx).join(" ");

    const kineticPop = 1.0 + Math.sin(activeProgress * Math.PI) * 0.12;
    const fontSize = Math.round((isVertical ? 38 : 34) * scale * kineticPop);
    ctx.font = `900 ${fontSize}px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const kineticY = isVertical ? height * 0.75 : height - 95 * scale;

    // Heavy black stroke
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 8 * scale;
    ctx.lineJoin = "round";
    ctx.strokeText(displayPhrase, centerX, kineticY);

    // Gradient kinetic glow
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 22 * scale;
    ctx.fillStyle = "#ffe600";
    ctx.fillText(displayPhrase, centerX, kineticY);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(displayPhrase, centerX, kineticY);

    // Sleek progress line beneath the active lyric line showing duration percentage
    const lineBottom = kineticY + (fontSize * 0.5) + 12 * scale;
    renderLyricLineProgressBar({
      ctx,
      centerX,
      y: lineBottom,
      contentWidth: Math.min(width * 0.6, 260 * scale),
      progress: activeProgress,
      accentColor,
      scale,
      width,
      isVertical,
      isPlaying,
    });

    ctx.restore();
    return;
  }

  // -------------------------------------------------------------------------
  // CAPCUT STYLE 4: CAPCUT NEON KARAOKE GLOW (រលកពន្លឺរត់តាមពាក្យ)
  // -------------------------------------------------------------------------
  if (captionMode === "capcut_karaoke_glow") {
    let fontSize = Math.round((isVertical ? 26 : 24) * scale);
    ctx.font = `bold ${fontSize}px 'Kantumruy Pro', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let textMetrics = ctx.measureText(rawText);
    const maxAllowedW = width * 0.90;
    if (textMetrics.width > maxAllowedW) {
      fontSize = Math.max(Math.round(14 * scale), Math.round(fontSize * (maxAllowedW / textMetrics.width)));
      ctx.font = `bold ${fontSize}px 'Kantumruy Pro', sans-serif`;
      textMetrics = ctx.measureText(rawText);
    }

    const textY = isVertical ? height * 0.77 : height - 92 * scale;
    const textW = textMetrics.width;

    // Base stroke & dim white
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5 * scale;
    ctx.strokeText(rawText, centerX, textY);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText(rawText, centerX, textY);

    // Neon Wipe Clip
    if (activeProgress > 0) {
      ctx.save();
      const startX = centerX - textW / 2;
      const sweepW = textW * activeProgress;

      ctx.beginPath();
      ctx.rect(startX, textY - 25 * scale, sweepW, 50 * scale);
      ctx.clip();

      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 18 * scale;
      ctx.fillStyle = "#00f0ff";
      ctx.fillText(rawText, centerX, textY);
      ctx.restore();
    }

    // Sleek progress line beneath the active lyric line showing duration percentage
    const lineBottom = textY + (fontSize * 0.45) + 12 * scale;
    renderLyricLineProgressBar({
      ctx,
      centerX,
      y: lineBottom,
      contentWidth: textW,
      progress: activeProgress,
      accentColor,
      scale,
      width,
      isVertical,
      isPlaying,
    });

    ctx.restore();
    return;
  }

  // -------------------------------------------------------------------------
  // STYLE 5: YOUTUBE CC CAPTION (លោត CC ដូចក្នុង YouTube)
  // -------------------------------------------------------------------------
  if (captionMode === "youtube_cc") {
    const baseFontSize = isVertical ? Math.round(25 * scale) : Math.round(23 * scale);
    let fontSize = Math.round(baseFontSize * entrancePop);
    ctx.font = `600 ${fontSize}px 'Kantumruy Pro', 'YouTube Sans', 'Roboto', sans-serif`;

    let textMetrics = ctx.measureText(rawText);
    const maxAllowedW = width * 0.88;
    if (textMetrics.width > maxAllowedW) {
      fontSize = Math.max(Math.round(14 * scale), Math.round(fontSize * (maxAllowedW / textMetrics.width)));
      ctx.font = `600 ${fontSize}px 'Kantumruy Pro', 'YouTube Sans', 'Roboto', sans-serif`;
      textMetrics = ctx.measureText(rawText);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textW = textMetrics.width;
    const padX = isVertical ? 18 * scale : 22 * scale;
    const padY = 12 * scale;
    const badgeW = textW + padX * 2;
    const badgeH = fontSize + padY * 2;

    const badgeX = centerX - badgeW / 2;
    const badgeY = isVertical ? height * 0.77 : height - 92 * scale;

    // YouTube CC Black Box with rounded corners
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 12 * scale;
    ctx.fillStyle = "rgba(8, 8, 8, 0.94)";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6 * scale);
    ctx.fill();
    ctx.shadowBlur = 0;

    // YouTube red accent active dot
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(badgeX + 12 * scale, badgeY + badgeH / 2, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    // CC Badge on top right
    ctx.font = `bold ${Math.round(10 * scale)}px 'JetBrains Mono', sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.fillText("CC", badgeX + badgeW - 10 * scale, badgeY + 12 * scale);

    // Base Subtitle text
    ctx.textAlign = "center";
    ctx.font = `600 ${fontSize}px 'Kantumruy Pro', 'YouTube Sans', 'Roboto', sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(rawText, centerX, badgeY + badgeH / 2);

    // Karaoke Highlight in yellow
    if (activeProgress > 0) {
      ctx.save();
      const startX = centerX - textW / 2;
      const sweepW = textW * activeProgress;

      ctx.beginPath();
      ctx.rect(startX, badgeY - 5, sweepW, badgeH + 10);
      ctx.clip();

      ctx.fillStyle = "#facc15";
      ctx.fillText(rawText, centerX, badgeY + badgeH / 2);
      ctx.restore();
    }

    // Sleek progress line beneath the active lyric line showing duration percentage
    const lineBottom = badgeY + badgeH + 8 * scale;
    renderLyricLineProgressBar({
      ctx,
      centerX,
      y: lineBottom,
      contentWidth: badgeW,
      progress: activeProgress,
      accentColor,
      scale,
      width,
      isVertical,
      isPlaying,
    });

    ctx.restore();
    return;
  }

  // -------------------------------------------------------------------------
  // STYLE 6: SUBTITLES CLEAN (Minimalist, cinematic)
  // -------------------------------------------------------------------------
  if (captionMode === "subtitles_clean") {
    let fontSize = Math.round(24 * scale);
    ctx.font = `bold ${fontSize}px 'Kantumruy Pro', sans-serif`;

    let textMetrics = ctx.measureText(rawText);
    const maxAllowedW = width * 0.90;
    if (textMetrics.width > maxAllowedW) {
      fontSize = Math.max(Math.round(14 * scale), Math.round(fontSize * (maxAllowedW / textMetrics.width)));
      ctx.font = `bold ${fontSize}px 'Kantumruy Pro', sans-serif`;
    }

    const textW = textMetrics.width;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textY = isVertical ? height * 0.77 : height - 92 * scale;

    ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
    ctx.lineWidth = 5 * scale;
    ctx.lineJoin = "round";
    ctx.strokeText(rawText, centerX, textY);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(rawText, centerX, textY);

    if (activeProgress > 0) {
      ctx.save();
      const startX = centerX - textW / 2;
      const sweepW = textW * activeProgress;

      ctx.beginPath();
      ctx.rect(startX, textY - 20 * scale, sweepW, 40 * scale);
      ctx.clip();

      ctx.fillStyle = accentColor;
      ctx.fillText(rawText, centerX, textY);
      ctx.restore();
    }

    // Sleek progress line beneath the active lyric line showing duration percentage
    const lineBottom = textY + (fontSize * 0.45) + 12 * scale;
    renderLyricLineProgressBar({
      ctx,
      centerX,
      y: lineBottom,
      contentWidth: textW,
      progress: activeProgress,
      accentColor,
      scale,
      width,
      isVertical,
      isPlaying,
    });

    ctx.restore();
    return;
  }

  // -------------------------------------------------------------------------
  // STYLE 7: KARAOKE STUDIO BOX (Frosted glass card with glow)
  // -------------------------------------------------------------------------
  const boxW = Math.min(width * (isVertical ? 0.92 : 0.88), (isVertical ? 680 : 740) * scale);
  const boxH = (isVertical ? 84 : 76) * scale;
  const boxX = (width - boxW) / 2;
  const boxY = isVertical ? height * 0.75 : height - 105 * scale;

  ctx.fillStyle = "rgba(10, 14, 24, 0.88)";
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 18 * scale);
  ctx.fill();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.6 * scale;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = (bassEnergy > 160 ? 12 : 4) * scale;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.font = `bold ${Math.round(10 * scale)}px 'JetBrains Mono', sans-serif`;
  ctx.fillStyle = accentColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("🎵 LYRICS • RUNNING KARAOKE", boxX + 16 * scale, boxY + 10 * scale);

  const textY = boxY + 38 * scale;
  ctx.font = `bold ${Math.round(20 * scale)}px 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const displayText = `❝ ${rawText} ❞`;
  const textW = ctx.measureText(displayText).width;

  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 6 * scale;
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.fillText(displayText, centerX, textY);
  ctx.shadowBlur = 0;

  if (activeProgress > 0) {
    ctx.save();
    const sweepWidth = textW * activeProgress;
    const startX = centerX - textW / 2;

    ctx.beginPath();
    ctx.rect(startX, textY - 16 * scale, sweepWidth, 32 * scale);
    ctx.clip();

    ctx.fillStyle = accentColor;
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = accentColor;
    ctx.fillText(displayText, centerX, textY);
    ctx.restore();
  }

  // Sleek progress line beneath the active lyric line showing duration percentage
  const lineBottom = textY + 18 * scale;
  renderLyricLineProgressBar({
    ctx,
    centerX,
    y: lineBottom,
    contentWidth: boxW * 0.75,
    progress: activeProgress,
    accentColor,
    scale,
    width,
    isVertical,
    isPlaying,
  });

  ctx.restore();
}
