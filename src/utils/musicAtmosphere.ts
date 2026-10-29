import { SongTrack } from "../types";

export interface MusicAtmosphere {
  id: string;
  name: string;
  nameKhmer: string;
  icon: string;
  category: "chill" | "lofi" | "acoustic" | "energy" | "ambient" | "romantic" | "traditional";
  keywords: string[];
  suggestedThumbnailStyle: "aesthetic" | "neon" | "nature" | "acoustic" | "dark";
  description: string;
}

export const MUSIC_ATMOSPHERES: MusicAtmosphere[] = [
  {
    id: "chill",
    name: "Late Night Chill & Relaxing",
    nameKhmer: "អារម្មណ៍ស្ងប់ស្ងាត់ពេលរាត្រី (Chill & Relax)",
    icon: "☕",
    category: "chill",
    keywords: ["chill", "relax", "relaxing", "calm", "coffee", "peaceful", "ស្ងប់ស្ងាត់", "ស្រទន់", "សំរាក", "សម្រាក", "កំដរ"],
    suggestedThumbnailStyle: "aesthetic",
    description: "Perfect for deep work, study, reading, and unwinding after a long day.",
  },
  {
    id: "lofi",
    name: "Lo-Fi Hip Hop & Study Beats",
    nameKhmer: "ចង្វាក់ភ្លេងរៀនសូត្រ Lo-Fi Beats",
    icon: "🎧",
    category: "lofi",
    keywords: ["lofi", "lo-fi", "study", "beats", "beat", "hip hop", "chillhop", "homework", "បាស", "ចង្វាក់"],
    suggestedThumbnailStyle: "aesthetic",
    description: "Nostalgic vinyl crackles, mellow electric piano, and head-nodding lo-fi drums.",
  },
  {
    id: "rain",
    name: "Rainy Day & Nostalgic Mood",
    nameKhmer: "កំដរថ្ងៃភ្លៀងធ្លាក់ និងអនុស្សាវរីយ៍ (Rainy Mood)",
    icon: "🌧️",
    category: "chill",
    keywords: ["rain", "rainy", "storm", "window", "nostalgic", "sad", "ភ្លៀង", "រលឹម", "ស្រណោះ", "ចងចាំ", "អនុស្សាវរីយ៍", "ទឹកភ្នែក", "ទឹកភ្លៀង"],
    suggestedThumbnailStyle: "nature",
    description: "Melancholic melodies paired with gentle rainfall sounds to reset your heart.",
  },
  {
    id: "acoustic",
    name: "Acoustic Guitar & Warm Vibes",
    nameKhmer: "សំនៀងហ្គីតា Acoustic កក់ក្តៅ",
    icon: "🎸",
    category: "acoustic",
    keywords: ["acoustic", "guitar", "unplugged", "warm", "strings", "folk", "ហ្គីតា", "អគូស្ទីក", "ខ្សែ", "កក់ក្តៅ", "ស្រទន់"],
    suggestedThumbnailStyle: "acoustic",
    description: "Pure acoustic strings, fingerstyle harmonics, and organic rustic warmth.",
  },
  {
    id: "sleep",
    name: "Deep Sleep & Meditation",
    nameKhmer: "បំពេដំណេកលង់លក់ និងសមាធិ (Deep Sleep)",
    icon: "🌙",
    category: "ambient",
    keywords: ["sleep", "deep sleep", "bedtime", "meditation", "zen", "dream", "night", "moon", "star", "គេង", "ដំណេក", "លក់", "សមាធិ", "យប់"],
    suggestedThumbnailStyle: "dark",
    description: "Delta waves, soft drone pads, and ethereal soundscapes for tranquil sleep.",
  },
  {
    id: "drive",
    name: "Late Night Drive & Synthwave",
    nameKhmer: "បើកបរពេលយប់ និងភ្លើងពណ៌ (Night Drive)",
    icon: "🚗",
    category: "energy",
    keywords: ["drive", "highway", "night drive", "synthwave", "city", "retro", "neon", "speed", "ក្រុង", "ភ្លើងពណ៌", "ឡាន", "ផ្លូវ", "ភ្នំពេញ"],
    suggestedThumbnailStyle: "neon",
    description: "Driving down glowing neon city freeways with 80s analog synthesizers.",
  },
  {
    id: "party",
    name: "Nonstop Summer Hits / Remix",
    nameKhmer: "ចង្វាក់រាំញាក់ Nonstop Remix & Dance",
    icon: "🔥",
    category: "energy",
    keywords: ["party", "remix", "dance", "club", "summer", "edm", "upbeat", "nonstop", "hits", "ញាក់", "រាំ", "សប្បាយ", "កន្ត្រាក់", "មហោស្រព"],
    suggestedThumbnailStyle: "neon",
    description: "High-energy festival beats, infectious dance drops, and summer club grooves.",
  },
  {
    id: "romantic",
    name: "Romantic Love & Sweet Ballad",
    nameKhmer: "មនោសញ្ចេតនាស្នេហាផ្អែមល្ហែម (Romantic Ballad)",
    icon: "💖",
    category: "romantic",
    keywords: ["love", "romantic", "sweet", "ballad", "heart", "couple", "kiss", "ស្នេហ៍", "ស្រឡាញ់", "បេះដូង", "គូស្នេហ៍", "សង្សារ", "ផ្អែមល្ហែម", "មនោសញ្ចេតនា", "មេត្រី"],
    suggestedThumbnailStyle: "aesthetic",
    description: "Sweet love songs and heartfelt slow ballads for couples and romantics.",
  },
  {
    id: "cafe",
    name: "Cozy Morning Cafe & Chill Jazz",
    nameKhmer: "ហាងកាហ្វេពេលព្រឹក និងចង្វាក់ Jazz ស្រាលៗ",
    icon: "🥐",
    category: "chill",
    keywords: ["cafe", "coffee", "morning", "jazz", "bistro", "bakery", "latte", "espresso", "កាហ្វេ", "ព្រឹក", "ក្រេបកាហ្វេ", "ហាងកាហ្វេ"],
    suggestedThumbnailStyle: "acoustic",
    description: "Warm espresso aroma, smooth saxophone notes, and relaxing Parisian cafe jazz.",
  },
  {
    id: "sunset",
    name: "Golden Hour & Sunset Vibes",
    nameKhmer: "ថ្ងៃលិចពេលរសៀល Golden Hour Sunset",
    icon: "🌅",
    category: "ambient",
    keywords: ["sunset", "golden hour", "twilight", "dusk", "horizon", "sunshine", "ព្រលប់", "រសៀល", "ថ្ងៃលិច", "ល្ងាច", "មេឃ"],
    suggestedThumbnailStyle: "nature",
    description: "Dreamy golden hour pads and serene melodies as the sun sets over the ocean.",
  },
  {
    id: "piano",
    name: "Soft Emotional Piano & Calm Melody",
    nameKhmer: "សំនៀងព្យាណូបង្កប់មនោសញ្ចេតនា (Soft Piano)",
    icon: "🎹",
    category: "acoustic",
    keywords: ["piano", "keys", "instrumental", "classical", "emotional", "melody", "ព្យាណូ", "សំនៀង", "តន្ត្រី", "ភ្លេងសុទ្ធ"],
    suggestedThumbnailStyle: "aesthetic",
    description: "Expressive solo grand piano notes touching the deepest parts of your soul.",
  },
  {
    id: "khmer_acoustic",
    name: "Khmer Acoustic & Sweet Memories",
    nameKhmer: "ចម្រៀងខ្មែរ Acoustic និងអនុស្សាវរីយ៍ចាស់ៗ",
    icon: "🇰🇭",
    category: "traditional",
    keywords: ["ខ្មែរ", "ភ្លេងការ", "បុរាណ", "មរតក", "ស៊ីសាមុត", "ស៊ិន ស៊ីសាមុត", "សុវត្ថិ", "សេរីសុទ្ធា", "ព្រាប សុវត្ថិ", "សៀមរាប", "រំដួល", "ដងស្ទឹង", "khmer", "cambodia", "traditional", "romdoul"],
    suggestedThumbnailStyle: "acoustic",
    description: "Classic Khmer melodies reimagined with gentle acoustic guitars and ambient textures.",
  },
  {
    id: "rnb",
    name: "Smooth R&B & Midnight Soul",
    nameKhmer: "ចង្វាក់ R&B និង Midnight Soul ពិរោះរណ្តំ",
    icon: "🎙️",
    category: "lofi",
    keywords: ["rnb", "r&b", "soul", "groove", "vocal", "smooth", "midnight soul", "រណ្តំ", "ស្រទន់"],
    suggestedThumbnailStyle: "dark",
    description: "Buttery smooth vocals, 808 bass slides, and soulful midnight vibes.",
  },
  {
    id: "ambient",
    name: "Ambient Space & Dreamy Drift",
    nameKhmer: "លំហអាកាស និងអារម្មណ៍អណ្តែតអណ្តូង (Ambient)",
    icon: "✨",
    category: "ambient",
    keywords: ["ambient", "space", "drift", "ethereal", "floating", "galaxy", "cosmic", "អណ្តែត", "លំហ", "ស្ងប់ស្ងាត់"],
    suggestedThumbnailStyle: "dark",
    description: "Weightless atmospheric drones and celestial sound design for deep focus.",
  },
];

/**
 * Intelligent algorithm to randomize or detect the best Atmosphere/Genre
 * matching the user's provided songs (tracks or current track).
 */
export function randomizeMoodFromTracks(
  tracks: SongTrack[],
  currentMoodId?: string
): { moodId: string; matchedReason: string; atmosphere: MusicAtmosphere } {
  const trackList = tracks && tracks.length > 0 ? tracks : [];

  // 1. Gather all text tokens from track titles, artists, captions, albums
  const combinedText = trackList
    .map((t) => `${t.title || ""} ${t.artist || ""} ${t.caption || ""} ${t.album || ""}`)
    .join(" ")
    .toLowerCase();

  // 2. Score each atmosphere based on keyword matches
  const scoredAtmospheres = MUSIC_ATMOSPHERES.map((atm) => {
    let score = 0;
    let matchingKeyword = "";

    for (const kw of atm.keywords) {
      const lowerKw = kw.toLowerCase();
      if (combinedText.includes(lowerKw)) {
        score += lowerKw.length >= 4 ? 3 : 1;
        if (!matchingKeyword) matchingKeyword = kw;
      }
    }

    return {
      atm,
      score,
      matchingKeyword,
    };
  });

  // Filter atmospheres that had matching keywords
  const matchedList = scoredAtmospheres.filter((item) => item.score > 0);

  // If there are matches, randomize among the matching candidates
  if (matchedList.length > 0) {
    // Sort descending by score
    matchedList.sort((a, b) => b.score - a.score);

    // Take top candidate or candidates with good scores
    const topScore = matchedList[0].score;
    const topCandidates = matchedList.filter((m) => m.score >= Math.max(1, topScore - 3));

    // Exclude currentMoodId if possible so randomizing gives a fresh choice
    const viableCandidates =
      topCandidates.length > 1
        ? topCandidates.filter((c) => c.atm.id !== currentMoodId)
        : topCandidates;

    const chosen = viableCandidates[Math.floor(Math.random() * viableCandidates.length)];

    return {
      moodId: chosen.atm.id,
      matchedReason: `ស័ក្តិសមតាមចំណងជើង/ពាក្យគន្លឹះ "${chosen.matchingKeyword}" ក្នុងបទចម្រៀង`,
      atmosphere: chosen.atm,
    };
  }

  // 3. If no specific keywords match, pick randomly from the rich atmospheres (excluding current to ensure fresh roll)
  const available =
    currentMoodId && MUSIC_ATMOSPHERES.length > 1
      ? MUSIC_ATMOSPHERES.filter((a) => a.id !== currentMoodId)
      : MUSIC_ATMOSPHERES;

  const chosenAtm = available[Math.floor(Math.random() * available.length)];

  return {
    moodId: chosenAtm.id,
    matchedReason: `ចៃដន្យស្របតាម ${trackList.length > 0 ? trackList.length + " បទចម្រៀង" : "បញ្ជីបទ"}`,
    atmosphere: chosenAtm,
  };
}
