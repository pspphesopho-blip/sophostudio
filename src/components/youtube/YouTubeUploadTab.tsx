import React from "react";
import {
  Upload,
  Video,
  Send,
  Sparkles,
  Youtube,
  ArrowUpRight,
  CheckCircle2,
  Play,
  Copy,
  Check,
  ExternalLink,
  Tv,
  FileText,
  RefreshCw,
} from "lucide-react";
import { YouTubePublishRecord } from "../../types";

interface YouTubeUploadTabProps {
  publishResult: YouTubePublishRecord | null;
  isPublishing: boolean;
  uploadProgress: number;
  uploadStage: string;
  selectedVideoBlob: Blob | null;
  videoPreviewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTitle: string;
  thumbnailUrl: string | null;
  thumbnailCharacter: string;
  thumbnailStyle: string;
  channelName: string;
  setChannelName: (v: string) => void;
  privacyStatus: "public" | "unlisted" | "private";
  setPrivacyStatus: (v: "public" | "unlisted" | "private") => void;
  onPublish: () => void;
  onNavigateToSeo: () => void;
  onResetPublish: () => void;
  onDownloadSeo: () => void;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
}

export const YouTubeUploadTab: React.FC<YouTubeUploadTabProps> = ({
  publishResult,
  isPublishing,
  uploadProgress,
  uploadStage,
  selectedVideoBlob,
  videoPreviewUrl,
  fileInputRef,
  handleFileChange,
  activeTitle,
  thumbnailUrl,
  thumbnailCharacter,
  thumbnailStyle,
  channelName,
  setChannelName,
  privacyStatus,
  setPrivacyStatus,
  onPublish,
  onNavigateToSeo,
  onResetPublish,
  onDownloadSeo,
  copiedField,
  copyToClipboard,
}) => {
  // SUCCESS STATE: Published successfully to YouTube
  if (publishResult) {
    return (
      <div className="p-5 bg-gradient-to-b from-emerald-950/40 to-neutral-950/80 border border-emerald-500/40 rounded-3xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-400 font-bold text-base">
            <div className="p-2 bg-emerald-500/20 rounded-full border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4>បាន Upload ទៅកាន់ YouTube ដោយជោគជ័យ 100%!</h4>
              <p className="text-xs text-neutral-300 font-normal">
                វីដេអូត្រូវបានផ្សព្វផ្សាយទៅ Channel &ldquo;{channelName}&rdquo; ស្របតាមក្បួន SEO រួចរាល់។
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Live on YouTube
          </span>
        </div>

        {/* Video Preview Card */}
        <div className="bg-black/60 rounded-2xl p-4 border border-neutral-800 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-56 aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 flex-shrink-0">
            <img
              src={publishResult.thumbnailUrl || thumbnailUrl || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1280&q=80"}
              alt="Thumbnail"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </div>
            </div>
            <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] font-mono text-white px-1.5 py-0.5 rounded">
              {publishResult.durationFormatted || "15:30"}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5 text-left w-full">
            <h5 className="text-sm font-bold text-white line-clamp-2">
              {publishResult.title}
            </h5>
            <p className="text-xs text-neutral-400">
              Channel: <span className="text-white font-medium">{publishResult.channelName}</span> • ភាពមើលឃើញ: <span className="text-emerald-400 font-medium capitalize">{publishResult.privacyStatus}</span>
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-neutral-400 font-mono">
              <span className="text-red-400 font-semibold truncate max-w-[240px]">
                {publishResult.url || publishResult.videoUrl}
              </span>
              <button
                onClick={() => copyToClipboard(publishResult.url || publishResult.videoUrl || "", "url")}
                className="p-1 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition cursor-pointer"
                title="Copy Link"
              >
                {copiedField === "url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Actions buttons */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <a
            href={publishResult.url || publishResult.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[180px] flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/20"
          >
            <Youtube className="w-4 h-4" />
            <span>មើលវីដេអូនៅលើ YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={publishResult.studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[180px] flex items-center justify-center space-x-2 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold border border-neutral-700 transition"
          >
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>គ្រប់គ្រងក្នុង YouTube Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onDownloadSeo}
            className="flex items-center justify-center space-x-1.5 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-amber-300 rounded-xl text-xs font-semibold border border-neutral-800 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>ទាញយក SEO TXT</span>
          </button>

          <button
            onClick={onResetPublish}
            className="flex items-center justify-center space-x-1.5 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold border border-neutral-800 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Upload វីដេអូមួយទៀត</span>
          </button>
        </div>
      </div>
    );
  }

  // UPLOAD PROGRESS STATE
  if (isPublishing) {
    return (
      <div className="p-8 bg-neutral-950 rounded-3xl border border-red-500/30 text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-20 h-20 rounded-full border-4 border-neutral-800 border-t-red-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Youtube className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-base font-bold text-white">
            កំពុង Upload ទៅកាន់ YouTube ដោយស្វ័យប្រវត្តិ...
          </h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {uploadStage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 max-w-md mx-auto">
          <div className="w-full bg-neutral-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-neutral-700">
            <div
              className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-neutral-400">
            <span>ដំណើរការ: <strong className="text-white">{uploadProgress}%</strong></span>
            <span>ល្បឿន Upload: <strong className="text-cyan-400">14.8 MB/s</strong></span>
          </div>
        </div>

        <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 max-w-md mx-auto text-left text-[11px] text-neutral-400 space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${uploadProgress >= 30 ? "text-emerald-400" : "text-neutral-600"}`} />
            <span>Validating 1080p Video Stream & Audio Tracks</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${uploadProgress >= 60 ? "text-emerald-400" : "text-neutral-600"}`} />
            <span>Direct Video Chunk Upload to Channel &ldquo;{channelName}&rdquo;</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <CheckCircle2 className={`w-3.5 h-3.5 ${uploadProgress >= 85 ? "text-emerald-400" : "text-neutral-600"}`} />
            <span>Injecting Pure US English SEO, Timestamps & High-CTR Thumbnail</span>
          </div>
        </div>
      </div>
    );
  }

  // IDLE PREPARATION STATE
  return (
    <div className="space-y-5">
      {/* Video Source Selection */}
      <div className="p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Video className="w-4 h-4 text-red-500" />
            <span>ឯកសារវីដេអូសម្រាប់ Upload (Video Source):</span>
          </label>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Upload className="w-3 h-3" />
            <span>ជ្រើសរើស File ផ្សេង (.mp4, .webm)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {selectedVideoBlob ? (
          <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col sm:flex-row gap-3 items-center">
            {videoPreviewUrl && (
              <div className="w-full sm:w-44 aspect-video bg-black rounded-lg overflow-hidden border border-neutral-700 flex-shrink-0">
                <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1 w-full text-left">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ វីដេអូរួចរាល់សម្រាប់ Upload
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {selectedVideoBlob instanceof File ? selectedVideoBlob.name : "Khmer_Studio_Visualizer_1080p.webm"}
              </p>
              <p className="text-[11px] text-neutral-400 font-mono">
                ទំហំ: {(selectedVideoBlob.size / 1024 / 1024).toFixed(2)} MB • Resolution: 1920x1080 Full HD
              </p>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-800 hover:border-red-500/50 rounded-xl p-5 text-center cursor-pointer transition bg-neutral-900/40 group"
          >
            <Upload className="w-6 h-6 text-neutral-400 group-hover:text-red-400 mx-auto mb-1.5 transition" />
            <p className="text-xs font-semibold text-neutral-200">
              ចុចទីនេះដើម្បីទម្លាក់ ឬជ្រើសរើសវីដេអូពីកុំព្យូទ័រ
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              (ឬប្រព័ន្ធនឹងប្រើប្រាស់ចម្រៀង & Visualizer បច្ចុប្បន្នសម្រាប់ Render & Upload ដោយស្វ័យប្រវត្តិ)
            </p>
          </div>
        )}
      </div>

      {/* Publishing Details & Privacy */}
      <div className="p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Send className="w-4 h-4 text-amber-400" />
          <span>ការកំណត់ Channel & SEO មុនពេល Upload:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              YouTube Channel Name:
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              ភាពមើលឃើញ (Privacy Status):
            </label>
            <div className="flex gap-1.5">
              {(["unlisted", "public", "private"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setPrivacyStatus(st)}
                  className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl border transition cursor-pointer capitalize ${
                    privacyStatus === st
                      ? "bg-red-500/20 text-red-400 border-red-500/50"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {st === "unlisted" ? "មិនបង្ហាញជាសាធារណៈ" : st === "public" ? "សាធារណៈ" : "ឯកជន"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata Preview Box */}
        <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-neutral-400 uppercase">
              ចំណងជើងវីដេអូ (Title):
            </span>
            <button
              onClick={onNavigateToSeo}
              className="text-[11px] text-blue-400 hover:underline cursor-pointer"
            >
              កែសម្រួល SEO & Timestamps →
            </button>
          </div>
          <p className="text-xs font-bold text-white line-clamp-2">
            {activeTitle || "កំពុងរៀបចំចំណងជើងស្វ័យប្រវត្តិ..."}
          </p>

          {thumbnailUrl && (
            <div className="flex items-center gap-3 pt-2">
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                referrerPolicy="no-referrer"
                className="w-24 aspect-video object-cover rounded-lg border border-neutral-700"
              />
              <div className="text-[11px] text-neutral-400 space-y-0.5">
                <span className="text-emerald-400 font-semibold">✓ 16:9 Thumbnail ភ្ជាប់រួចស្រេច</span>
                <p>Character: {thumbnailCharacter} • Style: {thumbnailStyle}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Upload CTA Button */}
      <div className="p-4 bg-gradient-to-r from-red-950/40 via-neutral-950 to-neutral-950 rounded-2xl border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Upload ទៅ YouTube ដោយស្វ័យប្រវត្តិ</span>
          </h5>
          <p className="text-xs text-neutral-400">
            ប្រព័ន្ធនឹង Upload វីដេអូ, កំណត់ SEO 100% US Audience និងបង្កើត Live Link ភ្លាមៗ
          </p>
        </div>

        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl text-xs transition shadow-xl shadow-red-600/30 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Youtube className="w-5 h-5" />
          <span>ចាប់ផ្តើម Upload ទៅកាន់ YouTube ឥឡូវនេះ</span>
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
