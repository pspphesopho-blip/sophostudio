import { LyricLine } from "../types";

/**
 * Parses an LRC string format into structured LyricLine objects.
 * Format examples:
 *   [00:12.50] ឱ! ដងស្ទឹងសៀមរាប
 *   [01:05.20] ស្តាប់ទឹកហូររណ្តំ...
 */
export function parseLRC(lrcText: string): LyricLine[] {
  if (!lrcText || !lrcText.trim()) return [];

  const lines = lrcText.split(/\r?\n/);
  const parsed: LyricLine[] = [];
  // Regex to match [mm:ss.xx] or [mm:ss] or [m:ss.x]
  const timeRegex = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check if line contains timestamp(s)
    let match: RegExpExecArray | null;
    timeRegex.lastIndex = 0;
    const timestamps: number[] = [];

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      let ms = 0;
      if (match[3]) {
        const msStr = match[3].padEnd(3, "0").substring(0, 3);
        ms = parseInt(msStr, 10);
      }
      const totalSeconds = min * 60 + sec + ms / 1000;
      timestamps.push(totalSeconds);
    }

    // Extract lyric text after removing all timestamp tags
    const text = trimmed.replace(timeRegex, "").trim();

    if (timestamps.length > 0) {
      for (const t of timestamps) {
        if (text) {
          parsed.push({ time: t, text });
        }
      }
    }
  }

  // Sort ascending by timestamp
  parsed.sort((a, b) => a.time - b.time);
  return parsed;
}

/**
 * Converts LyricLine array back to clean LRC format string.
 */
export function formatToLRC(lines: LyricLine[]): string {
  return lines
    .map((line) => {
      const min = Math.floor(line.time / 60);
      const sec = Math.floor(line.time % 60);
      const ms = Math.floor((line.time % 1) * 100);
      const mm = min.toString().padStart(2, "0");
      const ss = sec.toString().padStart(2, "0");
      const xx = ms.toString().padStart(2, "0");
      return `[${mm}:${ss}.${xx}] ${line.text}`;
    })
    .join("\n");
}

/**
 * If user supplies plain text lines without timestamps,
 * automatically distribute them evenly across the song duration.
 */
export function autoDistributeLyrics(plainText: string, durationSeconds: number): LyricLine[] {
  const lines = plainText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  if (lines.length === 0) return [];

  // Leave intro padding and outro padding
  const startSec = Math.min(3, durationSeconds * 0.05);
  const endSec = Math.max(startSec + 5, durationSeconds - 3);
  const availableSpan = endSec - startSec;
  const interval = availableSpan / lines.length;

  return lines.map((text, idx) => ({
    time: Math.round((startSec + idx * interval) * 10) / 10,
    text,
  }));
}

export interface ActiveLyricInfo {
  currentLine: LyricLine | null;
  nextLine: LyricLine | null;
  prevLine: LyricLine | null;
  index: number;
  /** Progress within current line (0 to 1) for karaoke sweep / highlight */
  progress: number;
}

/**
 * Finds the currently active lyric, upcoming lyric, and progress
 * given the current playback time.
 */
export function getActiveLyric(
  lyrics: LyricLine[] | undefined,
  currentTime: number,
  fallbackDuration?: number
): ActiveLyricInfo {
  if (!lyrics || lyrics.length === 0) {
    return {
      currentLine: null,
      nextLine: null,
      prevLine: null,
      index: -1,
      progress: 0,
    };
  }

  // If before first lyric
  if (currentTime < lyrics[0].time) {
    return {
      currentLine: null,
      nextLine: lyrics[0],
      prevLine: null,
      index: -1,
      progress: 0,
    };
  }

  let activeIdx = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIdx = i;
    } else {
      break;
    }
  }

  if (activeIdx === -1) {
    return {
      currentLine: null,
      nextLine: lyrics[0],
      prevLine: null,
      index: -1,
      progress: 0,
    };
  }

  const currentLine = lyrics[activeIdx];
  const nextLine = activeIdx + 1 < lyrics.length ? lyrics[activeIdx + 1] : null;
  const prevLine = activeIdx > 0 ? lyrics[activeIdx - 1] : null;

  // Calculate progress within current line
  let lineDuration = 5; // default fallback 5 seconds
  if (nextLine) {
    lineDuration = Math.max(1, nextLine.time - currentLine.time);
  } else if (fallbackDuration && fallbackDuration > currentLine.time) {
    lineDuration = Math.max(2, fallbackDuration - currentLine.time);
  }

  const elapsed = currentTime - currentLine.time;
  const progress = Math.min(1, Math.max(0, elapsed / lineDuration));

  return {
    currentLine,
    nextLine,
    prevLine,
    index: activeIdx,
    progress,
  };
}

/**
 * Built-in Khmer Lyric Presets with exact timestamps
 */
export const KHMER_LYRIC_PRESETS: { [key: string]: string } = {
  traditional: `[00:02.00] 🎵 ~ ភ្លេងកំដរអារម្មណ៍ ចាប់ផ្តើម ~ 🎵
[00:06.00] ឱ! ទឹកដីអង្គរ ទឹកដីបុព្វបុរសខ្មែរ
[00:12.00] រំដួលដងស្ទឹងសៀមរាប រីកស្រស់បំព្រង
[00:18.00] ស្រង់ក្លិនពិដោរ ក្រអូបឈ្ងុយឈ្ងប់ដួងចិត្ត
[00:24.00] បក្សាបក្សីយំឆ្លើយឆ្លង លើមែកព្រឹក្សា
[00:30.00] សម្លេងទ្រ និងពិណពាទ្យ រណ្តំចិត្ត
[00:36.00] មរតកដូនតា ចារឹកជាប់ក្នុងក្រអៅបេះដូង
[00:42.00] ស្រឡាញ់ទឹកដីខ្មែរ រក្សាវប្បធម៌រុងរឿង
[00:48.00] 🌸 ~ ចប់វគ្គចម្រៀងពិរោះរណ្តំ ~ 🌸`,

  chill: `[00:02.00] ☕ ~ កាហ្វេក្តៅៗ កំដរព្រឹកស្ងប់ស្ងាត់ ~ ☕
[00:06.50] តំណក់ទឹកភ្លៀង ធ្លាក់ស្រោចលើស្លឹកឈើ
[00:12.00] ចំហាយកាហ្វេឈ្ងុយ រសាត់តាមខ្យល់ត្រជាក់
[00:18.00] ស្តាប់សម្លេងហ្គីតា បន្លឺឡើងយ៉ាងស្រទន់
[00:24.50] បំភ្លេចទុក្ខកង្វល់ ក្នុងចិត្តឲ្យរលាយសាបសូន្យ
[00:31.00] ក្រេបកាហ្វេមួយកែវ ជាមួយអារម្មណ៍ស្រស់ស្រាយ
[00:38.00] ថ្ងៃថ្មីចាប់ផ្តើម ជាមួយក្តីសង្ឃឹម និងស្នាមញញឹម
[00:45.00] 🍃 ~ រីករាយជាមួយថ្ងៃថ្មីដ៏ស្រស់បំព្រង ~ 🍃`,

  ambient: `[00:02.00] 🌃 ~ រាត្រីរាជធានីភ្នំពេញ ក្រោមពន្លឺភ្លើងពណ៌ ~ 🌃
[00:06.00] ភ្លើងពណ៌ចម្រុះ ភ្លឺផ្លេកតាមដងវិថី
[00:12.00] ខ្យល់បក់រំភើយ តាមដងទន្លេចតុមុខ
[00:18.00] ចង្វាក់ភ្លេងបាស លាន់ឮយ៉ាងរណ្តំដួងចិត្ត
[00:24.00] យប់កាន់តែជ្រៅ អារម្មណ៍កាន់តែស្ងប់
[00:30.00] រាត្រីដ៏រស់រវើក នៃទីក្រុងគុជអាស៊ី
[00:36.00] គេងលក់ស្រួលណា រង់ចាំថ្ងៃរះថ្មី
[00:43.00] ✨ ~ រាត្រីសួស្តី គេងលក់សុបិនល្អ ~ ✨`,
};

/**
 * Standard English Lyric Presets for Western/English songs
 */
export const ENGLISH_LYRIC_PRESETS: { [key: string]: string } = {
  acoustic: `[00:03.00] 🎵 ~ Gentle acoustic guitar introduction ~ 🎵
[00:07.50] Walking through the quiet morning light
[00:13.00] Golden rays are shining warm and bright
[00:19.00] Listening to the breeze across the sea
[00:25.50] Soft vibrations set my spirit free
[00:32.00] Every chord reminds me of your smile
[00:38.50] Let us pause and wander for a while
[00:45.00] Lost inside the rhythm of this song
[00:51.50] Knowing this is where our hearts belong
[00:58.00] ☕ ~ Peaceful acoustic vibes ~ ☕`,

  chill: `[00:03.00] 🎧 ~ Smooth lo-fi chill beats playing ~ 🎧
[00:08.00] City lights reflect upon the glass
[00:14.00] Watching rainy clouds slowly pass
[00:20.50] Sip the coffee, leave the stress behind
[00:27.00] Finding peace of mind that's hard to find
[00:33.50] Basslines pulsing gently through the air
[00:40.00] Pure tranquility without a care
[00:46.50] Close your eyes and drift into the groove
[00:53.00] Let the midnight music make you move
[01:00.00] ✨ ~ Relax and enjoy the sound ~ ✨`,
};

/**
 * Detects whether text contains Khmer characters.
 */
export function isKhmerText(text?: string | null): boolean {
  if (!text) return false;
  return /[\u1780-\u17FF\u19E0-\u19FF]/.test(text);
}

/**
 * Generates appropriate synchronized lyrics (Khmer or English) based on track language.
 */
export function getDefaultLyricsForTrack(
  title?: string,
  artist?: string,
  durationSeconds: number = 180
): { lrc: string; parsed: LyricLine[]; lines: string[] } {
  const isKm = isKhmerText((title || "") + " " + (artist || ""));
  const cleanTitle = (title || (isKm ? "បទចម្រៀងពិរោះៗ" : "Melodic Song")).trim();
  const cleanArtist = (artist || (isKm ? "តារាចម្រៀងខ្មែរ" : "Singer")).trim();
  const dur = durationSeconds > 10 ? durationSeconds : 180;

  const rawLines = isKm
    ? [
        `🎶 ចាប់ផ្តើមបទ "${cleanTitle}" • ${cleanArtist} 🎶`,
        "ខ្យល់រាត្រីបក់រំភើយ នាំក្តីស្រណោះរណ្តំចិត្ត",
        "សំនៀងតន្ត្រីស្រទន់ បំពេអារម្មណ៍ស្ងប់ស្ងាត់",
        "ផ្កាយរះព្រោងព្រាត ភ្លឺថ្លាលើមេឃាក្រឡែត",
        "ចងចាំគ្រាកន្លង ធ្លាប់មានរូបអូនក្បែរកាយ",
        "ទោះពេលវេលាកន្លងឆ្ងាយ ស្នេហ៍នៅដក់ជាប់ឱរា",
        "ស្នាមញញឹមស្រស់បំព្រង មិនដែលរសាត់ពីចិន្តា",
        "ភ្លេងរងំរំលឹកអនុស្សាវរីយ៍ដ៏កក់ក្តៅ",
        "សូមឲ្យរាត្រីនេះ នាំក្តីសុខមកកាន់អ្នកស្តាប់",
        `✨ បញ្ចប់បទ "${cleanTitle}" ដោយក្តីរីករាយ ✨`,
      ]
    : [
        `🎶 Now Playing: "${cleanTitle}" • ${cleanArtist} 🎶`,
        "Walking down the quiet city streets tonight",
        "Stars are shining bright into the open sky",
        "I hear the melody whispering through the wind",
        "Holding on to memories we left behind",
        "Every single heartbeat reminds me of your smile",
        "Time is moving fast but love will never fade",
        "Lost inside the rhythm of this gentle song",
        "Close your eyes and let the music take you home",
        `✨ Hope you enjoyed "${cleanTitle}" • Thank you ✨`,
      ];

  const introSec = 3.0;
  const outroSec = Math.max(introSec + 15, dur - 6);
  const interval = (outroSec - introSec) / rawLines.length;

  const parsed: LyricLine[] = rawLines.map((text, idx) => ({
    time: Math.round((introSec + idx * interval) * 10) / 10,
    text,
  }));

  const lrc = parsed
    .map((l) => {
      const min = Math.floor(l.time / 60);
      const sec = Math.floor(l.time % 60);
      const ms = Math.floor((l.time % 1) * 100);
      const mm = min.toString().padStart(2, "0");
      const ss = sec.toString().padStart(2, "0");
      const xx = ms.toString().padStart(2, "0");
      return `[${mm}:${ss}.${xx}] ${l.text}`;
    })
    .join("\n");

  return { lrc, parsed, lines: rawLines };
}
