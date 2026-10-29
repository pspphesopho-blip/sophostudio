import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Check,
  Disc,
  Sparkles,
  Layers,
  Video as VideoIcon,
  Play,
  X,
  Film,
  SunMedium,
} from "lucide-react";
import { VisualizerPreset, SongTrack, BackgroundMode, BackgroundBrightnessMode } from "../types";
import {
  PRESET_VISUALIZERS,
  PRESET_COVERS,
  getDistinctCoverForTrack,
} from "../utils/audioSynthesizer";
import { PRESET_VIDEO_BACKGROUNDS } from "../utils/videoBackgroundPresets";

interface PhotoCoverPickerProps {
  currentPreset: VisualizerPreset;
  customBgUrl?: string;
  customBgVideoUrl?: string;
  activeBgType: BackgroundMode;
  backgroundBrightnessMode?: BackgroundBrightnessMode;
  onChangeBackgroundBrightness?: (mode: BackgroundBrightnessMode) => void;
  onSelectPreset: (preset: VisualizerPreset) => void;
  onUploadCustomPhoto: (file: File) => void;
  onSelectVideoPreset: (presetId: string) => void;
  onUploadCustomVideo: (file: File) => void;
  onClearVideoBackground: () => void;
  currentTrack?: SongTrack | null;
  onSelectTrackCover?: (coverUrl: string, applyToAll?: boolean) => void;
  onUploadTrackCover?: (file: File, applyToAll?: boolean) => void;
  showCover?: boolean;
  onToggleCover?: () => void;
}

export const PhotoCoverPicker: React.FC<PhotoCoverPickerProps> = ({
  currentPreset,
  customBgUrl,
  customBgVideoUrl,
  activeBgType,
  backgroundBrightnessMode = "original",
  onChangeBackgroundBrightness,
  onSelectPreset,
  onUploadCustomPhoto,
  onSelectVideoPreset,
  onUploadCustomVideo,
  onClearVideoBackground,
  currentTrack,
  onSelectTrackCover,
  onUploadTrackCover,
  showCover = true,
  onToggleCover,
}) => {
  const [activeTab, setActiveTab] = useState<"image_bg" | "video_bg" | "cover">(
    activeBgType === "video" ? "video_bg" : "image_bg"
  );
  const [customVideoFileName, setCustomVideoFileName] = useState<string>("");
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomPhoto(file);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomVideoFileName(file.name);
      onUploadCustomVideo(file);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadTrackCover) {
      onUploadTrackCover(file, false);
    }
  };

  const activeBg = customBgUrl || currentPreset.bgUrl;
  const currentCover = currentTrack
    ? getDistinctCoverForTrack(currentTrack, activeBg)
    : PRESET_COVERS[0].url;

  return (
    <div className="bg-neutral-900/90 backdrop-blur-md rounded-2xl p-5 border border-neutral-800 shadow-xl space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={bgFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBgFileChange}
      />
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/ogg,video/*"
        className="hidden"
        onChange={handleVideoFileChange}
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverFileChange}
      />

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {activeBgType === "video" ? (
              <VideoIcon className="w-4 h-4 text-emerald-400" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </span>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>ការកំណត់រូបភាព & វីដេអូផ្ទៃក្រោយ</span>
              {activeBgType === "video" ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  🎬 វីដេអូផ្ទៃក្រោយកំពុងដំណើរការ
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  🖼️ រូបភាពសន្លឹកកំពុងដំណើរការ
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-400">
              បំបែកដាច់ដោយឡែករវាងរូប/វីដេអូ <strong className="text-amber-300">ផ្ទៃខាងក្រោយ (Background)</strong> និងរូប <strong className="text-cyan-300">Cover ចម្រៀង (Singer Cover)</strong>
            </p>
          </div>
        </div>

        {/* 3-Tab Switcher */}
        <div className="flex items-center flex-wrap bg-neutral-950 p-1 rounded-xl border border-neutral-800 gap-1">
          <button
            onClick={() => setActiveTab("image_bg")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "image_bg"
                ? "bg-amber-500 text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. រូបថតផ្ទៃក្រោយ</span>
          </button>

          <button
            onClick={() => setActiveTab("video_bg")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "video_bg"
                ? "bg-emerald-500 text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>2. 🎬 វីដេអូផ្ទៃក្រោយ</span>
            {activeBgType === "video" && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("cover")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "cover"
                ? "bg-cyan-500 text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>3. Cover ចម្រៀង</span>
          </button>
        </div>
      </div>

      {/* TAB 1: IMAGE BACKGROUND (រូបភាពសន្លឹក 16:9 Stage Landscape) */}
      {activeTab === "image_bg" && (
        <div className="space-y-3">
          {/* Background Brightness & Clarity Control (រក្សាពន្លឺអោយស្អាតដូចរូបថតដើម) */}
          {onChangeBackgroundBrightness && (
            <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                  <span>កម្រិតពន្លឺរូបថត Background (រក្សាពន្លឺដូចរូបដើម):</span>
                </span>
                <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {backgroundBrightnessMode === "original"
                    ? "🌟 ពន្លឺដើម 100% (Original Brightness)"
                    : backgroundBrightnessMode === "soft"
                    ? "🎬 ពន្លឺស្រទន់ (Soft Cinematic)"
                    : "🌙 Focus Dim (ងងឹតបន្តិច)"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeBackgroundBrightness("original")}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                    backgroundBrightnessMode === "original"
                      ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-sm"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>🌟</span>
                    <span>ពន្លឺដើម 100% (ណែនាំ)</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    រក្សាពន្លឺ ពណ៌ស្រស់ និងភាពច្បាស់ដូចរូបដើម 100%
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeBackgroundBrightness("soft")}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                    backgroundBrightnessMode === "soft"
                      ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-sm"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>🎬</span>
                    <span>ពន្លឺស្រទន់</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    ពន្លឺបែបភាពយន្តស្រទន់
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeBackgroundBrightness("dimmed")}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                    backgroundBrightnessMode === "dimmed"
                      ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/25 shadow-sm"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>🌙</span>
                    <span>Focus Dim</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    បន្ថយពន្លឺសម្រាប់ Neon Glow
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
              <span>🖼️</span> ជ្រើសរើសផ្ទាំងសាវតារ ឬ Upload រូបថតទេសភាពផ្ទាល់ខ្លួន (16:9 Image Background):
            </span>
            <button
              onClick={() => bgFileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-xl text-xs font-semibold border border-neutral-700 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload រូបផ្ទៃខាងក្រោយ</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            {/* Custom Uploaded Background */}
            {customBgUrl && (
              <div
                className="relative aspect-video rounded-xl overflow-hidden border-2 border-amber-400 shadow-lg cursor-pointer group"
                title="រូបថតផ្ទាល់ខ្លួន (Custom Background)"
              >
                <img
                  src={customBgUrl}
                  alt="Custom Background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[10px] font-bold text-amber-300 truncate">
                    រូប Upload ផ្ទាល់ខ្លួន
                  </span>
                </div>
                {activeBgType === "image" && (
                  <div className="absolute top-1 right-1 bg-amber-500 text-black p-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            )}

            {/* Presets */}
            {PRESET_VISUALIZERS.map((preset) => {
              const isSelected =
                activeBgType === "image" && !customBgUrl && currentPreset.id === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                    isSelected
                      ? "border-amber-500 shadow-md shadow-amber-500/30 scale-[1.02]"
                      : "border-neutral-800 hover:border-neutral-600 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={preset.bgUrl}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] font-semibold text-white truncate">
                      {preset.nameKhmer}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-amber-500 text-black p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VIDEO BACKGROUND (ផ្ទៃខាងក្រោយវីដេអូមានចលនា Loop Motion) */}
      {activeTab === "video_bg" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-neutral-300 font-semibold flex items-center gap-1.5">
                <Film className="w-4 h-4 text-emerald-400" />
                <span>ផ្ទៃខាងក្រោយវីដេអូមានចលនា (Motion Video Loop Backgrounds):</span>
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                អ្នកអាច Upload វីដេអូផ្ទាល់ខ្លួន (MP4/WebM) ឬជ្រើសរើស Preset វីដេអូភ្លើងពណ៌/កាឡាក់ស៊ីខាងក្រោម
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeBgType === "video" && (
                <button
                  onClick={onClearVideoBackground}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-rose-300 rounded-xl text-xs font-semibold border border-neutral-700 transition cursor-pointer"
                  title="ប្តូរមកប្រើរូបភាពសន្លឹកវិញ"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>បិទវីដេអូ / ប្រើរូបថតវិញ</span>
                </button>
              )}
              <button
                onClick={() => videoFileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload វីដេអូផ្ទាល់ខ្លួន (MP4/WebM)</span>
              </button>
            </div>
          </div>

          {/* Uploaded Custom Video Preview Card (if any) */}
          {customBgVideoUrl && (
            <div className="p-3 bg-neutral-950/70 rounded-xl border border-emerald-500/40 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-44 aspect-video rounded-lg overflow-hidden bg-black border border-neutral-700 shrink-0">
                <video
                  src={customBgVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>LIVE PREVIEW</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    វីដេអូ Upload ផ្ទាល់ខ្លួន
                  </span>
                  <span className="text-xs font-semibold text-white truncate">
                    {customVideoFileName || "Custom Background Video.mp4"}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  វីដេអូនេះកំពុងដំណើរការជាផ្ទៃខាងក្រោយលើផ្ទាំង Visualizer និងក្នុងវីដេអូដែល Export ចេញ
                </p>
              </div>
              <button
                onClick={onClearVideoBackground}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-neutral-800 transition cursor-pointer"
              >
                ដកចេញ
              </button>
            </div>
          )}

          {/* Preset Video Motion Backgrounds */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {PRESET_VIDEO_BACKGROUNDS.map((videoPreset) => {
              const isSelected =
                activeBgType === "video" &&
                !customVideoFileName &&
                customBgVideoUrl?.includes(videoPreset.id);

              return (
                <div
                  key={videoPreset.id}
                  onClick={() => onSelectVideoPreset(videoPreset.id)}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col ${
                    isSelected
                      ? "border-emerald-500 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                      : "border-neutral-800 hover:border-neutral-600 opacity-85 hover:opacity-100"
                  }`}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                    <img
                      src={videoPreset.thumbnailUrl}
                      alt={videoPreset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-2">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-white block truncate leading-tight">
                          {videoPreset.nameKhmer}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400 block truncate">
                          {videoPreset.name}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-black p-0.5 rounded-full shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-emerald-300 flex items-center gap-1 backdrop-blur-sm">
                      <Film className="w-2.5 h-2.5" />
                      <span>MOTION</span>
                    </div>
                  </div>
                  <div className="p-2 bg-neutral-950/80 border-t border-neutral-800/60">
                    <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {videoPreset.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-neutral-400 flex items-center gap-2 pt-1">
            <span>💡 <strong>ចំណាំ:</strong> ផ្ទៃខាងក្រោយវីដេអូ នឹងចាក់ Loop អូតូ និងដំណើរការស៊ីចង្វាក់ជាមួយបទភ្លេង ហើយ Export ចេញជាវីដេអូពេញលេញ!</span>
          </div>
        </div>
      )}

      {/* TAB 3: SONG & SINGER COVER (រូបភាព Cover ឌីសចម្រៀង / តារាចម្រៀង) */}
      {activeTab === "cover" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-neutral-300 font-medium flex items-center gap-1.5">
              <span>💿</span> រូបភាព Cover តារាចម្រៀង / សិល្បករ សម្រាប់បទ:{" "}
              <strong className="text-cyan-300 underline truncate max-w-xs inline-block">
                {currentTrack?.title || "បទចម្រៀងបច្ចុប្បន្ន"}
              </strong>
            </span>
            <div className="flex items-center gap-2">
              {onToggleCover && (
                <button
                  type="button"
                  onClick={onToggleCover}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
                    showCover
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                  }`}
                  title="ចុចដើម្បី បិទ ឬ បើក រូប Cover ចម្រៀងលើអេក្រង់"
                >
                  <Disc className={`w-3.5 h-3.5 ${showCover ? "text-emerald-400" : "text-red-400"}`} />
                  <span>Cover: {showCover ? "បើក (ON)" : "បិទ (OFF)"}</span>
                </button>
              )}
              <button
                onClick={() => coverFileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded-xl text-xs font-semibold border border-neutral-700 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload រូប Cover ចម្រៀង</span>
              </button>
            </div>
          </div>

          {!showCover && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-red-300">
              <div className="flex items-center space-x-2">
                <Disc className="w-4 h-4 text-red-400 shrink-0" />
                <span>រូប Cover ត្រូវបានបិទ (Hidden) — អេក្រង់នឹងបង្ហាញតែ Background, អក្សរ និងរលកភ្លេងសុទ្ធសាធ។</span>
              </div>
              {onToggleCover && (
                <button
                  type="button"
                  onClick={onToggleCover}
                  className="px-2.5 py-1 bg-red-500 text-black font-bold text-[11px] rounded-lg hover:bg-red-400 transition cursor-pointer"
                >
                  បើក Cover ឡើងវិញ
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {PRESET_COVERS.map((cov) => {
              const isSelected = currentCover === cov.url;

              return (
                <div
                  key={cov.id}
                  onClick={() => onSelectTrackCover && onSelectTrackCover(cov.url, false)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                    isSelected
                      ? "border-cyan-400 shadow-md shadow-cyan-500/30 scale-[1.02]"
                      : "border-neutral-800 hover:border-neutral-600 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={cov.url}
                    alt={cov.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] font-semibold text-cyan-200 truncate">
                      {cov.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-cyan-400 text-black p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {onSelectTrackCover && currentTrack && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
              <span>💡 រូបភាព Cover នេះ នឹងបង្ហាញលើកាតឌីសវិលកណ្តាលអេក្រង់ និងក្នុងវីដេអូដែល Render ចេញ</span>
              <button
                onClick={() => onSelectTrackCover(currentCover, true)}
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>កំណត់ Cover នេះ សម្រាប់គ្រប់បទក្នុង Playlist</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
