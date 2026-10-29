import React from "react";
import {
  X,
  Check,
  Radio,
  Sparkles,
  Share2,
  Tv,
  Globe,
  Sliders,
  AtSign,
  Layers,
  LayoutTemplate,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { PlatformBadgesConfig } from "../types";

interface PlatformBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PlatformBadgesConfig;
  onChangeConfig: (newConfig: PlatformBadgesConfig) => void;
}

export const PlatformBadgesModal: React.FC<PlatformBadgesModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  const togglePlatform = (key: keyof PlatformBadgesConfig) => {
    onChangeConfig({
      ...config,
      [key]: !config[key],
    });
  };

  const platforms = [
    {
      id: "showLive" as keyof PlatformBadgesConfig,
      name: "🔴 LIVE",
      nameKhmer: "ស្លាកផ្សាយបន្តផ្ទាល់ (Live Stream)",
      desc: "សញ្ញាអំពូលភ្លើងលោតពណ៌ក្រហមបែបផ្សាយផ្ទាល់",
      color: "from-red-600 to-rose-700",
      activeBorder: "border-red-500",
      badgeColor: "bg-red-500",
    },
    {
      id: "showYouTube" as keyof PlatformBadgesConfig,
      name: "YouTube",
      nameKhmer: "ឡូហ្គោ YouTube",
      desc: "ប៊ូតុងក្រហមសញ្ញា Play ផ្លូវការ",
      color: "from-red-600 to-red-800",
      activeBorder: "border-red-500",
      badgeColor: "bg-red-600",
    },
    {
      id: "showTikTok" as keyof PlatformBadgesConfig,
      name: "TikTok",
      nameKhmer: "ឡូហ្គោ TikTok",
      desc: "ណោតភ្លេង Cyan & Magenta ស្ទីល TikTok",
      color: "from-neutral-900 to-neutral-950",
      activeBorder: "border-cyan-400",
      badgeColor: "bg-cyan-400 text-black",
    },
    {
      id: "showSpotify" as keyof PlatformBadgesConfig,
      name: "Spotify",
      nameKhmer: "ឡូហ្គោ Spotify",
      desc: "រលកសំឡេងពណ៌បៃតង Spotify Green",
      color: "from-emerald-600 to-green-700",
      activeBorder: "border-emerald-500",
      badgeColor: "bg-emerald-500 text-black",
    },
    {
      id: "showAppleMusic" as keyof PlatformBadgesConfig,
      name: "Apple Music",
      nameKhmer: "ឡូហ្គោ Apple Music",
      desc: "ណោតភ្លេងភ្លោះពណ៌ក្រហមផ្កាឈូក",
      color: "from-rose-500 to-red-600",
      activeBorder: "border-rose-400",
      badgeColor: "bg-rose-500 text-white",
    },
    {
      id: "showAmazonMusic" as keyof PlatformBadgesConfig,
      name: "Amazon Music",
      nameKhmer: "ឡូហ្គោ Amazon Music",
      desc: "សញ្ញាស្នាមញញឹមរលកភ្លេង Cyan Blue",
      color: "from-sky-600 to-blue-700",
      activeBorder: "border-sky-400",
      badgeColor: "bg-sky-500 text-black",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-red-500/20 to-cyan-500/20 text-white border border-amber-500/30">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>បន្ថែម Icons បណ្តាញ & Streaming Badges</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/40 font-mono font-bold">
                  LIVE & SOCIAL
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                បង្ហាញ Icons YouTube, TikTok, Spotify, Apple Music, Amazon Music និង Live លើវីដេអូ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Master Enable / Disable Banner */}
          <div className="flex items-center justify-between p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 shadow-sm">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-xl transition ${
                  config.enabled
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-neutral-800 text-neutral-500"
                }`}
              >
                {config.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  បង្ហាញ Streaming Icons & Badges លើអេក្រង់ និងលើវីដេអូ
                </p>
                <p className="text-[11px] text-neutral-400">
                  {config.enabled
                    ? "✓ កំពុងដំណើរការលើអេក្រង់ចាក់ និង Render ជាប់លើវីដេអូ Export"
                    : "✕ បានបិទទាំងស្រុង (គ្មានបង្ហាញឡើយ)"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, enabled: !config.enabled })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                config.enabled
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-black shadow-md shadow-emerald-500/20"
                  : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-white"
              }`}
            >
              {config.enabled ? "✓ បើក (ON)" : "បិទ (OFF)"}
            </button>
          </div>

          {/* Individual Platform Toggles */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
              <span>ជ្រើសរើស Icons ដែលចង់បង្ហាញ (Platform Icons) :</span>
              <span className="text-[11px] text-amber-400 font-mono">
                {platforms.filter((p) => config[p.id]).length} / 6 បានជ្រើសរើស
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {platforms.map((plat) => {
                const isActive = !!config[plat.id];

                return (
                  <div
                    key={plat.id}
                    onClick={() => togglePlatform(plat.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? `bg-neutral-950 border-neutral-700 shadow-md ${plat.activeBorder}`
                        : "bg-neutral-950/40 border-neutral-800/80 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          isActive
                            ? plat.badgeColor
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {plat.id === "showLive" && "🔴"}
                        {plat.id === "showYouTube" && "▶"}
                        {plat.id === "showTikTok" && "♪"}
                        {plat.id === "showSpotify" && "🟢"}
                        {plat.id === "showAppleMusic" && "♫"}
                        {plat.id === "showAmazonMusic" && "🎧"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {plat.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {plat.nameKhmer}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 ${
                        isActive
                          ? "bg-amber-500 text-black shadow"
                          : "border border-neutral-700 bg-neutral-900"
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Display Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300">
              ម៉ូតបង្ហាញ (Display Style) :
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "stream_bar" as const,
                  title: "Stream Bar",
                  desc: "របារកញ្ចក់ Glass Streamer + Handle",
                  badge: "ពេញនិយម",
                },
                {
                  id: "icons_with_text" as const,
                  title: "Icons + ឈ្មោះ",
                  desc: "Pills ដាច់ដោយឡែកមានស្លាកឈ្មោះ",
                  badge: "ច្បាស់",
                },
                {
                  id: "icons_only" as const,
                  title: "Icons Only",
                  desc: "តែឡូហ្គោរង្វង់តូចល្មម Minimal",
                  badge: "ស្រាលភ្នែក",
                },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onChangeConfig({ ...config, labelStyle: style.id })}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    config.labelStyle === style.id
                      ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10 text-white"
                      : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{style.title}</span>
                    <span className="text-[9px] bg-neutral-800 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                      {style.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {style.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Position Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300">
              ទីតាំងលើអេក្រង់ (Screen Position) :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "top_right" as const, label: "↗️ ខាងលើស្តាំ (Top Right)" },
                { id: "top_left" as const, label: "↖️ ខាងលើឆ្វេង (Top Left)" },
                { id: "bottom_right" as const, label: "↘️ ខាងក្រោមស្តាំ (Bottom Right)" },
                { id: "bottom_left" as const, label: "↙️ ខាងក្រោមឆ្វេង (Bottom Left)" },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onChangeConfig({ ...config, position: pos.id })}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                    config.position === pos.id
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow"
                      : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Channel Handle / Social Tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-sky-400" />
              <span>ឈ្មោះឆានែល / Social Handle (បង្ហាញក្នុង Stream Bar) :</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.customHandle}
                onChange={(e) =>
                  onChangeConfig({ ...config, customHandle: e.target.value })
                }
                placeholder="ឧ. @KhmerChillMusic ឬ Available on all platforms"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <p className="text-[10px] text-neutral-500">
              អាចដាក់ឈ្មោះ TikTok, YouTube Channel, Telegram ឬសាររំលឹកអ្នកស្តាប់ (ទុកទទេបើមិនចង់បង្ហាញ)
            </p>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 block">
              ឈុតរៀបចំរហ័ស (Quick Presets) :
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    enabled: true,
                    showLive: true,
                    showYouTube: true,
                    showTikTok: false,
                    showSpotify: true,
                    showAppleMusic: false,
                    showAmazonMusic: false,
                    labelStyle: "stream_bar",
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
              >
                🔴 YouTube & Spotify Live
              </button>
              <button
                type="button"
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    enabled: true,
                    showLive: true,
                    showYouTube: true,
                    showTikTok: true,
                    showSpotify: false,
                    showAppleMusic: false,
                    showAmazonMusic: false,
                    labelStyle: "stream_bar",
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
              >
                📱 TikTok & Shorts Creator
              </button>
              <button
                type="button"
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    enabled: true,
                    showLive: false,
                    showYouTube: true,
                    showTikTok: true,
                    showSpotify: true,
                    showAppleMusic: true,
                    showAmazonMusic: true,
                    labelStyle: "stream_bar",
                  })
                }
                className="px-2.5 py-1 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
              >
                🌟 All Streaming Platforms
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-400">
            {config.enabled ? "✓ Badges នឹងបង្ហាញភ្លាមៗ" : "✕ Badges ត្រូវបានបិទ"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>យល់ព្រម (រួចរាល់)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
