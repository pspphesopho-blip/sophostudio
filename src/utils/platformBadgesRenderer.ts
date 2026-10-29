import { PlatformBadgesConfig } from "../types";

export const DEFAULT_PLATFORM_BADGES: PlatformBadgesConfig = {
  enabled: true,
  showLive: true,
  showYouTube: true,
  showTikTok: true,
  showSpotify: true,
  showAppleMusic: true,
  showAmazonMusic: true,
  position: "top_right",
  customHandle: "@KhmerChillMusic",
  labelStyle: "stream_bar",
};

export interface RenderPlatformBadgesOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  scale?: number;
  currentTime: number;
  config?: PlatformBadgesConfig;
  isPortrait?: boolean;
}

/**
 * Draws crisp vector platform icons and streaming badges onto any HTML5 2D Canvas.
 * Used for both real-time canvas visualizer and 1080p/4K MP4 video export!
 */
export function renderPlatformBadgesOnCanvas({
  ctx,
  width,
  height,
  scale = 1,
  currentTime,
  config = DEFAULT_PLATFORM_BADGES,
  isPortrait = false,
}: RenderPlatformBadgesOptions): void {
  if (!config || !config.enabled) return;

  const {
    showLive,
    showYouTube,
    showTikTok,
    showSpotify,
    showAppleMusic,
    showAmazonMusic,
    position = "top_right",
    customHandle = "",
    labelStyle = "stream_bar",
  } = config;

  // Collect active items
  const activeItems: {
    id: string;
    label: string;
    color: string;
    bgGradient: [string, string];
    drawIcon: (cx: number, cy: number, iconSize: number) => void;
  }[] = [];

  // 1. 🔴 LIVE BADGE
  if (showLive) {
    activeItems.push({
      id: "live",
      label: "LIVE",
      color: "#ffffff",
      bgGradient: ["rgba(220, 38, 38, 0.95)", "rgba(185, 28, 28, 0.95)"],
      drawIcon: (cx, cy, sz) => {
        ctx.save();
        const pulse = (Math.sin(currentTime * 5) + 1) / 2; // 0 to 1
        const ripple = (currentTime * 1.8) % 1; // 0 to 1

        // Expanding radio ripple
        ctx.beginPath();
        ctx.arc(cx, cy, (sz * 0.22) + ripple * (sz * 0.28), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - ripple) * 0.75})`;
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();

        // Pulsing glowing dot
        ctx.beginPath();
        ctx.arc(cx, cy, sz * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 6 * scale * (0.8 + pulse * 0.4);
        ctx.shadowColor = "#ffffff";
        ctx.fill();
        ctx.restore();
      },
    });
  }

  // 2. YOUTUBE BADGE
  if (showYouTube) {
    activeItems.push({
      id: "youtube",
      label: "YouTube",
      color: "#ffffff",
      bgGradient: ["rgba(255, 0, 0, 0.92)", "rgba(204, 0, 0, 0.92)"],
      drawIcon: (cx, cy, sz) => {
        ctx.save();
        // Red rounded rect container for icon
        const rW = sz * 1.05;
        const rH = sz * 0.75;
        ctx.beginPath();
        ctx.roundRect(cx - rW / 2, cy - rH / 2, rW, rH, 3.5 * scale);
        ctx.fillStyle = "#FF0000";
        ctx.fill();

        // White Play Triangle
        const triW = sz * 0.36;
        const triH = sz * 0.40;
        ctx.beginPath();
        ctx.moveTo(cx - triW * 0.4, cy - triH / 2);
        ctx.lineTo(cx + triW * 0.6, cy);
        ctx.lineTo(cx - triW * 0.4, cy + triH / 2);
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      },
    });
  }

  // 3. TIKTOK BADGE
  if (showTikTok) {
    activeItems.push({
      id: "tiktok",
      label: "TikTok",
      color: "#ffffff",
      bgGradient: ["rgba(18, 18, 22, 0.95)", "rgba(10, 10, 14, 0.95)"],
      drawIcon: (cx, cy, sz) => {
        ctx.save();
        // Dark rounded square container for icon
        const r = sz * 0.46;
        ctx.beginPath();
        ctx.roundRect(cx - r, cy - r, r * 2, r * 2, 4 * scale);
        ctx.fillStyle = "#010101";
        ctx.fill();

        const s = sz * 0.085;
        // Cyan offset shadow
        ctx.fillStyle = "#25F4EE";
        drawTiktokNotePath(ctx, cx - 1.1 * scale, cy, s);
        // Pink offset shadow
        ctx.fillStyle = "#FE2C55";
        drawTiktokNotePath(ctx, cx + 1.1 * scale, cy, s);
        // White foreground note
        ctx.fillStyle = "#FFFFFF";
        drawTiktokNotePath(ctx, cx, cy, s);
        ctx.restore();
      },
    });
  }

  // 4. SPOTIFY BADGE
  if (showSpotify) {
    activeItems.push({
      id: "spotify",
      label: "Spotify",
      color: "#1DB954",
      bgGradient: ["rgba(20, 20, 24, 0.95)", "rgba(12, 12, 16, 0.95)"],
      drawIcon: (cx, cy, sz) => {
        ctx.save();
        // Green circle base
        const r = sz * 0.46;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "#1DB954";
        ctx.fill();

        // 3 Sound wave arcs (black curves)
        ctx.strokeStyle = "#000000";
        ctx.lineCap = "round";

        // Top arc
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(cx - r * 0.15, cy + r * 0.2, r * 0.72, -Math.PI * 0.38, -Math.PI * 0.05);
        ctx.stroke();

        // Middle arc
        ctx.lineWidth = 1.3 * scale;
        ctx.beginPath();
        ctx.arc(cx - r * 0.12, cy + r * 0.24, r * 0.52, -Math.PI * 0.40, -Math.PI * 0.06);
        ctx.stroke();

        // Bottom arc
        ctx.lineWidth = 1.1 * scale;
        ctx.beginPath();
        ctx.arc(cx - r * 0.08, cy + r * 0.28, r * 0.34, -Math.PI * 0.42, -Math.PI * 0.08);
        ctx.stroke();
        ctx.restore();
      },
    });
  }

  // 5. APPLE MUSIC BADGE
  if (showAppleMusic) {
    activeItems.push({
      id: "apple_music",
      label: "Apple Music",
      color: "#ff3b5c",
      bgGradient: ["rgba(250, 45, 72, 0.92)", "rgba(215, 28, 55, 0.92)"],
      drawIcon: (cx, cy, sz) => {
        ctx.save();
        // Red/pink squircle
        const sq = sz * 0.92;
        const rGrad = ctx.createLinearGradient(cx - sq / 2, cy - sq / 2, cx + sq / 2, cy + sq / 2);
        rGrad.addColorStop(0, "#FA2D48");
        rGrad.addColorStop(1, "#D4143D");
        ctx.beginPath();
        ctx.roundRect(cx - sq / 2, cy - sq / 2, sq, sq, 4 * scale);
        ctx.fillStyle = rGrad;
        ctx.fill();

        // White double eighth note (beamed notes)
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.4 * scale;

        const nh = sz * 0.16;
        // Left note head
        ctx.beginPath();
        ctx.ellipse(cx - sz * 0.18, cy + sz * 0.16, nh * 0.75, nh * 0.55, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right note head
        ctx.beginPath();
        ctx.ellipse(cx + sz * 0.16, cy + sz * 0.08, nh * 0.75, nh * 0.55, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stems
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.10, cy + sz * 0.14);
        ctx.lineTo(cx - sz * 0.10, cy - sz * 0.20);
        ctx.moveTo(cx + sz * 0.24, cy + sz * 0.06);
        ctx.lineTo(cx + sz * 0.24, cy - sz * 0.28);
        ctx.stroke();

        // Top Connecting Beam
        ctx.beginPath();
        ctx.moveTo(cx - sz * 0.12, cy - sz * 0.18);
        ctx.lineTo(cx + sz * 0.26, cy - sz * 0.26);
        ctx.lineWidth = 2.4 * scale;
        ctx.stroke();
        ctx.restore();
      },
    });
  }

  // 6. AMAZON MUSIC BADGE
  if (showAmazonMusic) {
    activeItems.push({
      id: "amazon_music",
      label: "Amazon Music",
      color: "#00A8E1",
      bgGradient: ["rgba(0, 168, 225, 0.92)", "rgba(0, 120, 180, 0.92)"],
      drawIcon: (cx, cy, sz) => {
        ctx.save();
        // Deep blue rounded square
        const sq = sz * 0.92;
        ctx.beginPath();
        ctx.roundRect(cx - sq / 2, cy - sq / 2, sq, sq, 4 * scale);
        ctx.fillStyle = "#0c1524";
        ctx.fill();
        ctx.strokeStyle = "#00A8E1";
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Cyan musical smile curve
        ctx.beginPath();
        ctx.arc(cx, cy - sz * 0.02, sz * 0.32, Math.PI * 0.22, Math.PI * 0.78);
        ctx.strokeStyle = "#00A8E1";
        ctx.lineWidth = 1.8 * scale;
        ctx.lineCap = "round";
        ctx.stroke();

        // Small smile arrow head
        ctx.beginPath();
        ctx.moveTo(cx + sz * 0.24, cy + sz * 0.18);
        ctx.lineTo(cx + sz * 0.32, cy + sz * 0.10);
        ctx.lineTo(cx + sz * 0.20, cy + sz * 0.11);
        ctx.fillStyle = "#00A8E1";
        ctx.fill();
        ctx.restore();
      },
    });
  }

  if (activeItems.length === 0) return;

  ctx.save();

  // Top marquee compensation: marquee banner is ~52px tall
  const marqueeOffset = (isPortrait ? 60 : 54) * scale;
  const paddingEdge = (isPortrait ? 12 : 16) * scale;
  const fontSize = Math.round((isPortrait ? 11 : 12) * scale);
  const iconSize = Math.round((isPortrait ? 16 : 18) * scale);
  const pillHeight = Math.round((isPortrait ? 26 : 28) * scale);

  ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', 'Kantumruy Pro', sans-serif`;
  ctx.textAlign = "left"; // CRITICAL: Must be left aligned so text NEVER draws backward over icon!
  ctx.textBaseline = "middle";

  // -------------------------------------------------------------
  // STYLE A: STREAM BAR (Glassmorphism streamer pill)
  // -------------------------------------------------------------
  if (labelStyle === "stream_bar") {
    const gap = 8 * scale;
    const separatorW = 8 * scale;
    const iconTextGap = 6 * scale;

    const measuredItems = activeItems.map((item) => {
      const showText = item.id === "live" || !isPortrait;
      const textToMeasure = showText ? item.label : "";
      const textW = textToMeasure ? ctx.measureText(textToMeasure).width + iconTextGap : 0;
      const itemW = iconSize + textW;
      return { ...item, itemW, showText };
    });

    let contentWidth = measuredItems.reduce((acc, curr) => acc + curr.itemW + gap, 0) - gap;

    // Add handle width if present
    const cleanHandle = customHandle?.trim();
    let handleW = 0;
    if (cleanHandle) {
      handleW = ctx.measureText(cleanHandle).width + separatorW + 6 * scale;
      contentWidth += handleW;
    }

    const pillPaddingX = 12 * scale;
    const totalPillW = contentWidth + pillPaddingX * 2;

    // Determine position coordinates
    let startX = 0;
    let startY = 0;

    if (position === "top_right") {
      startX = width - totalPillW - paddingEdge;
      startY = marqueeOffset + 6 * scale;
    } else if (position === "top_left") {
      startX = paddingEdge;
      startY = marqueeOffset + 6 * scale;
    } else if (position === "bottom_right") {
      startX = width - totalPillW - paddingEdge;
      startY = height - pillHeight - (isPortrait ? 95 : 68) * scale;
    } else {
      // bottom_left
      startX = paddingEdge;
      startY = height - pillHeight - (isPortrait ? 95 : 68) * scale;
    }

    // Draw Glassmorphism capsule backdrop
    ctx.save();
    ctx.shadowBlur = 14 * scale;
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";

    ctx.beginPath();
    ctx.roundRect(startX, startY, totalPillW, pillHeight, pillHeight / 2);
    ctx.fillStyle = "rgba(10, 12, 18, 0.90)";
    ctx.fill();

    // Subtle gradient border
    const borderGrad = ctx.createLinearGradient(startX, startY, startX + totalPillW, startY);
    borderGrad.addColorStop(0, "rgba(245, 158, 11, 0.5)");
    borderGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
    borderGrad.addColorStop(1, "rgba(6, 182, 212, 0.5)");
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    ctx.restore();

    // Render items inside the bar
    let currX = startX + pillPaddingX;
    const centerY = startY + pillHeight / 2;

    for (let i = 0; i < measuredItems.length; i++) {
      const item = measuredItems[i];
      const iconCenterX = currX + iconSize / 2;

      // Draw vector icon (isolated)
      ctx.save();
      item.drawIcon(iconCenterX, centerY, iconSize);
      ctx.restore();

      currX += iconSize + iconTextGap;

      // Draw text if enabled strictly to the right of icon
      if (item.showText) {
        ctx.save();
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = item.id === "live" ? "#ef4444" : "#f1f5f9";
        ctx.shadowBlur = 0;
        ctx.fillText(item.label, currX, centerY);
        ctx.restore();
        currX += ctx.measureText(item.label).width + 6 * scale;
      }

      // Separator dot between items
      if (i < measuredItems.length - 1 || cleanHandle) {
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.arc(currX + gap / 2 - 2 * scale, centerY, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        currX += gap;
      }
    }

    // Render custom handle at end
    if (cleanHandle) {
      ctx.save();
      ctx.fillStyle = "#38bdf8"; // Light sky blue handle
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(fontSize * 0.95)}px 'JetBrains Mono', 'Plus Jakarta Sans', monospace`;
      ctx.fillText(cleanHandle, currX, centerY);
      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // STYLE B: ICONS WITH TEXT (Individual Branded Floating Pills)
  // -------------------------------------------------------------
  else if (labelStyle === "icons_with_text") {
    const gap = 8 * scale;
    const pillPadLeft = 10 * scale;
    const pillPadRight = 12 * scale;
    const iconTextGap = 8 * scale; // Generous gap so icon and text NEVER collide!

    const measuredPills = activeItems.map((item) => {
      const textW = ctx.measureText(item.label).width;
      const pillW = pillPadLeft + iconSize + iconTextGap + textW + pillPadRight;
      return { ...item, pillW };
    });

    let totalWidth = measuredPills.reduce((acc, curr) => acc + curr.pillW + gap, 0) - gap;

    // Safety: if pills are wider than screen width, scale horizontally so they always fit
    const availableWidth = width - paddingEdge * 2;
    let shrinkRatio = 1;
    if (totalWidth > availableWidth) {
      shrinkRatio = availableWidth / totalWidth;
    }

    let startX = 0;
    let startY = 0;

    if (position === "top_right") {
      startX = width - totalWidth * shrinkRatio - paddingEdge;
      startY = marqueeOffset + 6 * scale;
    } else if (position === "top_left") {
      startX = paddingEdge;
      startY = marqueeOffset + 6 * scale;
    } else if (position === "bottom_right") {
      startX = width - totalWidth * shrinkRatio - paddingEdge;
      startY = height - pillHeight - (isPortrait ? 95 : 68) * scale;
    } else {
      startX = paddingEdge;
      startY = height - pillHeight - (isPortrait ? 95 : 68) * scale;
    }

    let curPillX = startX;
    for (const pill of measuredPills) {
      const currentPillW = pill.pillW * shrinkRatio;
      const centerY = startY + pillHeight / 2;

      // Draw background pill
      ctx.save();
      ctx.shadowBlur = 8 * scale;
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";

      ctx.beginPath();
      ctx.roundRect(curPillX, startY, currentPillW, pillHeight, pillHeight / 2);
      ctx.fillStyle = pill.id === "live" ? "rgba(220, 38, 38, 0.95)" : "rgba(10, 12, 18, 0.92)";
      ctx.fill();

      ctx.strokeStyle = pill.id === "live" ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
      ctx.restore();

      // Draw Icon strictly centered in its dedicated left slot
      const iconCenterX = curPillX + pillPadLeft * shrinkRatio + iconSize / 2;
      ctx.save();
      pill.drawIcon(iconCenterX, centerY, iconSize);
      ctx.restore();

      // Draw Text strictly starting AFTER the icon with guaranteed gap
      const textStartX = curPillX + (pillPadLeft + iconSize + iconTextGap) * shrinkRatio;
      ctx.save();
      ctx.textAlign = "left"; // CRITICAL: NEVER center, start strictly at textStartX!
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      ctx.fillText(pill.label, textStartX, centerY);
      ctx.restore();

      curPillX += currentPillW + gap * shrinkRatio;
    }
  }

  // -------------------------------------------------------------
  // STYLE C: ICONS ONLY (Minimalist Circular / Compact Row)
  // -------------------------------------------------------------
  else {
    const circleSize = pillHeight;
    const gap = 6 * scale;
    const totalW = activeItems.length * circleSize + (activeItems.length - 1) * gap;

    let startX = 0;
    let startY = 0;

    if (position === "top_right") {
      startX = width - totalW - paddingEdge;
      startY = marqueeOffset + 6 * scale;
    } else if (position === "top_left") {
      startX = paddingEdge;
      startY = marqueeOffset + 6 * scale;
    } else if (position === "bottom_right") {
      startX = width - totalW - paddingEdge;
      startY = height - circleSize - (isPortrait ? 95 : 68) * scale;
    } else {
      startX = paddingEdge;
      startY = height - circleSize - (isPortrait ? 95 : 68) * scale;
    }

    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i];
      const cx = startX + i * (circleSize + gap) + circleSize / 2;
      const cy = startY + circleSize / 2;

      // Circle backdrop
      ctx.save();
      ctx.shadowBlur = 8 * scale;
      ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.arc(cx, cy, circleSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = item.id === "live" ? "rgba(220, 38, 38, 0.95)" : "rgba(10, 12, 18, 0.92)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
      ctx.restore();

      // Icon (isolated)
      ctx.save();
      item.drawIcon(cx, cy, iconSize * 0.95);
      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * Draws crisp TikTok note shape centered at local coordinates (cx, cy)
 */
function drawTiktokNotePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.save();
  ctx.translate(cx, cy);

  // Bottom note circle
  ctx.beginPath();
  ctx.arc(-1.6 * s, 1.8 * s, 2.6 * s, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.fillRect(0.2 * s, -4.5 * s, 1.3 * s, 6.3 * s);

  // Top flag curve
  ctx.beginPath();
  ctx.moveTo(1.2 * s, -4.5 * s);
  ctx.bezierCurveTo(3.2 * s, -4.5 * s, 4.4 * s, -2.4 * s, 4.6 * s, -0.6 * s);
  ctx.bezierCurveTo(3.8 * s, -1.8 * s, 2.8 * s, -2.2 * s, 1.5 * s, -2.2 * s);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
