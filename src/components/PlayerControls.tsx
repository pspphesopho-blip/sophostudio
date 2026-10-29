import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  FastForward,
  Sparkles,
  Zap,
  BarChart2,
  Layers,
  ChevronDown,
  Mic2,
  Radio,
  Waves,
  Disc,
  Disc3,
  Box,
  Activity,
  Sliders,
} from "lucide-react";
import { SongTrack, PlayerRepeatMode, VisualizerStyle } from "../types";
import { formatDuration } from "../utils/audioDb";
import { VISUALIZER_STYLES } from "../utils/visualizerStyles";

interface PlayerControlsProps {
  currentTrack: SongTrack | null;
  nextTrack: SongTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: PlayerRepeatMode;
  isShuffle: boolean;
  visualizerStyle?: VisualizerStyle;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleVisualizerStyle?: () => void;
  onSelectVisualizerStyle?: (style: VisualizerStyle) => void;
  onOpenLyricEditor?: () => void;
  onGenerateCapCutCaption?: () => void;
  isGeneratingCaption?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentTrack,
  nextTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  visualizerStyle = "bars",
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onToggleVisualizerStyle,
  onSelectVisualizerStyle,
  onOpenLyricEditor,
  onGenerateCapCutCaption,
  isGeneratingCaption,
}) => {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCoverError(false);
  }, [currentTrack?.id, currentTrack?.coverUrl]);

  const currentStyleMeta =
    VISUALIZER_STYLES.find((s) => s.id === visualizerStyle) || VISUALIZER_STYLES[0];

  // Close style dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsStyleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStyleIcon = (style: VisualizerStyle, className: string = "w-4 h-4") => {
    switch (style) {
      case "radial":
        return <Radio className={`${className} text-orange-400`} />;
      case "wave":
        return <Waves className={`${className} text-sky-400`} />;
      case "vinyl":
        return <Disc3 className={`${className} text-yellow-400`} />;
      case "neon":
        return <Box className={`${className} text-purple-400`} />;
      case "ripple":
        return <Activity className={`${className} text-teal-400`} />;
      case "equalizer":
        return <Sliders className={`${className} text-lime-400`} />;
      case "particles":
        return <Sparkles className={`${className} text-cyan-400`} />;
      case "glitch":
        return <Zap className={`${className} text-fuchsia-400`} />;
      case "hybrid":
        return <Layers className={`${className} text-emerald-400`} />;
      case "bars":
      default:
        return <BarChart2 className={`${className} text-amber-400`} />;
    }
  };

  return (
    <div className="bg-neutral-900/95 backdrop-blur-md rounded-2xl p-4 border border-neutral-800 shadow-2xl space-y-3">
      {/* Progress Bar & Scrubber */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
          <span>{formatDuration(currentTime)}</span>
          <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-sans">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>ស្វ័យប្រវត្តិចាក់បទបន្ទាប់ (Auto Next ON)</span>
          </div>
          <span>{formatDuration(duration)}</span>
        </div>

        <div className="relative group cursor-pointer py-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-2 transition-all"
          />
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Current Track Mini preview */}
        <div className="flex items-center space-x-3 w-full md:w-1/3 min-w-0">
          {currentTrack ? (
            <>
              <div
                className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-neutral-700/80 bg-neutral-800 shadow-md flex items-center justify-center transition-all duration-500 ${
                  isPlaying ? "animate-cover-float shadow-amber-500/20 shadow-lg border-amber-500/40" : ""
                }`}
              >
                {!coverError && currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt=""
                    onError={() => setCoverError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Disc className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-500 italic">មិនទាន់ជ្រើសរើសបទចម្រៀង</p>
          )}
        </div>

        {/* Center: Play / Pause / Skip controls & Visualizer Style */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          {/* Shuffle button */}
          <button
            type="button"
            onClick={onToggleShuffle}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isShuffle
                ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
            title="សាប់បទ (Shuffle)"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            type="button"
            onClick={onPrev}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition active:scale-95 cursor-pointer"
            title="បទមុន"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
            title={isPlaying ? "ផ្អាក" : "ចាក់"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            type="button"
            onClick={onNext}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full transition active:scale-95 cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat mode */}
          <button
            type="button"
            onClick={onToggleRepeat}
            className={`p-2 rounded-lg transition cursor-pointer ${
              repeatMode !== "off"
                ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                : "text-neutral-400 hover:text-white"
            }`}
            title={
              repeatMode === "all"
                ? "វិលជុំទាំងអស់ (Repeat All)"
                : repeatMode === "one"
                ? "វិលជុំមួយបទ (Repeat One)"
                : "មិនវិលជុំ"
            }
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>

          {/* Visualizer Style Toggle Button (Beside Repeat) */}
          {onToggleVisualizerStyle && (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center rounded-xl bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={onToggleVisualizerStyle}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-700/60 transition cursor-pointer"
                  title="ចុចដើម្បីប្តូរស្ទីល Visualizer (Click to Cycle Style)"
                >
                  {getStyleIcon(visualizerStyle, "w-3.5 h-3.5")}
                  <span className="hidden sm:inline font-sans">{currentStyleMeta.nameKhmer}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsStyleMenuOpen((prev) => !prev)}
                  className="px-1.5 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700 border-l border-neutral-700/70 transition cursor-pointer"
                  title="បើកបញ្ជីជ្រើសរើសស្ទីល Visualizer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Style Dropdown Menu */}
              {isStyleMenuOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-h-80 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/80 mb-1 flex items-center justify-between">
                    <span>ម៉ូត Visualizer Animation</span>
                    <span className="text-[10px] text-amber-400 font-mono">20 Styles</span>
                  </div>
                  <div className="space-y-1">
                    {VISUALIZER_STYLES.map((style) => {
                      const isSelected = style.id === visualizerStyle;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            if (onSelectVisualizerStyle) {
                              onSelectVisualizerStyle(style.id);
                            } else if (onToggleVisualizerStyle) {
                              onToggleVisualizerStyle();
                            }
                            setIsStyleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                            isSelected
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            {getStyleIcon(style.id, "w-4 h-4")}
                            <div>
                              <div className="text-xs font-semibold leading-tight">
                                {style.nameKhmer}
                              </div>
                              <div className="text-[10px] text-neutral-400 leading-tight">
                                {style.name}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded-full">
                              សកម្ម
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Next song badge & Volume control (Original position) */}
        <div className="flex items-center justify-end space-x-4 w-full md:w-1/3">
          {/* Next song preview info */}
          {nextTrack && (
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-300 max-w-[170px]">
              <FastForward className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-cyan-400 block uppercase font-bold tracking-wider">
                  Next:
                </span>
                <span className="truncate block font-medium">{nextTrack.title}</span>
              </div>
            </div>
          )}

          {/* Volume Control */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-neutral-400 hover:text-white cursor-pointer"
              title={isMuted ? "បើកសំឡេង" : "បិទសំឡេង"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
