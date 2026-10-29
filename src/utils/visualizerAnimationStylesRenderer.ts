import { VisualizerPreset, VisualizerStyle } from "../types";

export interface RenderCustomVisualizerOptions {
  ctx: CanvasRenderingContext2D;
  style: VisualizerStyle;
  width: number;
  height: number;
  scale?: number;
  centerX: number;
  centerY: number;
  coverSize: number;
  currentTime: number;
  dataArray: Uint8Array | number[];
  bufferLength: number;
  bassEnergy: number;
  bassNormalized: number;
  preset: VisualizerPreset;
  showCover?: boolean;
  isPortrait?: boolean;
}

/**
 * Checks if the given style is one of the 10 extended animation styles.
 */
export function isExtendedVisualizerStyle(style: VisualizerStyle): boolean {
  return [
    "orb_pulsar",
    "galaxy_spiral",
    "laser_beams",
    "heartbeat",
    "dna_helix",
    "matrix_rain",
    "fire_flames",
    "crystal_poly",
    "lofi_rain",
    "retrowave_grid",
  ].includes(style);
}

/**
 * Renders the 10 new advanced Visualizer Animation styles onto any HTML5 2D Canvas.
 * Used identically in both live web player and 1080p/4K MP4 video export!
 */
export function renderExtendedVisualizerStyle(options: RenderCustomVisualizerOptions): void {
  const { style } = options;

  switch (style) {
    case "orb_pulsar":
      renderOrbPulsar(options);
      break;
    case "galaxy_spiral":
      renderGalaxySpiral(options);
      break;
    case "laser_beams":
      renderLaserBeams(options);
      break;
    case "heartbeat":
      renderHeartbeat(options);
      break;
    case "dna_helix":
      renderDnaHelix(options);
      break;
    case "matrix_rain":
      renderMatrixRain(options);
      break;
    case "fire_flames":
      renderFireFlames(options);
      break;
    case "crystal_poly":
      renderCrystalPoly(options);
      break;
    case "lofi_rain":
      renderLofiRain(options);
      break;
    case "retrowave_grid":
      renderRetrowaveGrid(options);
      break;
    default:
      break;
  }
}

// =========================================================================
// 1. PLASMA PULSAR ORB (គ្រាប់បាល់ពន្លឺផ្លាស្មា)
// =========================================================================
function renderOrbPulsar({
  ctx,
  centerX,
  centerY,
  coverSize,
  currentTime,
  dataArray,
  bufferLength,
  bassNormalized,
  preset,
  scale = 1,
  showCover = true,
}: RenderCustomVisualizerOptions): void {
  ctx.save();
  ctx.translate(centerX, centerY);

  const baseRadius = showCover ? coverSize / 2 + 10 * scale : 70 * scale;
  const pulseRadius = baseRadius + bassNormalized * 32 * scale;

  // Outer glowing plasma halo
  const haloGrad = ctx.createRadialGradient(0, 0, baseRadius * 0.8, 0, 0, pulseRadius * 1.5);
  haloGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  haloGrad.addColorStop(0.3, preset.accentColor + "aa");
  haloGrad.addColorStop(0.7, preset.barColor + "44");
  haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.beginPath();
  ctx.arc(0, 0, pulseRadius * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = haloGrad;
  ctx.fill();

  // Multi-arc electric plasma tentacles radiating outwards
  const numArcs = 24;
  for (let i = 0; i < numArcs; i++) {
    const angle = (i / numArcs) * Math.PI * 2 + currentTime * 0.8;
    const bin = Math.floor((i / numArcs) * (bufferLength * 0.8));
    const val = ((dataArray[bin] || 20) as number) / 255;
    const arcLen = (30 + val * 70 + bassNormalized * 40) * scale;

    const startX = Math.cos(angle) * (baseRadius + 4 * scale);
    const startY = Math.sin(angle) * (baseRadius + 4 * scale);

    const cpAngle = angle + (Math.sin(currentTime * 4 + i) * 0.3);
    const cpDist = baseRadius + arcLen * 0.6;
    const cpX = Math.cos(cpAngle) * cpDist;
    const cpY = Math.sin(cpAngle) * cpDist;

    const endX = Math.cos(angle + 0.1) * (baseRadius + arcLen);
    const endY = Math.sin(angle + 0.1) * (baseRadius + arcLen);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.strokeStyle = i % 2 === 0 ? preset.accentColor : "#ffffff";
    ctx.lineWidth = (1.5 + val * 2.5) * scale;
    ctx.shadowBlur = 12 * scale;
    ctx.shadowColor = preset.accentColor;
    ctx.stroke();

    // Spark node at tip
    ctx.beginPath();
    ctx.arc(endX, endY, (2 + val * 3) * scale, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  // Floating orbiting energy motes
  const motes = 12;
  for (let m = 0; m < motes; m++) {
    const orbAngle = currentTime * (1.2 + m * 0.15) + m * (Math.PI * 2 / motes);
    const orbDist = baseRadius + (20 + (m * 8) % 45) * scale + Math.sin(currentTime * 3 + m) * 10 * scale;
    const mx = Math.cos(orbAngle) * orbDist;
    const my = Math.sin(orbAngle) * orbDist * 0.65; // elliptic orbit

    ctx.beginPath();
    ctx.arc(mx, my, (2.5 + (m % 3)) * scale, 0, Math.PI * 2);
    ctx.fillStyle = m % 3 === 0 ? "#ffffff" : preset.accentColor;
    ctx.shadowBlur = 10 * scale;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
  }

  ctx.restore();
}

// =========================================================================
// 2. COSMIC GALAXY SPIRAL (គន្លងកាឡាក់ស៊ីវិលវល់)
// =========================================================================
function renderGalaxySpiral({
  ctx,
  centerX,
  centerY,
  width,
  currentTime,
  dataArray,
  bufferLength,
  bassNormalized,
  preset,
  scale = 1,
}: RenderCustomVisualizerOptions): void {
  ctx.save();
  ctx.translate(centerX, centerY);

  const arms = 4;
  const starsPerArm = 36;
  const maxRadius = width * 0.42;

  // Swirling galaxy dust nebula center glow
  const dustGrad = ctx.createRadialGradient(0, 0, 10 * scale, 0, 0, maxRadius * 0.7);
  dustGrad.addColorStop(0, "rgba(168, 85, 247, 0.35)");
  dustGrad.addColorStop(0.4, preset.accentColor + "33");
  dustGrad.addColorStop(0.8, "rgba(6, 182, 212, 0.15)");
  dustGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.beginPath();
  ctx.arc(0, 0, maxRadius * 0.7, 0, Math.PI * 2);
  ctx.fillStyle = dustGrad;
  ctx.fill();

  for (let a = 0; a < arms; a++) {
    const armBaseAngle = (a / arms) * Math.PI * 2;

    for (let s = 1; s <= starsPerArm; s++) {
      const progress = s / starsPerArm;
      const binIdx = Math.floor(progress * (bufferLength * 0.75));
      const freqVal = ((dataArray[binIdx] || 15) as number) / 255;

      // Logarithmic spiral math
      const r = progress * maxRadius + (freqVal * 25 * scale);
      const theta = armBaseAngle + (progress * Math.PI * 2.8) + (currentTime * 0.4);

      const sx = Math.cos(theta) * r;
      const sy = Math.sin(theta) * r * 0.72; // perspective tilt

      const starSize = Math.max(1.2 * scale, (progress * 3.5 + freqVal * 4 + bassNormalized * 2) * scale);
      const alpha = Math.min(1, 0.25 + freqVal * 0.75 + (1 - progress) * 0.3);

      ctx.beginPath();
      ctx.arc(sx, sy, starSize, 0, Math.PI * 2);

      const colorTier = (a + s) % 3;
      ctx.fillStyle =
        colorTier === 0
          ? `rgba(255, 255, 255, ${alpha})`
          : colorTier === 1
          ? `rgba(168, 85, 247, ${alpha})`
          : `rgba(6, 182, 212, ${alpha})`;

      ctx.shadowBlur = 6 * scale;
      ctx.shadowColor = preset.accentColor;
      ctx.fill();
    }
  }

  ctx.restore();
}

// =========================================================================
// 3. CONCERT LASER SHOW (កាំរស្មីឡាស៊ែរខនសឺត)
// =========================================================================
function renderLaserBeams({
  ctx,
  width,
  height,
  currentTime,
  dataArray,
  bufferLength,
  bassNormalized,
  preset,
  scale = 1,
}: RenderCustomVisualizerOptions): void {
  ctx.save();

  const numBeams = 12;
  const originY = height * 0.92;
  const origins = [
    { x: width * 0.15, y: originY },
    { x: width * 0.5, y: originY + 15 * scale },
    { x: width * 0.85, y: originY },
  ];

  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < numBeams; i++) {
    const origin = origins[i % origins.length];
    const bin = Math.floor((i / numBeams) * (bufferLength * 0.8));
    const val = ((dataArray[bin] || 15) as number) / 255;

    // Laser sweep angle
    const sweepRange = Math.PI * 0.65;
    const sweepPhase = currentTime * (1.1 + (i % 3) * 0.4) + i * 0.55;
    const angle = -Math.PI * 0.85 + ((Math.sin(sweepPhase) + 1) / 2) * sweepRange;

    const laserLen = Math.max(width * 0.6, (width * 0.8) * (0.8 + val * 0.4 + bassNormalized * 0.3));
    const targetX = origin.x + Math.cos(angle) * laserLen;
    const targetY = origin.y + Math.sin(angle) * laserLen;

    const beamAlpha = Math.min(1, 0.4 + val * 0.6);
    const laserColor =
      i % 3 === 0
        ? `rgba(239, 68, 68, ${beamAlpha})` // Red
        : i % 3 === 1
        ? `rgba(6, 182, 212, ${beamAlpha})` // Cyan
        : `rgba(168, 85, 247, ${beamAlpha})`; // Purple

    // Wide fog glow beam
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(targetX, targetY);
    ctx.strokeStyle = laserColor;
    ctx.lineWidth = (6 + val * 8) * scale;
    ctx.shadowBlur = 18 * scale;
    ctx.shadowColor = laserColor;
    ctx.stroke();

    // Sharp white core laser
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(targetX, targetY);
    ctx.strokeStyle = `rgba(255, 255, 255, ${beamAlpha * 0.9})`;
    ctx.lineWidth = (1.8 + val * 1.5) * scale;
    ctx.shadowBlur = 4 * scale;
    ctx.shadowColor = "#ffffff";
    ctx.stroke();

    // Spot emitter ring
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, (5 + val * 4) * scale, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  ctx.restore();
}

// =========================================================================
// 4. NEON EKG HEARTBEAT (ចង្វាក់បេះដូង EKG)
// =========================================================================
function renderHeartbeat({
  ctx,
  width,
  height,
  currentTime,
  bassNormalized,
  preset,
  scale = 1,
  isPortrait = false,
}: RenderCustomVisualizerOptions): void {
  ctx.save();

  const baseY = height * (isPortrait ? 0.72 : 0.78);
  const segments = 120;
  const stepX = width / segments;

  ctx.shadowBlur = 14 * scale;
  ctx.shadowColor = preset.accentColor;

  ctx.beginPath();
  for (let s = 0; s <= segments; s++) {
    const x = s * stepX;
    // Moving wave phase
    const t = ((s / segments) * 6 - currentTime * 3) % 6;
    const normT = (t + 6) % 6;

    let ekgOffset = 0;
    // P-Q-R-S-T wave pulse simulation
    if (normT > 1.8 && normT < 2.1) {
      ekgOffset = -12 * Math.sin((normT - 1.8) * Math.PI / 0.3); // P wave
    } else if (normT >= 2.1 && normT < 2.2) {
      ekgOffset = 8 * Math.sin((normT - 2.1) * Math.PI / 0.1); // Q dip
    } else if (normT >= 2.2 && normT < 2.45) {
      ekgOffset = -(90 + bassNormalized * 90) * Math.sin((normT - 2.2) * Math.PI / 0.25); // R peak!
    } else if (normT >= 2.45 && normT < 2.6) {
      ekgOffset = (35 + bassNormalized * 25) * Math.sin((normT - 2.45) * Math.PI / 0.15); // S dip
    } else if (normT >= 2.7 && normT < 3.1) {
      ekgOffset = -22 * Math.sin((normT - 2.7) * Math.PI / 0.4); // T wave
    }

    const y = baseY + ekgOffset * scale;

    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  // Draw wide glow line
  ctx.strokeStyle = preset.accentColor;
  ctx.lineWidth = 3.5 * scale;
  ctx.stroke();

  // Draw bright white core line
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.6 * scale;
  ctx.stroke();

  // Draw digital HUD stats readout
  const bpm = Math.round(118 + bassNormalized * 32);
  ctx.font = `bold ${Math.round(11 * scale)}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = preset.accentColor;
  ctx.textAlign = "left";
  ctx.fillText(`♥ BPM: ${bpm} // PULSE: 99.4% // AUDIO-SYNC: LOCKED`, 24 * scale, baseY - 35 * scale);

  ctx.restore();
}

// =========================================================================
// 5. 3D DNA BIO-HELIX (ខ្សែច្រវាក់ DNA 3D)
// =========================================================================
function renderDnaHelix({
  ctx,
  width,
  height,
  currentTime,
  dataArray,
  bufferLength,
  preset,
  scale = 1,
  isPortrait = false,
}: RenderCustomVisualizerOptions): void {
  ctx.save();

  const baseY = height * (isPortrait ? 0.72 : 0.78);
  const nodes = 38;
  const helixWidth = width * 0.86;
  const startX = (width - helixWidth) / 2;
  const stepX = helixWidth / nodes;
  const helixAmplitude = (isPortrait ? 38 : 48) * scale;

  for (let i = 0; i < nodes; i++) {
    const bin = Math.floor((i / nodes) * (bufferLength * 0.8));
    const val = ((dataArray[bin] || 15) as number) / 255;
    const dynamicAmp = helixAmplitude * (0.8 + val * 0.9);

    const x = startX + i * stepX;
    const phase = i * 0.32 + currentTime * 2.8;

    // Strand 1 (front/back 3D depth)
    const sin1 = Math.sin(phase);
    const cos1 = Math.cos(phase);
    const y1 = baseY + sin1 * dynamicAmp;
    const depth1 = (cos1 + 1) / 2; // 0 to 1

    // Strand 2 (opposite phase)
    const sin2 = Math.sin(phase + Math.PI);
    const cos2 = Math.cos(phase + Math.PI);
    const y2 = baseY + sin2 * dynamicAmp;
    const depth2 = (cos2 + 1) / 2;

    // Draw connecting base pair rung
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + val * 0.5})`;
    ctx.lineWidth = (1 + val * 1.5) * scale;
    ctx.stroke();

    // Node 1 sphere
    const r1 = (3 + depth1 * 4 + val * 3) * scale;
    ctx.beginPath();
    ctx.arc(x, y1, r1, 0, Math.PI * 2);
    ctx.fillStyle = preset.accentColor;
    ctx.shadowBlur = 8 * scale * depth1;
    ctx.shadowColor = preset.accentColor;
    ctx.fill();

    // Node 2 sphere
    const r2 = (3 + depth2 * 4 + val * 3) * scale;
    ctx.beginPath();
    ctx.arc(x, y2, r2, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8"; // Cyan partner
    ctx.shadowBlur = 8 * scale * depth2;
    ctx.shadowColor = "#38bdf8";
    ctx.fill();
  }

  ctx.restore();
}

// =========================================================================
// 6. CYBER MATRIX RAIN (ភ្លៀងកូដ Matrix ឌីជីថល)
// =========================================================================
function renderMatrixRain({
  ctx,
  width,
  height,
  currentTime,
  dataArray,
  bufferLength,
  bassNormalized,
  preset,
  scale = 1,
}: RenderCustomVisualizerOptions): void {
  ctx.save();

  const numCols = Math.min(36, Math.floor(width / (26 * scale)));
  const colSpacing = width / numCols;
  const glyphs = "0123456789ABCDEF$#@*!<>~♫♪";

  ctx.font = `bold ${Math.round(13 * scale)}px 'JetBrains Mono', monospace`;
  ctx.textAlign = "center";

  for (let c = 0; c < numCols; c++) {
    const bin = Math.floor((c / numCols) * (bufferLength * 0.8));
    const val = ((dataArray[bin] || 15) as number) / 255;
    const colX = c * colSpacing + colSpacing / 2;

    const speed = 1.8 + (c % 5) * 0.7 + bassNormalized * 3;
    const leadY = ((currentTime * speed * 70 + c * 83) % (height * 1.3)) - height * 0.15;

    const trailCount = 10 + Math.floor(val * 14);

    for (let t = 0; t < trailCount; t++) {
      const charY = leadY - t * (16 * scale);
      if (charY < 0 || charY > height) continue;

      const glyphIndex = Math.floor((c * 7 + t * 3 + Math.floor(currentTime * 8)) % glyphs.length);
      const char = glyphs[glyphIndex];

      const normDist = t / trailCount;
      if (t === 0) {
        // Glowing leading head character (White)
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 10 * scale;
        ctx.shadowColor = "#ffffff";
      } else {
        // Trailing fading green/cyan cyber text
        const alpha = Math.max(0, 1 - normDist);
        ctx.fillStyle = c % 2 === 0 ? `rgba(34, 197, 94, ${alpha})` : `rgba(6, 182, 212, ${alpha})`;
        ctx.shadowBlur = 4 * scale;
        ctx.shadowColor = preset.accentColor;
      }

      ctx.fillText(char, colX, charY);
    }
  }

  ctx.restore();
}

// =========================================================================
// 7. INFERNO BASS FLAMES (អណ្តាតភ្លើងបាស)
// =========================================================================
function renderFireFlames({
  ctx,
  width,
  height,
  currentTime,
  dataArray,
  bufferLength,
  bassNormalized,
  scale = 1,
}: RenderCustomVisualizerOptions): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const numTongues = 40;
  const tongueW = width / numTongues;
  const baseY = height;

  for (let i = 0; i < numTongues; i++) {
    const bin = Math.floor((i / numTongues) * (bufferLength * 0.75));
    const val = ((dataArray[bin] || 15) as number) / 255;
    const x = i * tongueW + tongueW / 2;

    const flameHeight = Math.max(
      20 * scale,
      (val * (height * 0.38) + bassNormalized * (height * 0.22)) * (0.8 + Math.sin(currentTime * 8 + i) * 0.2)
    );

    const grad = ctx.createLinearGradient(x, baseY, x, baseY - flameHeight);
    grad.addColorStop(0, "rgba(239, 68, 68, 0.95)"); // Deep red base
    grad.addColorStop(0.4, "rgba(249, 115, 22, 0.85)"); // Vibrant orange
    grad.addColorStop(0.75, "rgba(250, 204, 21, 0.75)"); // Radiant yellow
    grad.addColorStop(1, "rgba(255, 255, 255, 0.0)"); // Soft transparent tip

    ctx.beginPath();
    ctx.moveTo(x - tongueW * 0.8, baseY);
    ctx.quadraticCurveTo(
      x + Math.sin(currentTime * 6 + i) * (14 * scale),
      baseY - flameHeight * 0.55,
      x,
      baseY - flameHeight
    );
    ctx.quadraticCurveTo(
      x - Math.sin(currentTime * 6 + i) * (14 * scale),
      baseY - flameHeight * 0.55,
      x + tongueW * 0.8,
      baseY
    );
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Floating embers / sparks
  const numEmbers = 24;
  for (let e = 0; e < numEmbers; e++) {
    const ex = (Math.sin(e * 7.3 + currentTime * 0.8) * 0.5 + 0.5) * width;
    const ey = height - ((currentTime * (40 + (e % 5) * 20) + e * 45) % (height * 0.55));
    const eSize = (1.5 + (e % 3) + bassNormalized * 2) * scale;

    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
    ctx.fillStyle = e % 2 === 0 ? "#facc15" : "#f97316";
    ctx.shadowBlur = 8 * scale;
    ctx.shadowColor = "#f97316";
    ctx.fill();
  }

  ctx.restore();
}

// =========================================================================
// 8. PRISM CRYSTAL GEM (ត្បូងគ្រីស្តាល់ 3D)
// =========================================================================
function renderCrystalPoly({
  ctx,
  centerX,
  centerY,
  coverSize,
  currentTime,
  dataArray,
  bufferLength,
  bassNormalized,
  preset,
  scale = 1,
  showCover = true,
}: RenderCustomVisualizerOptions): void {
  ctx.save();
  ctx.translate(centerX, centerY);

  const radius = (showCover ? coverSize * 0.7 : 110 * scale) + bassNormalized * 24 * scale;
  const vertices = 8;
  const points: { x: number; y: number }[] = [];

  // Calculate polygon vertices with dynamic audio breathing
  for (let v = 0; v < vertices; v++) {
    const angle = (v / vertices) * Math.PI * 2 + currentTime * 0.5;
    const bin = Math.floor((v / vertices) * (bufferLength * 0.7));
    const val = ((dataArray[bin] || 15) as number) / 255;
    const r = radius * (0.85 + val * 0.3);

    points.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r * 0.82,
    });
  }

  // Draw multifaceted translucent crystal faces
  for (let i = 0; i < vertices; i++) {
    const next = (i + 1) % vertices;
    const opp = (i + 4) % vertices;

    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[next].x, points[next].y);
    ctx.lineTo(0, 0); // Center apex
    ctx.closePath();

    ctx.fillStyle = i % 2 === 0 ? preset.accentColor + "28" : "#38bdf828";
    ctx.fill();

    // Secondary interior facets
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[opp].x, points[opp].y);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 + bassNormalized * 0.25})`;
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
  }

  // Exterior crystal perimeter edge
  ctx.beginPath();
  for (let i = 0; i < vertices; i++) {
    if (i === 0) ctx.moveTo(points[i].x, points[i].y);
    else ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = preset.accentColor;
  ctx.lineWidth = 2.5 * scale;
  ctx.shadowBlur = 16 * scale;
  ctx.shadowColor = preset.accentColor;
  ctx.stroke();

  ctx.restore();
}

// =========================================================================
// 9. COZY LO-FI RAIN WINDOW (តំណក់ភ្លៀង Lo-Fi)
// =========================================================================
function renderLofiRain({
  ctx,
  width,
  height,
  currentTime,
  dataArray,
  bufferLength,
  bassNormalized,
  preset,
  scale = 1,
}: RenderCustomVisualizerOptions): void {
  ctx.save();

  // 1. Distant Warm Bokeh circles (like streetlights seen through wet glass)
  const numBokeh = 14;
  for (let b = 0; b < numBokeh; b++) {
    const bx = ((b * 127) % width);
    const by = ((b * 89) % (height * 0.7));
    const bSize = (20 + (b * 7) % 35 + bassNormalized * 18) * scale;
    const bAlpha = 0.08 + (Math.sin(currentTime * 1.5 + b) * 0.04) + bassNormalized * 0.08;

    const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, bSize);
    bGrad.addColorStop(0, b % 2 === 0 ? `rgba(245, 158, 11, ${bAlpha * 1.5})` : `rgba(6, 182, 212, ${bAlpha * 1.5})`);
    bGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fillStyle = bGrad;
    ctx.fill();
  }

  // 2. Realistic slanted falling rain streaks
  const numRain = 45;
  const slant = 18 * scale;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 1.2 * scale;

  for (let r = 0; r < numRain; r++) {
    const rx = ((r * 67 + currentTime * 12) % width);
    const speed = 400 + (r % 6) * 70;
    const ry = ((currentTime * speed + r * 97) % height);
    const dropLen = (18 + (r % 4) * 8) * scale;

    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + slant, ry + dropLen);
    ctx.stroke();
  }

  // 3. Gentle horizontal sound ripples on bottom water pool
  const baseY = height * 0.88;
  const poolRipples = 6;
  for (let p = 0; p < poolRipples; p++) {
    const bin = Math.floor((p / poolRipples) * (bufferLength * 0.6));
    const val = ((dataArray[bin] || 15) as number) / 255;
    const rPhase = ((currentTime * 1.5 + p * 0.8) % 3) / 3;
    const rWidth = (rPhase * (width * 0.45) + val * 40) * scale;
    const rAlpha = (1 - rPhase) * (0.35 + bassNormalized * 0.4);

    ctx.beginPath();
    ctx.ellipse(width * 0.5, baseY + p * 8 * scale, rWidth, 6 * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${rAlpha})`;
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
  }

  ctx.restore();
}

// =========================================================================
// 10. 80S RETRO SYNTHWAVE GRID (ជើងមេឃ Synthwave 80s)
// =========================================================================
function renderRetrowaveGrid({
  ctx,
  width,
  height,
  currentTime,
  dataArray,
  bufferLength,
  bassNormalized,
  scale = 1,
  isPortrait = false,
}: RenderCustomVisualizerOptions): void {
  ctx.save();

  const horizonY = height * (isPortrait ? 0.62 : 0.68);
  const gridBottomY = height;

  // 1. Giant Segmented Neon Retro Sun at Horizon
  const sunRadius = (isPortrait ? 75 : 95) * scale;
  const sunCenterX = width * 0.5;
  const sunCenterY = horizonY - 15 * scale;

  ctx.save();
  // Clip top half for sun
  ctx.beginPath();
  ctx.rect(0, 0, width, horizonY);
  ctx.clip();

  const sunGrad = ctx.createLinearGradient(sunCenterX, sunCenterY - sunRadius, sunCenterX, sunCenterY + sunRadius);
  sunGrad.addColorStop(0, "#fde047"); // bright yellow top
  sunGrad.addColorStop(0.5, "#f43f5e"); // hot magenta
  sunGrad.addColorStop(1, "#881337"); // deep crimson

  ctx.beginPath();
  ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.shadowBlur = 24 * scale;
  ctx.shadowColor = "#f43f5e";
  ctx.fill();

  // Horizontal retro stripes cutting through sun
  const stripes = 6;
  for (let s = 1; s <= stripes; s++) {
    const sy = sunCenterY + (s / stripes) * (sunRadius * 0.85);
    const sh = (2.5 + s * 1.2) * scale;
    ctx.fillStyle = "rgba(10, 10, 16, 0.95)";
    ctx.fillRect(sunCenterX - sunRadius - 10, sy, (sunRadius + 10) * 2, sh);
  }
  ctx.restore();

  // 2. Glowing Neon Horizon Line
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width, horizonY);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.5 * scale;
  ctx.shadowBlur = 14 * scale;
  ctx.shadowColor = "#38bdf8";
  ctx.stroke();

  // 3. 3D Perspective Wireframe Grid (Moving forward with audio ripples)
  const numLongitudinalLines = 20;
  const vanishingX = width * 0.5;

  ctx.shadowBlur = 8 * scale;
  ctx.shadowColor = "#ec4899";

  // Perspective vertical perspective rays
  for (let l = 0; l <= numLongitudinalLines; l++) {
    const bottomX = (l / numLongitudinalLines) * (width * 1.6) - width * 0.3;

    ctx.beginPath();
    ctx.moveTo(vanishingX, horizonY);
    ctx.lineTo(bottomX, gridBottomY);
    ctx.strokeStyle = "rgba(236, 72, 153, 0.45)"; // Hot pink
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
  }

  // Undulating horizontal depth lines
  const numDepthLines = 14;
  for (let d = 1; d <= numDepthLines; d++) {
    const rawProgress = (d + (currentTime * 1.8) % 1) / numDepthLines;
    const progress = Math.pow(rawProgress, 2.2); // Exponential depth
    const gridY = horizonY + progress * (gridBottomY - horizonY);

    const bin = Math.floor((d / numDepthLines) * (bufferLength * 0.6));
    const val = ((dataArray[bin] || 15) as number) / 255;
    const ripple = Math.sin(progress * 12 + currentTime * 6) * (val * 16 * scale + bassNormalized * 10 * scale);

    ctx.beginPath();
    ctx.moveTo(0, gridY + ripple);
    ctx.lineTo(width, gridY + ripple);
    ctx.strokeStyle = `rgba(6, 182, 212, ${Math.min(1, 0.2 + progress * 0.8)})`; // Cyan
    ctx.lineWidth = (1 + progress * 2) * scale;
    ctx.stroke();
  }

  ctx.restore();
}
