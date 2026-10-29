import { VisualizerStyle } from "../types";

export interface VisualizerStyleOption {
  id: VisualizerStyle;
  name: string;
  nameKhmer: string;
  badge: string;
  description: string;
}

export const VISUALIZER_STYLES: VisualizerStyleOption[] = [
  {
    id: "bars",
    name: "Classic Spectrum Bars",
    nameKhmer: "របាររលកសំឡេង (Spectrum)",
    badge: "BARS",
    description: "របារប្រេកង់រលកសំឡេងឆ្លុះបញ្ចាំងបែបបុរាណ និងពន្លឺ Glow",
  },
  {
    id: "radial",
    name: "Radial Pulse 360°",
    nameKhmer: "រង្វង់កាំរស្មី 360° (Radial)",
    badge: "RADIAL",
    description: "កាំរស្មីរលកសំឡេងជះចេញ 360 ដឺក្រេជុំវិញរូបចម្រៀងយ៉ាងរស់រវើក",
  },
  {
    id: "wave",
    name: "Smooth Liquid Wave",
    nameKhmer: "រលកទឹកភ្លោះរលោង (Liquid Wave)",
    badge: "WAVE",
    description: "រលកទឹកភ្លោះ Sine Wave ហូររលោងស្រទន់តាមចង្វាក់ភ្លេង",
  },
  {
    id: "vinyl",
    name: "Golden Vinyl Groove",
    nameKhmer: "ថាសចម្រៀងវិល (Vinyl Record)",
    badge: "VINYL",
    description: "ថាសជ័រវិលបែប Classic Retro ជាមួយចង្អូរភ្លេងបន្លឺសូរ និងម្ជុលចាក់ភ្លេង",
  },
  {
    id: "neon",
    name: "Neon Cyber Tunnel",
    nameKhmer: "ផ្លូវរូងពន្លឺ 3D (Neon Tunnel)",
    badge: "NEON",
    description: "ផ្លូវរូងពន្លឺពហុកោណ 3D បាញ់ចូលជ្រៅតាមចង្វាក់បាស",
  },
  {
    id: "ripple",
    name: "Water Bass Ripples",
    nameKhmer: "រលកទឹករំញ័រ (Bass Ripples)",
    badge: "RIPPLES",
    description: "រលកទឹករំញ័រចេញពីរូបកណ្តាលជាស្រទាប់ៗតាមសូរបាស",
  },
  {
    id: "equalizer",
    name: "Dual Studio EQ",
    nameKhmer: "ស្ទូឌីយោ Equalizer (Dual EQ)",
    badge: "STUDIO EQ",
    description: "របារប្រេកង់ស្ទូឌីយោឆ្វេង-ស្តាំ បែប Pro Audio Master Console",
  },
  {
    id: "particles",
    name: "Particle Nebula",
    nameKhmer: "គ្រាប់ពន្លឺអណ្តែត (Particles)",
    badge: "PARTICLES",
    description: "គ្រាប់ពន្លឺផ្កាយអណ្តែតរាំតាមចង្វាក់ភ្លេង និងរង្វង់រំញ័រ Shockwaves",
  },
  {
    id: "glitch",
    name: "Cyber Glitch",
    nameKhmer: "បែប Cyber Glitch (RGB)",
    badge: "GLITCH",
    description: "បែបបច្ចេកវិទ្យា Cyberpunk, បំបែកពណ៌ RGB Split, និងកងរង្វង់ HUD Sci-Fi",
  },
  {
    id: "hybrid",
    name: "Neon Fusion Hybrid",
    nameKhmer: "ចម្រុះរួមគ្នា (Hybrid)",
    badge: "HYBRID",
    description: "បន្សំបញ្ចូលគ្នារវាងរបាររលកសំឡេង គ្រាប់ពន្លឺផ្កាយ និង Cyber Glow",
  },
  {
    id: "orb_pulsar",
    name: "Plasma Pulsar Orb",
    nameKhmer: "គ្រាប់បាល់ពន្លឺផ្លាស្មា (Plasma Orb)",
    badge: "ORB",
    description: "គ្រាប់បាល់ថាមពលផ្លាស្មាលោតពន្លឺ Glow និងបញ្ចេញកាំរស្មីអគ្គិសនីតាមចង្វាក់បាស",
  },
  {
    id: "galaxy_spiral",
    name: "Cosmic Galaxy Spiral",
    nameKhmer: "គន្លងកាឡាក់ស៊ីវិលវល់ (Cosmic Galaxy)",
    badge: "GALAXY",
    description: "ដៃកាឡាក់ស៊ីផ្កាយវិលវល់ 360° រំញោចកញ្ចុំពន្លឺ Nebula តាមប្រេកង់ភ្លេង",
  },
  {
    id: "laser_beams",
    name: "Concert Laser Show",
    nameKhmer: "កាំរស្មីឡាស៊ែរខនសឺត (Concert Lasers)",
    badge: "LASER",
    description: "កាំរស្មីឡាស៊ែរឆាកតន្ត្រី EDM បាញ់កាត់ពពកអ័ព្ទរាំតាមចង្វាក់រំញ័រ",
  },
  {
    id: "heartbeat",
    name: "Neon EKG Heartbeat",
    nameKhmer: "ចង្វាក់បេះដូង EKG (Heartbeat)",
    badge: "HEARTBEAT",
    description: "ខ្សែរលកអេឡិចត្រូនិក ECG រត់ឆ្លងកាត់អេក្រង់ លោតតាមចង្វាក់បេះដូង និងបាសភ្លេង",
  },
  {
    id: "dna_helix",
    name: "3D DNA Bio-Helix",
    nameKhmer: "ខ្សែច្រវាក់ DNA 3D (DNA Helix)",
    badge: "DNA 3D",
    description: "ខ្សែច្រវាក់ DNA 3D វិលជុំវិញអ័ក្ស បញ្ចេញពន្លឺ Bioluminescent តាម Stereo L/R",
  },
  {
    id: "matrix_rain",
    name: "Cyber Matrix Rain",
    nameKhmer: "ភ្លៀងកូដ Matrix ឌីជីថល (Matrix Rain)",
    badge: "MATRIX",
    description: "តំណក់កូដអ៊ីនធឺណិត Cyber ហូរស្រោចចុះក្រោម និងលោតរំញោចពេលបុកបាស",
  },
  {
    id: "fire_flames",
    name: "Inferno Bass Flames",
    nameKhmer: "អណ្តាតភ្លើងបាស (Inferno Flames)",
    badge: "FIRE",
    description: "អណ្តាតភ្លើងឆាបឆេះរាំពីបាតអេក្រង់ ជះកម្ទេចភ្លើង Ember តាមកម្លាំងបាស",
  },
  {
    id: "crystal_poly",
    name: "Prism Crystal Gem",
    nameKhmer: "ត្បូងគ្រីស្តាល់ 3D (Crystal Gem)",
    badge: "CRYSTAL",
    description: "ត្បូងកែវគ្រីស្តាល់ពហុកោណ 3D ចាំងពន្លឺឥន្ទធនូរំលេចតាមសំឡេងភ្លេង",
  },
  {
    id: "lofi_rain",
    name: "Cozy Lo-Fi Rain Window",
    nameKhmer: "តំណក់ភ្លៀង Lo-Fi (Lo-Fi Rain)",
    badge: "LO-FI",
    description: "តំណក់ទឹកភ្លៀងរលោងស្រទន់លើកញ្ចក់បង្អួច អមដោយពន្លឺ Bokeh និងរលកទឹកស្រាលស្រទន់",
  },
  {
    id: "retrowave_grid",
    name: "80s Retro Synthwave Grid",
    nameKhmer: "ជើងមេឃ Synthwave 80s (Retro Grid)",
    badge: "RETROWAVE",
    description: "ផ្ទៃក្រឡា 3D Wireframe Grid បែប Synthwave 80s រំញ័រដូចរលកសមុទ្រឆ្ពោះទៅព្រះអាទិត្យ Neon",
  },
];
