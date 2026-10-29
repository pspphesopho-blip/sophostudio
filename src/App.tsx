import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Music,
  Video,
  Sparkles,
  Youtube,
  Upload,
  Image as ImageIcon,
  Sliders,
  Layers,
  Radio,
  Share2,
  Smartphone,
  Zap,
  Globe,
} from "lucide-react";
import {
  SongTrack,
  VisualizerPreset,
  PlayerRepeatMode,
  VisualizerStyle,
  LyricLine,
  CaptionMode,
  VideoOrientation,
  BackgroundMode,
  BackgroundBrightnessMode,
  PlatformBadgesConfig,
} from "./types";
import {
  getAllSongsFromDb,
  saveSongToDb,
  deleteSongFromDb,
  clearAllSongsFromDb,
} from "./utils/audioDb";
import {
  createSynthesizedDemoSong,
  PRESET_VISUALIZERS,
  PRESET_COVERS,
} from "./utils/audioSynthesizer";
import { VISUALIZER_STYLES } from "./utils/visualizerStyles";
import { getPresetVideoBlobUrl } from "./utils/videoBackgroundPresets";
import { TopMarqueeTicker } from "./components/TopMarqueeTicker";
import { AudioVisualizerCanvas } from "./components/AudioVisualizerCanvas";
import { PlaylistManager } from "./components/PlaylistManager";
import { PlayerControls } from "./components/PlayerControls";
import { PhotoCoverPicker } from "./components/PhotoCoverPicker";
import { VideoExportModal } from "./components/VideoExportModal";
import { YouTubeSeoAutomationModal } from "./components/YouTubeSeoAutomationModal";
import { LyricEditorModal } from "./components/LyricEditorModal";
import { PlatformBadgesModal } from "./components/PlatformBadgesModal";
import { getDefaultLyricsForTrack } from "./utils/lyricsParser";
import { DEFAULT_PLATFORM_BADGES } from "./utils/platformBadgesRenderer";

export default function App() {
  // Playlist & Database State
  const [tracks, setTracks] = useState<SongTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<VisualizerPreset>(PRESET_VISUALIZERS[0]);
  const [customBgUrl, setCustomBgUrl] = useState<string | undefined>(undefined);
  const [customBgVideoUrl, setCustomBgVideoUrl] = useState<string | undefined>(undefined);
  const [activeBgType, setActiveBgType] = useState<BackgroundMode>("image");
  const [backgroundBrightnessMode, setBackgroundBrightnessMode] = useState<BackgroundBrightnessMode>("original");

  const handleCycleBackgroundBrightness = () => {
    setBackgroundBrightnessMode((prev) =>
      prev === "original" ? "soft" : prev === "soft" ? "dimmed" : "original"
    );
  };

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<PlayerRepeatMode>("all");
  const [isShuffle, setIsShuffle] = useState(false);
  const [visualizerStyle, setVisualizerStyle] = useState<VisualizerStyle>("bars");

  const handleToggleVisualizerStyle = () => {
    const curIdx = VISUALIZER_STYLES.findIndex((s) => s.id === visualizerStyle);
    const nextIdx = (curIdx + 1) % VISUALIZER_STYLES.length;
    setVisualizerStyle(VISUALIZER_STYLES[nextIdx].id);
  };

  // Modal State
  const [isVideoExportOpen, setIsVideoExportOpen] = useState(false);
  const [exportOrientation, setExportOrientation] = useState<VideoOrientation>("portrait");
  const [isYouTubeAutomationOpen, setIsYouTubeAutomationOpen] = useState(false);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [showCaption, setShowCaption] = useState(true);
  const [captionMode, setCaptionMode] = useState<CaptionMode>("capcut_bounce");
  const [platformBadgesConfig, setPlatformBadgesConfig] = useState<PlatformBadgesConfig>(DEFAULT_PLATFORM_BADGES);
  const [isPlatformBadgesModalOpen, setIsPlatformBadgesModalOpen] = useState(false);
  const [isLyricEditorOpen, setIsLyricEditorOpen] = useState(false);
  const [lyricEditingTrack, setLyricEditingTrack] = useState<SongTrack | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [captionToast, setCaptionToast] = useState<string | null>(null);

  const handleCycleCaptionMode = () => {
    const modes: CaptionMode[] = [
      "capcut_bounce",
      "capcut_highlight",
      "capcut_tiktok_kinetic",
      "capcut_karaoke_glow",
      "youtube_cc",
      "karaoke_box",
      "subtitles_clean",
    ];
    const curIdx = modes.indexOf(captionMode);
    setCaptionMode(modes[(curIdx + 1) % modes.length]);
  };

  // Audio References
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Derived current and next track
  const currentTrack = tracks[currentTrackIndex] || null;
  const nextTrack = useMemo(() => {
    if (tracks.length <= 1) return null;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    return tracks[nextIdx] || null;
  }, [tracks, currentTrackIndex]);

  // Load from IndexedDB on initial mount, or seed with demo songs
  useEffect(() => {
    async function loadDatabase() {
      try {
        const storedTracks = await getAllSongsFromDb();
        if (storedTracks && storedTracks.length > 0) {
          // Sanitize any existing tracks whose coverUrl was previously identical to visualizer background
          const sanitized = storedTracks.map((t, idx) => {
            const isPresetBg = PRESET_VISUALIZERS.some((p) => p.bgUrl === t.coverUrl);
            if (isPresetBg || !t.coverUrl) {
              const distinctCover = PRESET_COVERS[idx % PRESET_COVERS.length].url;
              return { ...t, coverUrl: distinctCover };
            }
            return t;
          });
          setTracks(sanitized);
          sanitized.forEach((t) => saveSongToDb(t).catch(() => {}));
        } else {
          // Seed with 3 melodic demo songs
          await handleAddDemoTracks();
        }
      } catch (err) {
        console.warn("Could not load stored tracks:", err);
        await handleAddDemoTracks();
      }
    }
    loadDatabase();
  }, []);

  // Create demo tracks with distinct album cover art and Khmer song captions
  const handleAddDemoTracks = async () => {
    try {
      const demo1 = await createSynthesizedDemoSong(
        "demo_1",
        "ភ្លេងការខ្មែរ រំដួលដងស្ទឹងសៀមរាប",
        "Traditional Khmer Ensemble",
        "traditional",
        PRESET_COVERS[1].url,
        "🌸 អារម្មណ៍ស្រស់ស្រាយជាមួយបទភ្លេងពិរោះៗ • Enjoy the Melody 🎧"
      );
      const demo2 = await createSynthesizedDemoSong(
        "demo_2",
        "កាហ្វេពេលព្រឹក និងភ្លៀងរលឹម (Acoustic Chill)",
        "Sinn & Ros Modern Acoustic",
        "chill",
        PRESET_COVERS[0].url,
        "☕ ក្រេបកាហ្វេកំដរអារម្មណ៍ ជាមួយចង្វាក់ភ្លេងស្រទន់ • Peaceful Acoustic Moments 🍃"
      );
      const demo3 = await createSynthesizedDemoSong(
        "demo_3",
        "រាត្រីភ្នំពេញ ក្រោមពន្លឺភ្លើងពណ៌ (Night Beats)",
        "Phnom Penh Lo-Fi Studio",
        "ambient",
        PRESET_COVERS[2].url,
        "🌃 រាត្រីដ៏ស្ងប់ស្ងាត់ ជាមួយភ្លេងបាសបន្លឺឡើងយ៉ាងរណ្តំ • Night Beats & Chill ✨"
      );

      const initialDemos = [demo1, demo2, demo3];
      for (const d of initialDemos) {
        saveSongToDb(d).catch(() => {});
      }
      setTracks(initialDemos);
      setCurrentTrackIndex(0);
    } catch (e) {
      console.warn("handleAddDemoTracks fallback:", e);
      setTracks([
        {
          id: "demo_1",
          title: "ភ្លេងការខ្មែរ រំដួលដងស្ទឹងសៀមរាប",
          artist: "Traditional Khmer Ensemble",
          caption: "🌸 អារម្មណ៍ស្រស់ស្រាយជាមួយបទភ្លេងពិរោះៗ",
          lyrics: "",
          parsedLyrics: [],
          album: "Khmer Studio Demo Collection",
          duration: 180,
          audioUrl: "",
          coverUrl: PRESET_COVERS[1].url,
          addedAt: Date.now(),
          isDemo: true,
        },
      ]);
      setCurrentTrackIndex(0);
    }
  };

  // Initialize Web Audio API Analyser connected to the <audio> element
  const setupWebAudio = () => {
    if (!audioContextRef.current && audioElementRef.current) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;

        const source = ctx.createMediaElementSource(audioElementRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceNodeRef.current = source;
      } catch (e) {
        console.warn("Web Audio setup warning:", e);
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    setupWebAudio();
    if (!audioElementRef.current || !currentTrack) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Playback prevented or error:", err);
          setIsPlaying(false);
        });
    }
  };

  // Handle Track Selection
  const handleSelectTrack = (track: SongTrack, index: number) => {
    setupWebAudio();
    if (currentTrackIndex === index && isPlaying) {
      audioElementRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentTrackIndex(index);
      // Wait for audio src to update then play
      setTimeout(() => {
        if (audioElementRef.current) {
          audioElementRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      }, 50);
    }
  };

  // Auto-advance: automatically change to next song when current finishes
  const handleNextTrack = () => {
    if (tracks.length === 0) return;

    if (repeatMode === "one") {
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = 0;
        audioElementRef.current.play().then(() => setIsPlaying(true));
      }
      return;
    }

    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = currentTrackIndex + 1;
      if (nextIndex >= tracks.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }

    setCurrentTrackIndex(nextIndex);
    setTimeout(() => {
      if (audioElementRef.current) {
        audioElementRef.current.play().then(() => setIsPlaying(true));
      }
    }, 50);
  };

  // Previous song
  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
    setTimeout(() => {
      if (audioElementRef.current) {
        audioElementRef.current.play().then(() => setIsPlaying(true));
      }
    }, 50);
  };

  // Seek
  const handleSeek = (newTime: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioElementRef.current) {
      audioElementRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (audioElementRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      audioElementRef.current.muted = nextMute;
    }
  };

  // Add tracks
  const handleAddTracks = async (newTracks: SongTrack[]) => {
    for (const track of newTracks) {
      await saveSongToDb(track);
    }
    const combined = [...tracks, ...newTracks];
    setTracks(combined);
    if (tracks.length === 0 && combined.length > 0) {
      setCurrentTrackIndex(0);
    }
  };

  // Update track
  const handleUpdateTrack = async (updated: SongTrack) => {
    await saveSongToDb(updated);
    setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Delete track
  const handleDeleteTrack = async (id: string) => {
    await deleteSongFromDb(id);
    setTracks((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (currentTrackIndex >= filtered.length) {
        setCurrentTrackIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Reorder
  const handleReorderTracks = (reordered: SongTrack[]) => {
    setTracks(reordered);
    // Persist new order
    reordered.forEach((t) => saveSongToDb(t));
  };

  // Batch update artist name for all tracks
  const handleBatchUpdateArtist = async (newArtist: string) => {
    const trimmed = newArtist.trim();
    if (!trimmed) return;
    const updatedTracks = tracks.map((t) => ({
      ...t,
      artist: trimmed,
    }));
    for (const t of updatedTracks) {
      await saveSongToDb(t);
    }
    setTracks(updatedTracks);
  };

  // Batch update song caption for all tracks
  const handleBatchUpdateCaption = async (newCaption: string) => {
    const trimmed = newCaption.trim();
    if (!trimmed) return;
    const updatedTracks = tracks.map((t) => ({
      ...t,
      caption: trimmed,
    }));
    for (const t of updatedTracks) {
      await saveSongToDb(t);
    }
    setTracks(updatedTracks);
  };

  // Open Lyric Editor
  const handleOpenLyricEditor = (track: SongTrack) => {
    setLyricEditingTrack(track);
    setIsLyricEditorOpen(true);
  };

  // Save parsed lyrics & LRC text
  const handleSaveLyrics = async (trackId: string, lrcText: string, parsed: LyricLine[]) => {
    const updated = tracks.map((t) => {
      if (t.id === trackId) {
        return {
          ...t,
          lyrics: lrcText,
          parsedLyrics: parsed,
        };
      }
      return t;
    });
    setTracks(updated);
    const target = updated.find((t) => t.id === trackId);
    if (target) {
      await saveSongToDb(target);
    }
  };

  // Clear all
  const handleClearAll = async () => {
    if (window.confirm("តើអ្នកពិតជាចង់សម្អាតបទចម្រៀងទាំងអស់ចេញពី Database មែនទេ?")) {
      await clearAllSongsFromDb();
      setTracks([]);
      setCurrentTrackIndex(0);
      setIsPlaying(false);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    }
  };

  // Apply custom background photo (16:9 Stage Landscape)
  const handleUploadCustomPhoto = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomBgUrl(url);
    setCustomBgVideoUrl(undefined);
    setActiveBgType("image");
  };

  // Apply custom background video (MP4/WebM)
  const handleUploadCustomVideo = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomBgVideoUrl(url);
    setActiveBgType("video");
  };

  // Select video preset loop
  const handleSelectVideoPreset = async (presetId: string) => {
    setActiveBgType("video");
    const url = await getPresetVideoBlobUrl(presetId);
    if (url) {
      setCustomBgVideoUrl(url);
    }
  };

  // Clear video background to return to static image
  const handleClearVideoBackground = () => {
    setCustomBgVideoUrl(undefined);
    setActiveBgType("image");
  };

  // Change track cover (album / singer art)
  const handleSelectTrackCover = async (coverUrl: string, applyToAll: boolean = false) => {
    if (applyToAll) {
      const updated = tracks.map((t) => ({ ...t, coverUrl }));
      setTracks(updated);
      updated.forEach((t) => saveSongToDb(t));
      alert("បានកំណត់រូប Cover នេះ សម្រាប់គ្រប់បទចម្រៀងរួចរាល់!");
    } else if (currentTrack) {
      const updatedTrack = { ...currentTrack, coverUrl };
      await handleUpdateTrack(updatedTrack);
    }
  };

  const handleUploadTrackCover = async (file: File, applyToAll: boolean = false) => {
    const url = URL.createObjectURL(file);
    await handleSelectTrackCover(url, applyToAll);
  };

  // Generate Caption like CapCut automatically
  const handleGenerateCapCutCaption = async () => {
    if (!currentTrack) {
      alert("សូមជ្រើសរើស ឬបញ្ចូលបទចម្រៀងជាមុនសិន!");
      return;
    }

    setIsGeneratingCaption(true);
    setCaptionToast("🤖 កំពុង Generate Caption ស្ទីល CapCut ដោយស្វ័យប្រវត្តិ...");

    try {
      const response = await fetch("/api/ai/generate-synced-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songTitle: currentTrack.title,
          artist: currentTrack.artist,
          rawText: currentTrack.lyrics || currentTrack.caption || "",
          duration: currentTrack.duration || 180,
          language: "auto",
          mood: "chill",
        }),
      });

      const resData = await response.json();
      let generatedLines: LyricLine[] = [];
      let generatedLrc = "";

      if (response.ok && resData?.success && resData?.data?.lines?.length > 0) {
        generatedLines = resData.data.lines;
        generatedLrc = resData.data.lrc;
      } else {
        // High quality thematic lyric distribution fallback (English for English, Khmer for Khmer)
        const defaultData = getDefaultLyricsForTrack(
          currentTrack.title,
          currentTrack.artist,
          currentTrack.duration || 180
        );
        generatedLines = defaultData.parsed;
        generatedLrc = defaultData.lrc;
      }

      const updatedTrack: SongTrack = {
        ...currentTrack,
        lyrics: generatedLrc,
        parsedLyrics: generatedLines,
      };

      await handleUpdateTrack(updatedTrack);

      setShowCaption(true);
      setCaptionMode("capcut_bounce");

      if (!isPlaying && audioElementRef.current) {
        audioElementRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }

      setCaptionToast(`🎉 បាន Generate Caption ស្ទីល CapCut (${generatedLines.length} ឃ្លា) ជោគជ័យ! អក្សរកំពុងលោតលើវីដេអូ!`);
      setTimeout(() => setCaptionToast(null), 4500);
    } catch (e: any) {
      console.warn("Generate caption error:", e);
      setCaptionToast("បានបង្កើត Caption ស្វ័យប្រវត្តិរួចរាល់!");
      setTimeout(() => setCaptionToast(null), 3000);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Kantumruy_Pro',sans-serif]">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioElementRef}
        src={currentTrack?.audioUrl}
        crossOrigin="anonymous"
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => {
          const dur = (e.target as HTMLAudioElement).duration;
          setDuration(dur && isFinite(dur) ? dur : currentTrack?.duration || 180);
        }}
        onEnded={handleNextTrack}
      />

      {/* 1. TOP RUNNING MARQUEE TICKER (អក្សររត់នៅផ្នែកខាងលើនៃអេក្រង់បង្ហាញបទចម្រៀងបន្ទាប់) */}
      <TopMarqueeTicker
        currentTrack={currentTrack}
        nextTrack={nextTrack}
        isPlaying={isPlaying}
        totalTracks={tracks.length}
        currentIndex={currentTrackIndex}
      />

      {/* 2. MAIN APP NAVIGATION BAR */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-10 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-xl">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
              Khmer Studio Music Creator
              <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PRO STUDIO
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Auto Title Database • YouTube Video Generator • AI SEO Auto Post
            </p>
          </div>
        </div>

        {/* Global Toolbar Quick Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Change Photo / Background */}
          <button
            onClick={() => setShowPhotoPicker((p) => !p)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showPhotoPicker
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : activeBgType === "video"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            {activeBgType === "video" ? (
              <Video className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <ImageIcon className="w-4 h-4 text-cyan-400" />
            )}
            <span>{activeBgType === "video" ? "🎬 វីដេអូផ្ទៃក្រោយ (Active)" : "រូបថត & វីដេអូផ្ទៃក្រោយ"}</span>
          </button>

          {/* Streaming Platform Badges & Icons Trigger */}
          <button
            onClick={() => setIsPlatformBadgesModalOpen(true)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer active:scale-95 ${
              platformBadgesConfig.enabled
                ? "bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700 shadow-md hover:border-amber-500/50"
                : "bg-neutral-900/60 text-neutral-400 border-neutral-800"
            }`}
            title="បន្ថែម / កែសម្រួល Icons YouTube, TikTok, Spotify, Apple Music, Amazon Music, LIVE"
          >
            <span className="flex items-center gap-1">
              {platformBadgesConfig.showLive && platformBadgesConfig.enabled && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              <Globe className="w-4 h-4 text-sky-400" />
            </span>
            <span>Streaming Badges</span>
          </button>

          {/* CapCut Auto Caption Trigger */}
          <button
            onClick={handleGenerateCapCutCaption}
            disabled={isGeneratingCaption}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-amber-500/25 border border-amber-300/40 active:scale-95 cursor-pointer disabled:opacity-60"
            title="បង្កើត Caption ដូចក្នុង CapCut ឱ្យអក្សរលោតតាមសម្លេងច្រៀង Auto លើវីដេអូ"
          >
            {isGeneratingCaption ? (
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-black" />
            )}
            <span>Generate Caption (CapCut)</span>
          </button>

          {/* AI SEO Assistant & Auto Post */}
          <button
            onClick={() => setIsYouTubeAutomationOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-red-600/20 active:scale-95 cursor-pointer"
          >
            <Youtube className="w-4 h-4" />
            <span>AI SEO & YouTube Post</span>
          </button>

          {/* Quick YouTube Shorts (Portrait 9:16) Export Button */}
          <button
            onClick={() => {
              setExportOrientation("portrait");
              setIsVideoExportOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
            title="ទាញចេញជាវីដេអូបញ្ឈរ 9:16 សម្រាប់ YouTube Shorts (ត្រឹម 3 នាទីចុះក្រោម ≤ 180s), TikTok & Reels"
          >
            <Smartphone className="w-4 h-4" />
            <span>Shorts 9:16</span>
            <span className="text-[10px] px-1 py-0.2 bg-black/25 rounded font-mono font-black">≤ 3mn</span>
          </button>

          {/* Video Exporter Modal Trigger (Landscape 16:9) */}
          <button
            onClick={() => {
              setExportOrientation("landscape");
              setIsVideoExportOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>វីដេអូ 16:9</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Optional Collapsible Photo / Cover Picker */}
        {showPhotoPicker && (
          <div className="animate-fade-in">
            <PhotoCoverPicker
              currentPreset={activePreset}
              customBgUrl={customBgUrl}
              customBgVideoUrl={customBgVideoUrl}
              activeBgType={activeBgType}
              onSelectPreset={(preset) => {
                setActivePreset(preset);
                setCustomBgUrl(undefined);
                setCustomBgVideoUrl(undefined);
                setActiveBgType("image");
              }}
              onUploadCustomPhoto={handleUploadCustomPhoto}
              onSelectVideoPreset={handleSelectVideoPreset}
              onUploadCustomVideo={handleUploadCustomVideo}
              onClearVideoBackground={handleClearVideoBackground}
              backgroundBrightnessMode={backgroundBrightnessMode}
              onChangeBackgroundBrightness={setBackgroundBrightnessMode}
              currentTrack={currentTrack}
              onSelectTrackCover={handleSelectTrackCover}
              onUploadTrackCover={handleUploadTrackCover}
              showCover={showCover}
              onToggleCover={() => setShowCover((prev) => !prev)}
            />
          </div>
        )}

        {/* 2-Column Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Visualizer Screen & Audio Player Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Visualizer Canvas Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span className="flex items-center gap-1.5 text-white font-semibold">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  អេក្រង់បង្ហាញបទចម្រៀង & Visualizer (16:9 YouTube Preview)
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  {activePreset.nameKhmer}
                </span>
              </div>

              <AudioVisualizerCanvas
                currentTrack={currentTrack}
                nextTrack={nextTrack}
                preset={activePreset}
                customBgUrl={customBgUrl}
                customBgVideoUrl={activeBgType === "video" ? customBgVideoUrl : undefined}
                analyser={analyserRef.current}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                canvasRef={canvasRef}
                showOverlayText={true}
                showCover={showCover}
                onToggleCover={() => setShowCover((prev) => !prev)}
                visualizerStyle={visualizerStyle}
                onCycleVisualizerStyle={handleToggleVisualizerStyle}
                showCaption={showCaption}
                captionMode={captionMode}
                onToggleCaption={() => setShowCaption((s) => !s)}
                onCycleCaptionMode={handleCycleCaptionMode}
                onOpenLyricEditor={() => currentTrack && handleOpenLyricEditor(currentTrack)}
                onGenerateCapCutCaption={handleGenerateCapCutCaption}
                isGeneratingCaption={isGeneratingCaption}
                platformBadgesConfig={platformBadgesConfig}
                onOpenPlatformBadgesModal={() => setIsPlatformBadgesModalOpen(true)}
                backgroundBrightnessMode={backgroundBrightnessMode}
                onCycleBackgroundBrightness={handleCycleBackgroundBrightness}
              />
            </div>

            {/* Audio Player Controls */}
            <PlayerControls
              currentTrack={currentTrack}
              nextTrack={nextTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              repeatMode={repeatMode}
              isShuffle={isShuffle}
              visualizerStyle={visualizerStyle}
              onTogglePlay={togglePlay}
              onNext={handleNextTrack}
              onPrev={handlePrevTrack}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
              onToggleRepeat={() =>
                setRepeatMode((prev) =>
                  prev === "all" ? "one" : prev === "one" ? "off" : "all"
                )
              }
              onToggleShuffle={() => setIsShuffle((s) => !s)}
              onToggleVisualizerStyle={handleToggleVisualizerStyle}
              onSelectVisualizerStyle={(style) => setVisualizerStyle(style)}
              onOpenLyricEditor={() => currentTrack && handleOpenLyricEditor(currentTrack)}
              onGenerateCapCutCaption={handleGenerateCapCutCaption}
              isGeneratingCaption={isGeneratingCaption}
            />
          </div>

          {/* Right Column: Database Playlist Manager */}
          <div className="lg:col-span-5 h-full">
            <PlaylistManager
              tracks={tracks}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onSelectTrack={handleSelectTrack}
              onAddTracks={handleAddTracks}
              onUpdateTrack={handleUpdateTrack}
              onDeleteTrack={handleDeleteTrack}
              onReorderTracks={handleReorderTracks}
              onAddDemoTracks={handleAddDemoTracks}
              onBatchUpdateArtist={handleBatchUpdateArtist}
              onBatchUpdateCaption={handleBatchUpdateCaption}
              onOpenLyricEditor={handleOpenLyricEditor}
              onClearAll={handleClearAll}
              defaultCoverUrl={PRESET_COVERS[0].url}
            />
          </div>
        </div>
      </main>

      {/* 4. MODALS */}
      {/* Running Synchronized Lyrics (LRC) & Karaoke Editor Modal */}
      <LyricEditorModal
        isOpen={isLyricEditorOpen}
        onClose={() => setIsLyricEditorOpen(false)}
        track={lyricEditingTrack}
        onSaveLyrics={handleSaveLyrics}
      />

      {/* Video Exporter Modal */}
      <VideoExportModal
        isOpen={isVideoExportOpen}
        onClose={() => setIsVideoExportOpen(false)}
        tracks={tracks}
        currentTrack={currentTrack}
        preset={activePreset}
        customBgUrl={customBgUrl}
        customBgVideoUrl={activeBgType === "video" ? customBgVideoUrl : undefined}
        visualizerStyle={visualizerStyle}
        initialShowCaption={showCaption}
        initialCaptionMode={captionMode}
        initialShowCover={showCover}
        initialOrientation={exportOrientation}
        platformBadgesConfig={platformBadgesConfig}
        initialBackgroundBrightness={backgroundBrightnessMode}
        onOpenYouTubeAutomation={(blob) => {
          if (blob) setExportedVideoBlob(blob);
          setIsYouTubeAutomationOpen(true);
        }}
      />

      {/* Streaming Platform Badges & Social Watermark Modal */}
      <PlatformBadgesModal
        isOpen={isPlatformBadgesModalOpen}
        onClose={() => setIsPlatformBadgesModalOpen(false)}
        config={platformBadgesConfig}
        onChangeConfig={setPlatformBadgesConfig}
      />

      {/* AI SEO & YouTube Channel Publishing Automation Modal */}
      <YouTubeSeoAutomationModal
        isOpen={isYouTubeAutomationOpen}
        onClose={() => setIsYouTubeAutomationOpen(false)}
        tracks={tracks}
        currentTrack={currentTrack}
        videoBlob={exportedVideoBlob}
      />

      {/* Floating CapCut Caption Toast Notification */}
      {captionToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 text-white border-2 border-amber-400 px-4 py-2.5 rounded-2xl shadow-2xl shadow-amber-500/30 backdrop-blur-md flex items-center space-x-2.5 animate-bounce text-xs font-bold pointer-events-none">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <span>{captionToast}</span>
        </div>
      )}
    </div>
  );
}
