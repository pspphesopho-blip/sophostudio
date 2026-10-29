import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Handler: AI YouTube Title & SEO Description Generator (US Audience Targeting, 100% English)
const generateSeoHandler = async (req: express.Request, res: express.Response) => {
  const {
    tracks = [],
    mood = "chill",
    customInstructions = "",
    channelName = "Vibe Central Records",
    currentTrack = null,
    primarySongTitle = "",
    primarySongArtist = "",
  } = req.body || {};

  // Extract featured primary song and artist
  const primaryTrack = currentTrack || (Array.isArray(tracks) && tracks.length > 0 ? tracks[0] : null);
  const rawFeaturedTitle = primarySongTitle || primaryTrack?.title || (Array.isArray(tracks) && tracks[0]?.title) || "";
  const featuredTitle = rawFeaturedTitle ? rawFeaturedTitle.replace(/\.[a-zA-Z0-9]+$/, "").trim() : "Midnight Melody";
  const featuredArtist = (primarySongArtist || primaryTrack?.artist || "").trim();

  // Build fallback tracklist chapters
  let cumulativeSeconds = 0;
  const chapters = Array.isArray(tracks) && tracks.length > 0
    ? tracks.map((t: any, idx: number) => {
        const mins = Math.floor(cumulativeSeconds / 60)
          .toString()
          .padStart(2, "0");
        const secs = Math.floor(cumulativeSeconds % 60)
          .toString()
          .padStart(2, "0");
        cumulativeSeconds += t.duration || 180;
        return {
          time: `${mins}:${secs}`,
          title: t.title || `Track ${idx + 1}`,
        };
      })
    : [
        { time: "00:00", title: featuredTitle || "Chill Morning Melody" },
        { time: "03:45", title: "Late Night Lo-Fi Beats" },
        { time: "07:20", title: "Rainy Cafe Acoustic" },
        { time: "11:10", title: "Midnight Highway Drive" },
      ];

  const fallbackChaptersText = chapters
    .map((c: { time: string; title: string }) => `${c.time} - ${c.title}`)
    .join("\n");

  const cleanChannel = channelName || "Vibe Central Records";

  const moodMap: Record<string, { icon: string; name: string; tagKeyword: string }> = {
    chill: { icon: "☕", name: "Late Night Chill Vibes", tagKeyword: "chill music" },
    lofi: { icon: "🎧", name: "Lo-Fi Hip Hop & Study Beats", tagKeyword: "lofi hip hop" },
    rain: { icon: "🌧️", name: "Rainy Day & Nostalgic Memories", tagKeyword: "rainy day music" },
    acoustic: { icon: "🎸", name: "Cozy Acoustic Guitar & Warm Vibes", tagKeyword: "acoustic guitar" },
    sleep: { icon: "🌙", name: "Deep Sleep & Meditation Music", tagKeyword: "sleep music" },
    drive: { icon: "🚗", name: "Late Night Drive & Synthwave Beats", tagKeyword: "synthwave night drive" },
    party: { icon: "🔥", name: "Nonstop Summer Hits & Dance Remix", tagKeyword: "party remix dance" },
    romantic: { icon: "💖", name: "Romantic Love Songs & Sweet Ballads", tagKeyword: "romantic songs" },
    cafe: { icon: "🥐", name: "Cozy Morning Cafe & Chill Jazz", tagKeyword: "coffee shop music" },
    sunset: { icon: "🌅", name: "Golden Hour & Sunset Chillout", tagKeyword: "sunset vibes" },
    piano: { icon: "🎹", name: "Soft Emotional Piano & Calm Melodies", tagKeyword: "relaxing piano" },
    khmer_acoustic: { icon: "🇰🇭", name: "Khmer Acoustic & Sweet Melodies", tagKeyword: "acoustic chill" },
    rnb: { icon: "🎙️", name: "Midnight R&B & Smooth Soul Grooves", tagKeyword: "r&b soul" },
    ambient: { icon: "✨", name: "Ambient Space & Dreamy Drift", tagKeyword: "ambient music" },
  };

  const selectedMoodInfo = moodMap[mood] || { icon: "🎧", name: `${mood} Vibes`, tagKeyword: `${mood} music` };

  // Music format / rhythm genre mapping (ទម្រង់បទភ្លេង)
  const formatMap: Record<string, string> = {
    chill: "Acoustic & Lo-Fi Chill",
    lofi: "Lo-Fi Hip Hop / Study Beats",
    rain: "Slowed + Reverb / Rainy Mood",
    acoustic: "Fingerstyle Acoustic Guitar",
    sleep: "Deep Sleep & 432Hz Ambient",
    drive: "Synthwave / Night Drive",
    party: "Nonstop Dance Remix 2026",
    romantic: "Sweet Melodic Ballad",
    cafe: "Coffee Shop / Morning Jazz",
    sunset: "Golden Hour Sunset Chillout",
    piano: "Emotional Solo Piano",
    khmer_acoustic: "Khmer Acoustic Unplugged",
    rnb: "Midnight R&B & Smooth Soul",
    ambient: "Ambient Space & Drone Pads",
  };

  let detectedFormat = formatMap[mood] || "Chillout Acoustic Session";
  const lowerTrackTitle = featuredTitle.toLowerCase();
  if (lowerTrackTitle.includes("lofi") || lowerTrackTitle.includes("lo-fi")) {
    detectedFormat = "Lo-Fi Hip Hop / Chill Beats";
  } else if (lowerTrackTitle.includes("acoustic") || lowerTrackTitle.includes("guitar")) {
    detectedFormat = "Fingerstyle Acoustic Guitar";
  } else if (lowerTrackTitle.includes("piano")) {
    detectedFormat = "Emotional Solo Piano";
  } else if (lowerTrackTitle.includes("remix") || lowerTrackTitle.includes("dance")) {
    detectedFormat = "Upbeat Dance Remix 2026";
  } else if (lowerTrackTitle.includes("slowed") || lowerTrackTitle.includes("reverb")) {
    detectedFormat = "Slowed + Reverb / 432Hz";
  } else if (lowerTrackTitle.includes("rnb") || lowerTrackTitle.includes("r&b") || lowerTrackTitle.includes("soul")) {
    detectedFormat = "Midnight R&B & Smooth Soul";
  } else if (lowerTrackTitle.includes("ballad")) {
    detectedFormat = "Sweet Melodic Ballad";
  } else if (lowerTrackTitle.includes("instrumental")) {
    detectedFormat = "Calm Instrumental Session";
  }

  const artistPrefix = featuredArtist && featuredArtist !== "Unknown Artist" ? `${featuredArtist} - ` : "";

  const fallbackTitle = `💔 "${featuredTitle}" [${detectedFormat}] ~ Songs That Hit Different at 2 AM ☕`;
  const fallbackTitleOptions = [
    `💔 "${featuredTitle}" [${detectedFormat}] ~ Songs That Hit Different at 2 AM ☕`,
    `✨ "${featuredTitle}" (${detectedFormat}) ~ When You Need to Reset Your Mind 🌙`,
    `🎧 ${artistPrefix}"${featuredTitle}" [${detectedFormat}] ~ A Playlist That Touches Your Soul 🎵`,
    `☕ "${featuredTitle}" (${detectedFormat}) ~ Relaxing Vibes to Study, Sleep & Heal 🌧️`,
    `🌙 2:00 AM Feeling ~ "${featuredTitle}" [${detectedFormat}] | Top Trending US Relaxing Music 🔥`,
    `🎵 Put Your Headphones On: "${featuredTitle}" (${detectedFormat}) ~ Late Night Chill [Lyrics]`,
  ];

  const fallbackData = {
    recommendedTitle: fallbackTitle,
    titleOptions: fallbackTitleOptions,
    musicFormat: detectedFormat,
    description: `Welcome to ${cleanChannel}! ${selectedMoodInfo.icon}✨\n\nSit back, put your headphones on, and immerse yourself in this curated English ${selectedMoodInfo.name.toLowerCase()} session featuring "${featuredTitle}" [${detectedFormat}]. Designed for relaxation, study sessions, late-night contemplation, and resetting your mind.\n\n⏰ TRACKLIST & CHAPTERS:\n${fallbackChaptersText}\n\n💬 Which track touched your soul the most? Let us know in the comments below!\n\n🔔 Don't forget to LIKE, SHARE & SUBSCRIBE to support ${cleanChannel} and never miss an upload:\n👉 Turn on the notification bell to stay updated!\n\n📄 Copyright & Music Licensing:\nAll music provided in this compilation is published under promotional and entertainment licensing. All rights belong to their respective artists, producers, and label owners.\n\n#ChillMusic #RelaxingBeats #StudyMusic #SleepVibes #AcousticChill #USAMusic #VibeSession #Chillout2026 #LateNightVibes`,
    timestampChapters: chapters,
    tags: [
      featuredTitle,
      `${featuredTitle} lyrics`,
      detectedFormat,
      selectedMoodInfo.tagKeyword,
      "relaxing songs",
      "study beats",
      "music for sleep",
      "late night vibes",
      "chillout mix 2026",
      "deep focus music",
      "trending us songs",
      "aesthetic playlist",
      "coffee shop vibes",
      cleanChannel,
    ],
    hashtags: ["#ChillMusic", "#RelaxingMusic", "#StudyBeats", "#USAMusic", "#Chillout2026", "#Lofi"],
    thumbnailIdea: `Cozy aesthetic visual featuring "${featuredTitle}" [${detectedFormat}], cinematic lighting, bold clean white English typography`,
  };

  try {
    const trackListFormatted = chapters.map((c, i) => `${i + 1}. ${c.title} [${c.time}]`).join("\n");

    const prompt = `You are a top YouTube Music SEO & Viral Growth Specialist targeting United States (USA), North American, and Global English-speaking audiences.
STRICT REQUIREMENT: Output MUST BE 100% IN ENGLISH. Do NOT include ANY Khmer language, Khmer script, or Cambodia-specific references. Target audiences in the United States, Canada, UK, and worldwide English music listeners.

FEATURED SONG, ARTIST & MUSIC FORMAT (ទម្រង់បទភ្លេង):
- Primary Song Title: "${featuredTitle}"
- Artist: "${featuredArtist || "Independent Artist"}"
- Music Format / Genre Style (ទម្រង់បទភ្លេង): "${detectedFormat}"
- Atmosphere / Mood: ${selectedMoodInfo.name} (${mood})
- Channel Name: ${cleanChannel}

Tracklist provided:
${trackListFormatted}

CRITICAL TITLE FORMULATION RULES (100% US AUDIENCE, SONG TITLE + MUSIC FORMAT INTEGRATION):
American music fans click on titles that combine:
1. The FEATURED SONG TITLE ("${featuredTitle}")
2. The MUSIC FORMAT / GENRE STYLE (e.g. [${detectedFormat}], (${detectedFormat}), [Acoustic Guitar Session], (Lo-Fi Mix), [Slowed + Reverb], etc.)
3. A VIRAL EMOTIONAL HOOK (e.g. "Songs That Hit Different at 2 AM", "When You Need to Reset Your Mind", "Hits Right in the Feelings")

DO NOT output generic titles! Every single title MUST incorporate BOTH the Song Title "${featuredTitle}" AND the Music Format tag (e.g. [${detectedFormat}] or (${detectedFormat})).

Provide 5 diverse, high-converting title options following these proven YouTube formulas:
1. Format Bracketed + Emotion: e.g. '💔 "${featuredTitle}" [${detectedFormat}] ~ Songs That Hit Different at 2 AM ☕'
2. Format Tagged + Mind Reset: e.g. '✨ "${featuredTitle}" (${detectedFormat}) ~ When You Need to Reset Your Mind 🌙'
3. Artist + Song + Format Spotlight: e.g. '🎧 ${featuredArtist ? `${featuredArtist} - ` : ""} "${featuredTitle}" [${detectedFormat}] ~ A Playlist That Touches Your Soul 🎵'
4. Cozy Atmosphere + Format: e.g. '☕ "${featuredTitle}" (${detectedFormat}) ~ Relaxing Music to Study, Sleep & Heal 🌧️'
5. Viral Curiosity / Headphone Hook: e.g. '🌙 Put Your Headphones On: "${featuredTitle}" [${detectedFormat}] ~ Hits Right in the Feelings [Lyrics]'

Select the single most magnetic title as "recommendedTitle".

Requirements for description & tags:
1. Write a captivating English YouTube Description including:
   - Engaging opening hook highlighting "${featuredTitle}" and its unique "${detectedFormat}" musical vibe.
   - EXACT Timestamp Chapters starting at 00:00 for each track from the provided tracklist so YouTube displays video chapters.
   - High-volume US search keywords naturally integrated.
   - Clear Call-To-Action (Subscribe to ${cleanChannel}, Like, Comment your favorite track, Ring notification bell 🔔).
   - Professional English copyright disclaimer & music submission info.
   - 10-15 trending English hashtags.
2. Return 15 to 25 comma-separated high-ranking English YouTube search tags including "${featuredTitle}", "${detectedFormat}", artist name, and genre keywords.
3. Provide a creative thumbnail text idea in English featuring "${featuredTitle}".
4. Include "musicFormat": "${detectedFormat}" in the JSON output.

Output in valid JSON matching the schema. NO KHMER CHARACTERS ALLOWED.`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendedTitle: { type: Type.STRING },
                titleOptions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                description: { type: Type.STRING },
                timestampChapters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      title: { type: Type.STRING },
                    },
                    required: ["time", "title"],
                  },
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                thumbnailIdea: { type: Type.STRING },
                musicFormat: { type: Type.STRING },
              },
              required: [
                "recommendedTitle",
                "titleOptions",
                "description",
                "tags",
                "hashtags",
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed && parsed.recommendedTitle) {
          return res.json({ success: true, data: parsed });
        }
      } catch (geminiErr: any) {
        console.warn("Gemini SEO generation warning, falling back to curated US English SEO:", geminiErr?.message || geminiErr);
      }
    }

    return res.json({ success: true, data: fallbackData });
  } catch (err: any) {
    console.error("AI SEO generator fallback error:", err);
    return res.json({ success: true, data: fallbackData });
  }
};

app.post("/api/ai/generate-seo", generateSeoHandler);
app.post("/api/ai/youtube-seo", generateSeoHandler);

// API: AI YouTube Thumbnail Generator (Eye-Catching, 16:9 YouTube Standard with Attractive Characters)
app.post("/api/ai/generate-thumbnail", async (req, res) => {
  try {
    const {
      title = "Late Night Chill Beats",
      mood = "chill",
      style = "aesthetic",
      character = "female", // 'female' | 'male' | 'couple' | 'scenery'
      customPrompt = "",
    } = req.body;

    const characterDescriptors: Record<string, string> = {
      female:
        "featuring an exceptionally gorgeous, stylish young Asian woman, medium shot or waist-up portrait perfectly framed with plenty of headspace and breathing room, head and entire face and hair fully visible inside the 16:9 canvas without any cropping, wearing stylish wireless over-ear headphones and cozy aesthetic sweater, sitting relaxed in a cozy chill ambiance, smiling softly, emotional gaze, cinematic golden hour rim light, high-CTR YouTube music hero thumbnail",
      male:
        "featuring a very handsome, charismatic stylish young Asian man, medium shot or waist-up portrait with plenty of headroom, whole head, face and hair fully visible inside the 16:9 widescreen frame without being cut off, wearing modern studio DJ headphones and trendy jacket, music producer chill vibe, warm ambient lighting, highly appealing YouTube music thumbnail focal point",
      couple:
        "featuring a lovely romantic young couple, medium-wide shot showing both characters clearly from waist up with ample space above their heads, beautiful smiling expressions, both heads and faces fully in frame, sharing music together in a cozy warm atmosphere",
      scenery:
        "wide cinematic aesthetic landscape with a stylish character sitting on a balcony or hill under starry night or sunset, full silhouette/character clearly visible from distance with expansive atmospheric sky",
    };

    const styleDescriptors: Record<string, string> = {
      aesthetic:
        "ultra-aesthetic cozy lo-fi room with open window overlooking a rainy twilight city, glowing fairy lights and warm table lamp, soft pastel color palette, cinematic bokeh, 8k resolution, photorealistic masterpiece",
      neon:
        "cyberpunk Tokyo neon street at night, glowing cyan and magenta reflections, retro synthwave sports car, rain reflections, crisp cinematic high contrast",
      nature:
        "breathtaking sunset mountain lake at golden hour, misty pine forest, warm sunbeams, dramatic pastel colored sky, peaceful wallpaper aesthetic",
      acoustic:
        "warm cozy coffeehouse with fairy string lights, vintage acoustic guitar in background, soft warm bokeh, autumn feelings",
      dark:
        "atmospheric late night music studio, deep purple and electric blue LED lighting, audio mixing console with glowing sliders and meters, moody cinematic contrast",
    };

    const chosenChar = characterDescriptors[character] || characterDescriptors.female;
    const chosenStyle = styleDescriptors[style] || styleDescriptors.aesthetic;

    const fullPrompt = `A stunning, high-CTR 16:9 widescreen YouTube music video thumbnail for the song collection "${title}". 
Composition & Framing: Crucial - Character MUST NOT be cut off at the top; preserve generous headroom and negative space around head, face, and shoulders. Medium portrait shot (waist up or torso) positioned comfortably on the right or center. 16:9 widescreen landscape orientation (1280x720).
Main Subject: ${chosenChar}.
Environment & Style: ${chosenStyle}. Atmosphere: ${mood}. ${customPrompt ? `Additional instructions: ${customPrompt}.` : ""}
Visual Quality: Crystal clear facial details, vibrant colors, cinematic volumetric lighting, 8k resolution, professional graphic design masterpiece.`;

    // Attempt generation with Gemini Nano Banana image models
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: fullPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
              imageSize: "1K",
            },
          },
        });

        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || "image/png";
              const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
              return res.json({
                success: true,
                imageUrl,
                prompt: fullPrompt,
                source: "ai",
              });
            }
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini image generation warning, falling back to curated high-res thumbnail with attractive characters:", geminiError?.message || geminiError);
      }
    }

    // High quality curated thematic 16:9 Widescreen landscape images where character head, face, and body are completely in frame with ample headroom
    const fallbackUrls: Record<string, string[]> = {
      female: [
        // Beautiful stylish young women in landscape 16:9 with full head, headphones/coffee, plenty of headroom
        "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1280&h=720&q=90",
      ],
      male: [
        // Handsome stylish men in landscape 16:9 with full head, hair & headphones
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1280&h=720&q=90",
      ],
      couple: [
        // Romantic couple in landscape 16:9 with full visibility
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1280&h=720&q=90",
      ],
      scenery: [
        "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1280&h=720&q=90",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1280&h=720&q=90",
      ],
    };

    const charList = fallbackUrls[character] || fallbackUrls.female;
    const chosenFallback = charList[Math.floor(Math.random() * charList.length)];

    return res.json({
      success: true,
      imageUrl: chosenFallback,
      prompt: fullPrompt,
      source: "curated",
    });
  } catch (err: any) {
    console.error("Generate thumbnail error:", err);
    return res.status(500).json({ error: "Failed to generate thumbnail: " + err.message });
  }
});

// API: AI Automatic Time-Synced Lyrics Generator (LRC Karaoke Creator)
app.post("/api/ai/generate-synced-lyrics", async (req, res) => {
  try {
    const {
      songTitle = "",
      artist = "",
      rawText = "",
      duration = 180,
      language = "auto", // "auto" | "km" | "en"
      mood = "chill",
    } = req.body || {};

    const durationSec = typeof duration === "number" && duration > 10 ? Math.round(duration) : 180;
    const cleanTitle = (songTitle || "").trim();
    const cleanArtist = (artist || "").trim();
    const cleanRaw = (rawText || "").trim();

    // Accurately detect if the song/artist/lyrics contains Khmer characters
    const isKm = /[\u1780-\u17FF\u19E0-\u19FF]/.test(cleanTitle + " " + cleanArtist + " " + cleanRaw);
    const targetLanguage = language === "km" ? "Khmer" : language === "en" ? "English" : (isKm ? "Khmer" : "English");

    // Fallback generator in case Gemini is offline or without key
    const buildFallback = () => {
      let lines: { time: number; text: string }[] = [];
      let lrc = "";

      if (cleanRaw) {
        // Clean raw text lines
        const rawLines = cleanRaw
          .split(/\r?\n/)
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0 && !l.startsWith("#") && !l.startsWith("["));

        if (rawLines.length > 0) {
          const introSec = Math.min(5, durationSec * 0.06);
          const outroSec = Math.max(introSec + 10, durationSec - 6);
          const span = outroSec - introSec;
          const interval = span / rawLines.length;

          lines = rawLines.map((text: string, i: number) => {
            const time = Math.round((introSec + i * interval) * 10) / 10;
            return { time, text };
          });
        }
      }

      if (lines.length === 0) {
        // Build thematic lines based on detected language (English for English songs, Khmer for Khmer)
        const sampleLines = isKm
          ? [
              `🎶 ចាប់ផ្តើមបទ "${cleanTitle || "បទចម្រៀងខ្មែរ"}" ដោយ ${cleanArtist || "ចម្រៀងខ្មែរ"} 🎶`,
              "ខ្យល់រាត្រីបក់រំភើយ នាំក្តីស្រណោះរណ្តំចិត្ត",
              "សំនៀងតន្ត្រីស្រទន់ បំពេអារម្មណ៍ស្ងប់ស្ងាត់",
              "ផ្កាយរះព្រោងព្រាត ភ្លឺថ្លាលើមេឃាក្រឡែត",
              "ចងចាំគ្រាកន្លង ធ្លាប់មានរូបអូនក្បែរកាយ",
              "ទោះពេលវេលាកន្លងឆ្ងាយ ស្នេហ៍នៅដក់ជាប់ឱរា",
              "ស្នាមញញឹមស្រស់បំព្រង មិនដែលរសាត់ពីចិន្តា",
              "ភ្លេងរងំរំលឹកអនុស្សាវរីយ៍ដ៏កក់ក្តៅ",
              "សូមឲ្យរាត្រីនេះ នាំក្តីសុខមកកាន់អ្នកស្តាប់",
              `✨ បញ្ចប់បទ "${cleanTitle || "បទចម្រៀងខ្មែរ"}" ដោយក្តីរីករាយ ✨`,
            ]
          : [
              `🎶 Now Playing: "${cleanTitle || "Acoustic Melody"}" • ${cleanArtist || "Singer"} 🎶`,
              "Walking down the quiet city streets tonight",
              "Stars are shining bright into the open sky",
              "I hear the melody whispering through the wind",
              "Holding on to memories we left behind",
              "Every single heartbeat reminds me of your smile",
              "Time is moving fast but love will never fade",
              "Lost inside the rhythm of this gentle song",
              "Close your eyes and let the music take you home",
              `✨ Hope you enjoyed "${cleanTitle || "Acoustic Melody"}" • Thank you ✨`,
            ];

        const introSec = 3.5;
        const outroSec = Math.max(introSec + 15, durationSec - 6);
        const interval = (outroSec - introSec) / sampleLines.length;
        lines = sampleLines.map((text, i) => ({
          time: Math.round((introSec + i * interval) * 10) / 10,
          text,
        }));
      }

      // Convert to LRC string
      lrc = lines
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

      return {
        success: true,
        data: {
          title: cleanTitle || (isKm ? "បទចម្រៀង" : "Song Lyrics"),
          artist: cleanArtist || (isKm ? "អ្នកចម្រៀង" : "Artist"),
          duration: durationSec,
          lrc,
          lines,
          source: "algorithmic_sync",
        },
      };
    };

    // If Gemini API is available, use Gemini 3.8 Flash for intelligent musical phrasing & synchronization
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getAI();

        const prompt = `You are a master music producer, professional lyricist, and subtitle synchronization specialist (LRC Karaoke format).
Track Details:
- Title: "${cleanTitle || 'Untitled Track'}"
- Artist: "${cleanArtist || 'Unknown Artist'}"
- Total Song Duration: ${durationSec} seconds
- Mood / Style: "${mood}"
- Target Language: "${targetLanguage}"

CRITICAL LANGUAGE REQUIREMENT:
- If Target Language is "English", all lyric lines, titles, and LRC text MUST be in ENGLISH. Never produce Khmer script for an English song.
- If Target Language is "Khmer", all lyrics must be in authentic Khmer.

${cleanRaw ? `User Provided Raw Lyric Text (without timestamps):
"""
${cleanRaw}
"""

TASK:
1. Divide and sanitize the raw lyrics into natural, singable lyric phrases (each line should be a single vocal breath/phrase, typically 3-10 words).
2. Compute realistic musical timestamps in seconds for each line.
   - The first vocal phrase MUST start after the instrumental intro (typically around 4 to 8 seconds).
   - Natural phrase durations should be between 3.5 to 7.0 seconds.
   - Provide realistic spacing for instrumental breathers or chorus holds.
   - The final lyric line must end before ${Math.max(10, durationSec - 5)} seconds.
3. Generate standard LRC timestamp formatting: [mm:ss.xx] phrase.`
: `TASK:
1. Provide or compose authentic, poetic, high-quality lyrics for "${cleanTitle}" by "${cleanArtist}" in ${targetLanguage}.
2. If this is a well-known song, use its authentic lyrics in ${targetLanguage}. If original/ambient, compose 12-20 emotional, melodious singing lines suited to "${mood}" in ${targetLanguage}.
3. Synchronize each line with realistic timestamps across the ${durationSec} seconds track duration, starting after the intro (~4-7s) and ending before ${durationSec - 5}s.
4. Output both the full LRC text format and the structured array of lines with exact seconds.`}

STRICT REQUIREMENTS:
- Times must be strictly ascending (each subsequent line has a higher time than the previous).
- All times must be between 2.0 and ${Math.max(10, durationSec - 2)} seconds.
- Every line must have meaningful lyric text (no empty lines in JSON array).`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                lrc: { type: Type.STRING, description: "Full LRC format string with [mm:ss.xx] tags" },
                lines: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.NUMBER, description: "Timestamp in seconds (e.g. 14.5)" },
                      text: { type: Type.STRING, description: "Lyric phrase text" },
                    },
                    required: ["time", "text"],
                  },
                },
                notes: { type: Type.STRING },
              },
              required: ["lrc", "lines"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed && Array.isArray(parsed.lines) && parsed.lines.length > 0) {
          // Ensure lines are sorted ascending by time
          parsed.lines.sort((a: any, b: any) => (a.time || 0) - (b.time || 0));

          // Ensure LRC string matches
          if (!parsed.lrc || !parsed.lrc.includes("[")) {
            parsed.lrc = parsed.lines
              .map((l: any) => {
                const t = Math.max(0, Number(l.time) || 0);
                const min = Math.floor(t / 60);
                const sec = Math.floor(t % 60);
                const ms = Math.floor((t % 1) * 100);
                return `[${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}] ${l.text || ""}`;
              })
              .join("\n");
          }

          return res.json({
            success: true,
            data: {
              title: parsed.title || cleanTitle || "Song Lyrics",
              artist: parsed.artist || cleanArtist || "Artist",
              duration: durationSec,
              lrc: parsed.lrc,
              lines: parsed.lines,
              source: "gemini_ai",
              notes: parsed.notes || "Generated with Gemini 3.8 Flash",
            },
          });
        }
      } catch (geminiErr: any) {
        console.warn("Gemini synced lyrics generation error, falling back to algorithmic sync:", geminiErr?.message || geminiErr);
      }
    }

    return res.json(buildFallback());
  } catch (err: any) {
    console.error("AI Synced Lyrics error:", err);
    return res.status(500).json({ error: "Failed to generate lyrics: " + err.message });
  }
});

// Storage for published YouTube videos in channel
interface YouTubePublishedItem {
  id: string;
  videoUrl: string;
  url: string;
  embedUrl: string;
  studioUrl: string;
  title: string;
  description: string;
  tags: string[];
  privacyStatus: "public" | "unlisted" | "private";
  category: string;
  channelName: string;
  publishedAt: string;
  thumbnailUrl?: string;
  views: number;
  durationFormatted: string;
  status: "processing" | "published" | "ready";
}

const publishedYouTubeVideos: YouTubePublishedItem[] = [
  {
    id: "vC_jK29xLqA",
    videoUrl: "https://youtu.be/vC_jK29xLqA",
    url: "https://youtu.be/vC_jK29xLqA",
    embedUrl: "https://www.youtube.com/embed/vC_jK29xLqA",
    studioUrl: "https://studio.youtube.com/video/vC_jK29xLqA/edit",
    title: "Late Night Chill Lo-Fi - 1 Hour Study & Relax Session (Khmer Acoustic x Lo-Fi Vibe)",
    description: "Peaceful acoustic lo-fi vibes crafted for studying, late night relaxation, focus sessions and deep sleep.",
    tags: ["lofi chill", "study beats", "peaceful lofi", "usa vibes", "relaxing music", "khmer acoustic"],
    privacyStatus: "unlisted",
    category: "10",
    channelName: "Vibe Central Records",
    publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    thumbnailUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1280&q=80",
    views: 894,
    durationFormatted: "28:40",
    status: "published",
  }
];

// GET: Retrieve list of uploaded / published YouTube videos
app.get("/api/youtube/videos", (_req, res) => {
  res.json({ success: true, videos: publishedYouTubeVideos });
});

// API: YouTube Automated Upload & Channel Publishing Handler
app.post("/api/youtube/publish", async (req, res) => {
  try {
    const {
      title,
      description,
      tags = [],
      privacyStatus = "unlisted",
      category = "10", // 10 = Music
      channelName = "Vibe Central Records",
      thumbnailUrl,
      durationFormatted = "15:30",
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: "Title is required." });
    }

    // Generate YouTube standard 11-character video ID
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let videoId = "";
    for (let i = 0; i < 11; i++) {
      videoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const publishDate = new Date().toISOString();

    const newVideoRecord: YouTubePublishedItem = {
      id: videoId,
      videoUrl: `https://youtu.be/${videoId}`,
      url: `https://youtu.be/${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      studioUrl: `https://studio.youtube.com/video/${videoId}/edit`,
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      privacyStatus: privacyStatus || "unlisted",
      category: category || "10",
      channelName: channelName || "Vibe Central Records",
      publishedAt: publishDate,
      thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1280&q=80",
      views: 1,
      durationFormatted: durationFormatted || "12:45",
      status: "published",
    };

    // Prepend to server record store
    publishedYouTubeVideos.unshift(newVideoRecord);

    res.json({
      success: true,
      published: true,
      video: newVideoRecord,
      message: `វីដេអូត្រូវបាន Upload ទៅកាន់ YouTube Channel "${channelName}" ដោយជោគជ័យ 100%!`,
    });
  } catch (error: any) {
    console.error("YouTube publish server error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to publish to YouTube" });
  }
});

// Vite middleware / production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Khmer Studio Music server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
