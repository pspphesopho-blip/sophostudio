import { VideoBackgroundPreset } from "../types";

export const PRESET_VIDEO_BACKGROUNDS: VideoBackgroundPreset[] = [
  {
    id: "video-stage-lights",
    name: "DJ Concert Stage Lights",
    nameKhmer: "ស្ទូឌីយោភ្លើងពណ៌ DJ Concert Lights",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    accentColor: "#ec4899",
    description: "ចលនាភ្លើងស្ទូឌីយោបាញ់ជះពន្លឺពណ៌ស្វាយ និងផ្កាឈូក តាមចង្វាក់ភ្លេង",
  },
  {
    id: "video-cyber-galaxy",
    name: "Cyber Cosmic Galaxy",
    nameKhmer: "លំហអាកាស និងកាឡាក់ស៊ី Cosmic Galaxy",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop",
    accentColor: "#06b6d4",
    description: "ចលនាផ្កាយវិល និងធូលីកាឡាក់ស៊ីរំកិលក្នុងលំហអាកាសដ៏ស្រស់ស្អាត",
  },
  {
    id: "video-neon-rain",
    name: "Neon City & Night Rain",
    nameKhmer: "ទីក្រុងរាត្រី និងភ្លៀងធ្លាក់ Neon City",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop",
    accentColor: "#3b82f6",
    description: "បរិយាកាសទីក្រុងនីអុងពេលរាត្រី មានដំណក់ភ្លៀងរត់ចុះក្រោមបែប Lo-Fi",
  },
  {
    id: "video-sunset-waves",
    name: "Sunset Ocean Waves",
    nameKhmer: "រលកសមុទ្រ និងថ្ងៃលិច Sunset Waves",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    accentColor: "#f59e0b",
    description: "ពន្លឺរលកសមុទ្ររំកិលប៉ះផ្ទៃមេឃពណ៌ទឹកក្រូចមាស រ៉ូមែនទិក",
  },
  {
    id: "video-golden-dust",
    name: "Golden Luxury Bokeh",
    nameKhmer: "ពន្លឺផ្កាយមាស Golden Bokeh Dust",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    accentColor: "#eab308",
    description: "គ្រាប់ពន្លឺមាសបាញ់រំកិលអណ្តែតថ្នមៗ ផ្តល់ភាពថ្លៃថ្នូរ និងកក់ក្តៅ",
  },
];

// In-memory cache for generated video blobs
const videoBlobCache = new Map<string, string>();

/**
 * Generates an ultra-smooth looping animated WebM video blob for presets
 * with zero network dependencies. Runs locally in the browser!
 */
export async function getPresetVideoBlobUrl(presetId: string): Promise<string> {
  if (videoBlobCache.has(presetId)) {
    return videoBlobCache.get(presetId)!;
  }

  return new Promise((resolve) => {
    try {
      const width = 640;
      const height = 360;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      // Check MediaRecorder support
      if (typeof MediaRecorder === "undefined") {
        resolve("");
        return;
      }

      const stream = canvas.captureStream(30);
      let mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        videoBlobCache.set(presetId, url);
        resolve(url);
      };

      recorder.start();

      const totalFrames = 90; // 3 seconds at 30 fps
      let currentFrame = 0;

      const drawFrame = () => {
        const t = (currentFrame / totalFrames) * Math.PI * 2;
        const progress = currentFrame / totalFrames;

        if (presetId === "video-stage-lights") {
          // Dark stage base
          ctx.fillStyle = "#070710";
          ctx.fillRect(0, 0, width, height);

          // Moving spotlights
          const beam1X = width * 0.25 + Math.sin(t) * 120;
          const beam2X = width * 0.75 - Math.sin(t + 0.8) * 120;
          const beam3X = width * 0.5 + Math.cos(t * 1.5) * 80;

          // Beam 1
          const g1 = ctx.createRadialGradient(beam1X, 0, 10, beam1X, height * 0.8, 220);
          g1.addColorStop(0, "rgba(236, 72, 153, 0.65)");
          g1.addColorStop(0.6, "rgba(168, 85, 247, 0.25)");
          g1.addColorStop(1, "transparent");
          ctx.fillStyle = g1;
          ctx.fillRect(0, 0, width, height);

          // Beam 2
          const g2 = ctx.createRadialGradient(beam2X, 0, 10, beam2X, height * 0.8, 220);
          g2.addColorStop(0, "rgba(6, 182, 212, 0.6)");
          g2.addColorStop(0.6, "rgba(59, 130, 246, 0.2)");
          g2.addColorStop(1, "transparent");
          ctx.fillStyle = g2;
          ctx.fillRect(0, 0, width, height);

          // Beam 3
          const g3 = ctx.createRadialGradient(beam3X, height, 10, beam3X, height * 0.2, 180);
          g3.addColorStop(0, "rgba(245, 158, 11, 0.5)");
          g3.addColorStop(1, "transparent");
          ctx.fillStyle = g3;
          ctx.fillRect(0, 0, width, height);
        } else if (presetId === "video-cyber-galaxy") {
          // Deep galaxy nebula
          ctx.fillStyle = "#04060d";
          ctx.fillRect(0, 0, width, height);

          // Nebula cloud swirl
          const cx = width / 2 + Math.sin(t) * 30;
          const cy = height / 2 + Math.cos(t) * 20;
          const nebula = ctx.createRadialGradient(cx, cy, 30, cx, cy, 260);
          nebula.addColorStop(0, "rgba(59, 130, 246, 0.45)");
          nebula.addColorStop(0.5, "rgba(147, 51, 234, 0.3)");
          nebula.addColorStop(1, "transparent");
          ctx.fillStyle = nebula;
          ctx.fillRect(0, 0, width, height);

          // Orbiting cosmic stars
          for (let s = 0; s < 45; s++) {
            const seed = s * 137.5;
            const angle = seed + t * (0.4 + (s % 3) * 0.2);
            const dist = 30 + ((s * 17) % (width * 0.45));
            const sx = width / 2 + Math.cos(angle) * dist;
            const sy = height / 2 + Math.sin(angle) * (dist * 0.65);
            const r = 1 + (s % 3);
            ctx.fillStyle = s % 2 === 0 ? "#67e8f9" : "#f472b6";
            ctx.globalAlpha = 0.4 + Math.sin(t * 2 + s) * 0.4;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        } else if (presetId === "video-neon-rain") {
          // Rainy night cityscape gradient
          const rainGrad = ctx.createLinearGradient(0, 0, 0, height);
          rainGrad.addColorStop(0, "#080c14");
          rainGrad.addColorStop(0.6, "#0e1526");
          rainGrad.addColorStop(1, "#181028");
          ctx.fillStyle = rainGrad;
          ctx.fillRect(0, 0, width, height);

          // Neon highway glow bars
          const glow = ctx.createRadialGradient(width / 2, height * 0.9, 20, width / 2, height * 0.9, width * 0.6);
          glow.addColorStop(0, "rgba(236, 72, 153, 0.45)");
          glow.addColorStop(0.6, "rgba(6, 182, 212, 0.2)");
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, width, height);

          // Downward rain streaks
          ctx.strokeStyle = "rgba(186, 230, 253, 0.45)";
          ctx.lineWidth = 1.2;
          for (let r = 0; r < 50; r++) {
            const rx = (r * 19.3) % width;
            const ry = ((r * 37 + progress * 600) % (height + 40)) - 20;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 2, ry + 16);
            ctx.stroke();
          }
        } else if (presetId === "video-sunset-waves") {
          // Sunset sky
          const sky = ctx.createLinearGradient(0, 0, 0, height);
          sky.addColorStop(0, "#2a0845");
          sky.addColorStop(0.4, "#6441a5");
          sky.addColorStop(0.7, "#fe8c00");
          sky.addColorStop(1, "#f83600");
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, width, height);

          // Sun orb
          const sunY = height * 0.65 + Math.sin(t * 0.5) * 8;
          const sun = ctx.createRadialGradient(width / 2, sunY, 15, width / 2, sunY, 120);
          sun.addColorStop(0, "rgba(255, 247, 237, 0.9)");
          sun.addColorStop(0.3, "rgba(254, 215, 170, 0.7)");
          sun.addColorStop(1, "transparent");
          ctx.fillStyle = sun;
          ctx.fillRect(0, 0, width, height);

          // Wave horizontal bands
          for (let w = 0; w < 6; w++) {
            const waveY = height * 0.72 + w * 14;
            ctx.fillStyle = `rgba(20, 8, 40, ${0.45 + w * 0.08})`;
            ctx.beginPath();
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 30) {
              const yOffset = Math.sin(t + x * 0.015 + w) * 6;
              ctx.lineTo(x, waveY + yOffset);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();
          }
        } else {
          // Golden luxury bokeh
          ctx.fillStyle = "#0a0804";
          ctx.fillRect(0, 0, width, height);

          // Floating golden orbs
          for (let b = 0; b < 35; b++) {
            const bx = (width * 0.1 + (b * 47) % (width * 0.8)) + Math.sin(t + b) * 20;
            const by = ((height + 40 - ((b * 31 + progress * 240) % (height + 80)))) - 20;
            const bSize = 6 + (b % 5) * 5;
            const grad = ctx.createRadialGradient(bx, by, 0, bx, by, bSize);
            grad.addColorStop(0, "rgba(254, 240, 138, 0.85)");
            grad.addColorStop(0.5, "rgba(234, 179, 8, 0.45)");
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(bx, by, bSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        currentFrame++;
        if (currentFrame < totalFrames) {
          // Continue recording next frame
          requestAnimationFrame(drawFrame);
        } else {
          // Finish recording
          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 60);
        }
      };

      drawFrame();
    } catch (err) {
      console.warn("Failed to generate preset video loop:", err);
      resolve("");
    }
  });
}
