import React from "react";
import { Image as ImageIcon, Wand2, Download, Sparkles, Youtube, Check } from "lucide-react";

interface YouTubeThumbnailTabProps {
  thumbnailUrl: string | null;
  thumbnailCharacter: "female" | "male" | "couple" | "scenery";
  setThumbnailCharacter: (c: "female" | "male" | "couple" | "scenery") => void;
  thumbnailStyle: "aesthetic" | "neon" | "nature" | "acoustic" | "dark";
  setThumbnailStyle: (s: "aesthetic" | "neon" | "nature" | "acoustic" | "dark") => void;
  isGeneratingThumbnail: boolean;
  onGenerateThumbnail: () => void;
  onDownloadThumbnail: () => void;
  activeTitle: string;
  channelName: string;
}

export const YouTubeThumbnailTab: React.FC<YouTubeThumbnailTabProps> = ({
  thumbnailUrl,
  thumbnailCharacter,
  setThumbnailCharacter,
  thumbnailStyle,
  setThumbnailStyle,
  isGeneratingThumbnail,
  onGenerateThumbnail,
  onDownloadThumbnail,
  activeTitle,
  channelName,
}) => {
  return (
    <div className="space-y-5">
      <div className="p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>AI YouTube Thumbnail Generator (16:9 HD High CTR)</span>
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              រចនាប័ទ្ម 16:9 ពេញអេក្រង់ ដោយមិនដាច់ក្បាល ឬដាច់មុខឡើយ (Waist-Up Portrait with Generous Headroom)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {thumbnailUrl && (
              <button
                onClick={onDownloadThumbnail}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold border border-neutral-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download HD</span>
              </button>
            )}

            <button
              onClick={onGenerateThumbnail}
              disabled={isGeneratingThumbnail}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-md shadow-amber-500/20"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isGeneratingThumbnail ? "animate-spin" : ""}`} />
              <span>{isGeneratingThumbnail ? "កំពុង Generate..." : "Generate New Thumbnail"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              ✨ តួអង្គក្នុង Thumbnail (Character Model):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "female", label: "👩 ស្រីស្អាត (Attractive Female)", desc: "Headphones, Cozy Vibe" },
                { id: "male", label: "🧑 ប្រុសសង្ហា (Handsome Male)", desc: "DJ & Producer Style" },
                { id: "couple", label: "👫 គូស្នេហ៍ (Cute Couple)", desc: "Romantic Music Vibe" },
                { id: "scenery", label: "🏞️ ទេសភាព (Scenic View)", desc: "Atmospheric Chill" },
              ].map((char) => (
                <button
                  key={char.id}
                  onClick={() => setThumbnailCharacter(char.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer text-left ${
                    thumbnailCharacter === char.id
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <p className="truncate">{char.label}</p>
                  <p className="text-[10px] text-neutral-400 font-normal truncate">{char.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              🎨 រចនាប័ទ្ម និងពន្លឺ (Visual Theme):
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "aesthetic", label: "☕ Cozy Room" },
                { id: "neon", label: "🚗 Neon Night" },
                { id: "nature", label: "🌲 Sunset Lake" },
                { id: "acoustic", label: "🎸 Acoustic Cafe" },
                { id: "dark", label: "🎧 Dark Studio" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setThumbnailStyle(st.id as any)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition cursor-pointer text-center ${
                    thumbnailStyle === st.id
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/60"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Display with Full 16:9 Headroom */}
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center group shadow-xl">
        {thumbnailUrl ? (
          <div className="relative w-full h-full">
            <img
              src={thumbnailUrl}
              alt="YouTube Thumbnail"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-101"
            />
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Youtube className="w-3 h-3" />
                <span>MUSIC COMPILATION</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/10">
                1280 x 720 (16:9 HD)
              </span>
            </div>

            <div className="absolute top-3 right-3 pointer-events-none">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white flex items-center gap-1 shadow">
                <Check className="w-3 h-3" />
                <span>តួអង្គពេញអេក្រង់ (Full Framing)</span>
              </span>
            </div>

            {/* Bottom title preview */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex items-end justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <p className="text-white font-black text-sm sm:text-base drop-shadow-md leading-tight uppercase line-clamp-1">
                  {activeTitle || "LATE NIGHT CHILL SESSION"}
                </p>
                <p className="text-[11px] text-amber-400 font-medium">
                  {channelName} • High CTR YouTube Standard
                </p>
              </div>

              <button
                onClick={onDownloadThumbnail}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition cursor-pointer shadow-lg active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយក HD</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 space-y-2">
            <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-400 font-medium">
              ចុច &quot;Generate New Thumbnail&quot; ដើម្បីឱ្យ AI បង្កើតរូបភាព 16:9 ទាក់ទាញ
            </p>
          </div>
        )}

        {/* Loading Overlay */}
        {isGeneratingThumbnail && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-10">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <div className="text-center space-y-0.5">
              <p className="text-xs font-bold text-white">AI កំពុងគូររូបភាព Thumbnail 16:9 HD...</p>
              <p className="text-[11px] text-amber-400 font-mono">Waist-Up Portrait with Generous Headroom</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
