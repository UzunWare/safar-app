/**
 * Curriculum Definition: Salah First Pathway
 *
 * ~120 words across 6 units covering Al-Fatiha, short surahs,
 * and prayer adhkar. Arabic text is Uthmani script with full tashkeel.
 *
 * Audio URLs reference Quran.com CDN: https://audio.qurancdn.com/
 * Format: wbw/{surah}_{ayah}_{word}.mp3
 */

// ============================================================
// Types
// ============================================================

export interface PathwayDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  promise: string;
  preview_items: string[];
  is_active: boolean;
}

export interface UnitDef {
  id: string;
  pathway_id: string;
  name: string;
  description: string;
  order: number;
}

export type LessonType = 'word' | 'root' | 'frequency';

export interface LessonDef {
  id: string;
  unit_id: string;
  name: string;
  order: number;
  lesson_type: LessonType;
}

export interface WordDef {
  id: string;
  lesson_id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  audio_url: string | null;
  order: number;
  // Only for frequency words:
  frequency?: number;
  description?: string;
}

export interface RootDef {
  id: string;
  letters: string;
  meaning: string;
  transliteration: string;
}

export interface WordRootLink {
  word_id: string;
  root_id: string;
}

export interface FrequencyExampleDef {
  id: string;
  word_id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  audio_url: string | null;
  order: number;
}

export interface QuizQuestionDef {
  id: string;
  lesson_id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  explanation: string;
  order: number;
}

// ============================================================
// Audio URL helper
// ============================================================

const AUDIO_BASE = 'https://audio.qurancdn.com/';

function audioUrl(surah: number, ayah: number, word: number): string {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  const w = String(word).padStart(3, '0');
  return `${AUDIO_BASE}wbw/${s}_${a}_${w}.mp3`;
}

// ============================================================
// Pathway
// ============================================================

export const pathway: PathwayDef = {
  id: 'salah-first',
  name: 'Salah First',
  slug: 'salah-first',
  description: 'Master the vocabulary of your daily prayers',
  promise: 'Understand every word you say in salah',
  preview_items: ['Surah Al-Fatiha — every word explained', 'Prayer position phrases (ruku, sujood)', "Essential du'as & adhkar"],
  is_active: true,
};

// ============================================================
// Units
// ============================================================

export const units: UnitDef[] = [
  {
    id: 'sf-u1-fatiha',
    pathway_id: 'salah-first',
    name: 'Al-Fatiha',
    description: 'The Opening — Learn every word of the most recited chapter',
    order: 1,
  },
  {
    id: 'sf-u2-protection',
    pathway_id: 'salah-first',
    name: 'The Protection Surahs',
    description: 'Al-Ikhlas, Al-Falaq & An-Nas — Surahs of refuge and faith',
    order: 2,
  },
  {
    id: 'sf-u3-wisdom',
    pathway_id: 'salah-first',
    name: 'The Wisdom Surahs',
    description: 'Al-Asr, Al-Kawthar & Al-Kafirun — Time, abundance and conviction',
    order: 3,
  },
  {
    id: 'sf-u4-standing',
    pathway_id: 'salah-first',
    name: 'Standing & Bowing',
    description: 'Opening dua, ruku and rising — The adhkar of standing before Allah',
    order: 4,
  },
  {
    id: 'sf-u5-prostration',
    pathway_id: 'salah-first',
    name: 'Prostration & Sitting',
    description: 'Sujood and Tashahhud — The closest you are to your Lord',
    order: 5,
  },
  {
    id: 'sf-u6-closing',
    pathway_id: 'salah-first',
    name: 'Durood & Closing',
    description: 'Salawat and final duas — Completing your prayer with peace',
    order: 6,
  },
];

// ============================================================
// Roots
// ============================================================

export const roots: RootDef[] = [
  { id: 'r-smw', letters: 'س-م-و', meaning: 'name, attribute', transliteration: 's-m-w' },
  { id: 'r-ilh', letters: 'ا-ل-ه', meaning: 'god, deity', transliteration: 'a-l-h' },
  { id: 'r-hmd', letters: 'ح-م-د', meaning: 'praise, commendation', transliteration: 'h-m-d' },
  { id: 'r-rbb', letters: 'ر-ب-ب', meaning: 'lord, master, sustainer', transliteration: 'r-b-b' },
  { id: 'r-rhm', letters: 'ر-ح-م', meaning: 'mercy, compassion', transliteration: 'r-h-m' },
  { id: 'r-alm', letters: 'ع-ل-م', meaning: 'to know, worlds', transliteration: 'ayn-l-m' },
  { id: 'r-mlk', letters: 'م-ل-ك', meaning: 'king, dominion, authority', transliteration: 'm-l-k' },
  { id: 'r-dwn', letters: 'د-ي-ن', meaning: 'religion, judgment, recompense', transliteration: 'd-y-n' },
  { id: 'r-abd', letters: 'ع-ب-د', meaning: 'worship, servitude', transliteration: 'ayn-b-d' },
  { id: 'r-awn', letters: 'ع-و-ن', meaning: 'help, assistance', transliteration: 'ayn-w-n' },
  { id: 'r-hdy', letters: 'ه-د-ي', meaning: 'guidance, right path', transliteration: 'h-d-y' },
  { id: 'r-srt', letters: 'ص-ر-ط', meaning: 'path, way', transliteration: 's-r-t' },
  { id: 'r-qwm', letters: 'ق-و-م', meaning: 'stand, upright, establish', transliteration: 'q-w-m' },
  { id: 'r-nam', letters: 'ن-ع-م', meaning: 'blessing, favor, grace', transliteration: 'n-ayn-m' },
  { id: 'r-ghdb', letters: 'غ-ض-ب', meaning: 'anger, wrath', transliteration: 'gh-d-b' },
  { id: 'r-dll', letters: 'ض-ل-ل', meaning: 'go astray, err', transliteration: 'd-l-l' },
  { id: 'r-qwl', letters: 'ق-و-ل', meaning: 'say, speech', transliteration: 'q-w-l' },
  { id: 'r-ahd', letters: 'ا-ح-د', meaning: 'one, unique', transliteration: 'a-h-d' },
  { id: 'r-smd', letters: 'ص-م-د', meaning: 'eternal, absolute', transliteration: 's-m-d' },
  { id: 'r-wld', letters: 'و-ل-د', meaning: 'beget, offspring', transliteration: 'w-l-d' },
  { id: 'r-kfw', letters: 'ك-ف-و', meaning: 'equal, comparable', transliteration: 'k-f-w' },
  { id: 'r-flq', letters: 'ف-ل-ق', meaning: 'split, daybreak', transliteration: 'f-l-q' },
  { id: 'r-khlo', letters: 'خ-ل-ق', meaning: 'create, creation', transliteration: 'kh-l-q' },
  { id: 'r-shr', letters: 'ش-ر-ر', meaning: 'evil, harm', transliteration: 'sh-r-r' },
  { id: 'r-wqb', letters: 'و-ق-ب', meaning: 'grow dark, set', transliteration: 'w-q-b' },
  { id: 'r-nfs', letters: 'ن-ف-س', meaning: 'soul, self, breath', transliteration: 'n-f-s' },
  { id: 'r-nfth', letters: 'ن-ف-ث', meaning: 'blow, whisper', transliteration: 'n-f-th' },
  { id: 'r-aqd', letters: 'ع-ق-د', meaning: 'tie, knot', transliteration: 'ayn-q-d' },
  { id: 'r-hsd', letters: 'ح-س-د', meaning: 'envy, jealousy', transliteration: 'h-s-d' },
  { id: 'r-nws', letters: 'ن-و-س', meaning: 'people, mankind', transliteration: 'n-w-s' },
  { id: 'r-wswis', letters: 'و-س-و-س', meaning: 'whisper, tempt', transliteration: 'w-s-w-s' },
  { id: 'r-khn', letters: 'خ-ن-س', meaning: 'retreat, slink away', transliteration: 'kh-n-s' },
  { id: 'r-sdr', letters: 'ص-د-ر', meaning: 'chest, breast', transliteration: 's-d-r' },
  { id: 'r-jnn', letters: 'ج-ن-ن', meaning: 'hidden, jinn', transliteration: 'j-n-n' },
  { id: 'r-asr', letters: 'ع-ص-ر', meaning: 'time, era, squeeze', transliteration: 'ayn-s-r' },
  { id: 'r-khs', letters: 'خ-س-ر', meaning: 'loss, diminish', transliteration: 'kh-s-r' },
  { id: 'r-amn', letters: 'ا-م-ن', meaning: 'believe, faith, security', transliteration: 'a-m-n' },
  { id: 'r-aml', letters: 'ع-م-ل', meaning: 'action, deed, work', transliteration: 'ayn-m-l' },
  { id: 'r-slh', letters: 'ص-ل-ح', meaning: 'righteous, reform, good', transliteration: 's-l-h' },
  { id: 'r-wsy', letters: 'و-ص-ي', meaning: 'advise, enjoin', transliteration: 'w-s-y' },
  { id: 'r-hqq', letters: 'ح-ق-ق', meaning: 'truth, right, reality', transliteration: 'h-q-q' },
  { id: 'r-sbr', letters: 'ص-ب-ر', meaning: 'patience, perseverance', transliteration: 's-b-r' },
  { id: 'r-kwth', letters: 'ك-و-ث-ر', meaning: 'abundance, plenty', transliteration: 'k-w-th-r' },
  { id: 'r-aty', letters: 'ع-ط-و', meaning: 'give, grant', transliteration: 'ayn-t-w' },
  { id: 'r-slw', letters: 'ص-ل-و', meaning: 'prayer, connection', transliteration: 's-l-w' },
  { id: 'r-nhr', letters: 'ن-ح-ر', meaning: 'sacrifice, slaughter', transliteration: 'n-h-r' },
  { id: 'r-shna', letters: 'ش-ن-ا', meaning: 'hate, detest', transliteration: 'sh-n-a' },
  { id: 'r-btr', letters: 'ب-ت-ر', meaning: 'cut off, sever', transliteration: 'b-t-r' },
  { id: 'r-kfr', letters: 'ك-ف-ر', meaning: 'disbelieve, deny, cover', transliteration: 'k-f-r' },
  { id: 'r-sbh', letters: 'س-ب-ح', meaning: 'glory, exalt, swim', transliteration: 's-b-h' },
  { id: 'r-adm', letters: 'ع-ظ-م', meaning: 'great, mighty', transliteration: 'ayn-z-m' },
  { id: 'r-smaa', letters: 'س-م-ع', meaning: 'hear, listen', transliteration: 's-m-ayn' },
  { id: 'r-ala', letters: 'ع-ل-و', meaning: 'high, exalted', transliteration: 'ayn-l-w' },
  { id: 'r-ghfr', letters: 'غ-ف-ر', meaning: 'forgive, cover, pardon', transliteration: 'gh-f-r' },
  { id: 'r-hyy', letters: 'ح-ي-ي', meaning: 'life, living, greet', transliteration: 'h-y-y' },
  { id: 'r-tyb', letters: 'ط-ي-ب', meaning: 'good, pure, pleasant', transliteration: 't-y-b' },
  { id: 'r-slm', letters: 'س-ل-م', meaning: 'peace, submission, safety', transliteration: 's-l-m' },
  { id: 'r-brk', letters: 'ب-ر-ك', meaning: 'blessing, abundance', transliteration: 'b-r-k' },
  { id: 'r-shd', letters: 'ش-ه-د', meaning: 'witness, testify', transliteration: 'sh-h-d' },
  { id: 'r-rsl', letters: 'ر-س-ل', meaning: 'send, messenger', transliteration: 'r-s-l' },
  { id: 'r-nby', letters: 'ن-ب-و', meaning: 'prophet, news', transliteration: 'n-b-w' },
  { id: 'r-brh', letters: 'ب-ر-ه', meaning: 'Abraham (name)', transliteration: 'b-r-h' },
  { id: 'r-aal', letters: 'ا-و-ل', meaning: 'family, people of', transliteration: 'a-w-l' },
  { id: 'r-zlm', letters: 'ظ-ل-م', meaning: 'wrong, oppress, darkness', transliteration: 'z-l-m' },
  { id: 'r-awdh', letters: 'ع-و-ذ', meaning: 'seek refuge', transliteration: 'ayn-w-dh' },
  { id: 'r-adhb', letters: 'ع-ذ-ب', meaning: 'punishment, torment', transliteration: 'ayn-dh-b' },
  { id: 'r-ftn', letters: 'ف-ت-ن', meaning: 'trial, temptation, test', transliteration: 'f-t-n' },
  { id: 'r-mwt', letters: 'م-و-ت', meaning: 'death, die', transliteration: 'm-w-t' },
  { id: 'r-qbr', letters: 'ق-ب-ر', meaning: 'grave, bury', transliteration: 'q-b-r' },
  { id: 'r-msyh', letters: 'م-س-ح', meaning: 'anoint, messiah', transliteration: 'm-s-h' },
  { id: 'r-djl', letters: 'د-ج-ل', meaning: 'deceive, cover', transliteration: 'd-j-l' },
];

// ============================================================
// Unit 1: Al-Fatiha — Lessons & Words
// ============================================================

const u1_lessons: LessonDef[] = [
  { id: 'sf-u1-l1', unit_id: 'sf-u1-fatiha', name: 'Ayat 1-3: The Opening Praise', order: 1, lesson_type: 'word' },
  { id: 'sf-u1-l2', unit_id: 'sf-u1-fatiha', name: 'Ayat 4-5: Master & Worship', order: 2, lesson_type: 'word' },
  { id: 'sf-u1-l3', unit_id: 'sf-u1-fatiha', name: 'Ayat 6-7: The Straight Path', order: 3, lesson_type: 'word' },
  { id: 'sf-root-rhm', unit_id: 'sf-u1-fatiha', name: 'Root: Mercy (ر-ح-م)', order: 4, lesson_type: 'root' },
  { id: 'sf-root-abd', unit_id: 'sf-u1-fatiha', name: 'Root: Worship (ع-ب-د)', order: 5, lesson_type: 'root' },
];

const u1_words: WordDef[] = [
  // Lesson 1: Ayat 1-3
  { id: 'w-bismi', lesson_id: 'sf-u1-l1', arabic: 'بِسْمِ', transliteration: 'bismi', meaning: 'In the name of', audio_url: audioUrl(1, 1, 1), order: 1 },
  { id: 'w-allahi', lesson_id: 'sf-u1-l1', arabic: 'اللَّهِ', transliteration: 'Allahi', meaning: 'Allah (God)', audio_url: audioUrl(1, 1, 2), order: 2 },
  { id: 'w-arrahman', lesson_id: 'sf-u1-l1', arabic: 'الرَّحْمَنِ', transliteration: 'ar-Rahmani', meaning: 'the Most Gracious', audio_url: audioUrl(1, 1, 3), order: 3 },
  { id: 'w-arraheem', lesson_id: 'sf-u1-l1', arabic: 'الرَّحِيمِ', transliteration: 'ar-Raheemi', meaning: 'the Most Merciful', audio_url: audioUrl(1, 1, 4), order: 4 },
  { id: 'w-alhamdu', lesson_id: 'sf-u1-l1', arabic: 'الْحَمْدُ', transliteration: 'al-Hamdu', meaning: 'All praise', audio_url: audioUrl(1, 2, 1), order: 5 },
  { id: 'w-lillahi', lesson_id: 'sf-u1-l1', arabic: 'لِلَّهِ', transliteration: 'lillahi', meaning: 'is for Allah', audio_url: audioUrl(1, 2, 2), order: 6 },
  { id: 'w-rabbi', lesson_id: 'sf-u1-l1', arabic: 'رَبِّ', transliteration: 'Rabbi', meaning: 'Lord of', audio_url: audioUrl(1, 2, 3), order: 7 },
  { id: 'w-alameen', lesson_id: 'sf-u1-l1', arabic: 'الْعَالَمِينَ', transliteration: 'al-\'Aalameena', meaning: 'the worlds', audio_url: audioUrl(1, 2, 4), order: 8 },

  // Lesson 2: Ayat 4-5
  { id: 'w-maliki', lesson_id: 'sf-u1-l2', arabic: 'مَالِكِ', transliteration: 'Maliki', meaning: 'Master/Owner of', audio_url: audioUrl(1, 4, 1), order: 1 },
  { id: 'w-yawmi', lesson_id: 'sf-u1-l2', arabic: 'يَوْمِ', transliteration: 'Yawmi', meaning: 'the Day of', audio_url: audioUrl(1, 4, 2), order: 2 },
  { id: 'w-addeen', lesson_id: 'sf-u1-l2', arabic: 'الدِّينِ', transliteration: 'ad-Deeni', meaning: 'the Judgment', audio_url: audioUrl(1, 4, 3), order: 3 },
  { id: 'w-iyyaka', lesson_id: 'sf-u1-l2', arabic: 'إِيَّاكَ', transliteration: 'Iyyaka', meaning: 'You Alone', audio_url: audioUrl(1, 5, 1), order: 4 },
  { id: 'w-nabudu', lesson_id: 'sf-u1-l2', arabic: 'نَعْبُدُ', transliteration: 'na\'budu', meaning: 'we worship', audio_url: audioUrl(1, 5, 2), order: 5 },
  { id: 'w-nastaeen', lesson_id: 'sf-u1-l2', arabic: 'نَسْتَعِينُ', transliteration: 'nasta\'eenu', meaning: 'we ask for help', audio_url: audioUrl(1, 5, 4), order: 6 },

  // Lesson 3: Ayat 6-7
  { id: 'w-ihdina', lesson_id: 'sf-u1-l3', arabic: 'اهْدِنَا', transliteration: 'Ihdina', meaning: 'Guide us', audio_url: audioUrl(1, 6, 1), order: 1 },
  { id: 'w-assirat', lesson_id: 'sf-u1-l3', arabic: 'الصِّرَاطَ', transliteration: 'as-Sirata', meaning: 'the path', audio_url: audioUrl(1, 6, 2), order: 2 },
  { id: 'w-almustaqeem', lesson_id: 'sf-u1-l3', arabic: 'الْمُسْتَقِيمَ', transliteration: 'al-Mustaqeema', meaning: 'the straight', audio_url: audioUrl(1, 6, 3), order: 3 },
  { id: 'w-alladhina', lesson_id: 'sf-u1-l3', arabic: 'الَّذِينَ', transliteration: 'alladheena', meaning: 'those who', audio_url: audioUrl(1, 7, 2), order: 4 },
  { id: 'w-anamta', lesson_id: 'sf-u1-l3', arabic: 'أَنْعَمْتَ', transliteration: 'an\'amta', meaning: 'You have blessed', audio_url: audioUrl(1, 7, 3), order: 5 },
  { id: 'w-alayhim', lesson_id: 'sf-u1-l3', arabic: 'عَلَيْهِمْ', transliteration: '\'alayhim', meaning: 'upon them', audio_url: audioUrl(1, 7, 4), order: 6 },
  { id: 'w-ghayri', lesson_id: 'sf-u1-l3', arabic: 'غَيْرِ', transliteration: 'ghayri', meaning: 'not (other than)', audio_url: audioUrl(1, 7, 5), order: 7 },
  { id: 'w-almaghdubi', lesson_id: 'sf-u1-l3', arabic: 'الْمَغْضُوبِ', transliteration: 'al-Maghdoobi', meaning: 'those who earned wrath', audio_url: audioUrl(1, 7, 6), order: 8 },
  { id: 'w-wala', lesson_id: 'sf-u1-l3', arabic: 'وَلَا', transliteration: 'wa la', meaning: 'and not', audio_url: audioUrl(1, 7, 8), order: 9 },
  { id: 'w-addalleen', lesson_id: 'sf-u1-l3', arabic: 'الضَّالِّينَ', transliteration: 'ad-Daalleen', meaning: 'those who go astray', audio_url: audioUrl(1, 7, 9), order: 10 },
];

// ============================================================
// Unit 2: The Protection Surahs
// ============================================================

const u2_lessons: LessonDef[] = [
  { id: 'sf-u2-l1', unit_id: 'sf-u2-protection', name: 'Al-Ikhlas: Pure Monotheism', order: 1, lesson_type: 'word' },
  { id: 'sf-u2-l2', unit_id: 'sf-u2-protection', name: 'Al-Falaq: Seeking Refuge in Dawn', order: 2, lesson_type: 'word' },
  { id: 'sf-u2-l3', unit_id: 'sf-u2-protection', name: 'An-Nas: Seeking Refuge in Mankind', order: 3, lesson_type: 'word' },
  { id: 'sf-root-qwl', unit_id: 'sf-u2-protection', name: 'Root: Say (ق-و-ل)', order: 4, lesson_type: 'root' },
];

const u2_words: WordDef[] = [
  // Al-Ikhlas (112)
  { id: 'w-qul', lesson_id: 'sf-u2-l1', arabic: 'قُلْ', transliteration: 'Qul', meaning: 'Say', audio_url: audioUrl(112, 1, 1), order: 1 },
  { id: 'w-huwa', lesson_id: 'sf-u2-l1', arabic: 'هُوَ', transliteration: 'Huwa', meaning: 'He is', audio_url: audioUrl(112, 1, 2), order: 2 },
  { id: 'w-allahu', lesson_id: 'sf-u2-l1', arabic: 'اللَّهُ', transliteration: 'Allahu', meaning: 'Allah', audio_url: audioUrl(112, 1, 3), order: 3 },
  { id: 'w-ahad', lesson_id: 'sf-u2-l1', arabic: 'أَحَدٌ', transliteration: 'Ahad', meaning: 'One', audio_url: audioUrl(112, 1, 4), order: 4 },
  { id: 'w-assamad', lesson_id: 'sf-u2-l1', arabic: 'الصَّمَدُ', transliteration: 'as-Samad', meaning: 'the Eternal Refuge', audio_url: audioUrl(112, 2, 2), order: 5 },
  { id: 'w-lam', lesson_id: 'sf-u2-l1', arabic: 'لَمْ', transliteration: 'lam', meaning: 'not (past)', audio_url: audioUrl(112, 3, 1), order: 6 },
  { id: 'w-yalid', lesson_id: 'sf-u2-l1', arabic: 'يَلِدْ', transliteration: 'yalid', meaning: 'He begets', audio_url: audioUrl(112, 3, 2), order: 7 },
  { id: 'w-yulad', lesson_id: 'sf-u2-l1', arabic: 'يُولَدْ', transliteration: 'yoolad', meaning: 'is He begotten', audio_url: audioUrl(112, 3, 4), order: 8 },
  { id: 'w-yakun', lesson_id: 'sf-u2-l1', arabic: 'يَكُن', transliteration: 'yakun', meaning: 'there is', audio_url: audioUrl(112, 4, 2), order: 9 },
  { id: 'w-kufuwan', lesson_id: 'sf-u2-l1', arabic: 'كُفُوًا', transliteration: 'kufuwan', meaning: 'equivalent/comparable', audio_url: audioUrl(112, 4, 4), order: 10 },

  // Al-Falaq (113)
  { id: 'w-audhu', lesson_id: 'sf-u2-l2', arabic: 'أَعُوذُ', transliteration: 'a\'oodhu', meaning: 'I seek refuge', audio_url: audioUrl(113, 1, 2), order: 1 },
  { id: 'w-birabbi', lesson_id: 'sf-u2-l2', arabic: 'بِرَبِّ', transliteration: 'bi-Rabbi', meaning: 'in the Lord of', audio_url: audioUrl(113, 1, 3), order: 2 },
  { id: 'w-alfalaq', lesson_id: 'sf-u2-l2', arabic: 'الْفَلَقِ', transliteration: 'al-Falaq', meaning: 'the daybreak', audio_url: audioUrl(113, 1, 4), order: 3 },
  { id: 'w-sharri', lesson_id: 'sf-u2-l2', arabic: 'شَرِّ', transliteration: 'sharri', meaning: 'evil/harm of', audio_url: audioUrl(113, 2, 2), order: 4 },
  { id: 'w-ma', lesson_id: 'sf-u2-l2', arabic: 'مَا', transliteration: 'ma', meaning: 'what', audio_url: audioUrl(113, 2, 3), order: 5 },
  { id: 'w-khalaqa', lesson_id: 'sf-u2-l2', arabic: 'خَلَقَ', transliteration: 'khalaqa', meaning: 'He created', audio_url: audioUrl(113, 2, 4), order: 6 },
  { id: 'w-ghasiqin', lesson_id: 'sf-u2-l2', arabic: 'غَاسِقٍ', transliteration: 'ghasiqin', meaning: 'darkness', audio_url: audioUrl(113, 3, 2), order: 7 },
  { id: 'w-waqab', lesson_id: 'sf-u2-l2', arabic: 'وَقَبَ', transliteration: 'waqab', meaning: 'when it settles', audio_url: audioUrl(113, 3, 4), order: 8 },
  { id: 'w-annaffathat', lesson_id: 'sf-u2-l2', arabic: 'النَّفَّاثَاتِ', transliteration: 'an-Naffathati', meaning: 'the blowers', audio_url: audioUrl(113, 4, 2), order: 9 },
  { id: 'w-aluqad', lesson_id: 'sf-u2-l2', arabic: 'الْعُقَدِ', transliteration: 'al-\'Uqad', meaning: 'the knots', audio_url: audioUrl(113, 4, 4), order: 10 },
  { id: 'w-hasidin', lesson_id: 'sf-u2-l2', arabic: 'حَاسِدٍ', transliteration: 'hasidin', meaning: 'an envier', audio_url: audioUrl(113, 5, 3), order: 11 },
  { id: 'w-hasad', lesson_id: 'sf-u2-l2', arabic: 'حَسَدَ', transliteration: 'hasad', meaning: 'when he envies', audio_url: audioUrl(113, 5, 4), order: 12 },

  // An-Nas (114)
  { id: 'w-annas', lesson_id: 'sf-u2-l3', arabic: 'النَّاسِ', transliteration: 'an-Nas', meaning: 'mankind', audio_url: audioUrl(114, 1, 4), order: 1 },
  { id: 'w-maliki2', lesson_id: 'sf-u2-l3', arabic: 'مَلِكِ', transliteration: 'Maliki', meaning: 'King of', audio_url: audioUrl(114, 2, 2), order: 2 },
  { id: 'w-ilahi', lesson_id: 'sf-u2-l3', arabic: 'إِلَهِ', transliteration: 'Ilahi', meaning: 'God of', audio_url: audioUrl(114, 3, 2), order: 3 },
  { id: 'w-alwaswas', lesson_id: 'sf-u2-l3', arabic: 'الْوَسْوَاسِ', transliteration: 'al-Waswas', meaning: 'the whisperer', audio_url: audioUrl(114, 4, 3), order: 4 },
  { id: 'w-alkhannas', lesson_id: 'sf-u2-l3', arabic: 'الْخَنَّاسِ', transliteration: 'al-Khannas', meaning: 'the retreater', audio_url: audioUrl(114, 4, 4), order: 5 },
  { id: 'w-yuwaswisu', lesson_id: 'sf-u2-l3', arabic: 'يُوَسْوِسُ', transliteration: 'yuwaswisu', meaning: 'who whispers', audio_url: audioUrl(114, 5, 2), order: 6 },
  { id: 'w-sudoor', lesson_id: 'sf-u2-l3', arabic: 'صُدُورِ', transliteration: 'sudoor', meaning: 'breasts/hearts', audio_url: audioUrl(114, 5, 4), order: 7 },
  { id: 'w-aljinnati', lesson_id: 'sf-u2-l3', arabic: 'الْجِنَّةِ', transliteration: 'al-Jinnati', meaning: 'the jinn', audio_url: audioUrl(114, 6, 2), order: 8 },
];

// ============================================================
// Unit 3: The Wisdom Surahs
// ============================================================

const u3_lessons: LessonDef[] = [
  { id: 'sf-u3-l1', unit_id: 'sf-u3-wisdom', name: 'Al-Asr: The Declining Time', order: 1, lesson_type: 'word' },
  { id: 'sf-u3-l2', unit_id: 'sf-u3-wisdom', name: 'Al-Kawthar: The Abundance', order: 2, lesson_type: 'word' },
  { id: 'sf-u3-l3', unit_id: 'sf-u3-wisdom', name: 'Al-Kafirun: The Disbelievers', order: 3, lesson_type: 'word' },
  { id: 'sf-root-aml', unit_id: 'sf-u3-wisdom', name: 'Root: Deeds (ع-م-ل)', order: 4, lesson_type: 'root' },
];

const u3_words: WordDef[] = [
  // Al-Asr (103)
  { id: 'w-walasr', lesson_id: 'sf-u3-l1', arabic: 'وَالْعَصْرِ', transliteration: 'wal-\'Asr', meaning: 'By time', audio_url: audioUrl(103, 1, 1), order: 1 },
  { id: 'w-alinsana', lesson_id: 'sf-u3-l1', arabic: 'الْإِنسَانَ', transliteration: 'al-Insana', meaning: 'mankind', audio_url: audioUrl(103, 2, 2), order: 2 },
  { id: 'w-lakhusr', lesson_id: 'sf-u3-l1', arabic: 'خُسْرٍ', transliteration: 'khusr', meaning: 'loss', audio_url: audioUrl(103, 2, 4), order: 3 },
  { id: 'w-amanu', lesson_id: 'sf-u3-l1', arabic: 'آمَنُوا', transliteration: 'amanoo', meaning: 'believed', audio_url: audioUrl(103, 3, 3), order: 4 },
  { id: 'w-amiloo', lesson_id: 'sf-u3-l1', arabic: 'عَمِلُوا', transliteration: '\'amiloo', meaning: 'did (deeds)', audio_url: audioUrl(103, 3, 4), order: 5 },
  { id: 'w-assalihat', lesson_id: 'sf-u3-l1', arabic: 'الصَّالِحَاتِ', transliteration: 'as-Salihati', meaning: 'righteous deeds', audio_url: audioUrl(103, 3, 5), order: 6 },
  { id: 'w-tawaasaw', lesson_id: 'sf-u3-l1', arabic: 'تَوَاصَوْا', transliteration: 'tawasaw', meaning: 'advised each other', audio_url: audioUrl(103, 3, 6), order: 7 },
  { id: 'w-bilhaqqi', lesson_id: 'sf-u3-l1', arabic: 'بِالْحَقِّ', transliteration: 'bil-Haqqi', meaning: 'with truth', audio_url: audioUrl(103, 3, 7), order: 8 },
  { id: 'w-bissabr', lesson_id: 'sf-u3-l1', arabic: 'بِالصَّبْرِ', transliteration: 'bis-Sabr', meaning: 'with patience', audio_url: audioUrl(103, 3, 9), order: 9 },

  // Al-Kawthar (108)
  { id: 'w-ataynaka', lesson_id: 'sf-u3-l2', arabic: 'أَعْطَيْنَاكَ', transliteration: 'a\'taynaaka', meaning: 'We have given you', audio_url: audioUrl(108, 1, 2), order: 1 },
  { id: 'w-alkalwthar', lesson_id: 'sf-u3-l2', arabic: 'الْكَوْثَرَ', transliteration: 'al-Kawthar', meaning: 'the Abundance', audio_url: audioUrl(108, 1, 3), order: 2 },
  { id: 'w-fasalli', lesson_id: 'sf-u3-l2', arabic: 'فَصَلِّ', transliteration: 'fa-salli', meaning: 'so pray', audio_url: audioUrl(108, 2, 1), order: 3 },
  { id: 'w-lirabbika', lesson_id: 'sf-u3-l2', arabic: 'لِرَبِّكَ', transliteration: 'li-Rabbika', meaning: 'to your Lord', audio_url: audioUrl(108, 2, 2), order: 4 },
  { id: 'w-wanhar', lesson_id: 'sf-u3-l2', arabic: 'وَانْحَرْ', transliteration: 'wanhar', meaning: 'and sacrifice', audio_url: audioUrl(108, 2, 3), order: 5 },
  { id: 'w-shaaniaka', lesson_id: 'sf-u3-l2', arabic: 'شَانِئَكَ', transliteration: 'shani\'aka', meaning: 'the one who hates you', audio_url: audioUrl(108, 3, 2), order: 6 },
  { id: 'w-alabtar', lesson_id: 'sf-u3-l2', arabic: 'الْأَبْتَرُ', transliteration: 'al-Abtar', meaning: 'the one cut off', audio_url: audioUrl(108, 3, 4), order: 7 },

  // Al-Kafirun (109)
  { id: 'w-ayyuha', lesson_id: 'sf-u3-l3', arabic: 'أَيُّهَا', transliteration: 'ayyuha', meaning: 'O you', audio_url: audioUrl(109, 1, 3), order: 1 },
  { id: 'w-alkafirun', lesson_id: 'sf-u3-l3', arabic: 'الْكَافِرُونَ', transliteration: 'al-Kafiroon', meaning: 'the disbelievers', audio_url: audioUrl(109, 1, 4), order: 2 },
  { id: 'w-la', lesson_id: 'sf-u3-l3', arabic: 'لَا', transliteration: 'la', meaning: 'I do not', audio_url: audioUrl(109, 2, 1), order: 3 },
  { id: 'w-abudu', lesson_id: 'sf-u3-l3', arabic: 'أَعْبُدُ', transliteration: 'a\'budu', meaning: 'worship', audio_url: audioUrl(109, 2, 2), order: 4 },
  { id: 'w-tabudun', lesson_id: 'sf-u3-l3', arabic: 'تَعْبُدُونَ', transliteration: 'ta\'budoona', meaning: 'you worship', audio_url: audioUrl(109, 2, 4), order: 5 },
  { id: 'w-abidun', lesson_id: 'sf-u3-l3', arabic: 'عَابِدُونَ', transliteration: '\'aabidoona', meaning: 'worshippers of', audio_url: audioUrl(109, 3, 3), order: 6 },
  { id: 'w-abadtu', lesson_id: 'sf-u3-l3', arabic: 'عَبَدتُّ', transliteration: '\'abadtu', meaning: 'I have worshipped', audio_url: audioUrl(109, 4, 3), order: 7 },
  { id: 'w-abid', lesson_id: 'sf-u3-l3', arabic: 'عَابِدٌ', transliteration: '\'aabid', meaning: 'a worshipper', audio_url: audioUrl(109, 5, 2), order: 8 },
  { id: 'w-deenukum', lesson_id: 'sf-u3-l3', arabic: 'دِينُكُمْ', transliteration: 'deenukum', meaning: 'your religion', audio_url: audioUrl(109, 6, 2), order: 9 },
  { id: 'w-deen', lesson_id: 'sf-u3-l3', arabic: 'دِينِ', transliteration: 'deeni', meaning: 'my religion', audio_url: audioUrl(109, 6, 5), order: 10 },
];

// ============================================================
// Unit 4: Standing & Bowing Adhkar
// ============================================================

const u4_lessons: LessonDef[] = [
  { id: 'sf-u4-l1', unit_id: 'sf-u4-standing', name: 'Opening Dua: Glory to You, O Allah', order: 1, lesson_type: 'word' },
  { id: 'sf-u4-l2', unit_id: 'sf-u4-standing', name: 'Ruku & Rising: Glory and Praise', order: 2, lesson_type: 'word' },
  { id: 'sf-root-sbh', unit_id: 'sf-u4-standing', name: 'Root: Glory (س-ب-ح)', order: 3, lesson_type: 'root' },
  { id: 'sf-root-hmd', unit_id: 'sf-u4-standing', name: 'Root: Praise (ح-م-د)', order: 4, lesson_type: 'root' },
];

const u4_words: WordDef[] = [
  // Opening Dua: سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ
  { id: 'w-subhanaka', lesson_id: 'sf-u4-l1', arabic: 'سُبْحَانَكَ', transliteration: 'Subhanaka', meaning: 'Glory be to You', audio_url: null, order: 1 },
  { id: 'w-allahumma', lesson_id: 'sf-u4-l1', arabic: 'اللَّهُمَّ', transliteration: 'Allahumma', meaning: 'O Allah', audio_url: null, order: 2 },
  { id: 'w-wabihamdika', lesson_id: 'sf-u4-l1', arabic: 'وَبِحَمْدِكَ', transliteration: 'wa bi-Hamdika', meaning: 'and with Your praise', audio_url: null, order: 3 },
  { id: 'w-watabaraka', lesson_id: 'sf-u4-l1', arabic: 'وَتَبَارَكَ', transliteration: 'wa Tabaraka', meaning: 'and blessed is', audio_url: null, order: 4 },
  { id: 'w-ismuka', lesson_id: 'sf-u4-l1', arabic: 'اسْمُكَ', transliteration: 'Ismuka', meaning: 'Your name', audio_url: null, order: 5 },
  { id: 'w-wataala', lesson_id: 'sf-u4-l1', arabic: 'وَتَعَالَى', transliteration: 'wa Ta\'aala', meaning: 'and exalted is', audio_url: null, order: 6 },
  { id: 'w-jadduka', lesson_id: 'sf-u4-l1', arabic: 'جَدُّكَ', transliteration: 'Jadduka', meaning: 'Your majesty', audio_url: null, order: 7 },
  { id: 'w-ilaha', lesson_id: 'sf-u4-l1', arabic: 'إِلَهَ', transliteration: 'ilaha', meaning: 'god/deity', audio_url: null, order: 8 },
  { id: 'w-ghayruka', lesson_id: 'sf-u4-l1', arabic: 'غَيْرُكَ', transliteration: 'ghayruka', meaning: 'other than You', audio_url: null, order: 9 },

  // Ruku: سُبْحَانَ رَبِّيَ الْعَظِيمِ + سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ رَبَّنَا وَلَكَ الْحَمْدُ
  { id: 'w-subhana', lesson_id: 'sf-u4-l2', arabic: 'سُبْحَانَ', transliteration: 'Subhana', meaning: 'Glory be to', audio_url: null, order: 1 },
  { id: 'w-rabbiya', lesson_id: 'sf-u4-l2', arabic: 'رَبِّيَ', transliteration: 'Rabbiya', meaning: 'my Lord', audio_url: null, order: 2 },
  { id: 'w-aladheem', lesson_id: 'sf-u4-l2', arabic: 'الْعَظِيمِ', transliteration: 'al-\'Adheemi', meaning: 'the Magnificent', audio_url: null, order: 3 },
  { id: 'w-samia', lesson_id: 'sf-u4-l2', arabic: 'سَمِعَ', transliteration: 'Sami\'a', meaning: 'has heard', audio_url: null, order: 4 },
  { id: 'w-allahu2', lesson_id: 'sf-u4-l2', arabic: 'اللَّهُ', transliteration: 'Allahu', meaning: 'Allah', audio_url: null, order: 5 },
  { id: 'w-liman', lesson_id: 'sf-u4-l2', arabic: 'لِمَنْ', transliteration: 'liman', meaning: 'the one who', audio_url: null, order: 6 },
  { id: 'w-hamidahu', lesson_id: 'sf-u4-l2', arabic: 'حَمِدَهُ', transliteration: 'hamidahu', meaning: 'praises Him', audio_url: null, order: 7 },
  { id: 'w-rabbana', lesson_id: 'sf-u4-l2', arabic: 'رَبَّنَا', transliteration: 'Rabbana', meaning: 'Our Lord', audio_url: null, order: 8 },
  { id: 'w-walaka', lesson_id: 'sf-u4-l2', arabic: 'وَلَكَ', transliteration: 'wa laka', meaning: 'and to You (belongs)', audio_url: null, order: 9 },
  { id: 'w-alhamd', lesson_id: 'sf-u4-l2', arabic: 'الْحَمْدُ', transliteration: 'al-Hamd', meaning: 'all praise', audio_url: null, order: 10 },
];

// ============================================================
// Unit 5: Prostration & Sitting Adhkar
// ============================================================

const u5_lessons: LessonDef[] = [
  { id: 'sf-u5-l1', unit_id: 'sf-u5-prostration', name: 'Sujood: The Nearest Position', order: 1, lesson_type: 'word' },
  { id: 'sf-u5-l2', unit_id: 'sf-u5-prostration', name: 'Tashahhud: Greetings to Allah', order: 2, lesson_type: 'word' },
  { id: 'sf-root-ghfr', unit_id: 'sf-u5-prostration', name: 'Root: Forgiveness (غ-ف-ر)', order: 3, lesson_type: 'root' },
];

const u5_words: WordDef[] = [
  // Sujood: سُبْحَانَ رَبِّيَ الْأَعْلَى + رَبِّ اغْفِرْ لِي
  { id: 'w-alala', lesson_id: 'sf-u5-l1', arabic: 'الْأَعْلَى', transliteration: 'al-A\'la', meaning: 'the Most High', audio_url: null, order: 1 },
  { id: 'w-rabbi2', lesson_id: 'sf-u5-l1', arabic: 'رَبِّ', transliteration: 'Rabbi', meaning: 'My Lord', audio_url: null, order: 2 },
  { id: 'w-ighfir', lesson_id: 'sf-u5-l1', arabic: 'اغْفِرْ', transliteration: 'ighfir', meaning: 'forgive', audio_url: null, order: 3 },
  { id: 'w-li', lesson_id: 'sf-u5-l1', arabic: 'لِي', transliteration: 'li', meaning: 'for me', audio_url: null, order: 4 },
  { id: 'w-warhamni', lesson_id: 'sf-u5-l1', arabic: 'وَارْحَمْنِي', transliteration: 'warhamni', meaning: 'and have mercy on me', audio_url: null, order: 5 },
  { id: 'w-wahdini', lesson_id: 'sf-u5-l1', arabic: 'وَاهْدِنِي', transliteration: 'wahdini', meaning: 'and guide me', audio_url: null, order: 6 },
  { id: 'w-warzuqni', lesson_id: 'sf-u5-l1', arabic: 'وَارْزُقْنِي', transliteration: 'warzuqni', meaning: 'and provide for me', audio_url: null, order: 7 },
  { id: 'w-waafini', lesson_id: 'sf-u5-l1', arabic: 'وَعَافِنِي', transliteration: 'wa\'afini', meaning: 'and grant me wellbeing', audio_url: null, order: 8 },

  // Tashahhud: التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ
  { id: 'w-attahiyyatu', lesson_id: 'sf-u5-l2', arabic: 'التَّحِيَّاتُ', transliteration: 'at-Tahiyyatu', meaning: 'All greetings', audio_url: null, order: 1 },
  { id: 'w-wassalawatu', lesson_id: 'sf-u5-l2', arabic: 'وَالصَّلَوَاتُ', transliteration: 'was-Salawatu', meaning: 'and prayers', audio_url: null, order: 2 },
  { id: 'w-wattayyibat', lesson_id: 'sf-u5-l2', arabic: 'وَالطَّيِّبَاتُ', transliteration: 'wat-Tayyibatu', meaning: 'and pure words', audio_url: null, order: 3 },
  { id: 'w-assalamu', lesson_id: 'sf-u5-l2', arabic: 'السَّلَامُ', transliteration: 'as-Salamu', meaning: 'Peace', audio_url: null, order: 4 },
  { id: 'w-alayka', lesson_id: 'sf-u5-l2', arabic: 'عَلَيْكَ', transliteration: '\'alayka', meaning: 'upon you', audio_url: null, order: 5 },
  { id: 'w-annabiyyu', lesson_id: 'sf-u5-l2', arabic: 'النَّبِيُّ', transliteration: 'an-Nabiyyu', meaning: 'O Prophet', audio_url: null, order: 6 },
  { id: 'w-warahmatu', lesson_id: 'sf-u5-l2', arabic: 'وَرَحْمَةُ', transliteration: 'wa Rahmatu', meaning: 'and the mercy of', audio_url: null, order: 7 },
  { id: 'w-wabarakatuhu', lesson_id: 'sf-u5-l2', arabic: 'وَبَرَكَاتُهُ', transliteration: 'wa Barakatuhu', meaning: 'and His blessings', audio_url: null, order: 8 },
  { id: 'w-alayna', lesson_id: 'sf-u5-l2', arabic: 'عَلَيْنَا', transliteration: '\'alayna', meaning: 'upon us', audio_url: null, order: 9 },
  { id: 'w-ibadi', lesson_id: 'sf-u5-l2', arabic: 'عِبَادِ', transliteration: '\'ibadi', meaning: 'servants of', audio_url: null, order: 10 },
  { id: 'w-assaliheen', lesson_id: 'sf-u5-l2', arabic: 'الصَّالِحِينَ', transliteration: 'as-Saliheen', meaning: 'the righteous', audio_url: null, order: 11 },
  { id: 'w-ashhadu', lesson_id: 'sf-u5-l2', arabic: 'أَشْهَدُ', transliteration: 'Ash-hadu', meaning: 'I bear witness', audio_url: null, order: 12 },
  { id: 'w-illa', lesson_id: 'sf-u5-l2', arabic: 'إِلَّا', transliteration: 'illa', meaning: 'except', audio_url: null, order: 13 },
  { id: 'w-muhammadan', lesson_id: 'sf-u5-l2', arabic: 'مُحَمَّدًا', transliteration: 'Muhammadan', meaning: 'Muhammad', audio_url: null, order: 14 },
  { id: 'w-abduhu', lesson_id: 'sf-u5-l2', arabic: 'عَبْدُهُ', transliteration: '\'abduhu', meaning: 'His servant', audio_url: null, order: 15 },
  { id: 'w-warasuluhu', lesson_id: 'sf-u5-l2', arabic: 'وَرَسُولُهُ', transliteration: 'wa Rasooluhu', meaning: 'and His messenger', audio_url: null, order: 16 },
];

// ============================================================
// Unit 6: Durood & Closing
// ============================================================

const u6_lessons: LessonDef[] = [
  { id: 'sf-u6-l1', unit_id: 'sf-u6-closing', name: 'Durood: Blessings Upon the Prophet', order: 1, lesson_type: 'word' },
  { id: 'sf-u6-l2', unit_id: 'sf-u6-closing', name: 'Final Dua: Before the Salam', order: 2, lesson_type: 'word' },
  { id: 'sf-root-slm', unit_id: 'sf-u6-closing', name: 'Root: Peace (س-ل-م)', order: 3, lesson_type: 'root' },
  { id: 'sf-root-slw', unit_id: 'sf-u6-closing', name: 'Root: Prayer (ص-ل-و)', order: 4, lesson_type: 'root' },
];

const u6_words: WordDef[] = [
  // Durood: اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ
  { id: 'w-salli', lesson_id: 'sf-u6-l1', arabic: 'صَلِّ', transliteration: 'salli', meaning: 'send blessings', audio_url: null, order: 1 },
  { id: 'w-ala', lesson_id: 'sf-u6-l1', arabic: 'عَلَى', transliteration: '\'ala', meaning: 'upon', audio_url: null, order: 2 },
  { id: 'w-muhammadin', lesson_id: 'sf-u6-l1', arabic: 'مُحَمَّدٍ', transliteration: 'Muhammadin', meaning: 'Muhammad', audio_url: null, order: 3 },
  { id: 'w-ali', lesson_id: 'sf-u6-l1', arabic: 'آلِ', transliteration: 'Aali', meaning: 'family of', audio_url: null, order: 4 },
  { id: 'w-kama', lesson_id: 'sf-u6-l1', arabic: 'كَمَا', transliteration: 'kama', meaning: 'just as', audio_url: null, order: 5 },
  { id: 'w-sallayta', lesson_id: 'sf-u6-l1', arabic: 'صَلَّيْتَ', transliteration: 'sallayta', meaning: 'You sent blessings', audio_url: null, order: 6 },
  { id: 'w-ibraheem', lesson_id: 'sf-u6-l1', arabic: 'إِبْرَاهِيمَ', transliteration: 'Ibraheema', meaning: 'Ibrahim (Abraham)', audio_url: null, order: 7 },
  { id: 'w-innaka', lesson_id: 'sf-u6-l1', arabic: 'إِنَّكَ', transliteration: 'Innaka', meaning: 'Indeed You are', audio_url: null, order: 8 },
  { id: 'w-hameedun', lesson_id: 'sf-u6-l1', arabic: 'حَمِيدٌ', transliteration: 'Hameedun', meaning: 'Praiseworthy', audio_url: null, order: 9 },
  { id: 'w-majeedun', lesson_id: 'sf-u6-l1', arabic: 'مَجِيدٌ', transliteration: 'Majeedun', meaning: 'Glorious', audio_url: null, order: 10 },

  // Final Dua: رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
  // + اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ وَمِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ
  { id: 'w-atina', lesson_id: 'sf-u6-l2', arabic: 'آتِنَا', transliteration: 'aatina', meaning: 'give us', audio_url: null, order: 1 },
  { id: 'w-fiddunya', lesson_id: 'sf-u6-l2', arabic: 'فِي الدُّنْيَا', transliteration: 'fid-dunya', meaning: 'in this world', audio_url: null, order: 2 },
  { id: 'w-hasanatan', lesson_id: 'sf-u6-l2', arabic: 'حَسَنَةً', transliteration: 'hasanatan', meaning: 'good/blessing', audio_url: null, order: 3 },
  { id: 'w-alakhirati', lesson_id: 'sf-u6-l2', arabic: 'الْآخِرَةِ', transliteration: 'al-Aakhirati', meaning: 'the Hereafter', audio_url: null, order: 4 },
  { id: 'w-waqina', lesson_id: 'sf-u6-l2', arabic: 'وَقِنَا', transliteration: 'wa qina', meaning: 'and protect us from', audio_url: null, order: 5 },
  { id: 'w-adhaba', lesson_id: 'sf-u6-l2', arabic: 'عَذَابَ', transliteration: '\'adhaba', meaning: 'punishment of', audio_url: null, order: 6 },
  { id: 'w-annar', lesson_id: 'sf-u6-l2', arabic: 'النَّارِ', transliteration: 'an-Nari', meaning: 'the Fire', audio_url: null, order: 7 },
  { id: 'w-audhu2', lesson_id: 'sf-u6-l2', arabic: 'أَعُوذُ', transliteration: 'a\'oodhu', meaning: 'I seek refuge', audio_url: null, order: 8 },
  { id: 'w-bika', lesson_id: 'sf-u6-l2', arabic: 'بِكَ', transliteration: 'bika', meaning: 'in You', audio_url: null, order: 9 },
  { id: 'w-fitnat', lesson_id: 'sf-u6-l2', arabic: 'فِتْنَةِ', transliteration: 'fitnati', meaning: 'trial/tribulation of', audio_url: null, order: 10 },
  { id: 'w-almahya', lesson_id: 'sf-u6-l2', arabic: 'الْمَحْيَا', transliteration: 'al-Mahya', meaning: 'life', audio_url: null, order: 11 },
  { id: 'w-walmamat', lesson_id: 'sf-u6-l2', arabic: 'وَالْمَمَاتِ', transliteration: 'wal-Mamati', meaning: 'and death', audio_url: null, order: 12 },
];

// ============================================================
// Combine all lessons and words
// ============================================================

export const lessons: LessonDef[] = [
  ...u1_lessons,
  ...u2_lessons,
  ...u3_lessons,
  ...u4_lessons,
  ...u5_lessons,
  ...u6_lessons,
];

export const words: WordDef[] = [
  ...u1_words,
  ...u2_words,
  ...u3_words,
  ...u4_words,
  ...u5_words,
  ...u6_words,
];

// ============================================================
// Word-Root Links
// ============================================================

export const wordRoots: WordRootLink[] = [
  // Unit 1: Al-Fatiha
  { word_id: 'w-bismi', root_id: 'r-smw' },
  { word_id: 'w-allahi', root_id: 'r-ilh' },
  { word_id: 'w-arrahman', root_id: 'r-rhm' },
  { word_id: 'w-arraheem', root_id: 'r-rhm' },
  { word_id: 'w-alhamdu', root_id: 'r-hmd' },
  { word_id: 'w-lillahi', root_id: 'r-ilh' },
  { word_id: 'w-rabbi', root_id: 'r-rbb' },
  { word_id: 'w-alameen', root_id: 'r-alm' },
  { word_id: 'w-maliki', root_id: 'r-mlk' },
  { word_id: 'w-yawmi', root_id: 'r-dwn' },
  { word_id: 'w-addeen', root_id: 'r-dwn' },
  { word_id: 'w-nabudu', root_id: 'r-abd' },
  { word_id: 'w-nastaeen', root_id: 'r-awn' },
  { word_id: 'w-ihdina', root_id: 'r-hdy' },
  { word_id: 'w-assirat', root_id: 'r-srt' },
  { word_id: 'w-almustaqeem', root_id: 'r-qwm' },
  { word_id: 'w-alladhina', root_id: 'r-ilh' },
  { word_id: 'w-anamta', root_id: 'r-nam' },
  { word_id: 'w-almaghdubi', root_id: 'r-ghdb' },
  { word_id: 'w-addalleen', root_id: 'r-dll' },

  // Unit 2: Al-Ikhlas
  { word_id: 'w-qul', root_id: 'r-qwl' },
  { word_id: 'w-allahu', root_id: 'r-ilh' },
  { word_id: 'w-ahad', root_id: 'r-ahd' },
  { word_id: 'w-assamad', root_id: 'r-smd' },
  { word_id: 'w-yalid', root_id: 'r-wld' },
  { word_id: 'w-yulad', root_id: 'r-wld' },
  { word_id: 'w-kufuwan', root_id: 'r-kfw' },

  // Unit 2: Al-Falaq
  { word_id: 'w-audhu', root_id: 'r-awdh' },
  { word_id: 'w-birabbi', root_id: 'r-rbb' },
  { word_id: 'w-alfalaq', root_id: 'r-flq' },
  { word_id: 'w-sharri', root_id: 'r-shr' },
  { word_id: 'w-khalaqa', root_id: 'r-khlo' },
  { word_id: 'w-annaffathat', root_id: 'r-nfth' },
  { word_id: 'w-aluqad', root_id: 'r-aqd' },
  { word_id: 'w-hasidin', root_id: 'r-hsd' },
  { word_id: 'w-hasad', root_id: 'r-hsd' },

  // Unit 2: An-Nas
  { word_id: 'w-annas', root_id: 'r-nws' },
  { word_id: 'w-maliki2', root_id: 'r-mlk' },
  { word_id: 'w-ilahi', root_id: 'r-ilh' },
  { word_id: 'w-alwaswas', root_id: 'r-wswis' },
  { word_id: 'w-alkhannas', root_id: 'r-khn' },
  { word_id: 'w-yuwaswisu', root_id: 'r-wswis' },
  { word_id: 'w-sudoor', root_id: 'r-sdr' },
  { word_id: 'w-aljinnati', root_id: 'r-jnn' },

  // Unit 3: Al-Asr
  { word_id: 'w-walasr', root_id: 'r-asr' },
  { word_id: 'w-lakhusr', root_id: 'r-khs' },
  { word_id: 'w-amanu', root_id: 'r-amn' },
  { word_id: 'w-amiloo', root_id: 'r-aml' },
  { word_id: 'w-assalihat', root_id: 'r-slh' },
  { word_id: 'w-tawaasaw', root_id: 'r-wsy' },
  { word_id: 'w-bilhaqqi', root_id: 'r-hqq' },
  { word_id: 'w-bissabr', root_id: 'r-sbr' },

  // Unit 3: Al-Kawthar
  { word_id: 'w-ataynaka', root_id: 'r-aty' },
  { word_id: 'w-alkalwthar', root_id: 'r-kwth' },
  { word_id: 'w-fasalli', root_id: 'r-slw' },
  { word_id: 'w-lirabbika', root_id: 'r-rbb' },
  { word_id: 'w-wanhar', root_id: 'r-nhr' },
  { word_id: 'w-shaaniaka', root_id: 'r-shna' },
  { word_id: 'w-alabtar', root_id: 'r-btr' },

  // Unit 3: Al-Kafirun
  { word_id: 'w-alkafirun', root_id: 'r-kfr' },
  { word_id: 'w-abudu', root_id: 'r-abd' },
  { word_id: 'w-tabudun', root_id: 'r-abd' },
  { word_id: 'w-abidun', root_id: 'r-abd' },
  { word_id: 'w-abadtu', root_id: 'r-abd' },
  { word_id: 'w-abid', root_id: 'r-abd' },
  { word_id: 'w-deenukum', root_id: 'r-dwn' },
  { word_id: 'w-deen', root_id: 'r-dwn' },

  // Unit 4: Opening Dua
  { word_id: 'w-subhanaka', root_id: 'r-sbh' },
  { word_id: 'w-allahumma', root_id: 'r-ilh' },
  { word_id: 'w-wabihamdika', root_id: 'r-hmd' },
  { word_id: 'w-watabaraka', root_id: 'r-brk' },
  { word_id: 'w-ismuka', root_id: 'r-smw' },
  { word_id: 'w-wataala', root_id: 'r-ala' },
  { word_id: 'w-ilaha', root_id: 'r-ilh' },

  // Unit 4: Ruku
  { word_id: 'w-subhana', root_id: 'r-sbh' },
  { word_id: 'w-rabbiya', root_id: 'r-rbb' },
  { word_id: 'w-aladheem', root_id: 'r-adm' },
  { word_id: 'w-samia', root_id: 'r-smaa' },
  { word_id: 'w-allahu2', root_id: 'r-ilh' },
  { word_id: 'w-hamidahu', root_id: 'r-hmd' },
  { word_id: 'w-rabbana', root_id: 'r-rbb' },
  { word_id: 'w-alhamd', root_id: 'r-hmd' },

  // Unit 5: Sujood
  { word_id: 'w-alala', root_id: 'r-ala' },
  { word_id: 'w-rabbi2', root_id: 'r-rbb' },
  { word_id: 'w-ighfir', root_id: 'r-ghfr' },
  { word_id: 'w-warhamni', root_id: 'r-rhm' },
  { word_id: 'w-wahdini', root_id: 'r-hdy' },

  // Unit 5: Tashahhud
  { word_id: 'w-attahiyyatu', root_id: 'r-hyy' },
  { word_id: 'w-wassalawatu', root_id: 'r-slw' },
  { word_id: 'w-wattayyibat', root_id: 'r-tyb' },
  { word_id: 'w-assalamu', root_id: 'r-slm' },
  { word_id: 'w-annabiyyu', root_id: 'r-nby' },
  { word_id: 'w-warahmatu', root_id: 'r-rhm' },
  { word_id: 'w-wabarakatuhu', root_id: 'r-brk' },
  { word_id: 'w-ibadi', root_id: 'r-abd' },
  { word_id: 'w-assaliheen', root_id: 'r-slh' },
  { word_id: 'w-ashhadu', root_id: 'r-shd' },
  { word_id: 'w-abduhu', root_id: 'r-abd' },
  { word_id: 'w-warasuluhu', root_id: 'r-rsl' },

  // Unit 6: Durood
  { word_id: 'w-salli', root_id: 'r-slw' },
  { word_id: 'w-muhammadin', root_id: 'r-hmd' },
  { word_id: 'w-sallayta', root_id: 'r-slw' },
  { word_id: 'w-hameedun', root_id: 'r-hmd' },

  // Unit 6: Final Dua
  { word_id: 'w-adhaba', root_id: 'r-adhb' },
  { word_id: 'w-audhu2', root_id: 'r-awdh' },
  { word_id: 'w-fitnat', root_id: 'r-ftn' },
  { word_id: 'w-almahya', root_id: 'r-hyy' },
  { word_id: 'w-walmamat', root_id: 'r-mwt' },
];
