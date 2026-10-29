import { SongTrack } from "../types";

const DB_NAME = "KhmerStudioMusicDB";
const DB_VERSION = 1;
const STORE_NAME = "songs";
const SETTINGS_STORE = "settings";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === "undefined" || typeof indexedDB === "undefined") {
        return reject(new Error("IndexedDB is not supported in this environment"));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
    } catch (e) {
      reject(e);
    }
  });
}

export async function saveSongToDb(song: SongTrack): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      
      // Store song with blob or url
      const record = {
        ...song,
        // If fileBlob exists, keep it
        fileBlob: song.fileBlob,
      };
      
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to save song to IndexedDB:", err);
  }
}

export async function getAllSongsFromDb(): Promise<SongTrack[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records: SongTrack[] = req.result || [];
        // Re-create Object URLs for blobs if needed
        const hydrated = records.map((record) => {
          if (record.fileBlob && (!record.audioUrl || record.audioUrl.startsWith("blob:"))) {
            try {
              record.audioUrl = URL.createObjectURL(record.fileBlob);
            } catch (e) {
              // ignore
            }
          }
          return record;
        });
        resolve(hydrated);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to load songs from IndexedDB:", err);
    return [];
  }
}

export async function deleteSongFromDb(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to delete song from IndexedDB:", err);
  }
}

export async function clearAllSongsFromDb(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to clear songs from IndexedDB:", err);
  }
}

// Clean and extract title & artist from filename
export function parseAudioFilename(fileName: string): { title: string; artist: string } {
  // Strip extension
  let cleanName = fileName.replace(/\.(mp3|wav|m4a|ogg|aac|flac)$/i, "");
  
  // Remove common YouTube tags / bitrate brackets
  cleanName = cleanName
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/official\s*(music\s*)?video/gi, "")
    .replace(/official\s*mv/gi, "")
    .replace(/official\s*audio/gi, "")
    .replace(/lyric\s*video/gi, "")
    .replace(/128kbps|320kbps|hd|4k/gi, "")
    .trim();

  // Replace underscores or multiple dashes
  cleanName = cleanName.replace(/_/g, " ").replace(/\s+/g, " ");

  // Check if there is a separator like " - " or " _ "
  if (cleanName.includes(" - ")) {
    const parts = cleanName.split(" - ");
    const artist = parts[0]?.trim() || "Khmer Singer";
    const title = parts.slice(1).join(" - ").trim() || "ចម្រៀងពិរោះៗ";
    return { title, artist };
  } else if (cleanName.includes("-")) {
    const parts = cleanName.split("-");
    const artist = parts[0]?.trim() || "Khmer Singer";
    const title = parts.slice(1).join("-").trim() || "ចម្រៀងពិរោះៗ";
    return { title, artist };
  }

  return {
    title: cleanName || "បទចម្រៀងពិរោះៗ",
    artist: "Khmer Artist",
  };
}

// Format duration in mm:ss
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Format file size
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

// Extract duration of an audio blob or file
export function getAudioDuration(file: Blob | File | string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      const url = typeof file === "string" ? file : URL.createObjectURL(file);
      audio.src = url;
      audio.addEventListener("loadedmetadata", () => {
        const dur = audio.duration;
        if (typeof file !== "string") {
          URL.revokeObjectURL(url);
        }
        resolve(dur && isFinite(dur) ? dur : 180);
      });
      audio.addEventListener("error", () => {
        resolve(180);
      });
    } catch {
      resolve(180);
    }
  });
}
