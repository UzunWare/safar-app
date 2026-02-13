import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Star, ArrowRight, Home, LayoutGrid, Award, Play, ChevronLeft, Volume2, Info, X, Search, Zap, Moon, Sun, Settings, Check, RefreshCw, Type, Layers, Droplets } from 'lucide-react';

/* SAFAR - PROJECT IMPLEMENTATION 
  Based on PRD & SKILL.md
  
  Design System: "Divine Geometry"
  - Palette: Deep Emerald (#0f2e28), Parchment (#f4f1ea), Gold (#cfaa6b), Midnight (#0a1f1b)
  - Typography: Amiri (Arabic), Fraunces (Headings), Outfit (UI)
  - Vibe: Spiritual, Educational, Tactile, "Breathing" Interface
*/

const SafarApp = () => {
    const [currentView, setCurrentView] = useState('onboarding'); // onboarding, dashboard, explore, profile
    const [activeLesson, setActiveLesson] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // User Preferences
    const [preferences, setPreferences] = useState({
        transliteration: true,
        autoPlayAudio: false,
        fontSize: 'medium',
        hapticFeedback: true
    });

    const [userStats, setUserStats] = useState({
        streak: 5,
        totalWords: 14,
        points: 340,
        level: 'Seeker'
    });

    // --- DATA ---

    const PATHWAYS = [
        {
            id: 'salah',
            title: 'The Salah Pathway',
            description: 'Understand what you say in prayer.',
            totalNodes: 12,
            completedNodes: 2,
            color: 'from-emerald-800 to-emerald-950',
            accent: 'text-emerald-300',
            nodes: [
                { id: 1, title: 'The Opening (Al-Fatiha)', type: 'surah', status: 'completed' },
                { id: 2, title: 'The Root: R-H-M', type: 'root', status: 'completed' },
                { id: 3, title: 'Bowing (Ruku)', type: 'root', status: 'active' },
                { id: 4, title: 'The Root: S-J-D', type: 'root', status: 'locked' },
                { id: 5, title: 'Prostration (Sujood)', type: 'action', status: 'locked' },
            ]
        },
        {
            id: 'frequency',
            title: 'High Frequency',
            description: '80% of Quranic vocabulary.',
            totalNodes: 50,
            completedNodes: 0,
            color: 'from-blue-900 to-slate-900',
            accent: 'text-blue-300',
            nodes: [
                { id: 101, title: 'The Connector: Wa', type: 'frequency', status: 'active', wordId: 'wa' },
                { id: 102, title: 'The Vessel: Fi', type: 'frequency', status: 'locked', wordId: 'fi' },
                { id: 103, title: 'The Origin: Min', type: 'frequency', status: 'locked', wordId: 'min' },
            ]
        }
    ];

    const FREQUENCY_DATA = {
        'wa': {
            arabic: "وَ",
            trans: "Wa",
            meaning: "And",
            frequency: 9800, // Approx
            description: "The most common particle. It connects ideas, stories, and blessings.",
            examples: [
                { arabic: "وَالشَّمْسِ", trans: "Wash-shams", meaning: "And the sun" },
                { arabic: "وَالْقَمَرِ", trans: "Wal-qamar", meaning: "And the moon" },
                { arabic: "وَالنَّهَارِ", trans: "Wan-nahar", meaning: "And the day" },
            ]
        }
    };

    const ROOT_DATA = {
        root: "ر-ح-m",
        letters: ["ر", "ح", "م"],
        transliteration: "R-H-M",
        coreMeaning: "Mercy, Compassion",
        derivatives: [
            { arabic: "رَحْمَة", trans: "Rahmah", meaning: "Mercy (Noun)", type: "noun" },
            { arabic: "رَحِيم", trans: "Rahim", meaning: "Especially Merciful", type: "adj" },
            { arabic: "رَحْمَٰن", trans: "Rahman", meaning: "Entirely Merciful", type: "adj" },
            { arabic: "يَرْحَمُ", trans: "Yarhamu", meaning: "He has mercy", type: "verb" },
        ],
        quiz: [
            {
                id: 1,
                question: "Which word means 'Especially Merciful'?",
                type: "multiple-choice",
                options: [
                    { id: 'a', text: "Rahman", arabic: "رَحْمَٰن" },
                    { id: 'b', text: "Rahim", arabic: "رَحِيم" },
                    { id: 'c', text: "Rahmah", arabic: "رَحْمَة" }
                ],
                correctId: 'b'
            },
            {
                id: 2,
                question: "What is the core meaning of R-H-M?",
                type: "concept",
                options: [
                    { id: 'a', text: "Power & Authority" },
                    { id: 'b', text: "Writing & Recording" },
                    { id: 'c', text: "Mercy & Compassion" }
                ],
                correctId: 'c'
            }
        ]
    };

    const SURAH_DATA = {
        title: "Al-Fatiha",
        ayahs: [
            {
                text: "الرَّحْمَٰنِ الرَّحِيمِ",
                translation: "The Entirely Merciful, The Especially Merciful",
                words: [
                    { arabic: "الرَّحْمَٰنِ", trans: "Ar-Rahman", meaning: "The Entirely Merciful", root: "R-H-M" },
                    { arabic: "الرَّحِيمِ", trans: "Ar-Rahim", meaning: "The Especially Merciful", root: "R-H-M" }
                ]
            }
        ]
    };

    const ROOTS_LIST = [
        { root: "ك-ت-ب", trans: "K-T-B", meaning: "Writing / Book", derivatives: 12 },
        { root: "ر-ح-م", trans: "R-H-M", meaning: "Mercy", derivatives: 8 },
        { root: "ع-ل-م", trans: "A-L-M", meaning: "Knowledge", derivatives: 15 },
        { root: "س-ج-د", trans: "S-J-D", meaning: "Prostration", derivatives: 6 },
        { root: "ح-م-د", trans: "H-M-D", meaning: "Praise", derivatives: 9 },
        { root: "ق-و-ل", trans: "Q-W-L", meaning: "Speech", derivatives: 22 },
    ];

    const BADGES = [
        { id: 1, name: "First Step", icon: "🌱", earned: true, date: "Jan 12" },
        { id: 2, name: "Root Seeker", icon: "🔍", earned: true, date: "Jan 14" },
        { id: 3, name: "Salah Master", icon: "🕌", earned: false, date: null },
        { id: 4, name: "Daily Star", icon: "⭐", earned: false, date: null },
    ];

    // --- HELPER COMPONENTS ---

    const TextureOverlay = () => (
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
        </div>
    );

    const BackgroundPattern = ({ opacity = 0.05 }) => (
        <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000`} style={{ opacity }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="islamic-geo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#islamic-geo)" className="text-amber-900" />
            </svg>
        </div>
    );

    const Navigation = ({ active, setActive }) => (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0a1f1b]/95 text-[#e8dcc5] px-8 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-40 flex gap-10 items-center border border-[#cfaa6b]/20 backdrop-blur-xl">
            <button onClick={() => setActive('dashboard')} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active === 'dashboard' ? 'text-[#cfaa6b] -translate-y-1' : 'opacity-40 hover:opacity-80'}`}>
                <Home size={22} strokeWidth={active === 'dashboard' ? 2 : 1.5} />
            </button>
            <div className="w-px h-8 bg-[#cfaa6b]/10"></div>
            <button onClick={() => setActive('explore')} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active === 'explore' ? 'text-[#cfaa6b] -translate-y-1' : 'opacity-40 hover:opacity-80'}`}>
                <LayoutGrid size={22} strokeWidth={active === 'explore' ? 2 : 1.5} />
            </button>
            <div className="w-px h-8 bg-[#cfaa6b]/10"></div>
            <button onClick={() => setActive('profile')} className={`flex flex-col items-center gap-1 transition-all duration-300 ${active === 'profile' ? 'text-[#cfaa6b] -translate-y-1' : 'opacity-40 hover:opacity-80'}`}>
                <Award size={22} strokeWidth={active === 'profile' ? 2 : 1.5} />
            </button>
        </div>
    );

    const SettingsModal = ({ isOpen, onClose, prefs, setPrefs }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[#0a1f1b]/80 backdrop-blur-sm" onClick={onClose}></div>
                <div className="bg-[#f4f1ea] text-[#0f2e28] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative z-10 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-fraunces text-2xl">Traveler's Kit</h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5"><X size={20} /></button>
                    </div>

                    <div className="space-y-6">
                        {/* Transliteration Toggle */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#0f2e28]/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#cfaa6b]/20 flex items-center justify-center text-[#0f2e28]">
                                    <Type size={18} />
                                </div>
                                <div>
                                    <p className="font-fraunces text-lg leading-tight">Transliteration</p>
                                    <p className="font-outfit text-xs opacity-60">Show English pronunciation</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPrefs({ ...prefs, transliteration: !prefs.transliteration })}
                                className={`w-12 h-7 rounded-full transition-colors relative ${prefs.transliteration ? 'bg-[#0f2e28]' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${prefs.transliteration ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Audio Auto-play */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#0f2e28]/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#0f2e28]/10 flex items-center justify-center text-[#0f2e28]">
                                    <Volume2 size={18} />
                                </div>
                                <div>
                                    <p className="font-fraunces text-lg leading-tight">Auto-play Audio</p>
                                    <p className="font-outfit text-xs opacity-60">Hear words automatically</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPrefs({ ...prefs, autoPlayAudio: !prefs.autoPlayAudio })}
                                className={`w-12 h-7 rounded-full transition-colors relative ${prefs.autoPlayAudio ? 'bg-[#0f2e28]' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${prefs.autoPlayAudio ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="pt-4 border-t border-[#0f2e28]/10 text-center">
                            <p className="font-outfit text-xs opacity-40 uppercase tracking-widest">Version 0.8.2 • Safar Beta</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- VIEWS ---

    const OnboardingView = () => (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a1f1b] text-[#e8dcc5] relative overflow-hidden">
            <BackgroundPattern opacity={0.1} />
            <div className="z-10 flex flex-col items-center text-center p-8 animate-fade-in-up">
                <div className="w-28 h-28 mb-10 relative">
                    <div className="absolute inset-0 bg-[#cfaa6b] rounded-full opacity-10 animate-pulse-slow"></div>
                    <div className="absolute inset-4 border border-[#cfaa6b] rounded-full flex items-center justify-center rotate-45">
                        <div className="w-2 h-2 bg-[#cfaa6b] rounded-full"></div>
                    </div>
                    <BookOpen className="absolute inset-0 m-auto text-[#cfaa6b]" size={36} strokeWidth={1} />
                </div>

                <h1 className="text-7xl font-amiri text-[#e8dcc5] mb-4 tracking-wide drop-shadow-lg">سَفَر</h1>
                <h2 className="text-4xl font-fraunces font-light text-[#cfaa6b] mb-6">Safar</h2>

                <p className="text-xl text-[#e8dcc5]/70 max-w-xs font-outfit font-light leading-relaxed mb-16">
                    The journey from recitation<br />to conversation.
                </p>

                <button
                    onClick={() => setCurrentView('dashboard')}
                    className="group relative px-10 py-5 bg-[#cfaa6b] text-[#0a1f1b] rounded-2xl font-fraunces font-semibold text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(207,170,107,0.4)]"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        Begin Journey <ArrowRight size={20} />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>
        </div>
    );

    const DashboardView = () => (
        <div className="min-h-screen bg-[#f4f1ea] text-[#0f2e28] pb-32 relative">
            <div className="sticky top-0 z-30 bg-[#f4f1ea]/90 backdrop-blur-md px-6 py-6 border-b border-[#0f2e28]/5 flex justify-between items-end">
                <div>
                    <p className="text-xs font-outfit uppercase tracking-widest text-[#0f2e28]/50 mb-1">Current Path</p>
                    <h2 className="text-3xl font-fraunces text-[#0f2e28]">Your Journey</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full border border-[#0f2e28]/10 flex items-center justify-center text-[#0f2e28] hover:bg-[#0f2e28]/5">
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8 animate-fade-in-up">
                {PATHWAYS.map((path) => (
                    <div key={path.id} className="relative group cursor-pointer"
                        onClick={() => {
                            const targetNode = path.id === 'frequency'
                                ? path.nodes[0]
                                : path.nodes[0].type === 'surah' ? path.nodes[0] : path.nodes[2];
                            setActiveLesson(targetNode);
                        }}>
                        <div className={`rounded-[2rem] p-8 overflow-hidden relative shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br ${path.color} text-white`}>
                            <div className="absolute top-0 right-0 p-40 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 p-32 bg-[#cfaa6b] opacity-[0.05] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm ${path.accent} flex items-center justify-center border border-white/10`}>
                                        {path.id === 'frequency' ? <Droplets size={24} /> : <BookOpen size={24} />}
                                    </div>
                                    <span className="text-xs font-outfit uppercase tracking-wider font-medium text-white/70 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                        {path.completedNodes}/{path.totalNodes} Steps
                                    </span>
                                </div>

                                <h3 className="text-3xl font-fraunces mb-2 leading-tight">{path.title}</h3>
                                <p className="font-outfit font-light opacity-80 mb-8 max-w-[90%] leading-relaxed">{path.description}</p>

                                <div className="flex items-center gap-4">
                                    {path.nodes.slice(0, 4).map((node, idx) => (
                                        <div key={idx} className="flex items-center group/node">
                                            <div className={`w-4 h-4 rounded-full transition-all duration-300 relative
                            ${node.status === 'completed' ? 'bg-[#cfaa6b] scale-100' : node.status === 'active' ? 'bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-white/20 scale-90'}`}>
                                                {node.status === 'active' && <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50"></div>}
                                            </div>
                                            {idx < 3 && <div className={`w-6 h-0.5 rounded-full mx-1 ${node.status === 'completed' ? 'bg-[#cfaa6b]' : 'bg-white/10'}`}></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#0f2e28]/5 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#cfaa6b]/10 rounded-bl-[4rem] transition-transform group-hover:scale-110 origin-top-right"></div>
                    <h4 className="font-fraunces text-lg mb-4 text-[#0f2e28] flex items-center gap-2">
                        <Sun size={18} className="text-[#cfaa6b]" />
                        Word of the Day
                    </h4>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-4xl font-amiri text-[#0f2e28] mb-1">صَبْر</p>
                            <p className="font-outfit text-sm text-[#0f2e28]/60 font-medium">Sabr • Patience/Perseverance</p>
                        </div>
                        <button className="w-12 h-12 rounded-full bg-[#f4f1ea] flex items-center justify-center text-[#0f2e28] hover:bg-[#0f2e28] hover:text-[#cfaa6b] transition-colors shadow-sm">
                            <Volume2 size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const ExploreView = () => (
        <div className="min-h-screen bg-[#0a1f1b] text-[#e8dcc5] pb-32">
            <div className="sticky top-0 z-30 bg-[#0a1f1b]/90 backdrop-blur-md px-6 py-6 border-b border-[#cfaa6b]/10">
                <h2 className="text-3xl font-fraunces text-[#e8dcc5] mb-6">Root Garden</h2>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cfaa6b]/50" size={20} />
                    <input
                        type="text"
                        placeholder="Search via English, Arabic or Transliteration..."
                        className="w-full bg-white/5 border border-[#cfaa6b]/20 rounded-xl py-4 pl-12 pr-4 text-[#e8dcc5] placeholder:text-[#e8dcc5]/30 focus:outline-none focus:border-[#cfaa6b]/50 transition-colors font-outfit"
                    />
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4 animate-fade-in-up">
                {ROOTS_LIST.map((item, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 hover:border-[#cfaa6b]/30 transition-all cursor-pointer group"
                        onClick={() => setActiveLesson({ id: `root-${idx}`, title: `The Root: ${item.trans}`, type: 'root', status: 'active' })}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="font-amiri text-2xl text-[#cfaa6b]">{item.root}</span>
                            <span className="text-[10px] font-outfit uppercase tracking-widest opacity-40 bg-black/30 px-2 py-1 rounded-md">{item.derivatives} words</span>
                        </div>
                        <h3 className="font-fraunces text-lg mb-1">{item.trans}</h3>
                        <p className="text-sm font-outfit opacity-60 group-hover:opacity-100 transition-opacity">{item.meaning}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const ProfileView = () => (
        <div className="min-h-screen bg-[#f4f1ea] text-[#0f2e28] pb-32">
            <div className="p-6 pt-12 animate-fade-in-up">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-fraunces text-[#0f2e28] mb-1">Traveler's Log</h2>
                        <p className="font-outfit opacity-60">Level: {userStats.level}</p>
                    </div>
                    <button onClick={() => setShowSettings(true)} className="w-16 h-16 rounded-full bg-[#0f2e28] text-[#cfaa6b] flex items-center justify-center font-amiri text-2xl border-2 border-[#cfaa6b]">
                        ع
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#0f2e28]/5 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-[#cfaa6b]/20 flex items-center justify-center mb-3 text-[#0f2e28]">
                            <Zap size={20} className="fill-[#0f2e28]" />
                        </div>
                        <span className="text-3xl font-fraunces text-[#0f2e28]">{userStats.streak}</span>
                        <span className="text-xs font-outfit uppercase tracking-widest opacity-50">Day Streak</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#0f2e28]/5 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-[#0f2e28]/10 flex items-center justify-center mb-3 text-[#0f2e28]">
                            <BookOpen size={20} />
                        </div>
                        <span className="text-3xl font-fraunces text-[#0f2e28]">{userStats.totalWords}</span>
                        <span className="text-xs font-outfit uppercase tracking-widest opacity-50">Roots Known</span>
                    </div>
                </div>

                <h3 className="font-fraunces text-xl mb-4">Milestones</h3>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#0f2e28]/5">
                    <div className="grid grid-cols-4 gap-4">
                        {BADGES.map(badge => (
                            <div key={badge.id} className="flex flex-col items-center gap-2">
                                <div className={`w-14 h-14 rounded-xl rotate-45 flex items-center justify-center text-2xl shadow-sm transition-all
                     ${badge.earned ? 'bg-[#0f2e28] text-white border-2 border-[#cfaa6b]' : 'bg-[#f4f1ea] grayscale opacity-50 border border-[#0f2e28]/10'}`}>
                                    <span className="-rotate-45">{badge.icon}</span>
                                </div>
                                <span className="text-[10px] font-outfit text-center uppercase tracking-wide opacity-60 mt-2">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const LessonView = ({ lesson, onExit }) => {
        const [step, setStep] = useState(0);
        const [bloomState, setBloomState] = useState('closed'); // for root lesson
        const [selectedWord, setSelectedWord] = useState(null); // for surah lesson

        // Quiz State
        const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
        const [quizSelectedOption, setQuizSelectedOption] = useState(null);
        const [quizFeedback, setQuizFeedback] = useState(null); // 'correct' | 'incorrect'

        useEffect(() => {
            if (lesson.type === 'root' && step === 1) {
                setTimeout(() => setBloomState('open'), 500);
            }
        }, [step, lesson.type]);

        const handleQuizOptionSelect = (optionId) => {
            if (quizFeedback) return; // Prevent clicking during feedback
            setQuizSelectedOption(optionId);

            const currentQ = ROOT_DATA.quiz[quizQuestionIndex];
            if (optionId === currentQ.correctId) {
                setQuizFeedback('correct');
                setTimeout(() => {
                    if (quizQuestionIndex < ROOT_DATA.quiz.length - 1) {
                        setQuizQuestionIndex(prev => prev + 1);
                        setQuizSelectedOption(null);
                        setQuizFeedback(null);
                    } else {
                        onExit(); // End of lesson
                    }
                }, 1500);
            } else {
                setQuizFeedback('incorrect');
                setTimeout(() => {
                    setQuizFeedback(null);
                    setQuizSelectedOption(null);
                }, 1000);
            }
        };

        // --- FREQUENCY LESSON CONTENT (NEW) ---
        const FrequencyLesson = () => {
            const data = FREQUENCY_DATA[lesson.wordId] || FREQUENCY_DATA['wa'];
            const [viewState, setViewState] = useState('intro'); // intro, flow, examples

            // Animation for the "Stream" of text
            const StreamText = () => (
                <div className="absolute inset-0 flex flex-col justify-center gap-4 opacity-10 pointer-events-none overflow-hidden select-none">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="whitespace-nowrap font-amiri text-4xl text-[#cfaa6b] animate-scroll-text" style={{ animationDuration: `${20 + i * 5}s` }}>
                            وَالشَّمْسِ وَضُحَاهَا وَالْقَمَرِ إِذَا تَلَاهَا وَالنَّهَارِ إِذَا جَلَّاهَا وَاللَّيْلِ إِذَا يَغْشَاهَا
                        </div>
                    ))}
                </div>
            );

            return (
                <div className="w-full max-w-lg mx-auto flex flex-col h-full animate-fade-in-up pt-4 relative">

                    {viewState === 'intro' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                            <div className="relative mb-12 group cursor-pointer" onClick={() => setViewState('examples')}>
                                {/* Glowing Orb Background */}
                                <div className="absolute inset-0 bg-[#cfaa6b] rounded-full blur-[80px] opacity-20 animate-pulse-slow"></div>

                                {/* Central Word Tile */}
                                <div className="relative w-48 h-48 bg-[#0a1f1b] border-2 border-[#cfaa6b] rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(207,170,107,0.15)] transition-transform hover:scale-105 duration-500">
                                    <span className="font-amiri text-8xl text-[#e8dcc5] mb-2 drop-shadow-lg">{data.arabic}</span>
                                    <span className="font-outfit uppercase tracking-[0.3em] text-[#cfaa6b] text-sm">Particle</span>
                                </div>
                            </div>

                            <h2 className="text-4xl font-fraunces text-[#e8dcc5] mb-2">{data.trans}</h2>
                            <p className="text-2xl text-[#cfaa6b] font-serif italic mb-6">"{data.meaning}"</p>

                            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 max-w-xs mx-auto backdrop-blur-sm">
                                <p className="font-outfit text-sm text-[#e8dcc5]/80 leading-relaxed">{data.description}</p>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-xs font-outfit uppercase tracking-widest text-[#cfaa6b] opacity-80">Frequency</p>
                                    <p className="font-fraunces text-xl text-[#e8dcc5]">{data.frequency.toLocaleString()} times</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setViewState('examples')}
                                className="mt-12 group flex flex-col items-center gap-2 text-[#e8dcc5]/60 hover:text-[#cfaa6b] transition-colors"
                            >
                                <span className="text-xs font-outfit uppercase tracking-widest">See Examples</span>
                                <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:bg-[#cfaa6b] group-hover:text-[#0a1f1b] transition-all">
                                    <ArrowRight size={18} />
                                </div>
                            </button>
                        </div>
                    )}

                    {viewState === 'examples' && (
                        <div className="flex-1 flex flex-col pt-8 z-10 w-full animate-fade-in-up">
                            <StreamText />

                            <h3 className="text-center font-fraunces text-[#cfaa6b] mb-8 text-xl relative z-20">The Foundation</h3>

                            <div className="space-y-4 relative z-20 px-4">
                                {data.examples.map((ex, i) => (
                                    <div key={i} className="bg-[#f4f1ea] text-[#0f2e28] rounded-2xl p-6 shadow-lg border border-[#cfaa6b]/20 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#cfaa6b]/20 rounded-bl-full"></div>

                                        <div className="flex justify-between items-center mb-4">
                                            <p className="font-amiri text-4xl text-right w-full" dir="rtl">
                                                {/* Highlight the specific particle */}
                                                {ex.arabic.split(data.arabic).map((part, idx, arr) => (
                                                    <React.Fragment key={idx}>
                                                        {part}
                                                        {idx < arr.length - 1 && <span className="text-[#cfaa6b] font-bold">{data.arabic}</span>}
                                                    </React.Fragment>
                                                ))}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-end border-t border-[#0f2e28]/10 pt-4">
                                            <div>
                                                <p className="font-fraunces text-lg text-[#0f2e28]">{ex.trans}</p>
                                                <p className="font-outfit text-sm text-[#0f2e28]/60 italic">{ex.meaning}</p>
                                            </div>
                                            <button className="p-2 rounded-full bg-[#0f2e28]/5 hover:bg-[#0f2e28] hover:text-[#cfaa6b] transition-colors">
                                                <Volume2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto mb-8 text-center relative z-20">
                                <button
                                    onClick={onExit}
                                    className="bg-[#cfaa6b] text-[#0a1f1b] px-12 py-4 rounded-xl font-fraunces font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(207,170,107,0.3)]"
                                >
                                    Complete Lesson
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        // --- ROOT LESSON CONTENT ---
        const RootLesson = () => (
            <>
                {step === 0 && (
                    <div className="text-center animate-fade-in-up">
                        <span className="inline-block px-4 py-1.5 rounded-full border border-[#cfaa6b]/30 bg-[#cfaa6b]/10 text-[#cfaa6b] text-xs font-outfit uppercase tracking-widest mb-8">
                            New Concept
                        </span>
                        <h2 className="text-5xl font-fraunces mb-6">The Root System</h2>
                        <p className="text-xl font-outfit font-light opacity-80 leading-relaxed max-w-sm mx-auto mb-16">
                            Arabic words are grown like trees. They start from a 3-letter "seed" called a Root.
                        </p>
                        <button
                            onClick={() => setStep(1)}
                            className="bg-[#e8dcc5] text-[#0f2e28] px-10 py-4 rounded-xl font-fraunces font-semibold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(232,220,197,0.3)]"
                        >
                            Show me
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div className="w-full max-w-md h-[500px] relative flex flex-col items-center justify-center">
                        {/* THE ROOT BLOOM VISUALIZATION */}
                        <div className="relative w-64 h-64 flex items-center justify-center">

                            {ROOT_DATA.derivatives.map((word, idx) => {
                                const angle = (idx * 90) - 45;
                                const radius = 150;
                                const x = Math.cos(angle * Math.PI / 180) * radius;
                                const y = Math.sin(angle * Math.PI / 180) * radius;

                                return (
                                    <div
                                        key={idx}
                                        className={`absolute flex flex-col items-center transition-all duration-1000 ease-out`}
                                        style={{
                                            transform: bloomState === 'open'
                                                ? `translate(${x}px, ${y}px)`
                                                : 'translate(0px, 0px) scale(0)',
                                            opacity: bloomState === 'open' ? 1 : 0
                                        }}
                                    >
                                        <div className="bg-[#e8dcc5] text-[#0f2e28] w-20 h-20 rounded-2xl rotate-45 flex items-center justify-center shadow-2xl border-2 border-[#cfaa6b] hover:scale-110 transition-transform cursor-pointer group">
                                            <span className="-rotate-45 font-amiri text-2xl font-bold group-hover:text-[#cfaa6b] transition-colors">{word.arabic}</span>
                                        </div>
                                        <div className="mt-4 text-center">
                                            {preferences.transliteration && <p className="font-fraunces text-[#cfaa6b] text-sm">{word.trans}</p>}
                                            <p className="font-outfit text-xs opacity-70">{word.meaning}</p>
                                        </div>
                                        <div className="absolute top-1/2 left-1/2 w-[1px] bg-[#cfaa6b]/50 origin-top -z-10"
                                            style={{
                                                height: '150px',
                                                transform: `rotate(${angle + 225}deg)`,
                                                top: 'auto', left: 'auto', bottom: '50%', right: '50%'
                                            }}>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className={`relative z-20 w-32 h-32 bg-[#0f2e28] border-2 border-[#cfaa6b] rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(207,170,107,0.2)] transition-all duration-700 ${bloomState === 'open' ? 'scale-100' : 'scale-110'}`}>
                                <div className="text-4xl font-amiri text-[#e8dcc5] mb-1">{ROOT_DATA.root}</div>
                                <div className="text-[10px] font-outfit uppercase tracking-widest text-[#cfaa6b]">Root</div>
                            </div>
                        </div>

                        <div className={`mt-20 text-center transition-all duration-1000 ${bloomState === 'open' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <h3 className="text-3xl font-fraunces mb-2 text-[#cfaa6b]">R - H - M</h3>
                            <p className="font-outfit opacity-70 text-lg">The root for "Mercy"</p>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className={`absolute bottom-0 right-0 p-4 bg-[#cfaa6b] rounded-full text-[#0f2e28] transition-all duration-500 hover:scale-110 shadow-lg ${bloomState === 'open' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="w-full max-w-sm animate-fade-in-up">
                        {/* QUIZ SYSTEM */}
                        <div className="flex justify-between items-center mb-6 opacity-60">
                            <span className="text-xs font-outfit uppercase tracking-widest">Question {quizQuestionIndex + 1} of {ROOT_DATA.quiz.length}</span>
                            <div className="flex gap-1">
                                {ROOT_DATA.quiz.map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i === quizQuestionIndex ? 'bg-[#cfaa6b]' : i < quizQuestionIndex ? 'bg-[#cfaa6b]/40' : 'bg-white/10'}`}></div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#e8dcc5]/10 backdrop-blur-md rounded-3xl p-8 border border-[#cfaa6b]/20 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
                            {/* Feedback Overlay */}
                            {quizFeedback === 'correct' && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0f2e28]/80 backdrop-blur-sm animate-fade-in-up">
                                    <div className="w-20 h-20 rounded-full bg-[#cfaa6b] flex items-center justify-center text-[#0f2e28]">
                                        <Check size={40} />
                                    </div>
                                </div>
                            )}

                            <h3 className="text-center font-fraunces text-2xl mb-8 leading-relaxed">{ROOT_DATA.quiz[quizQuestionIndex].question}</h3>

                            <div className="space-y-3">
                                {ROOT_DATA.quiz[quizQuestionIndex].options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleQuizOptionSelect(opt.id)}
                                        className={`w-full p-4 rounded-xl border transition-all font-outfit text-lg flex items-center justify-between group
                           ${quizSelectedOption === opt.id
                                                ? quizFeedback === 'incorrect'
                                                    ? 'bg-red-500/20 border-red-500 text-red-100 shake-animation'
                                                    : 'bg-[#cfaa6b] border-[#cfaa6b] text-[#0f2e28]'
                                                : 'border-white/10 hover:bg-[#cfaa6b]/10 hover:border-[#cfaa6b]/30'}`}
                                    >
                                        <span className={opt.arabic ? "font-amiri text-2xl" : "font-outfit"}>{opt.arabic || opt.text}</span>
                                        {opt.arabic && <span className="text-sm opacity-60 font-outfit">{opt.text}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );

        // --- SURAH LESSON CONTENT (VERSE BREAKDOWN) ---
        const SurahLesson = () => (
            <div className="w-full max-w-lg mx-auto flex flex-col h-full animate-fade-in-up pt-10">
                <div className="text-center mb-12 relative">
                    <h3 className="font-fraunces text-[#cfaa6b] mb-8 text-xl">The Opening • Verse 1</h3>

                    <div className="flex flex-wrap justify-center gap-4 dir-rtl text-right" style={{ direction: 'rtl' }}>
                        {SURAH_DATA.ayahs[0].words.map((word, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedWord(word)}
                                className={`font-amiri text-5xl leading-loose px-2 rounded-lg transition-all duration-300 
                    ${selectedWord === word
                                        ? 'text-[#cfaa6b] bg-[#cfaa6b]/10 scale-110'
                                        : 'text-[#e8dcc5] hover:text-[#cfaa6b]/80'}`}
                            >
                                {word.arabic}
                            </button>
                        ))}
                    </div>

                    <p className="mt-8 font-outfit text-xl font-light opacity-80 max-w-xs mx-auto">
                        "{SURAH_DATA.ayahs[0].translation}"
                    </p>
                </div>

                {/* Word Analysis Panel */}
                <div className={`flex-1 bg-[#f4f1ea] text-[#0f2e28] rounded-t-[2.5rem] p-8 transition-transform duration-500 ease-out transform ${selectedWord ? 'translate-y-0' : 'translate-y-full opacity-50'}`}>
                    {selectedWord ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-[#0f2e28]/10 text-[#0f2e28] rounded-full text-[10px] font-outfit uppercase tracking-widest mb-2">Word Analysis</span>
                                    <h2 className="text-4xl font-amiri">{selectedWord.arabic}</h2>
                                </div>
                                <button className="w-12 h-12 rounded-full bg-[#0f2e28] text-[#cfaa6b] flex items-center justify-center hover:scale-110 transition-transform">
                                    <Volume2 size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-outfit opacity-50 uppercase tracking-wide mb-1">Translation</p>
                                    <p className="text-2xl font-fraunces">{selectedWord.trans}</p>
                                    <p className="text-lg text-[#0f2e28]/70">{selectedWord.meaning}</p>
                                </div>

                                <div className="p-4 bg-[#cfaa6b]/10 rounded-2xl border border-[#cfaa6b]/20 flex items-center gap-4 cursor-pointer hover:bg-[#cfaa6b]/20 transition-colors">
                                    <div className="w-10 h-10 bg-[#0f2e28] rounded-full flex items-center justify-center text-[#cfaa6b]">
                                        <Search size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-outfit uppercase tracking-widest text-[#0f2e28]/60">Root Family</p>
                                        <p className="font-amiri text-xl">{selectedWord.root}</p>
                                    </div>
                                    <ArrowRight size={16} className="ml-auto opacity-50" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-start pt-10 opacity-40">
                            <p className="font-outfit uppercase tracking-widest text-sm">Tap a word above to analyze</p>
                        </div>
                    )}
                </div>
            </div>
        );

        // ROUTER FOR LESSON TYPES
        const renderContent = () => {
            switch (lesson.type) {
                case 'frequency': return <FrequencyLesson />;
                case 'root': return <RootLesson />;
                case 'surah': return <SurahLesson />;
                default: return <RootLesson />;
            }
        };

        return (
            <div className="fixed inset-0 bg-[#0a1f1b] text-[#e8dcc5] z-50 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 flex justify-between items-center z-10">
                    <button onClick={onExit} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <X size={24} />
                    </button>

                    {(lesson.type === 'root' || lesson.type === 'surah') && (
                        <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#cfaa6b] transition-all duration-500" style={{ width: `${(step + 1) * 33}%` }}></div>
                        </div>
                    )}

                    <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <Info size={24} />
                    </button>
                </div>

                {/* Content Container */}
                <div className="flex-1 flex flex-col items-center relative px-6 w-full max-w-2xl mx-auto">
                    <BackgroundPattern opacity={0.05} />
                    {renderContent()}
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---

    return (
        <div className="font-outfit antialiased selection:bg-[#cfaa6b] selection:text-[#0f2e28] bg-[#0a1f1b] min-h-screen">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600&family=Outfit:wght@300;400;500;700&display=swap');
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes scroll-text {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-pulse-slow { animation: pulse-slow 4s infinite ease-in-out; }
        .animate-scroll-text { animation: scroll-text 30s linear infinite; }
        .shake-animation { animation: shake 0.4s ease-in-out; }
        .font-amiri { font-family: 'Amiri', serif; }
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
      `}</style>

            <TextureOverlay />

            {/* View Router */}
            {currentView === 'onboarding' && <OnboardingView />}
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'explore' && <ExploreView />}
            {currentView === 'profile' && <ProfileView />}

            {/* Navigation (Hidden on Onboarding) */}
            {currentView !== 'onboarding' && <Navigation active={currentView} setActive={setCurrentView} />}

            {/* Lesson Modal Overlay */}
            {activeLesson && (
                <LessonView
                    lesson={activeLesson}
                    onExit={() => setActiveLesson(null)}
                />
            )}

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                prefs={preferences}
                setPrefs={setPreferences}
            />

        </div>
    );
};

export default SafarApp;