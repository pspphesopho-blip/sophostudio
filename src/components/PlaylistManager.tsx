import React, { useRef, useState } from "react";
import {
  UploadCloud,
  Music2,
  Trash2,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  Search,
  Image as ImageIcon,
  Sparkles,
  Database,
  Plus,
  RefreshCw,
  Users,
  X,
  Tag,
  CheckCircle2,
  MessageSquare,
  Mic2,
} from "lucide-react";
import { SongTrack } from "../types";
import { getDefaultLyricsForTrack } from "../utils/lyricsParser";
import { parseAudioFilename, formatDuration, formatFileSize, getAudioDuration } from "../utils/audioDb";

interface PlaylistManagerProps {
  tracks: SongTrack[];
  currentTrackId?: string;
  isPlaying: boolean;
  onSelectTrack: (track: SongTrack, index: number) => void;
  onAddTracks: (newTracks: SongTrack[]) => void;
  onUpdateTrack: (updated: SongTrack) => void;
  onDeleteTrack: (id: string) => void;
  onReorderTracks: (newTracks: SongTrack[]) => void;
  onAddDemoTracks: () => void;
  onBatchUpdateArtist?: (newArtist: string) => void;
  onBatchUpdateCaption?: (newCaption: string) => void;
  onOpenLyricEditor?: (track: SongTrack) => void;
  onClearAll: () => void;
  defaultCoverUrl: string;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onAddTracks,
  onUpdateTrack,
  onDeleteTrack,
  onReorderTracks,
  onAddDemoTracks,
  onBatchUpdateArtist,
  onBatchUpdateCaption,
  onOpenLyricEditor,
  onClearAll,
  defaultCoverUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [targetCoverTrackId, setTargetCoverTrackId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Batch Artist Rename State
  const [isBatchArtistModalOpen, setIsBatchArtistModalOpen] = useState(false);
  const [batchArtistInput, setBatchArtistInput] = useState("");

  // Batch Song Caption State
  const [isBatchCaptionModalOpen, setIsBatchCaptionModalOpen] = useState(false);
  const [batchCaptionInput, setBatchCaptionInput] = useState("");

  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  // Handle Multi-file Upload
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newTracksList: SongTrack[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|flac)$/i)) {
        continue;
      }

      const { title, artist } = parseAudioFilename(file.name);
      const audioUrl = URL.createObjectURL(file);
      const duration = await getAudioDuration(file);
      const dur = Math.round(duration) || 180;

      // Automatically generate appropriate synchronized lyrics (English for English songs, Khmer for Khmer)
      const defaultData = getDefaultLyricsForTrack(title, artist, dur);

      const song: SongTrack = {
        id: "song_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        title,
        artist,
        duration: dur,
        fileBlob: file,
        audioUrl,
        coverUrl: defaultCoverUrl,
        lyrics: defaultData.lrc,
        parsedLyrics: defaultData.parsed,
        caption: defaultData.lines.slice(0, 4).join(" | "),
        addedAt: Date.now() + i,
        fileSize: file.size,
        sizeFormatted: formatFileSize(file.size),
        isDemo: false,
      };

      newTracksList.push(song);
    }

    if (newTracksList.length > 0) {
      onAddTracks(newTracksList);
    }
    setIsProcessing(false);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Edit in-place
  const startEditing = (track: SongTrack) => {
    setEditingTrackId(track.id);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditCaption(track.caption || "");
  };

  const saveEditing = (track: SongTrack) => {
    onUpdateTrack({
      ...track,
      title: editTitle.trim() || track.title,
      artist: editArtist.trim() || track.artist,
      caption: editCaption.trim() || undefined,
    });
    setEditingTrackId(null);
  };

  // Change individual track cover
  const handleCoverChange = (trackId: string) => {
    setTargetCoverTrackId(trackId);
    coverInputRef.current?.click();
  };

  const onCoverFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetCoverTrackId) {
      const coverUrl = URL.createObjectURL(file);
      const target = tracks.find((t) => t.id === targetCoverTrackId);
      if (target) {
        onUpdateTrack({ ...target, coverUrl });
      }
    }
    setTargetCoverTrackId(null);
  };

  // Handle batch artist rename
  const handleApplyBatchArtist = () => {
    const trimmed = batchArtistInput.trim();
    if (!trimmed) return;
    if (onBatchUpdateArtist) {
      onBatchUpdateArtist(trimmed);
    }
    setBatchSuccessMessage(`បានប្តូរឈ្មោះអ្នកចម្រៀងទៅជា "${trimmed}" លើ ${tracks.length} បទទាំងអស់ដោយជោគជ័យ!`);
    setTimeout(() => {
      setBatchSuccessMessage(null);
    }, 4500);
    setIsBatchArtistModalOpen(false);
  };

  // Handle batch caption update
  const handleApplyBatchCaption = () => {
    const trimmed = batchCaptionInput.trim();
    if (!trimmed) return;
    if (onBatchUpdateCaption) {
      onBatchUpdateCaption(trimmed);
    }
    setBatchSuccessMessage(`បានដាក់ Song Caption លើ ${tracks.length} បទទាំងអស់ដោយជោគជ័យ!`);
    setTimeout(() => {
      setBatchSuccessMessage(null);
    }, 4500);
    setIsBatchCaptionModalOpen(false);
  };

  // Reorder helpers
  const moveTrack = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= tracks.length) return;
    const updated = [...tracks];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onReorderTracks(updated);
  };

  // Filtered tracks
  const filteredTracks = tracks.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-neutral-900/90 backdrop-blur-md rounded-2xl p-5 border border-neutral-800 shadow-xl flex flex-col h-full">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onCoverFileSelected}
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Music2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                បញ្ជីបទចម្រៀងក្នុង Database
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {tracks.length} បទ
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                ទាញចំណងជើងចូលស្វ័យប្រវត្តិ • ស្វ័យប្រវត្តិប្តូរបទពេលចប់
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isProcessing ? "កំពុងទាញចូល..." : "ដាក់ចម្រៀងចូល (+)"}</span>
          </button>

          {tracks.length === 0 && (
            <button
              onClick={onAddDemoTracks}
              className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-medium rounded-xl text-xs border border-neutral-700 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ដាក់បទគំរូ</span>
            </button>
          )}

          {tracks.length > 0 && onBatchUpdateArtist && (
            <button
              onClick={() => {
                setBatchArtistInput(tracks[0]?.artist || "");
                setIsBatchArtistModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold rounded-xl text-xs border border-neutral-700 transition active:scale-95 cursor-pointer shadow-sm"
              title="ប្តូរឈ្មោះតារាចម្រៀងទាំងអស់ (Rename Artist for All Tracks)"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>ប្តូរឈ្មោះតារាទាំងអស់</span>
            </button>
          )}

          {tracks.length > 0 && onBatchUpdateCaption && (
            <button
              onClick={() => {
                setBatchCaptionInput(tracks[0]?.caption || "🌸 អារម្មណ៍ស្រស់ស្រាយជាមួយបទភ្លេងពិរោះៗ • Enjoy the Melody 🎧");
                setIsBatchCaptionModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold rounded-xl text-xs border border-neutral-700 transition active:scale-95 cursor-pointer shadow-sm"
              title="ដាក់ Song Caption លើវីដេអូសម្រាប់គ្រប់បទ (Set Caption for All)"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>ដាក់ Caption ទាំងអស់</span>
            </button>
          )}

          {tracks.length > 0 && onOpenLyricEditor && (
            <button
              onClick={() => {
                const target = tracks.find((t) => t.id === currentTrackId) || tracks[0];
                onOpenLyricEditor(target);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold rounded-xl text-xs border border-neutral-700 transition active:scale-95 cursor-pointer shadow-sm"
              title="បើកផ្ទាំងកែសម្រួលទំនុកច្រៀង Lyric & Timestamps"
            >
              <Mic2 className="w-3.5 h-3.5 text-amber-400" />
              <span>កែ Lyric បទនេះ</span>
            </button>
          )}

          {tracks.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center space-x-1 px-2.5 py-2 bg-neutral-800/80 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 rounded-xl text-xs border border-neutral-800 transition cursor-pointer"
              title="លុបបទទាំងអស់"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">សម្អាត</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Success Message Toast */}
      {batchSuccessMessage && (
        <div className="my-2.5 p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{batchSuccessMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`my-3 p-4 border-2 border-dashed rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3 text-center ${
          isDragging
            ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
            : "border-neutral-800 hover:border-amber-500/50 bg-neutral-950/50 hover:bg-neutral-950"
        }`}
      >
        <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-400">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold text-white">
            ទម្លាក់ហ្វាលចម្រៀងចូលទីនេះ (Drop audio files here)
          </p>
          <p className="text-[11px] text-neutral-400">
            គាំទ្រ MP3, WAV, M4A, OGG ច្រើនបទក្នុងពេលតែមួយ • ទាញឈ្មោះដោយស្វ័យប្រវត្តិ
          </p>
        </div>
      </div>

      {/* Search Input */}
      {tracks.length > 3 && (
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="ស្វែងរកតាមចំណងជើង ឬអ្នកច្រៀង..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      )}

      {/* Track List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[380px]">
        {filteredTracks.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <Database className="w-10 h-10 mb-2 opacity-40 text-amber-500" />
            <p className="text-sm font-medium text-neutral-300">
              {searchQuery ? "រកមិនឃើញបទចម្រៀង" : "មិនទាន់មានបទចម្រៀងក្នុង Database"}
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              ចុចប៊ូតុង "ដាក់ចម្រៀងចូល" ឬ "ដាក់បទគំរូ" ដើម្បីចាប់ផ្តើម
            </p>
          </div>
        ) : (
          filteredTracks.map((track, index) => {
            const isCurrent = track.id === currentTrackId;
            const isEditing = editingTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5"
                    : "bg-neutral-950/60 hover:bg-neutral-950 border-neutral-800/80 hover:border-neutral-700"
                }`}
              >
                {/* Left: Index & Thumbnail & Titles */}
                <div className="flex items-center space-x-3 flex-1 min-w-0 mr-2">
                  {/* Play / Index Button */}
                  <button
                    onClick={() => onSelectTrack(track, index)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 transition ${
                      isCurrent
                        ? "bg-amber-500 text-black font-bold"
                        : "bg-neutral-800 text-neutral-400 group-hover:bg-amber-500/20 group-hover:text-amber-400"
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Cover image with change option */}
                  <div
                    onClick={() => handleCoverChange(track.id)}
                    className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-800 cursor-pointer group/cover"
                    title="ចុចដើម្បីប្តូររូបថត Cover"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center transition">
                      <ImageIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5 w-full py-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="ចំណងជើងបទ"
                            className="bg-neutral-900 border border-amber-500 px-2 py-0.5 text-xs text-white rounded flex-1 focus:outline-none"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editArtist}
                            onChange={(e) => setEditArtist(e.target.value)}
                            placeholder="អ្នកច្រៀង"
                            className="bg-neutral-900 border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 rounded flex-1 focus:outline-none"
                          />
                          <button
                            onClick={() => saveEditing(track)}
                            className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded cursor-pointer"
                            title="រក្សាទុក"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-amber-400 shrink-0" />
                          <input
                            type="text"
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            placeholder="💬 Song Caption លើវីដេអូ (ឧ. 🌸 អារម្មណ៍ស្រស់ស្រាយជាមួយបទភ្លេង...)"
                            className="bg-neutral-900 border border-neutral-700 focus:border-amber-500 px-2 py-0.5 text-xs text-amber-300 rounded w-full focus:outline-none placeholder:text-neutral-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        onDoubleClick={() => startEditing(track)}
                        className="cursor-pointer"
                        title="ចុចពីរដង (Double click) ដើម្បីកែចំណងជើង & Caption"
                      >
                        <p
                          className={`text-xs font-semibold truncate ${
                            isCurrent ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {index + 1}. {track.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5">
                          <span>{track.artist}</span>
                          <span className="text-neutral-600">•</span>
                          <span className="font-mono text-[10px] text-neutral-500">
                            {formatDuration(track.duration)}
                          </span>
                          {track.lyrics || (track.parsedLyrics && track.parsedLyrics.length > 0) ? (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-0.5">
                              <Mic2 className="w-2.5 h-2.5" />
                              Lyric
                            </span>
                          ) : null}
                          {track.isDemo && (
                            <span className="text-[9px] bg-neutral-800 text-amber-400/80 px-1.5 py-0.2 rounded">
                              Demo
                            </span>
                          )}
                        </p>
                        {track.caption && (
                          <p
                            className="text-[10px] text-amber-300/80 truncate flex items-center gap-1 mt-0.5"
                            title={track.caption}
                          >
                            <MessageSquare className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span className="italic truncate">"{track.caption}"</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100">
                  {/* Move Up / Down */}
                  <div className="hidden sm:flex flex-col">
                    <button
                      disabled={index === 0}
                      onClick={() => moveTrack(index, "up")}
                      className="p-0.5 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={index === tracks.length - 1}
                      onClick={() => moveTrack(index, "down")}
                      className="p-0.5 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Lyric Edit Button */}
                  {onOpenLyricEditor && (
                    <button
                      onClick={() => onOpenLyricEditor(track)}
                      className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition cursor-pointer"
                      title="កែសម្រួលទំនុកច្រៀង Lyric & Timestamps"
                    >
                      <Mic2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Edit button */}
                  {!isEditing && (
                    <button
                      onClick={() => startEditing(track)}
                      className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition cursor-pointer"
                      title="កែចំណងជើង & អ្នកច្រៀង"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteTrack(track.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="លុបចេញ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom status bar */}
      <div className="pt-3 mt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          ទិន្នន័យត្រូវបានរក្សាទុកក្នុង IndexedDB ស្វ័យប្រវត្តិ
        </span>
        <span className="font-mono text-neutral-300">
          សរុប:{" "}
          {formatDuration(
            tracks.reduce((acc, curr) => acc + (curr.duration || 0), 0)
          )}
        </span>
      </div>

      {/* Batch Artist Rename Modal */}
      {isBatchArtistModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    ប្តូរឈ្មោះតារាចម្រៀងទាំងអស់ (Rename Artist All)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    នឹងប្តូរឈ្មោះ Artist លើ {tracks.length} បទទាំងអស់ក្នុងពេលតែមួយ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchArtistModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  ឈ្មោះអ្នកចម្រៀងថ្មី (New Artist Name)
                </label>
                <input
                  type="text"
                  value={batchArtistInput}
                  onChange={(e) => setBatchArtistInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && batchArtistInput.trim()) {
                      handleApplyBatchArtist();
                    }
                  }}
                  placeholder="បញ្ចូលឈ្មោះអ្នកចម្រៀង (ឧ. ស៊ិន ស៊ីសាមុត)..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                  autoFocus
                />
              </div>

              {/* Quick Suggestion Chips */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                  ជម្រើសលឿន (Quick Artist Presets):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "ស៊ិន ស៊ីសាមុត",
                    "រស់ សេរីសុទ្ធា",
                    "ព្រាប សុវត្ថិ",
                    "ម៉េង កែវពេជ្ជតា",
                    "Traditional Khmer",
                    "Khmer Acoustic Chill",
                    "Phnom Penh Beats",
                  ].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setBatchArtistInput(name)}
                      className={`px-2.5 py-1 rounded-lg text-xs border transition cursor-pointer ${
                        batchArtistInput === name
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border-neutral-700/80"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 text-xs">
                <p className="text-[11px] text-neutral-400 mb-1.5 font-mono">ការបង្ហាញគំរូ (Live Preview):</p>
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {tracks[0]?.title || "ចំណងជើងបទចម្រៀង"}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-amber-400 font-bold truncate">
                    {batchArtistInput.trim() || "(មិនទាន់ដាក់ឈ្មោះ)"}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  * ឈ្មោះថ្មីនេះនឹងត្រូវរក្សាទុកចូលក្នុង Database សម្រាប់គ្រប់បទទាំងអស់។
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsBatchArtistModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleApplyBatchArtist}
                disabled={!batchArtistInput.trim()}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                អនុវត្តលើ {tracks.length} បទទាំងអស់
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Song Caption Modal */}
      {isBatchCaptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    ដាក់ Song Caption លើវីដេអូសម្រាប់គ្រប់បទ
                  </h3>
                  <p className="text-xs text-neutral-400">
                    កំណត់ Caption / Subtitle លើវីដេអូ YouTube សម្រាប់គ្រប់ {tracks.length} បទទាំងអស់
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchCaptionModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  បញ្ចូល Song Caption លើវីដេអូ (Video Caption / Subtitle):
                </label>
                <textarea
                  rows={2}
                  value={batchCaptionInput}
                  onChange={(e) => setBatchCaptionInput(e.target.value)}
                  placeholder="បញ្ចូល Song Caption (ឧ. 🌸 អារម្មណ៍ស្រស់ស្រាយជាមួយបទភ្លេងពិរោះៗ...)"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-amber-300 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition resize-none"
                  autoFocus
                />
              </div>

              {/* Quick Preset Chips */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                  គំរូ Caption ពេញនិយម (Quick Presets):
                </label>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {[
                    "🌸 អារម្មណ៍ស្រស់ស្រាយជាមួយបទភ្លេងពិរោះៗ • Enjoy the Melody 🎧",
                    "☕ ក្រេបកាហ្វេកំដរអារម្មណ៍ ជាមួយចង្វាក់ភ្លេងស្រទន់ • Peaceful Acoustic Moments 🍃",
                    "🇰🇭 តន្ត្រីមរតកខ្មែរ រណ្តំចិត្តដិតអារម្មណ៍ • Melodic Khmer Heritage 🎶",
                    "🌃 រាត្រីដ៏ស្ងប់ស្ងាត់ ជាមួយភ្លេងបាសបន្លឺឡើងយ៉ាងរណ្តំ • Night Beats & Chill ✨",
                    "🌧️ ស្តាប់ភ្លេងពេលភ្លៀងធ្លាក់ បំភ្លេចទុក្ខកង្វល់ • Rainy Day Acoustic Mood ☔",
                    "🔥 ភ្លេងរាំកម្សាន្តសប្បាយៗ ចង្វាក់ញាក់កន្ត្រាក់អារម្មណ៍ • Party Dance Beats 💃",
                  ].map((presetText) => (
                    <button
                      key={presetText}
                      type="button"
                      onClick={() => setBatchCaptionInput(presetText)}
                      className={`px-3 py-2 rounded-xl text-left text-xs border transition cursor-pointer flex items-center justify-between ${
                        batchCaptionInput === presetText
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border-neutral-700/80"
                      }`}
                    >
                      <span className="truncate">{presetText}</span>
                      {batchCaptionInput === presetText && (
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 text-xs">
                <p className="text-[11px] text-neutral-400 mb-1.5 font-mono">ការបង្ហាញគំរូលើវីដេអូ (Live Video Preview):</p>
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex flex-col items-center justify-center text-center space-y-1">
                  <span className="font-bold text-white text-xs">
                    {tracks[0]?.title || "ចំណងជើងបទចម្រៀង"}
                  </span>
                  <span className="text-[11px] text-amber-400">
                    {tracks[0]?.artist || "Khmer Artist"}
                  </span>
                  {batchCaptionInput.trim() && (
                    <div className="mt-1.5 px-3 py-1 bg-neutral-950/90 border border-amber-500/40 rounded-full text-amber-300 text-[11px] font-medium shadow-sm">
                      ❝ {batchCaptionInput.trim()} ❞
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500 mt-1.5">
                  * Caption នេះនឹងត្រូវបង្ហាញលើ Visualizer និងវីដេអូ Export សម្រាប់ YouTube។
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsBatchCaptionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleApplyBatchCaption}
                disabled={!batchCaptionInput.trim()}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                អនុវត្តលើ {tracks.length} បទទាំងអស់
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
