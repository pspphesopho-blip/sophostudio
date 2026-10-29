import React from "react";
import { Radio, Disc3, FastForward, Volume2, Sparkles } from "lucide-react";
import { SongTrack } from "../types";

interface TopMarqueeTickerProps {
  currentTrack: SongTrack | null;
  nextTrack: SongTrack | null;
  isPlaying: boolean;
  totalTracks: number;
  currentIndex: number;
}

export const TopMarqueeTicker: React.FC<TopMarqueeTickerProps> = ({
  currentTrack,
  nextTrack,
  isPlaying,
  totalTracks,
  currentIndex,
}) => {
  const currentTitle = currentTrack?.title || "No Track Selected";
  const currentArtist = currentTrack?.artist || "Khmer Music Studio";
  const nextTitle = nextTrack?.title || (totalTracks > 0 ? "Loop to First Track" : "No Next Track");
  const nextArtist = nextTrack?.artist || "Auto Loop";

  const tickerContent = (
    <div className="flex items-center space-x-8 px-6 font-medium text-sm">
      {/* Song Title Focused */}
      <div className="flex items-center space-x-3 text-amber-400">
        <span className="relative flex h-2.5 w-2.5">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          )}
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <Disc3 className={`w-4 h-4 text-amber-400 ${isPlaying ? "animate-spin" : ""}`} />
          🎵 {currentTitle}
        </span>
      </div>

      <span className="text-neutral-600">✦</span>

      <div className="flex items-center space-x-2 text-white font-semibold text-sm">
        <span>🎵 {currentTitle}</span>
      </div>

      <span className="text-neutral-600">✦</span>
    </div>
  );

  return (
    <div
      id="top-marquee-bar"
      className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 shadow-lg overflow-hidden select-none"
    >
      <div className="flex items-center h-10 w-full">
        {/* Left fixed badge */}
        <div className="hidden sm:flex items-center px-3.5 h-full bg-amber-500/10 border-r border-amber-500/30 text-amber-400 text-xs font-bold shrink-0 space-x-1.5 z-10">
          <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>ON AIR</span>
        </div>

        {/* Marquee viewport */}
        <div className="relative flex-1 overflow-hidden flex items-center">
          {/* Subtle gradient fades on edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-950 to-transparent z-10"></div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-950 to-transparent z-10"></div>

          {/* Marquee infinite loop container */}
          <div className="flex animate-marquee">
            {tickerContent}
            {tickerContent}
            {tickerContent}
          </div>
        </div>

        {/* Right audio visualizer miniature pulse */}
        <div className="hidden md:flex items-center px-3 h-full bg-neutral-900/60 border-l border-neutral-800 text-xs text-neutral-400 space-x-1 shrink-0">
          <Volume2 className="w-3.5 h-3.5 text-neutral-300" />
          <div className="flex items-end gap-0.5 h-3">
            <div className={`w-1 bg-amber-400 rounded-sm ${isPlaying ? "animate-pulse h-3" : "h-1"}`} />
            <div className={`w-1 bg-amber-500 rounded-sm ${isPlaying ? "animate-pulse h-2 delay-75" : "h-1"}`} />
            <div className={`w-1 bg-amber-300 rounded-sm ${isPlaying ? "animate-pulse h-3.5 delay-150" : "h-1"}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
