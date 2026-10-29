import { BackgroundBrightnessMode } from "../types";

/**
 * Renders an image as a 100% full-screen cover on any HTML5 Canvas,
 * maintaining high-definition clarity and 100% original brightness and vibrant colors.
 */
export function renderImageBackgroundOnCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  brightnessMode: BackgroundBrightnessMode = "original"
): void {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  // Exact cover scaling: guarantees 100% full-bleed coverage with no black borders
  const hRatio = width / imgW;
  const vRatio = height / imgH;
  const ratio = Math.max(hRatio, vRatio);

  const drawW = Math.ceil(imgW * ratio);
  const drawH = Math.ceil(imgH * ratio);
  const shiftX = Math.floor((width - drawW) / 2);
  const shiftY = Math.floor((height - drawH) / 2);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Draw original photo at full scale and 100% opacity
  ctx.drawImage(img, 0, 0, imgW, imgH, shiftX, shiftY, drawW, drawH);

  // 2. Brightness & Clarity Processing
  if (brightnessMode === "original") {
    // 🌟 ORIGINAL BRIGHTNESS (100% Pure & Vivid):
    // Zero full-screen blackening veil! The user's photo shines with its real colors and bright lighting.
    // Subtle localized micro-feather only at the bottom 14% where lyrics/dock sit.
    const bottomFeather = ctx.createLinearGradient(0, height * 0.86, 0, height);
    bottomFeather.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomFeather.addColorStop(1, "rgba(0, 0, 0, 0.25)");
    ctx.fillStyle = bottomFeather;
    ctx.fillRect(0, height * 0.86, width, height * 0.14);
  } else if (brightnessMode === "soft") {
    // 🎬 SOFT CINEMATIC: Gentle, balanced soft lighting
    const softGrad = ctx.createLinearGradient(0, 0, 0, height);
    softGrad.addColorStop(0, "rgba(0, 0, 0, 0.15)");
    softGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.05)");
    softGrad.addColorStop(1, "rgba(0, 0, 0, 0.35)");
    ctx.fillStyle = softGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (brightnessMode === "dimmed") {
    // 🌙 FOCUS DIM: Darkened for glowing neon visualizers
    const dimGrad = ctx.createLinearGradient(0, 0, 0, height);
    dimGrad.addColorStop(0, "rgba(10, 10, 16, 0.40)");
    dimGrad.addColorStop(0.5, "rgba(10, 10, 16, 0.25)");
    dimGrad.addColorStop(1, "rgba(10, 10, 16, 0.55)");
    ctx.fillStyle = dimGrad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

/**
 * Renders a video background as a 100% full-screen cover on any HTML5 Canvas,
 * maintaining high-definition clarity and crisp original colors.
 */
export function renderVideoBackgroundOnCanvas(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
  brightnessMode: BackgroundBrightnessMode = "original"
): void {
  const vW = video.videoWidth || 1280;
  const vH = video.videoHeight || 720;
  if (!vW || !vH) return;

  const hRatio = width / vW;
  const vRatio = height / vH;
  const ratio = Math.max(hRatio, vRatio);

  const drawW = Math.ceil(vW * ratio);
  const drawH = Math.ceil(vH * ratio);
  const shiftX = Math.floor((width - drawW) / 2);
  const shiftY = Math.floor((height - drawH) / 2);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(video, 0, 0, vW, vH, shiftX, shiftY, drawW, drawH);

  if (brightnessMode === "original") {
    const bottomFeather = ctx.createLinearGradient(0, height * 0.86, 0, height);
    bottomFeather.addColorStop(0, "rgba(0, 0, 0, 0)");
    bottomFeather.addColorStop(1, "rgba(0, 0, 0, 0.25)");
    ctx.fillStyle = bottomFeather;
    ctx.fillRect(0, height * 0.86, width, height * 0.14);
  } else if (brightnessMode === "soft") {
    const softGrad = ctx.createLinearGradient(0, 0, 0, height);
    softGrad.addColorStop(0, "rgba(0, 0, 0, 0.15)");
    softGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.05)");
    softGrad.addColorStop(1, "rgba(0, 0, 0, 0.35)");
    ctx.fillStyle = softGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (brightnessMode === "dimmed") {
    const dimGrad = ctx.createLinearGradient(0, 0, 0, height);
    dimGrad.addColorStop(0, "rgba(10, 10, 16, 0.40)");
    dimGrad.addColorStop(0.5, "rgba(10, 10, 16, 0.25)");
    dimGrad.addColorStop(1, "rgba(10, 10, 16, 0.55)");
    ctx.fillStyle = dimGrad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}
