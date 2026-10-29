import React, { useState } from "react";
import { Sparkles, ListOrdered, FileText, Hash, Copy, Check, Dices, Shuffle } from "lucide-react";
import { SEOData } from "../../types";
import { MUSIC_ATMOSPHERES } from "../../utils/musicAtmosphere";

interface YouTubeSeoTabProps {
  channelName: string;
  setChannelName: (v: string) => void;
  mood: string;
  setMood: (v: string) => void;
  activeTitle: string;
  setActiveTitle: (v: string) => void;
  activeDescription: string;
  setActiveDescription: (v: string) => void;
  activeTags: string[];
  setActiveTags: (v: string[]) => void;
  seoData: SEOData | null;
  isLoadingAi: boolean;
  onGenerateSeo: () => void;
  copyToClipboard: (text: string, field: string) => void;
  copiedField: string | null;
  onRandomizeMood?: () => void;
  moodReason?: string;
  tracksCount?: number;
  featuredSongTitle?: string;
  featuredSongArtist?: string;
  musicFormat?: string;
}

export const YouTubeSeoTab: React.FC<YouTubeSeoTabProps> = ({
  channelName,
  setChannelName,
  mood,
  setMood,
  activeTitle,
  setActiveTitle,
  activeDescription,
  setActiveDescription,
  activeTags,
  setActiveTags,
  seoData,
  isLoadingAi,
  onGenerateSeo,
  copyToClipboard,
  copiedField,
  onRandomizeMood,
  moodReason,
  tracksCount = 0,
  featuredSongTitle = "",
  featuredSongArtist = "",
  musicFormat = "",
}) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRandomizeClick = () => {
    setIsSpinning(true);
    if (onRandomizeMood) {
      onRandomizeMood();
    }
    setTimeout(() => setIsSpinning(false), 450);
  };

  const currentAtmosphere = MUSIC_ATMOSPHERES.find((a) => a.id === mood) || MUSIC_ATMOSPHERES[0];
  const effectiveFormat = musicFormat || seoData?.musicFormat || currentAtmosphere.name;
  const artistPrefix = featuredSongArtist ? `${featuredSongArtist} - ` : "";

  return (
    <div className="space-y-5">
      {/* USA Targeting Notice */}
      <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-blue-300 font-semibold">
          <span className="text-lg">🇺🇸</span>
          <span>
            <strong>USA / Global English Mode:</strong> គ្មានអក្សរខ្មែរឡើយ (Pure English Only) – រៀបចំស្របតាម YouTube Music Algorithm នៅសហរដ្ឋអាមេរិក។
          </span>
        </div>
      </div>

      {/* Generator Trigger */}
      <div className="bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">
            Channel Name:
          </label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-neutral-300 block">
              Music Genre / Atmosphere:
            </label>
            <button
              type="button"
              onClick={handleRandomizeClick}
              className="flex items-center space-x-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/25 px-2 py-0.5 rounded-lg border border-amber-500/30 transition cursor-pointer active:scale-95 shadow-sm"
              title="ជ្រើសរើសចៃដន្យស្របតាមបទចម្រៀងដែលបានដាក់ (Randomize based on tracks)"
            >
              <Dices className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
              <span>🎲 Randomize តាមបទ</span>
            </button>
          </div>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {MUSIC_ATMOSPHERES.map((atm) => (
              <option key={atm.id} value={atm.id}>
                {atm.icon} {atm.name}
              </option>
            ))}
          </select>
          {moodReason ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span className="truncate">{moodReason}</span>
            </div>
          ) : (
            <div className="mt-1 text-[10px] text-neutral-400 truncate">
              {currentAtmosphere.nameKhmer}
            </div>
          )}
        </div>

        <div className="flex items-end">
          <button
            onClick={onGenerateSeo}
            disabled={isLoadingAi}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-md shadow-blue-500/10"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? "animate-spin" : ""}`} />
            <span>{isLoadingAi ? "AI Generating..." : "Generate US English SEO"}</span>
          </button>
        </div>
      </div>

      {/* Title Options & Song Title + Music Format Integration */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <label className="text-xs font-semibold text-neutral-300 block">
            YouTube Video Title (100% US Audience Optimized):
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {featuredSongTitle && (
              <div className="flex items-center space-x-1 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/25">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>បទចម្រៀង:</span>
                <strong className="text-white truncate max-w-[140px]">"{featuredSongTitle}"</strong>
              </div>
            )}
            {effectiveFormat && (
              <div className="flex items-center space-x-1 text-[11px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/25">
                <span>🎼 ទម្រង់ភ្លេង:</span>
                <strong className="text-white font-mono truncate max-w-[170px]">[{effectiveFormat}]</strong>
              </div>
            )}
          </div>
        </div>

        <input
          type="text"
          value={activeTitle}
          onChange={(e) => setActiveTitle(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-blue-500"
        />

        {/* Quick Viral US Hook Templates incorporating BOTH song title and music format */}
        {featuredSongTitle && (
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1">
                <span>⚡ ម៉ូតចំណងជើងទាក់ទាញ (Viral US Hooks with Song Title + Music Format):</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-sans hidden sm:inline">
                ទម្រង់ភ្លេង: <span className="text-cyan-400 font-mono font-semibold">[{effectiveFormat}]</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                {
                  label: "💔 2:00 AM Feeling",
                  title: `💔 "${featuredSongTitle}" [${effectiveFormat}] ~ Songs That Hit Different at 2 AM ☕`,
                },
                {
                  label: "✨ Reset Your Mind",
                  title: `✨ "${featuredSongTitle}" (${effectiveFormat}) ~ When You Need to Reset Your Mind 🌙`,
                },
                {
                  label: "🎧 Soul Touching",
                  title: `🎧 ${artistPrefix}"${featuredSongTitle}" [${effectiveFormat}] ~ A Playlist That Touches Your Soul 🎵`,
                },
                {
                  label: "☕ Cozy Study & Chill",
                  title: `☕ "${featuredSongTitle}" (${effectiveFormat}) ~ Relaxing Vibes to Study, Sleep & Heal 🌧️`,
                },
                {
                  label: "🔥 US Trending Mix",
                  title: `🔥 "${featuredSongTitle}" [${effectiveFormat}] ~ Top Trending US Music Collection [Lyrics]`,
                },
                {
                  label: "🌙 Slowed + Reverb",
                  title: `🌙 "${featuredSongTitle}" [Slowed + Reverb / 432Hz] ~ When You Miss Someone You Can't Text 💔`,
                },
              ].map((hook, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTitle(hook.title)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer active:scale-95 ${
                    activeTitle === hook.title
                      ? "bg-amber-500 text-black border-amber-400 font-bold shadow-sm"
                      : "bg-neutral-900/90 text-amber-300/90 border-amber-500/20 hover:border-amber-400/50 hover:bg-neutral-800"
                  }`}
                  title="ចុចដើម្បីប្រើម៉ូតចំណងជើងនេះភ្លាមៗ"
                >
                  {hook.label}
                </button>
              ))}
            </div>

            {/* Quick Music Format Switcher pills */}
            <div className="flex items-center gap-1 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-[9px] text-neutral-400 shrink-0 uppercase font-bold">ប្តូរទម្រង់ភ្លេង:</span>
              {[
                "Acoustic Guitar",
                "Lo-Fi Hip Hop",
                "Slowed + Reverb",
                "Midnight R&B",
                "Emotional Piano",
                "Sweet Ballad",
                "Deep Sleep 432Hz",
                "Synthwave Drive",
              ].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => {
                    const currentClean = activeTitle.replace(/\[.*?\]|\(.*?\)/g, "").replace(/\s{2,}/g, " ").trim();
                    if (currentClean.includes(`"${featuredSongTitle}"`)) {
                      setActiveTitle(currentClean.replace(`"${featuredSongTitle}"`, `"${featuredSongTitle}" [${fmt}]`));
                    } else {
                      setActiveTitle(`✨ "${featuredSongTitle}" [${fmt}] ~ ${currentClean || "Chillout Session 2026"}`);
                    }
                  }}
                  className="text-[9px] font-mono px-1.5 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-700/60 transition cursor-pointer shrink-0"
                  title={`ចុចដើម្បីបញ្ចូលទម្រង់ [${fmt}] ក្នុងចំណងជើង`}
                >
                  +{fmt}
                </button>
              ))}
            </div>
          </div>
        )}

        {seoData?.titleOptions && seoData.titleOptions.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] text-neutral-400 self-center">ជម្រើសផ្សេងទៀត (AI Suggested):</span>
            {seoData.titleOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => setActiveTitle(opt)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer text-left ${
                  activeTitle === opt
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description & Timestamps */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
            <span>Description & Timestamps (SEO ល្អបំផុត):</span>
          </label>
          <button
            onClick={() => copyToClipboard(activeDescription, "desc")}
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            {copiedField === "desc" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy Description</span>
          </button>
        </div>
        <textarea
          rows={7}
          value={activeDescription}
          onChange={(e) => setActiveDescription(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-xs text-neutral-200 leading-relaxed font-mono focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Chapters & Timestamps Preview */}
      {seoData?.timestampChapters && seoData.timestampChapters.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
              <span>Video Chapters / Timestamps ({seoData.timestampChapters.length} Tracks):</span>
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">សម្រាប់ YouTube Video Timeline</span>
          </label>
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 max-h-32 overflow-y-auto space-y-1 font-mono text-xs text-neutral-300">
            {seoData.timestampChapters.map((ch, idx) => (
              <div key={idx} className="flex items-center justify-between py-0.5 border-b border-neutral-900/60 last:border-0">
                <span className="text-cyan-400 font-semibold">{ch.time}</span>
                <span className="truncate ml-2 text-neutral-300">{ch.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {activeTags.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>YouTube Search Tags ({activeTags.length}):</span>
            </label>
            <button
              onClick={() => copyToClipboard(activeTags.join(", "), "tags")}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedField === "tags" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy All Tags</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800">
            {activeTags.map((tag, i) => (
              <span
                key={i}
                className="text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
