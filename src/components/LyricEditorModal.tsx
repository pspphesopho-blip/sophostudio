import React, { useState, useRef, useEffect } from "react";
import {
  Mic2,
  X,
  Play,
  Pause,
  Clock,
  Sparkles,
  Check,
  RotateCcw,
  Download,
  Upload,
  Music,
  Plus,
  Trash2,
  HelpCircle,
  Volume2,
  Zap,
  Undo2,
  SkipForward,
  CheckCircle2,
  ListMusic,
  FileText,
  Gauge,
  CornerDownLeft,
  FastForward,
  Rewind,
  Wand2,
  Bot,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Search,
} from "lucide-react";
import { SongTrack, LyricLine } from "../types";
import {
  parseLRC,
  formatToLRC,
  autoDistributeLyrics,
  getActiveLyric,
  KHMER_LYRIC_PRESETS,
} from "../utils/lyricsParser";
import { formatDuration } from "../utils/audioDb";

interface LyricEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: SongTrack | null;
  onSaveLyrics: (trackId: string, lrcText: string, parsed: LyricLine[]) => void;
}

export const LyricEditorModal: React.FC<LyricEditorModalProps> = ({
  isOpen,
  onClose,
  track,
  onSaveLyrics,
}) => {
  const [activeTab, setActiveTab] = useState<"sync" | "visual" | "raw">("sync");
  const [lrcInput, setLrcInput] = useState<string>("");
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(0);

  // Tap to Sync specific state
  const [syncTargetIndex, setSyncTargetIndex] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [tapFlash, setTapFlash] = useState<boolean>(false);
  const [lastStampedTime, setLastStampedTime] = useState<number | null>(null);
  const [isAllSynced, setIsAllSynced] = useState<boolean>(false);

  // AI Lyrics & Auto-Sync State
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<"title" | "raw">("title");
  const [aiSongTitle, setAiSongTitle] = useState<string>("");
  const [aiArtist, setAiArtist] = useState<string>("");
  const [aiRawText, setAiRawText] = useState<string>("");
  const [aiMood, setAiMood] = useState<string>("Acoustic Chill / Lo-Fi");
  const [aiLanguage, setAiLanguage] = useState<"auto" | "km" | "en">("auto");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Audio preview playback inside modal
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const syncListContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize from track when modal opens
  useEffect(() => {
    if (!track) return;

    let initialLrc = track.lyrics || "";
    // If no lyrics yet, try to build from caption or load preset
    if (!initialLrc.trim()) {
      if (track.caption && track.caption.includes("\n")) {
        const distributed = autoDistributeLyrics(track.caption, track.duration || 60);
        initialLrc = formatToLRC(distributed);
      } else {
        initialLrc = KHMER_LYRIC_PRESETS.chill;
      }
    }

    setLrcInput(initialLrc);
    const parsed = parseLRC(initialLrc);
    const resolvedLines = parsed.length > 0 ? parsed : autoDistributeLyrics(initialLrc, track.duration || 60);
    setLines(resolvedLines);
    setSyncTargetIndex(0);
    setIsAllSynced(false);

    // AI defaults
    setAiSongTitle(track.title || "");
    setAiArtist(track.artist || "");
    setAiRawText(track.caption || "");
    setAiError(null);
    setAiSuccessMessage(null);
  }, [track, isOpen]);

  // Audio time listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [track?.audioUrl]);

  // Auto-scroll the active sync line into view in Tap to Sync mode
  useEffect(() => {
    if (activeTab === "sync") {
      const el = document.getElementById(`sync-queue-item-${syncTargetIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [syncTargetIndex, activeTab]);

  // Playback Rate adjustment
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(track?.duration || 0, time));
      setCurrentTime(audio.currentTime);
    }
  };

  const seekRelative = (deltaSec: number) => {
    const audio = audioRef.current;
    if (audio) {
      const target = Math.max(0, Math.min(track?.duration || 0, audio.currentTime + deltaSec));
      audio.currentTime = target;
      setCurrentTime(target);
    }
  };

  // --- TAP TO SYNC ACTIONS ---
  const handleTapSync = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // If audio is paused, start playing so audio continues smoothly
    if (!isPlaying) {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }

    if (lines.length === 0) return;
    if (syncTargetIndex >= lines.length) {
      setIsAllSynced(true);
      return;
    }

    const currentAudioTime = Math.round(audio.currentTime * 100) / 100;
    const updated = [...lines];
    updated[syncTargetIndex] = {
      ...updated[syncTargetIndex],
      time: currentAudioTime,
    };
    setLines(updated);
    setLrcInput(formatToLRC(updated));
    setLastStampedTime(currentAudioTime);

    // Trigger visual pulse
    setTapFlash(true);
    setTimeout(() => setTapFlash(false), 220);

    // Advance to next line
    if (syncTargetIndex + 1 < lines.length) {
      setSyncTargetIndex(syncTargetIndex + 1);
    } else {
      setIsAllSynced(true);
    }
  };

  // Step back 1 line and rewind audio slightly for easy re-timing
  const handleSyncStepBack = () => {
    if (syncTargetIndex > 0) {
      const prevIdx = syncTargetIndex - 1;
      setSyncTargetIndex(prevIdx);
      setIsAllSynced(false);
      // Seek back to 1.5 seconds before that line timestamp
      const targetTime = Math.max(0, lines[prevIdx].time - 1.5);
      seekTo(targetTime);
    }
  };

  // Skip 1 line forward without modifying time
  const handleSyncSkip = () => {
    if (syncTargetIndex + 1 < lines.length) {
      setSyncTargetIndex(syncTargetIndex + 1);
    } else {
      setIsAllSynced(true);
    }
  };

  // Restart Sync from Beginning
  const handleRestartSync = () => {
    setSyncTargetIndex(0);
    setIsAllSynced(false);
    seekTo(0);
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  // Click specific line in queue to target it directly
  const handleJumpToSyncTarget = (index: number) => {
    setSyncTargetIndex(index);
    setIsAllSynced(false);
    if (lines[index]) {
      const targetTime = Math.max(0, lines[index].time - 1.2);
      seekTo(targetTime);
    }
  };

  // Stamp current audio time to selected line in Visual table
  const stampCurrentTimeToLine = (index: number) => {
    const newTime = Math.round(currentTime * 100) / 100;
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      time: newTime,
    };
    updated.sort((a, b) => a.time - b.time);
    setLines(updated);
    setLrcInput(formatToLRC(updated));

    if (index + 1 < updated.length) {
      setActiveLineIdx(index + 1);
    }
  };

  // Add new empty line
  const handleAddLine = () => {
    const lastTime = lines.length > 0 ? lines[lines.length - 1].time + 3 : Math.round(currentTime);
    const updated = [...lines, { time: Math.min(track?.duration || 180, lastTime), text: "" }];
    setLines(updated);
    setLrcInput(formatToLRC(updated));
    setActiveLineIdx(updated.length - 1);
  };

  // Delete line
  const handleDeleteLine = (index: number) => {
    const updated = lines.filter((_, i) => i !== index);
    setLines(updated);
    setLrcInput(formatToLRC(updated));
    if (syncTargetIndex >= updated.length && updated.length > 0) {
      setSyncTargetIndex(updated.length - 1);
    }
  };

  // Update line text
  const handleLineTextChange = (index: number, newText: string) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], text: newText };
    setLines(updated);
    setLrcInput(formatToLRC(updated));
  };

  // Update line timestamp directly
  const handleLineTimeChange = (index: number, newTimeSec: number) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], time: Math.max(0, newTimeSec) };
    updated.sort((a, b) => a.time - b.time);
    setLines(updated);
    setLrcInput(formatToLRC(updated));
  };

  // Switch to Raw tab -> sync state
  const handleRawTextChange = (newRaw: string) => {
    setLrcInput(newRaw);
    const parsed = parseLRC(newRaw);
    if (parsed.length > 0) {
      setLines(parsed);
    }
  };

  // Auto-distribute plain text
  const handleAutoDistribute = () => {
    const distributed = autoDistributeLyrics(lrcInput, track?.duration || 60);
    if (distributed.length > 0) {
      setLines(distributed);
      setLrcInput(formatToLRC(distributed));
      setSyncTargetIndex(0);
      setIsAllSynced(false);
    }
  };

  // Load Preset
  const handleLoadPreset = (key: string) => {
    const presetLrc = KHMER_LYRIC_PRESETS[key];
    if (presetLrc) {
      setLrcInput(presetLrc);
      const parsed = parseLRC(presetLrc);
      setLines(parsed);
      setSyncTargetIndex(0);
      setIsAllSynced(false);
    }
  };

  // Import .lrc file
  const handleImportLrc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setLrcInput(content);
        const parsed = parseLRC(content);
        setLines(parsed.length > 0 ? parsed : autoDistributeLyrics(content, track?.duration || 60));
        setSyncTargetIndex(0);
        setIsAllSynced(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Export .lrc file
  const handleExportLrc = () => {
    const blob = new Blob([lrcInput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(track?.title || "Lyrics").replace(/\s+/g, "_")}_Lyrics.lrc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save changes
  const handleSave = () => {
    if (!track) return;
    const parsed = parseLRC(lrcInput);
    const finalLines = parsed.length > 0 ? parsed : lines;
    onSaveLyrics(track.id, lrcInput, finalLines);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  // AI Lyrics Auto-Sync Generator Handler
  const handleGenerateAiLyrics = async () => {
    if (!track) return;
    setIsAiGenerating(true);
    setAiError(null);
    setAiSuccessMessage(null);

    try {
      const response = await fetch("/api/ai/generate-synced-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songTitle: aiSongTitle.trim() || track.title,
          artist: aiArtist.trim() || track.artist,
          rawText: aiMode === "raw" ? aiRawText : "",
          duration: track.duration || 180,
          language: aiLanguage,
          mood: aiMood,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success || !resData.data) {
        throw new Error(resData?.error || "មិនអាចទាញយក Lyric តាមរយៈ AI បានទេ។");
      }

      const generated = resData.data;
      if (Array.isArray(generated.lines) && generated.lines.length > 0) {
        setLines(generated.lines);
        const newLrc = generated.lrc || formatToLRC(generated.lines);
        setLrcInput(newLrc);
        setSyncTargetIndex(0);
        setIsAllSynced(false);
        setAiSuccessMessage(
          `ជោគជ័យ! AI បានបង្កើត និង Sync ទំនុកច្រៀងចំនួន ${generated.lines.length} បន្ទាត់ស្របតាមប្រវែងបទ (${formatDuration(track.duration)}) រួចរាល់!`
        );
      } else {
        throw new Error("AI មិនបានបញ្ជូនទំនុកច្រៀងត្រឡប់មកវិញទេ។ សូមព្យាយាមម្តងទៀត។");
      }
    } catch (err: any) {
      console.error("AI Lyrics Generation Error:", err);
      setAiError(err.message || "មានបញ្ហាក្នុងការទាក់ទង AI Service។ សូមពិនិត្យមើលការតភ្ជាប់។");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Modal Close Handler
  const handleCloseModal = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setShowAiModal(false);
    onClose();
  };

  // Keyboard shortcut listener for Tap to Sync & Modal Close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showAiModal) {
          setShowAiModal(false);
        } else {
          handleCloseModal();
        }
        return;
      }

      if (activeTab !== "sync") return;

      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleTapSync();
      } else if (e.code === "ArrowLeft" || e.code === "Backspace") {
        e.preventDefault();
        handleSyncStepBack();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleSyncSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showAiModal, activeTab, syncTargetIndex, lines, isPlaying]);

  if (!isOpen || !track) return null;

  // Active lyric calculation for live preview
  const activeInfo = getActiveLyric(lines, currentTime, track.duration);

  const currentPendingLine = lines[syncTargetIndex] || null;
  const nextPendingLine = lines[syncTargetIndex + 1] || null;
  const syncProgressPercent = lines.length > 0 ? Math.round((syncTargetIndex / lines.length) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >
      <audio ref={audioRef} src={track.audioUrl} />

      <div className="relative bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* AI Auto-Sync Assistant Overlay */}
        {showAiModal && (
          <div className="absolute inset-0 z-30 bg-neutral-950/95 backdrop-blur-xl p-4 sm:p-6 flex flex-col overflow-y-auto animate-in fade-in duration-200">
            {/* AI Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>ជំនួយការ AI Generate Caption & Auto-Sync (CapCut Style)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-semibold">
                      ⚡ CapCut + Gemini
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    បង្កើត ឬទាញយកទំនុកច្រៀង និងគណនាត្រាពេលវេលា [mm:ss.xx] ស្របតាមចង្វាក់ភ្លេងស្វ័យប្រវត្តិ
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiModal(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
                title="បិទ (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl shrink-0">
              <button
                onClick={() => {
                  setAiMode("title");
                  setAiError(null);
                }}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  aiMode === "title"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>ស្វែងរកតាមចំណងជើង & អ្នកចម្រៀង</span>
              </button>
              <button
                onClick={() => {
                  setAiMode("raw");
                  setAiError(null);
                }}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  aiMode === "raw"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Sync ពីអត្ថបទឆៅ (Raw Lyric Text)</span>
              </button>
            </div>

            {/* Content area */}
            <div className="mt-4 flex-1 space-y-4">
              {aiMode === "title" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                        <span>ចំណងជើងបទចម្រៀង (Song Title)</span>
                        <span className="text-[10px] text-amber-400">ទាមទារ</span>
                      </label>
                      <input
                        type="text"
                        value={aiSongTitle}
                        onChange={(e) => setAiSongTitle(e.target.value)}
                        placeholder="ឧ. រាត្រីរំដួលក្រអូប, ផ្កាយព្រឹក..."
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                        <span>ឈ្មោះអ្នកចម្រៀង / សិល្បករ (Artist)</span>
                        <span className="text-[10px] text-neutral-500">ស្រេចចិត្ត</span>
                      </label>
                      <input
                        type="text"
                        value={aiArtist}
                        onChange={(e) => setAiArtist(e.target.value)}
                        placeholder="ឧ. ស៊ីន ស៊ីសាមុត, ព្រាប សុវត្ថិ..."
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Mood / Style Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      ទម្រង់ / ចង្វាក់បទភ្លេង (Song Mood & Style)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Acoustic Chill / Lo-Fi",
                        "មនោសញ្ចេតនា (Romantic Ballad)",
                        "ភ្លេងការ/បុរាណ (Khmer Classical)",
                        "Pop / Trending Beat",
                        "ស្រុកស្រែ/អនុស្សាវរីយ៍",
                      ].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setAiMood(m)}
                          className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                            aiMood === m
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold"
                              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      ភាសាទំនុកច្រៀង (Language Preference)
                    </label>
                    <div className="flex items-center space-x-2">
                      {[
                        { id: "auto", label: "ស្វ័យប្រវត្តិ (Auto-Detect)" },
                        { id: "km", label: "ភាសាខ្មែរ (Khmer)" },
                        { id: "en", label: "English" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAiLanguage(item.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                            aiLanguage === item.id
                              ? "bg-amber-500 text-black font-bold"
                              : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-2.5">
                    <Bot className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      AI នឹងស្វែងរកទំនុកច្រៀងពិតប្រាកដ ឬតែងទំនុកច្រៀងយ៉ាងពីរោះស្របតាមចំណងជើង រួចគណនាត្រាពេលវេលា [mm:ss.xx] សម្រាប់ច្រៀងខារ៉ាអូខេស្របតាមប្រវែងបទ <span className="font-bold text-amber-300">{formatDuration(track.duration)}</span>។
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300">
                      បិទភ្ជាប់អត្ថបទទំនុកច្រៀងឆៅ (Raw Lyric Text without timestamps)
                    </label>
                    <div className="flex items-center space-x-2">
                      {track.caption && (
                        <button
                          type="button"
                          onClick={() => setAiRawText(track.caption || "")}
                          className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                        >
                          ចម្លងពី Caption បទ
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setAiRawText(
                            `ខ្យល់រាត្រីបក់រំភើយ នាំក្តីស្រណោះរណ្តំចិត្ត\nសំនៀងតន្ត្រីស្រទន់ បំពេអារម្មណ៍ស្ងប់ស្ងាត់\nផ្កាយរះព្រោងព្រាត ភ្លឺថ្លាលើមេឃាក្រឡែត\nចងចាំគ្រាកន្លង ធ្លាប់មានរូបអូនក្បែរកាយ\nទោះពេលវេលាកន្លងឆ្ងាយ ស្នេហ៍នៅដក់ជាប់ឱរា`
                          )
                        }
                        className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
                      >
                        គំរូអត្ថបទ
                      </button>
                      {aiRawText && (
                        <button
                          type="button"
                          onClick={() => setAiRawText("")}
                          className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
                        >
                          សម្អាត
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    placeholder="បិទភ្ជាប់ទំនុកច្រៀងធម្មតា (បន្ទាត់នីមួយៗជាឃ្លាច្រៀង) នៅទីនេះ...&#10;ឧទាហរណ៍៖&#10;ខ្យល់រាត្រីបក់រំភើយ នាំក្តីស្រណោះរណ្តំចិត្ត&#10;សំនៀងតន្ត្រីស្រទន់ បំពេអារម្មណ៍ស្ងប់ស្ងាត់&#10;ផ្កាយរះព្រោងព្រាត ភ្លឺថ្លាលើមេឃាក្រឡែត..."
                    className="w-full p-3.5 bg-neutral-900 border border-neutral-700 rounded-xl font-mono text-xs text-amber-300 placeholder-neutral-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
                  />

                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-start space-x-2.5">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      AI នឹងបំបែកអត្ថបទនេះជាឃ្លាច្រៀងរលូន ទុកចន្លោះភ្លេង Intro ពីដំបូង និងចែកចាយពេលវេលា [mm:ss.xx] ស្របតាមចង្វាក់ភ្លេង និងប្រវែងបទ <span className="font-bold text-white">{formatDuration(track.duration)}</span>។
                    </p>
                  </div>
                </div>
              )}

              {/* Status & Error Display */}
              {aiError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center space-x-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="flex-1">{aiError}</span>
                </div>
              )}

              {/* Success Result Box */}
              {aiSuccessMessage && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-xs text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{aiSuccessMessage}</span>
                  </div>

                  {lines.length > 0 && (
                    <div className="bg-neutral-950/80 rounded-xl p-2.5 border border-neutral-800 text-[11px] font-mono space-y-1 max-h-32 overflow-y-auto">
                      <div className="text-neutral-500 font-bold">គំរូបន្ទាត់ដែលបាន Sync៖</div>
                      {lines.slice(0, 4).map((line, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-neutral-300">
                          <span className="text-amber-400 shrink-0">
                            [{formatDuration(Math.floor(line.time))}.{Math.floor((line.time % 1) * 100).toString().padStart(2, "0")}]
                          </span>
                          <span className="truncate">{line.text}</span>
                        </div>
                      ))}
                      {lines.length > 4 && (
                        <div className="text-neutral-500 italic text-[10px]">
                          ... និង {lines.length - 4} បន្ទាត់ទៀត
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiModal(false);
                        if (!isPlaying) togglePlay();
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>ចាក់ស្តាប់សាកល្បងភ្លាមៗ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAiModal(false)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-xl border border-neutral-700 cursor-pointer"
                    >
                      ចូលទៅផ្ទាំងកែសម្រួល
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Modal Footer */}
            <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-neutral-400 flex items-center gap-2">
                <span>ប្រវែងបទ:</span>
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  {formatDuration(track.duration)} ({Math.round(track.duration)} វិនាទី)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition cursor-pointer"
                >
                  បិទ
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiLyrics}
                  disabled={isAiGenerating}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer ${
                    isAiGenerating
                      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
                      : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 shadow-amber-500/25 border border-amber-300/40"
                  }`}
                >
                  {isAiGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>AI កំពុងបង្កើត & Sync តាមភ្លេង...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {aiMode === "title"
                          ? "🪄 បង្កើត & Sync តាម AI"
                          : "🪄 Sync អត្ថបទឆៅនេះតាម AI"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <Mic2 className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white flex items-center gap-2 truncate">
                <span>កម្មវិធីកែ Lyric និងខារ៉ាអូខេ (Timed Lyrics Editor)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                  LRC Karaoke
                </span>
              </h2>
              <p className="text-xs text-neutral-400 truncate">
                {track.title} • <span className="text-amber-400">{track.artist}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setAiSongTitle(track.title || "");
                setAiArtist(track.artist || "");
                if (!aiRawText && track.caption) setAiRawText(track.caption);
                setAiError(null);
                setAiSuccessMessage(null);
                setShowAiModal(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer border border-amber-300/40"
              title="បង្កើត & Sync ទំនុកច្រៀងស្វ័យប្រវត្តិតាមរយៈ AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Auto-Sync</span>
              <span className="hidden sm:inline-block bg-black/20 text-neutral-950 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase">
                AI
              </span>
            </button>

            <button
              type="button"
              onClick={handleCloseModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-red-500/20 text-neutral-300 hover:text-red-300 border border-neutral-700/80 hover:border-red-500/40 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              title="បិទផ្ទាំងកែសម្រួលទំនុកច្រៀង Lyric & Timestamps (Close)"
            >
              <X className="w-4 h-4 text-neutral-400" />
              <span>បិទ (Close)</span>
            </button>
          </div>
        </div>

        {/* Live Audio Sync Toolbar */}
        <div className="bg-neutral-950 px-6 py-3 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg transition active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 text-black shadow-amber-500/30 hover:bg-amber-400"
                  : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
              }`}
              title={isPlaying ? "ផ្អាកសំឡេង (Pause)" : "ចាក់សំឡេង (Play)"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Replay 3s button */}
            <button
              onClick={() => seekRelative(-3)}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer text-xs flex items-center gap-1"
              title="ថយក្រោយ ៣ វិនាទី (-3s)"
            >
              <Rewind className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">-3s</span>
            </button>

            {/* Fast forward 3s button */}
            <button
              onClick={() => seekRelative(3)}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer text-xs flex items-center gap-1"
              title="ទៅមុខ ៣ វិនាទី (+3s)"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">+3s</span>
            </button>

            <div>
              <div className="text-xs font-mono font-bold text-white">
                {formatDuration(Math.round(currentTime))} / {formatDuration(track.duration)}
              </div>
              <div className="text-[10px] text-neutral-500">
                {isPlaying ? "កំពុងចាក់សំឡេង..." : "បានផ្អាកសំឡេង"}
              </div>
            </div>
          </div>

          {/* Time scrubber */}
          <div className="flex-1 min-w-[160px] max-w-xs">
            <input
              type="range"
              min={0}
              max={track.duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Playback speed selector */}
          <div className="flex items-center space-x-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 text-xs">
            <Gauge className="w-3.5 h-3.5 text-neutral-500 mr-1" />
            <span className="text-[10px] text-neutral-400 mr-1">ល្បឿន:</span>
            {[0.75, 0.9, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition cursor-pointer ${
                  playbackRate === rate
                    ? "bg-amber-500 text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("sync")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === "sync"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tap to Sync (ចុច Sync តាមភ្លេង)</span>
            </button>
            <button
              onClick={() => setActiveTab("visual")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === "visual"
                  ? "bg-amber-500 text-black font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>តារាងកែ (Visual)</span>
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === "raw"
                  ? "bg-amber-500 text-black font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>កូដ LRC (Raw)</span>
            </button>
          </div>
        </div>

        {/* Live Video Lyric Preview Box */}
        <div className="px-6 py-2.5 bg-neutral-900/90 border-b border-neutral-800">
          <div className="p-2.5 bg-neutral-950/80 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider font-bold text-amber-500/80 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              អេក្រង់បង្ហាញគំរូ Lyric រត់លើវីដេអូ (Live Screen Preview)
            </div>

            <div className="my-1 min-h-[46px] flex flex-col items-center justify-center">
              {activeInfo.currentLine ? (
                <div className="space-y-0.5">
                  <div className="text-base sm:text-lg font-bold text-amber-300 drop-shadow-md flex items-center justify-center gap-2">
                    <span className="text-xs text-amber-500">🎤</span>
                    <span>❝ {activeInfo.currentLine.text} ❞</span>
                  </div>
                  {activeInfo.nextLine && (
                    <div className="text-xs text-neutral-400 truncate max-w-md">
                      បន្ទាប់: {activeInfo.nextLine.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-neutral-400 italic flex items-center gap-2">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>~ ភ្លេងកំដរអារម្មណ៍ (កំពុងរង់ចាំទំនុកច្រៀងបន្ទាប់...) ~</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: TAP TO SYNC (FEATURED INTUITIVE MODE) */}
          {activeTab === "sync" && (
            <div className="space-y-4">
              {/* Tap to Sync Instructions & Status Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-950/70 rounded-2xl border border-neutral-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-bold text-white">
                    របៀបប្រើ Tap to Sync:
                  </span>
                  <span className="text-xs text-neutral-400">
                    ចាក់ចម្រៀងស្តាប់ ហើយចុច <strong className="text-amber-300">Spacebar</strong> ឬ <strong className="text-amber-300">ប៊ូតុងធំ</strong> ពេលអ្នកចម្រៀងចាប់ផ្តើមច្រៀងបន្ទាត់នីមួយៗ
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-neutral-400 font-mono">
                    វឌ្ឍនភាព: {syncTargetIndex} / {lines.length} បន្ទាត់ ({syncProgressPercent}%)
                  </span>
                  <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${syncProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* PRIMARY INTERACTIVE HERO: THE BIG TAP TO SYNC CONTROL */}
              {lines.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 space-y-3 bg-neutral-950/40 rounded-3xl border border-neutral-800">
                  <Mic2 className="w-12 h-12 mx-auto text-neutral-600 opacity-50" />
                  <p className="text-base text-neutral-300 font-semibold">មិនទាន់មានទំនុកច្រៀងនៅឡើយទេ</p>
                  <p className="text-xs max-w-md mx-auto">
                    សូមជ្រើសរើសគំរូ Lyric ខ្មែរខាងក្រោម ឬបញ្ចូលអត្ថបទច្រៀង ដើម្បីចាប់ផ្តើម Tap to Sync!
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setAiSongTitle(track.title || "");
                        setAiArtist(track.artist || "");
                        if (!aiRawText && track.caption) setAiRawText(track.caption);
                        setShowAiModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>បង្កើត & Sync ដោយ AI</span>
                    </button>
                    <button
                      onClick={() => handleLoadPreset("chill")}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/40 cursor-pointer"
                    >
                      ប្រើគំរូ Acoustic Chill
                    </button>
                    <button
                      onClick={() => handleLoadPreset("traditional")}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl border border-neutral-700 cursor-pointer"
                    >
                      ប្រើគំរូ ភ្លេងការ/បុរាណ
                    </button>
                  </div>
                </div>
              ) : isAllSynced ? (
                /* Congratulation completion card */
                <div className="p-6 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-950 rounded-3xl border border-emerald-500/40 text-center space-y-3 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    🎉 បាន Sync គ្រប់បន្ទាត់ទំនុកច្រៀងដោយជោគជ័យ!
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    គ្រប់បន្ទាត់ទាំង {lines.length} ត្រូវបានកំណត់ពេលវេលាស្របតាមបទចម្រៀង។ អ្នកអាចចាក់ស្តាប់ផ្ទៀងផ្ទាត់ ឬរក្សាទុកបានភ្លាមៗ!
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleRestartSync}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-xl text-xs font-semibold border border-neutral-700 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Sync ម្តងទៀតពីដើម</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>រក្សាទុក Lyric ភ្លាមៗ</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Line Stamping Stage */
                <div className="space-y-3">
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-neutral-950 to-neutral-900 rounded-3xl border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                          បន្ទាត់ទី {syncTargetIndex + 1} នៃ {lines.length}
                        </span>
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>ពេលបច្ចុប្បន្ន: <strong className="font-mono text-white">{formatDuration(currentTime)}</strong></span>
                        </span>
                      </div>

                      {lastStampedTime !== null && (
                        <div className="text-[11px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>បានកត់ត្រាត្រាពេល [{formatDuration(lastStampedTime)}]</span>
                        </div>
                      )}
                    </div>

                    {/* Prominent Lyric Line Display */}
                    <div className="py-5 text-center space-y-2">
                      <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                        កំពុងរង់ចាំកំណត់ម៉ោង (Waiting for Tap)
                      </div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-300 leading-snug drop-shadow-md px-4">
                        ❝ {currentPendingLine?.text || "(បន្ទាត់ទទេ)"} ❞
                      </div>

                      {nextPendingLine && (
                        <div className="text-xs text-neutral-400 pt-1 flex items-center justify-center gap-1.5">
                          <span className="text-neutral-500">បន្ទាប់:</span>
                          <span className="text-neutral-300 font-medium">"{nextPendingLine.text}"</span>
                        </div>
                      )}
                    </div>

                    {/* THE GIANT TAP TO SYNC BUTTON */}
                    <div className="pt-2 flex flex-col items-center">
                      <button
                        onClick={handleTapSync}
                        className={`w-full max-w-xl py-4 sm:py-5 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center space-x-3 shadow-2xl transition-all cursor-pointer select-none active:scale-[0.98] ${
                          tapFlash
                            ? "bg-emerald-400 text-black shadow-emerald-400/50 scale-105"
                            : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 shadow-amber-500/30 border border-amber-300/40"
                        }`}
                      >
                        <Zap className="w-6 h-6 animate-pulse" />
                        <span>ចុចត្រាពេលបន្ទាត់នេះ (TAP TO SYNC)</span>
                        <span className="hidden sm:inline-block px-2 py-0.5 bg-black/25 text-neutral-950 rounded-lg text-xs font-mono font-bold ml-2">
                          [SPACE / ENTER]
                        </span>
                      </button>

                      <p className="text-[11px] text-neutral-400 mt-2 text-center">
                        ចុចប៊ូតុងខាងលើ ឬចុច <strong className="text-amber-300">Spacebar</strong> ពេលអ្នកចម្រៀងចាប់ផ្តើមច្រៀងបន្ទាត់នេះ
                      </p>
                    </div>

                    {/* Helper Navigation Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-neutral-800/80 mt-4">
                      <button
                        onClick={handleSyncStepBack}
                        disabled={syncTargetIndex === 0}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-neutral-300 hover:text-white border border-neutral-800 transition cursor-pointer"
                        title="ថយក្រោយ ១ បន្ទាត់ និងទាញភ្លេងថយក្រោយបន្តិច (Undo)"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>↶ ថយក្រោយ ១ បន្ទាត់</span>
                      </button>

                      <button
                        onClick={handleSyncSkip}
                        disabled={syncTargetIndex >= lines.length - 1}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-neutral-300 hover:text-white border border-neutral-800 transition cursor-pointer"
                        title="រំលងបន្ទាត់នេះដោយមិនកែម៉ោង (Skip)"
                      >
                        <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
                        <span>↷ រំលងបន្ទាត់នេះ</span>
                      </button>

                      <button
                        onClick={handleRestartSync}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
                        title="ចាប់ផ្តើម Sync ឡើងវិញពីដើម"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>↺ ចាប់ផ្តើមពីដើម</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LYRICS STREAM / QUEUE LIST */}
              {lines.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                    <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                      <ListMusic className="w-3.5 h-3.5 text-amber-400" />
                      <span>បញ្ជីទំនុកច្រៀងតាមលំដាប់ (ចុចលើបន្ទាត់ណាមួយដើម្បី Sync ត្រង់នោះ):</span>
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {lines.length} បន្ទាត់សរុប
                    </span>
                  </div>

                  <div
                    ref={syncListContainerRef}
                    className="space-y-1.5 max-h-56 overflow-y-auto pr-1 rounded-2xl p-2 bg-neutral-950/60 border border-neutral-800"
                  >
                    {lines.map((line, idx) => {
                      const isCurrentTarget = idx === syncTargetIndex && !isAllSynced;
                      const isPast = idx < syncTargetIndex || isAllSynced;
                      const isFuture = idx > syncTargetIndex && !isAllSynced;

                      const min = Math.floor(line.time / 60);
                      const sec = Math.floor(line.time % 60);
                      const ms = Math.floor((line.time % 1) * 10);
                      const formattedTime = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms}`;

                      return (
                        <div
                          key={idx}
                          id={`sync-queue-item-${idx}`}
                          onClick={() => handleJumpToSyncTarget(idx)}
                          className={`flex items-center space-x-2.5 p-2 rounded-xl transition-all cursor-pointer border ${
                            isCurrentTarget
                              ? "bg-amber-500/20 border-amber-500/70 shadow-lg shadow-amber-500/10 scale-[1.01]"
                              : isPast
                              ? "bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800/80 text-neutral-400"
                              : "bg-neutral-950/40 hover:bg-neutral-900/60 border-transparent text-neutral-500"
                          }`}
                        >
                          <span className="w-6 text-center text-xs font-mono text-neutral-500 shrink-0">
                            {idx + 1}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 flex items-center gap-1 ${
                              isCurrentTarget
                                ? "bg-amber-500 text-black"
                                : isPast
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-neutral-800 text-neutral-400"
                            }`}
                          >
                            {isPast && <Check className="w-2.5 h-2.5" />}
                            {formattedTime}
                          </span>

                          <span
                            className={`flex-1 text-xs truncate ${
                              isCurrentTarget
                                ? "text-amber-300 font-bold"
                                : isPast
                                ? "text-neutral-300"
                                : "text-neutral-400"
                            }`}
                          >
                            {line.text || "(បន្ទាត់ទទេ)"}
                          </span>

                          {isCurrentTarget && (
                            <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-bold animate-pulse shrink-0">
                              ● កំពុងរង់ចាំចុច
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VISUAL TABLE */}
          {activeTab === "visual" && (
            <div className="space-y-3">
              {/* Presets & Quick Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs text-neutral-400 font-medium">គំរូ Lyric ខ្មែរ:</span>
                  <button
                    onClick={() => handleLoadPreset("traditional")}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs rounded-lg border border-neutral-700 transition cursor-pointer"
                  >
                    ភ្លេងការ/បុរាណ
                  </button>
                  <button
                    onClick={() => handleLoadPreset("chill")}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs rounded-lg border border-neutral-700 transition cursor-pointer"
                  >
                    Acoustic Chill
                  </button>
                  <button
                    onClick={() => handleLoadPreset("ambient")}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs rounded-lg border border-neutral-700 transition cursor-pointer"
                  >
                    រាត្រីភ្នំពេញ
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setAiSongTitle(track.title || "");
                      setAiArtist(track.artist || "");
                      if (!aiRawText && track.caption) setAiRawText(track.caption);
                      setShowAiModal(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                    title="បង្កើត & Sync ទំនុកច្រៀងតាម AI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Sync</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("sync")}
                    className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40 transition cursor-pointer"
                    title="ប្តូរទៅរបៀប Tap to Sync តាមភ្លេង"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>ទៅផ្ទាំង Tap to Sync</span>
                  </button>
                  <button
                    onClick={handleAutoDistribute}
                    className="flex items-center space-x-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs rounded-lg border border-neutral-700 transition cursor-pointer"
                    title="បែងចែកពេលវេលាស្វ័យប្រវត្តិតាមប្រវែងបទ"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ចែកម៉ោងស្វ័យប្រវត្តិ</span>
                  </button>
                  <button
                    onClick={handleAddLine}
                    className="flex items-center space-x-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg border border-neutral-700 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>បន្ថែមបន្ទាត់</span>
                  </button>
                </div>
              </div>

              {/* Line items list */}
              {lines.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 space-y-2">
                  <Mic2 className="w-10 h-10 mx-auto text-neutral-600 opacity-50" />
                  <p className="text-sm text-neutral-300">មិនទាន់មាន Lyric នៅឡើយទេ</p>
                  <p className="text-xs">
                    ចុច "បន្ថែមបន្ទាត់" ឬជ្រើសរើស "គំរូ Lyric ខ្មែរ" ខាងលើដើម្បីចាប់ផ្តើម
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lines.map((line, idx) => {
                    const isActive = activeInfo.index === idx;
                    const min = Math.floor(line.time / 60);
                    const sec = Math.floor(line.time % 60);
                    const timeFormatted = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center space-x-2 p-2.5 rounded-xl border transition-all ${
                          isActive
                            ? "bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10"
                            : "bg-neutral-950/60 hover:bg-neutral-950 border-neutral-800"
                        }`}
                      >
                        {/* Line number */}
                        <span className="w-6 text-center text-xs font-mono text-neutral-500 shrink-0">
                          {idx + 1}
                        </span>

                        {/* Timestamp badge & Stamp button */}
                        <button
                          onClick={() => stampCurrentTimeToLine(idx)}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-300 rounded-lg text-xs font-mono font-bold border border-neutral-700 transition cursor-pointer shrink-0 flex items-center gap-1"
                          title="ចុចដើម្បីដាក់ត្រាពេលវេលាបច្ចុប្បន្នលើបន្ទាត់នេះ (Stamp Time)"
                        >
                          <Clock className="w-3 h-3" />
                          <span>{timeFormatted}</span>
                        </button>

                        {/* Jump audio to this line */}
                        <button
                          onClick={() => seekTo(line.time)}
                          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shrink-0"
                          title="ចាក់សំឡេងចាប់ពីត្រង់នេះ"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>

                        {/* Lyric text input */}
                        <input
                          type="text"
                          value={line.text}
                          onChange={(e) => handleLineTextChange(idx, e.target.value)}
                          placeholder="បញ្ចូលពាក្យទំនុកច្រៀង..."
                          className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-amber-500 px-3 py-1.5 text-xs text-white rounded-lg focus:outline-none transition"
                        />

                        {/* Delete line button */}
                        <button
                          onClick={() => handleDeleteLine(idx)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition cursor-pointer shrink-0"
                          title="លុបបន្ទាត់នេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RAW LRC TEXT AREA */}
          {activeTab === "raw" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>ទម្រង់ LRC Standard: [mm:ss.xx] ទំនុកច្រៀងខ្មែរ</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setAiMode("raw");
                      setAiRawText(lrcInput);
                      setShowAiModal(true);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 rounded-lg text-xs font-bold transition cursor-pointer"
                    title="ឲ្យ AI Sync ពេលវេលាលើអត្ថបទនេះ"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Sync អត្ថបទនេះ</span>
                  </button>
                  <button
                    onClick={handleAutoDistribute}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded-lg border border-neutral-700 transition cursor-pointer"
                    title="បំប្លែងអត្ថបទធម្មតាទៅជា LRC ដោយស្វ័យប្រវត្តិ"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ចែកម៉ោងស្វ័យប្រវត្តិ</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={12}
                value={lrcInput}
                onChange={(e) => handleRawTextChange(e.target.value)}
                placeholder="[00:04.50] ឱ! ទឹកដីអង្គរ...&#10;[00:12.00] រំដួលដងស្ទឹងសៀមរាប..."
                className="w-full p-3.5 bg-neutral-950 border border-neutral-700 rounded-xl font-mono text-xs text-amber-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".lrc,.txt"
              onChange={handleImportLrc}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs border border-neutral-700 transition cursor-pointer"
              title="បញ្ចូលឯកសារ .lrc ឬ .txt ពីកុំព្យូទ័រ"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>នាំចូល .LRC</span>
            </button>

            <button
              onClick={handleExportLrc}
              className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs border border-neutral-700 transition cursor-pointer"
              title="ទាញយកឯកសារ .lrc រក្សាទុក"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ទាញយក .LRC</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition cursor-pointer"
              title="បិទផ្ទាំងកែសម្រួលទំនុកច្រៀង Lyric & Timestamps (Close)"
            >
              <X className="w-3.5 h-3.5 text-neutral-400" />
              <span>បិទផ្ទាំង (Close)</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>រក្សាទុក Lyric លើបទនេះ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

