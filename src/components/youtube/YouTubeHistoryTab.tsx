import React from "react";
import { Tv, RefreshCw, Youtube, Copy, Check } from "lucide-react";
import { YouTubePublishRecord } from "../../types";

interface YouTubeHistoryTabProps {
  history: YouTubePublishRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  copyToClipboard: (text: string, field: string) => void;
  copiedField: string | null;
}

export const YouTubeHistoryTab: React.FC<YouTubeHistoryTabProps> = ({
  history,
  isLoading,
  onRefresh,
  copyToClipboard,
  copiedField,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Tv className="w-4 h-4 text-emerald-400" />
          <span>វីដេអូដែលបាន Upload ទៅកាន់ Channel ({history.length}):</span>
        </h4>
        <button
          onClick={onRefresh}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center text-neutral-400 bg-neutral-950/60 rounded-2xl border border-neutral-800">
          <Tv className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
          <p className="text-xs">មិនទាន់មានវីដេអូបាន Upload នៅឡើយទេ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-neutral-950/80 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row gap-3.5 items-center justify-between hover:border-neutral-700 transition"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-28 aspect-video bg-neutral-900 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-800">
                  <img
                    src={item.thumbnailUrl || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1280&q=80"}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono text-white px-1 rounded">
                    {item.durationFormatted || "15:30"}
                  </span>
                </div>

                <div className="space-y-1 text-left min-w-0 flex-1">
                  <h6 className="text-xs font-bold text-white line-clamp-1">{item.title}</h6>
                  <p className="text-[11px] text-neutral-400">
                    Channel: <strong className="text-neutral-200">{item.channelName}</strong> • {new Date(item.publishedAt).toLocaleDateString()}
                  </p>
                  <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ {item.privacyStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <a
                  href={item.url || item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Watch</span>
                </a>

                <button
                  onClick={() => copyToClipboard(item.url || item.videoUrl || "", item.id)}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs border border-neutral-700 transition cursor-pointer"
                  title="Copy Video Link"
                >
                  {copiedField === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
