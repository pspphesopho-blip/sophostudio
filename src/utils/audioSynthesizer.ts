import { SongTrack } from "../types";
import { parseLRC, KHMER_LYRIC_PRESETS } from "./lyricsParser";

// Helper to encode raw audio buffer into WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF chunk descriptor
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // FMT sub-chunk
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // subchunk1size (16 for PCM)
  setUint16(1); // audio format (1 is PCM)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample

  // Data sub-chunk
  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: "audio/wav" });
}

// Generates warm acoustic/melodic chords as a playable SongTrack
export async function createSynthesizedDemoSong(
  id: string,
  title: string,
  artist: string,
  style: "chill" | "traditional" | "ambient",
  coverUrl: string,
  caption?: string
): Promise<SongTrack> {
  const duration = 24; // 24 seconds preview loop
  const lrcText = KHMER_LYRIC_PRESETS[style] || KHMER_LYRIC_PRESETS.chill;
  const parsedLyrics = parseLRC(lrcText);

  try {
    const AudioCtx =
      typeof window !== "undefined"
        ? window.OfflineAudioContext || (window as any).webkitOfflineAudioContext
        : null;

    if (!AudioCtx) {
      throw new Error("OfflineAudioContext not available");
    }

    const sampleRate = 44100;
    const offlineCtx = new AudioCtx(2, sampleRate * duration, sampleRate);

    // Musical chord progressions
    let scaleFreqs = [261.63, 329.63, 392.0, 493.88, 523.25]; // C major pentatonic
    if (style === "traditional") {
      // Khmer Pinpeat / Roneat inspired pentatonic scale
      scaleFreqs = [293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
    } else if (style === "ambient") {
      scaleFreqs = [220.0, 261.63, 329.63, 392.0, 440.0, 523.25];
    }

    // Bass pad
    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(scaleFreqs[0] / 2, 0);
    bassGain.gain.setValueAtTime(0.18, 0);
    bassOsc.connect(bassGain);
    bassGain.connect(offlineCtx.destination);
    bassOsc.start(0);
    bassOsc.stop(duration);

    // Arpeggiated melody notes
    const noteDuration = 0.5;
    const totalNotes = Math.floor(duration / noteDuration);

    for (let i = 0; i < totalNotes; i++) {
      const time = i * noteDuration;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();

      const noteIdx = (i * 3) % scaleFreqs.length;
      const freq = scaleFreqs[noteIdx] * (i % 2 === 0 ? 1 : 1.5);

      osc.type = style === "traditional" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, time);

      // Envelope
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(0.14, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + noteDuration - 0.02);

      osc.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(time);
      osc.stop(time + noteDuration);
    }

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWav(renderedBuffer);
    const audioUrl = URL.createObjectURL(wavBlob);

    return {
      id,
      title,
      artist,
      caption: caption || "🌸 អារម្មណ៍ស្រស់ស្រាយជាមួយបទភ្លេងពិរោះៗ • Enjoy the Melody 🎧",
      lyrics: lrcText,
      parsedLyrics,
      album: "Khmer Studio Demo Collection",
      duration,
      fileBlob: wavBlob,
      audioUrl,
      coverUrl,
      addedAt: Date.now(),
      fileSize: wavBlob.size,
      sizeFormatted: (wavBlob.size / (1024 * 1024)).toFixed(1) + " MB",
      isDemo: true,
    };
  } catch (err) {
    console.warn("Audio synthesis unavailable, creating lightweight audio track:", err);
    // Create safe empty WAV blob fallback
    const emptyWav = new Blob([], { type: "audio/wav" });
    return {
      id,
      title,
      artist,
      caption: caption || "🌸 អារម្មណ៍ស្រស់ស្រាយជាមួយបទភ្លេងពិរោះៗ • Enjoy the Melody 🎧",
      lyrics: lrcText,
      parsedLyrics,
      album: "Khmer Studio Demo Collection",
      duration,
      fileBlob: emptyWav,
      audioUrl: "",
      coverUrl,
      addedAt: Date.now(),
      fileSize: 0,
      sizeFormatted: "0 MB",
      isDemo: true,
    };
  }
}

export const PRESET_VISUALIZERS = [
  {
    id: "preset-phnompenh",
    name: "Phnom Penh Night Glow",
    nameKhmer: "រាត្រីភ្នំពេញ ភ្លើងពណ៌",
    bgUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop",
    accentColor: "#f59e0b",
    barColor: "#fbbf24",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: "preset-angkor",
    name: "Angkor Sunset Chill",
    nameKhmer: "ថ្ងៃរៀបលិច អង្គរវត្ត",
    bgUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    accentColor: "#ec4899",
    barColor: "#f43f5e",
    glowColor: "rgba(236, 72, 153, 0.4)",
  },
  {
    id: "preset-cyberstudio",
    name: "Cyber Neon Studio",
    nameKhmer: "បន្ទប់ស្ទូឌីយោ នីអុង",
    bgUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600&auto=format&fit=crop",
    accentColor: "#06b6d4",
    barColor: "#3b82f6",
    glowColor: "rgba(6, 182, 212, 0.4)",
  },
  {
    id: "preset-coffee",
    name: "Coffee Shop & Rain",
    nameKhmer: "កាហ្វេកំដរភ្លៀង",
    bgUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1600&auto=format&fit=crop",
    accentColor: "#10b981",
    barColor: "#34d399",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: "preset-lofi",
    name: "Lo-Fi Midnight Room",
    nameKhmer: "បន្ទប់ស្ងប់ស្ងាត់ ពេលយប់",
    bgUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    accentColor: "#8b5cf6",
    barColor: "#a855f7",
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
];

// Curated Distinct Singer & Album Cover Presets (distinct from Background photos)
export const PRESET_COVERS = [
  {
    id: "cover-female-singer",
    name: "តារាចម្រៀងស្រី (Female Artist)",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cover-acoustic-guitar",
    name: "អ្នកលេងហ្គីតា (Acoustic Guitarist)",
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cover-producer-dj",
    name: "DJ & Music Producer",
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cover-chill-vocal",
    name: "Cute Singer (Vocalist)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cover-vinyl-record",
    name: "ឌីសចម្រៀង Vinyl Classic",
    url: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop",
  },
];

// Helper to guarantee cover art is NEVER identical to the background
export function getDistinctCoverForTrack(track?: SongTrack | null, fallbackBg?: string): string {
  if (track?.coverUrl && track.coverUrl !== fallbackBg) {
    return track.coverUrl;
  }
  return PRESET_COVERS[0].url;
}

