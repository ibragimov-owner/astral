/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FILE: src/App.tsx
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Languages, 
  Heart, 
  User, 
  ChevronRight, 
  Calendar,
  Compass,
  Stars,
  ArrowLeft,
  Search,
  Orbit,
  Type,
  CheckCircle2,
  AlertCircle,
  History,
  Trash2,
  X
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";
import { ZODIAC_SIGNS, getZodiacSign, ZodiacSign } from "./constants/zodiac";
import { TRANSLATIONS, Language } from "./i18n/translations";
import { NAME_MEANINGS, LETTER_ANALYSIS, NameInfo } from "./constants/nameMeanings";
import { Profile } from "./components/Profile";
import { HelpSupport } from "./components/HelpSupport";

// --- Types ---
type View = "home" | "horoscope" | "quiz" | "nameAnalysis" | "dualHoroscopia" | "result" | "history" | "settings" | "profile" | "help";
type Category = "all" | "love" | "career" | "health" | "luck";

interface HistoryItem {
  id: string;
  type: "horoscope" | "compatibility" | "quiz" | "name" | "dual";
  title: string;
  result: string;
  timestamp: number;
}

interface QuizQuestion {
  id: number;
  questionEn: string;
  questionUz: string;
  options: {
    labelEn: string;
    labelUz: string;
    value: string;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    questionEn: "How do you prefer to spend your weekend?",
    questionUz: "Dam olish kunini qanday o'tkazishni afzal ko'rasiz?",
    options: [
      { labelEn: "Exploring new places", labelUz: "Yangi joylarni kashf qilish", value: "E" },
      { labelEn: "Relaxing at home with a book", labelUz: "Uyda kitob o'qib dam olish", value: "I" },
    ]
  },
  {
    id: 2,
    questionEn: "When making a decision, you follow your:",
    questionUz: "Qaror qabul qilishda nimaga tayanasiz?",
    options: [
      { labelEn: "Heart & Intuition", labelUz: "Qalb va intuitsiya", value: "F" },
      { labelEn: "Brain & Logic", labelUz: "Aql va mantiq", value: "T" },
    ]
  },
  {
    id: 3,
    questionEn: "In a group meeting, you are usually:",
    questionUz: "Guruh uchrashuvlarida siz odatda:",
    options: [
      { labelEn: "The one leading the conversation", labelUz: "Suhbatni boshqaruvchi", value: "E" },
      { labelEn: "The one listening and observing", labelUz: "Tinglovchi va kuzatuvchi", value: "I" },
    ]
  },
  {
    id: 4,
    questionEn: "Do you prefer a strict schedule?",
    questionUz: "Aniq jadvalga amal qilishni yoqtirasizni?",
    options: [
      { labelEn: "Yes, I love planning", labelUz: "Ha, rejalashtirishni yaxshi ko'raman", value: "J" },
      { labelEn: "No, I go with the flow", labelUz: "Yo'q, vaziyatga qarab ish tutaman", value: "P" },
    ]
  },
  {
    id: 5,
    questionEn: "What inspires you more?",
    questionUz: "Sizga nima ko'proq ilhom beradi?",
    options: [
      { labelEn: "Big abstract ideas", labelUz: "Katta va mavhum g'oyalar", value: "N" },
      { labelEn: "Practical facts and details", labelUz: "Amaliy dalillar va detallar", value: "S" },
    ]
  }
];

// --- AI Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [lang, setLang] = useState<Language>("uz");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [view, setView] = useState<View>("home");
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [partnerSign, setPartnerSign] = useState<ZodiacSign | null>(null);

  // Horoscope Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [horoscopeCategory, setHoroscopeCategory] = useState<Category>("all");

  // Name Analysis State
  const [inputName, setInputName] = useState("");
  const [inputName2, setInputName2] = useState("");
  const [isDualMode, setIsDualMode] = useState(false);
  const [nameResult, setNameResult] = useState<{ 
    name: string; 
    name2?: string;
    info: NameInfo | null; 
    info2?: NameInfo | null;
    letterAnalysis?: string[];
    letterAnalysis2?: string[];
    summary?: string;
  } | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("astral_history", JSON.stringify(updated));
  };

  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  
  // Settings State
  const [isBioEnabled, setIsBioEnabled] = useState(false);

  // User Profile State
  const [profile, setProfile] = useState({
    fullName: "Astral User",
    email: "user@astral.io",
    birthDate: "1995-01-01"
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("astral_profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
    
    const savedHistory = localStorage.getItem("astral_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    
    const bio = localStorage.getItem("astral_bio");
    if (bio === "true") setIsBioEnabled(true);
  }, []);

  const toggleBio = async () => {
    const next = !isBioEnabled;
    
    // Simulate Biometric Auth if enabling
    if (next) {
      if (window.PublicKeyCredential) {
        try {
          // This is a minimal simulate-only approach as per instructions
          // Real WebAuthn requires server-side ceremony
          console.log("Simulating Biometric Registration...");
          // alert("Simulating Biometric Auth...");
        } catch (e) {
          console.error("Biometric simulation failed", e);
          return;
        }
      }
    }

    setIsBioEnabled(next);
    localStorage.setItem("astral_bio", String(next));
  };

  const handleSaveProfile = (newProfile: any) => {
    setProfile(newProfile);
    localStorage.setItem("astral_profile", JSON.stringify(newProfile));
  };

  const exportData = () => {
    const data = {
      history,
      lang,
      theme,
      isBioEnabled
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astral_data_${new Date().toISOString()}.json`;
    a.click();
  };

  const saveToHistory = (item: Omit<HistoryItem, "id" | "timestamp">) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };
    const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem("astral_history", JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("astral_history");
  };

  const t = TRANSLATIONS[lang];

  // --- Effects ---
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, aiResponse, nameResult]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // --- Horoscope Filter Logic ---
  const filteredSigns = useMemo(() => {
    return ZODIAC_SIGNS.filter(sign => {
      const nameMatch = (lang === "en" ? sign.name : sign.uzName).toLowerCase().includes(searchQuery.toLowerCase());
      const traitMatch = (lang === "en" ? sign.traits : sign.uzTraits).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return nameMatch || traitMatch;
    });
  }, [searchQuery, lang]);

  // --- Handlers ---
  const handleGetDailyHoroscope = async (sign: ZodiacSign, category: Category = "all") => {
    setLoading(true);
    setView("result");
    setSelectedSign(sign);
    setAiResponse("");
    setNameResult(null);
    
    try {
      const prompt = `Generate a detailed daily horoscope for ${sign.name}. 
      Category focus: ${category === "all" ? "General, Love, Career, Health, Luck" : category}.
      Language: ${lang === "en" ? "English" : "Uzbek"}.
      Current Date: ${new Date().toDateString()}.
      Style: Professional astrology, insightful.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const text = response.text || "The stars are silent today.";
      setAiResponse(text);
      saveToHistory({
        type: "horoscope",
        title: `${sign.name} - ${category}`,
        result: text
      });
    } catch (error) {
      setAiResponse("Failed to connect to the cosmos. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleAnalyzeName = async () => {
    const normalized = inputName.trim().toLowerCase();
    if (!normalized) return;

    setLoading(true);
    setView("result");
    setAiResponse("");
    
    // Dataset check
    const info = NAME_MEANINGS[normalized] || null;
    
    // Letter analysis
    const analysis = inputName.toLowerCase().split("").map(char => {
      const item = LETTER_ANALYSIS[char];
      return item ? `${char.toUpperCase()} - ${lang === "en" ? item.en : item.uz}: ${lang === "en" ? item.trait : item.uzTrait}` : "";
    }).filter(Boolean);

    try {
      const prompt = `Provide a deep personality summary and emotional tone for the name "${inputName}". 
      Explain its whole meaning if it exists in history/etymology.
      Language: ${lang === "en" ? "English" : "Uzbek"}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const summary = response.text || "";
      setNameResult({ 
        name: inputName, 
        info, 
        letterAnalysis: analysis,
        summary
      });

      saveToHistory({
        type: "name",
        title: `${inputName}`,
        result: summary
      });
    } catch (e) {
      setNameResult({ name: inputName, info, letterAnalysis: analysis });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeDual = async () => {
    const n1 = inputName.trim();
    const n2 = inputName2.trim();
    if (!n1 || !n2) return;

    setLoading(true);
    setView("result");
    setAiResponse("");

    const norm1 = n1.toLowerCase();
    const norm2 = n2.toLowerCase();

    const info1 = NAME_MEANINGS[norm1] || null;
    const info2 = NAME_MEANINGS[norm2] || null;

    const analysis1 = n1.toLowerCase().split("").map(char => {
      const item = LETTER_ANALYSIS[char];
      return item ? `${char.toUpperCase()} - ${lang === "en" ? item.en : item.uz}: ${lang === "en" ? item.trait : item.uzTrait}` : "";
    }).filter(Boolean);

    const analysis2 = n2.toLowerCase().split("").map(char => {
      const item = LETTER_ANALYSIS[char];
      return item ? `${char.toUpperCase()} - ${lang === "en" ? item.en : item.uz}: ${lang === "en" ? item.trait : item.uzTrait}` : "";
    }).filter(Boolean);

    try {
      const prompt = `Perform a dual analysis and comparison between two entities (names): "${n1}" and "${n2}".
      Provide:
      1. Compatibility/Resonance score (0-100%)
      2. Shared Traits (visual list)
      3. Differences (visual list)
      4. Visual comparison bars representation description.
      Language: ${lang === "en" ? "English" : "Uzbek"}.
      Format clearly with Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const summary = response.text || "";
      setNameResult({
        name: n1,
        name2: n2,
        info: info1,
        info2: info2,
        letterAnalysis: analysis1,
        letterAnalysis2: analysis2,
        summary
      });

      saveToHistory({
        type: "dual",
        title: `${n1} vs ${n2}`,
        result: summary
      });
    } catch (e) {
      setAiResponse("Dual analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (value: string) => {
    const nextAnswers = { ...quizAnswers, [quizStep]: value };
    setQuizAnswers(nextAnswers);
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(prev => prev + 1);
    }
  };

  const finalizeQuiz = async () => {
    setLoading(true);
    setView("result");
    try {
      const answerSummary = Object.values(quizAnswers).join(", ");
      const prompt = `Based on these personality choices: [${answerSummary}].
      Generate a personality profile. 
      Language: ${lang === "en" ? "English" : "Uzbek"}.
      Format: Markdown. Include Personality Name, Description, and Zodiac Compatibility Recommendations.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const text = response.text || "Quiz failed.";
      setAiResponse(text);
      saveToHistory({
        type: "quiz",
        title: "Astral Quiz Result",
        result: text
      });
    } catch (e) {
      setAiResponse("Failed to analyze personality.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDualHoroscopia = async () => {
    if (!selectedSign || !partnerSign) return;
    setLoading(true);
    setView("result");
    setAiResponse("");
    setNameResult(null);
    
    try {
      const prompt = `Analyze the cosmic resonance and compatibility between zodiac signs: ${selectedSign.name} and ${partnerSign.name}.
      Explain their shared energies, divergent forces, and provide a compatibility score out of 100%.
      Language: ${lang === "en" ? "English" : "Uzbek"}.
      Format with clear sections.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const text = response.text || "Resonance indeterminate.";
      setAiResponse(text);
      saveToHistory({
        type: "compatibility",
        title: `${selectedSign.name} + ${partnerSign.name}`,
        result: text
      });
    } catch (error) {
      setAiResponse("Failed to establish spectral link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 flex",
      theme === "dark" 
        ? "bg-[#0b0c10] text-[#c5c6c7] selection:bg-[#66fcf1] selection:text-black" 
        : "bg-[#f4f7f6] text-[#1f2833] selection:bg-[#45a29e]"
    )}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#66fcf1] blur-[250px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#45a29e] blur-[220px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-white/5 bg-black/20 backdrop-blur-3xl sticky top-0 h-screen z-50">
        <div className="p-8 space-y-12 flex flex-col h-full">
          {/* Brand */}
          <div 
            className="flex items-center gap-4 cursor-pointer group" 
            onClick={() => setView("home")}
          >
            <div className="bg-gradient-to-tr from-[#66fcf1] to-[#45a29e] p-3 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-[#66fcf1]/20">
              <Orbit className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#66fcf1] to-white">
                {t.title}
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40 leading-none mt-1.5">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <SidebarItem 
              active={view === "home"} 
              icon={<Sparkles className="w-5 h-5" />} 
              label={t.home} 
              onClick={() => setView("home")} 
            />
            <SidebarItem 
              active={view === "horoscope"} 
              icon={<Calendar className="w-5 h-5" />} 
              label={t.dailyHoroscope} 
              onClick={() => setView("horoscope")} 
            />
            <SidebarItem 
              active={view === "dualHoroscopia"} 
              icon={<Heart className="w-5 h-5" />} 
              label={t.dualHoroscopia} 
              onClick={() => setView("dualHoroscopia")} 
            />
            <SidebarItem 
              active={view === "quiz"} 
              icon={<Compass className="w-5 h-5" />} 
              label={t.personality} 
              onClick={() => setView("quiz")} 
            />
            <SidebarItem 
              active={view === "nameAnalysis" && !isDualMode} 
              icon={<Type className="w-5 h-5" />} 
              label={t.nameMeaning} 
              onClick={() => {
                setIsDualMode(false);
                setView("nameAnalysis");
              }} 
            />
            <SidebarItem 
              active={view === "nameAnalysis" && isDualMode} 
              icon={<Stars className="w-5 h-5" />} 
              label={t.dualAnalysis} 
              onClick={() => {
                setIsDualMode(true);
                setView("nameAnalysis");
              }} 
            />
            <SidebarItem 
              active={view === "profile"} 
              icon={<User className="w-5 h-5" />} 
              label={t.profile} 
              onClick={() => setView("profile")} 
            />
            <SidebarItem 
              active={view === "history"} 
              icon={<History className="w-5 h-5" />} 
              label={t.history} 
              onClick={() => setView("history")} 
            />
            <div className="pt-6 opacity-30 px-4">
              <div className="h-px bg-white/10 w-full" />
            </div>
            <SidebarItem active={view === "settings"} icon={<ArrowLeft className="w-5 h-5 rotate-180" />} label={t.settings} onClick={() => setView("settings")} />
            <SidebarItem active={view === "help"} icon={<AlertCircle className="w-5 h-5" />} label={t.help} onClick={() => setView("help")} />
          </nav>

          {/* Premium Panel */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-[2rem] p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-base font-black text-white">{t.premiumTitle}</h4>
              <ul className="space-y-2.5">
                {[t.premiumFeature1, t.premiumFeature2, t.premiumFeature3, t.premiumFeature4].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] opacity-60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#66fcf1]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full py-3.5 bg-[#66fcf1] text-black text-xs font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#66fcf1]/20">
              {t.premiumButton}
            </button>
          </div>

          <p className="text-[10px] opacity-20 text-center font-medium">
            © 2026 {t.title} Barcha huquqlar himoyalangan.
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-end items-center transition-all bg-black/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === "en" ? "uz" : "en")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-[#66fcf1]/10 hover:border-[#66fcf1]/30 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <Languages className="w-4 h-4" />
              {lang === "en" ? "UZ" : "EN"}
            </button>
            
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setView("profile")}
              className="w-10 h-10 rounded-full border-2 border-[#66fcf1]/20 p-0.5 cursor-pointer hover:border-[#66fcf1]/50 transition-all"
            >
               <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#66fcf1] to-[#45a29e] flex items-center justify-center overflow-hidden">
                 {/* Simplified avatar, could be an image */}
                 <User className="w-5 h-5 text-black" />
               </div>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-10 relative z-10 overflow-y-auto pb-32 lg:pb-10">
          <AnimatePresence mode="wait">
            {view === "settings" && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-10 py-10"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black">{t.settings}</h2>
                  <button onClick={() => setView("home")} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Profile & Language */}
                  <div className="space-y-6">
                        <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-[#66fcf1]/10 rounded-xl">
                            <User className="w-6 h-6 text-[#66fcf1]" />
                         </div>
                         <h3 className="text-xl font-bold">{t.profile}</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase opacity-40">{t.fullName}</span>
                          <span className="font-bold">{profile.fullName}</span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <button 
                          onClick={() => setView("profile")}
                          className="w-full py-4 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#66fcf1]/10 hover:border-[#66fcf1]/30 transition-all"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-[#66fcf1]/10 rounded-xl">
                            <Languages className="w-6 h-6 text-[#66fcf1]" />
                         </div>
                         <h3 className="text-xl font-bold">{t.language}</h3>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setLang("en")}
                          className={cn(
                            "flex-1 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all",
                            lang === "en" ? "bg-[#66fcf1] text-black" : "bg-white/5 border border-white/10"
                          )}
                        >
                          English
                        </button>
                        <button 
                          onClick={() => setLang("uz")}
                          className={cn(
                            "flex-1 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all",
                            lang === "uz" ? "bg-[#66fcf1] text-black" : "bg-white/5 border border-white/10"
                          )}
                        >
                          O'zbek
                        </button>
                      </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-[#66fcf1]/10 rounded-xl">
                            <Sun className="w-6 h-6 text-[#66fcf1]" />
                         </div>
                         <h3 className="text-xl font-bold">UI Theme</h3>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setTheme("light")}
                          className={cn(
                            "flex-1 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all",
                            theme === "light" ? "bg-[#66fcf1] text-black" : "bg-white/5 border border-white/10"
                          )}
                        >
                          {t.lightMode}
                        </button>
                        <button 
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "flex-1 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all",
                            theme === "dark" ? "bg-[#66fcf1] text-black" : "bg-white/5 border border-white/10"
                          )}
                        >
                          {t.darkMode}
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* Security & Data */}
                  <div className="space-y-6">
                    <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-[#66fcf1]/10 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-[#66fcf1]" />
                         </div>
                         <h3 className="text-xl font-bold">{t.privacy}</h3>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                         <div className="space-y-1">
                            <p className="text-sm font-bold">{t.biometrics}</p>
                            <p className="text-[10px] opacity-40">{t.bioDescription}</p>
                         </div>
                         <button 
                            onClick={toggleBio}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all relative",
                              isBioEnabled ? "bg-[#66fcf1]" : "bg-white/10"
                            )}
                         >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 rounded-full transition-all bg-white",
                              isBioEnabled ? "right-1 bg-black" : "left-1"
                            )} />
                         </button>
                      </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-[#66fcf1]/10 rounded-xl">
                            <Trash2 className="w-6 h-6 text-[#66fcf1]" />
                         </div>
                         <h3 className="text-xl font-bold">{t.testConfig}</h3>
                         <span className="ml-auto px-3 py-1 bg-[#66fcf1]/10 text-[#66fcf1] border border-[#66fcf1]/20 text-[9px] font-black uppercase tracking-widest rounded-full">{t.comingSoon}</span>
                      </div>
                      <p className="text-xs opacity-30 italic">{t.dataDescription}</p>
                      <div className="flex gap-4">
                         <button 
                          onClick={exportData}
                          className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[#66fcf1]/40 transition-all"
                         >
                           {t.exportData}
                         </button>
                         <button 
                          onClick={clearHistory}
                          className="flex-1 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
                         >
                           {t.resetData}
                         </button>
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            )}

            {view === "profile" && (
              <motion.div 
                key="profile-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                 <button 
                  onClick={() => setView("home")}
                  className="flex items-center gap-2 group mb-8"
                >
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#66fcf1]/20 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  <span className="font-bold opacity-50 group-hover:opacity-100">{t.back}</span>
                </button>
                <Profile t={t} profile={profile} onSave={handleSaveProfile} />
              </motion.div>
            )}

            {view === "help" && (
              <motion.div 
                key="help-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button 
                  onClick={() => setView("home")}
                  className="flex items-center gap-2 group mb-8"
                >
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#66fcf1]/20 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  <span className="font-bold opacity-50 group-hover:opacity-100">{t.back}</span>
                </button>
                <HelpSupport t={t} />
              </motion.div>
            )}

            {view === "home" && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-16"
              >
                {/* Hero Section */}
                <section className="flex flex-col lg:flex-row justify-between items-center bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden relative group transition-all">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#66fcf1]/5 to-transparent pointer-events-none" />
                  <div className="space-y-6 relative z-10 text-center lg:text-left">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                      {t.welcomeTitle}
                    </h2>
                    <p className="max-w-md mx-auto lg:mx-0 text-base md:text-lg opacity-60 leading-relaxed font-light">
                      {t.welcomeSubtitle}
                    </p>
                  </div>
                  
                  <div className="hidden lg:block relative h-48 w-48">
                    <div className="absolute inset-0 bg-[#66fcf1]/10 blur-[60px] rounded-full animate-pulse" />
                    <Orbit className="w-full h-full text-[#66fcf1] opacity-20 absolute rotate-12" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-[#66fcf1] animate-bounce" />
                  </div>
                </section>

                {/* Main Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard 
                    icon={<Calendar className="w-7 h-7" />}
                    title={t.cardHoroscopeTitle}
                    desc={t.cardHoroscopeDesc}
                    color="blue"
                    action={t.view}
                    onClick={() => setView("horoscope")}
                  />
                  <FeatureCard 
                    icon={<Heart className="w-7 h-7" />}
                    title={t.cardDualHoroscopiaTitle}
                    desc={t.cardDualHoroscopiaDesc}
                    color="pink"
                    action={t.analyze}
                    onClick={() => setView("dualHoroscopia")}
                  />
                  <FeatureCard 
                    icon={<Compass className="w-7 h-7" />}
                    title={t.cardQuizTitle}
                    desc={t.cardQuizDesc}
                    color="cyan"
                    action={t.start}
                    onClick={() => {
                        setQuizStep(0);
                        setQuizAnswers({});
                        setView("quiz");
                    }}
                  />
                  <FeatureCard 
                    icon={<Type className="w-7 h-7" />}
                    title={t.cardNameTitle}
                    desc={t.cardNameDesc}
                    color="yellow"
                    action={t.analyze}
                    onClick={() => {
                        setIsDualMode(false);
                        setView("nameAnalysis");
                    }}
                  />
                  <FeatureCard 
                    icon={<Stars className="w-7 h-7" />}
                    title={t.cardBurjTitle}
                    desc={t.cardBurjDesc}
                    color="purple"
                    action={t.analyze}
                    onClick={() => {
                        setIsDualMode(true);
                        setView("nameAnalysis");
                    }}
                  />
                  <FeatureCard 
                    icon={<History className="w-7 h-7" />}
                    title={t.cardHistoryTitle}
                    desc={t.cardHistoryDesc}
                    color="pink"
                    action={t.view}
                    onClick={() => setView("history")}
                  />
                </div>

                {/* Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Inspiration */}
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6 group">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-[#66fcf1]" />
                      {t.dailyInspiration}
                    </h3>
                    <div className="relative">
                      <span className="absolute -top-6 -left-4 text-7xl text-[#66fcf1]/20 font-serif leading-none">“</span>
                      <p className="text-2xl font-light italic opacity-80 leading-snug pl-4">
                        {t.dailyQuote}
                      </p>
                    </div>
                  </div>

                  {/* Advice */}
                  <div className="bg-[#66fcf1]/5 border border-[#66fcf1]/10 rounded-[2.5rem] p-10 space-y-8 flex items-center gap-8 group">
                    <div className="bg-[#66fcf1]/10 p-6 rounded-[2rem] group-hover:rotate-12 transition-transform shadow-2xl shadow-[#66fcf1]/10">
                      <Orbit className="w-12 h-12 text-[#66fcf1]" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-white">{t.dailyAdvice}</h3>
                      <p className="text-lg opacity-70 leading-relaxed font-light">
                        {t.dailyAdviceText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Analysis Table-like Section */}
                <section className="space-y-8">
                   <div className="flex justify-between items-center">
                     <h3 className="text-2xl font-black text-white">{t.recentAnalysis}</h3>
                     <button onClick={() => setView("history")} className="text-[#66fcf1] text-xs font-black uppercase tracking-widest hover:underline underline-offset-8">
                       {t.view} All
                     </button>
                   </div>
                   
                   <div className="grid gap-4">
                     {history.length > 0 ? (
                       history.slice(0, 3).map(item => (
                         <div 
                           key={item.id}
                           className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-[#66fcf1]/30 transition-all cursor-pointer"
                           onClick={() => {
                             setAiResponse(item.result);
                             setNameResult(null);
                             setView("result");
                           }}
                         >
                           <div className="flex items-center gap-6">
                             <div className="p-3 bg-[#66fcf1]/10 rounded-2xl group-hover:bg-[#66fcf1]/20 transition-colors">
                                <History className="w-6 h-6 text-[#66fcf1]" />
                             </div>
                             <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-[#45a29e]/20 text-[#66fcf1] rounded-full">
                                    {item.type}
                                  </span>
                                  <span className="text-sm opacity-30 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-xl font-bold">{item.title}</h4>
                             </div>
                           </div>
                           <ChevronRight className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                         </div>
                       ))
                     ) : (
                        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] py-20 text-center opacity-30 space-y-4">
                           <History className="w-12 h-12 mx-auto" />
                           <p className="text-xl font-light">No records found in archives.</p>
                        </div>
                     )}
                   </div>
                </section>
              </motion.div>
            )}

          {view === "horoscope" && (
            <motion.div 
              key="horoscope"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-10"
            >
              <button 
                onClick={() => setView("home")}
                className="flex items-center gap-2 group mx-auto md:mx-0"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#66fcf1]/20 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-bold opacity-50 group-hover:opacity-100">{t.back}</span>
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="text-4xl font-black">{t.dailyHoroscope}</h2>

                <div className="relative group w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30 group-focus-within:text-[#66fcf1] group-focus-within:opacity-100 transition-all" />
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-[#66fcf1] outline-none transition-all placeholder:opacity-30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSigns.length > 0 ? (
                  filteredSigns.map((sign) => (
                    <motion.div 
                      key={sign.id} 
                      layout 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <ZodiacPill 
                        sign={sign} 
                        lang={lang}
                        onClick={() => handleGetDailyHoroscope(sign)}
                        theme={theme}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 mx-auto opacity-20" />
                    <p className="text-xl opacity-40 font-light">{t.noResults}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === "nameAnalysis" && (
            <motion.div 
              key="name-analysis"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-2xl mx-auto space-y-12 py-12"
            >
              <button 
                onClick={() => setView("home")}
                className="flex items-center gap-2 group mx-auto md:mx-0"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#66fcf1]/20 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-bold opacity-50 group-hover:opacity-100">{t.back}</span>
              </button>

              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-[#66fcf1]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                   <Type className="w-10 h-10 text-[#66fcf1]" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter">
                  {isDualMode ? t.dualAnalysis : t.nameMeaning}
                </h2>
                <p className="opacity-50">
                  {isDualMode 
                    ? "Enter two names to see how their core astral structures resonate." 
                    : "Enter a name to discover its unique astral signature and inherited traits."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 mb-4 justify-center">
                   <button 
                    onClick={() => setIsDualMode(false)}
                    className={cn(
                      "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                      !isDualMode ? "bg-[#66fcf1] text-black" : "bg-white/5 border border-white/10"
                    )}
                   >
                     {t.singleName}
                   </button>
                   <button 
                    onClick={() => setIsDualMode(true)}
                    className={cn(
                      "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                      isDualMode ? "bg-[#66fcf1] text-black" : "bg-white/5 border border-white/10"
                    )}
                   >
                     {t.dualName}
                   </button>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder={t.namePlaceolder}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-10 text-2xl font-bold focus:ring-4 focus:ring-[#66fcf1]/20 outline-none transition-all placeholder:opacity-20 text-center"
                  />
                  
                  {isDualMode && (
                    <motion.input 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text" 
                      value={inputName2}
                      onChange={(e) => setInputName2(e.target.value)}
                      placeholder={t.name2Placeolder}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-10 text-2xl font-bold focus:ring-4 focus:ring-[#66fcf1]/20 outline-none transition-all placeholder:opacity-20 text-center"
                    />
                  )}

                  <button 
                    onClick={isDualMode ? handleAnalyzeDual : handleAnalyzeName}
                    disabled={isDualMode ? (!inputName.trim() || !inputName2.trim()) : !inputName.trim()}
                    className="w-full py-6 bg-[#66fcf1] text-black text-xl font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#66fcf1]/20 disabled:opacity-30 disabled:scale-100"
                  >
                    {isDualMode ? t.analyzeDual : t.analyzeName}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "dualHoroscopia" && (
            <motion.div 
              key="dualHoroscopia"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-16 py-12"
            >
              <button 
                onClick={() => setView("home")}
                className="flex items-center gap-2 group mx-auto md:mx-0"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#66fcf1]/20 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-bold opacity-50 group-hover:opacity-100">{t.back}</span>
              </button>

              <h2 className="text-4xl font-black">{t.dualHoroscopia}</h2>

              <div className="flex flex-col md:flex-row items-center justify-center gap-16 max-w-5xl mx-auto">
                <div className="space-y-6 text-center flex-1 w-full">
                  <p className="text-xs uppercase font-black tracking-[0.3em] opacity-40">Your Astral Identity</p>
                  <SignSelector 
                    selected={selectedSign} 
                    onSelect={setSelectedSign} 
                    theme={theme} 
                    placeholder={t.selectSign}
                  />
                </div>
                
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-[#66fcf1]/10 p-8 rounded-[3rem] shadow-2xl shadow-[#66fcf1]/20 border border-[#66fcf1]/20"
                >
                  <Heart className="w-16 h-16 text-[#66fcf1] fill-[#66fcf1]/30" />
                </motion.div>

                <div className="space-y-6 text-center flex-1 w-full">
                  <p className="text-xs uppercase font-black tracking-[0.3em] opacity-40">Target Astral Resonance</p>
                  <SignSelector 
                    selected={partnerSign} 
                    onSelect={setPartnerSign} 
                    theme={theme} 
                    placeholder={t.partnerSign}
                  />
                </div>
              </div>

              <div className="text-center pt-8">
                <button 
                  disabled={!selectedSign || !partnerSign}
                  onClick={handleCheckDualHoroscopia}
                  className="px-16 py-6 bg-[#66fcf1] text-black font-black text-xl rounded-full hover:scale-110 hover:-rotate-1 active:scale-95 transition-all shadow-2xl shadow-[#66fcf1]/40 disabled:opacity-20 disabled:scale-100"
                >
                  Calculate Resonance
                </button>
              </div>
            </motion.div>
          )}

          {view === "history" && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto space-y-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView("home")} className="p-3 bg-white/5 rounded-2xl hover:bg-[#66fcf1]/10 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-4xl font-black">{t.history}</h2>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 font-black uppercase text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.clearHistory}</span>
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                {history.length > 0 ? (
                  history.map(item => (
                    <div 
                      key={item.id}
                      className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-[#66fcf1]/30 transition-all cursor-pointer"
                      onClick={() => {
                        setAiResponse(item.result);
                        setNameResult(null);
                        setView("result");
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#66fcf1]/10 transition-colors">
                          <History className="w-5 h-5 text-[#66fcf1]" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-[#66fcf1]/10 text-[#66fcf1] rounded-md">
                              {item.type}
                            </span>
                            <span className="text-sm opacity-40 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-xl font-bold">{item.title}</h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-3 rounded-xl hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <ChevronRight className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 opacity-20 space-y-4">
                    <Stars className="w-12 h-12 mx-auto" />
                    <p className="text-xl">Archives are empty.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === "quiz" && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto py-12 space-y-10"
            >
              <button 
                onClick={() => setView("home")}
                className="flex items-center gap-2 group mx-auto md:mx-0"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-[#66fcf1]/20 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="font-bold opacity-50 group-hover:opacity-100">{t.back}</span>
              </button>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-40">
                  <span>{t.question} {quizStep + 1} / {QUIZ_QUESTIONS.length}</span>
                  <span>{Math.round(((quizStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    className="h-full bg-[#66fcf1]" 
                  />
                </div>
              </div>

              <div className="space-y-12">
                <h2 className="text-4xl font-black leading-tight">
                  {lang === "en" ? QUIZ_QUESTIONS[quizStep].questionEn : QUIZ_QUESTIONS[quizStep].questionUz}
                </h2>

                <div className="grid gap-4">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => handleQuizAnswer(opt.value)}
                      className={cn(
                        "p-8 rounded-3xl border-2 text-left transition-all relative overflow-hidden group",
                        quizAnswers[quizStep] === opt.value 
                          ? "bg-[#66fcf1] border-[#66fcf1] text-black" 
                          : "bg-white/5 border-white/5 hover:border-[#66fcf1]/50"
                      )}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-xl font-bold">{lang === "en" ? opt.labelEn : opt.labelUz}</span>
                        {quizAnswers[quizStep] === opt.value && <CheckCircle2 className="w-6 h-6" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <button 
                  onClick={() => setQuizStep(s => Math.max(0, s - 1))}
                  disabled={quizStep === 0}
                  className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-20 transition-all font-bold"
                >
                  {t.previous}
                </button>
                
                {quizStep === QUIZ_QUESTIONS.length - 1 ? (
                  <button 
                    onClick={finalizeQuiz}
                    disabled={!quizAnswers[quizStep]}
                    className="px-12 py-3 bg-[#66fcf1] text-black rounded-full font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                  >
                    {t.finish}
                  </button>
                ) : (
                  <button 
                    onClick={() => setQuizStep(s => s + 1)}
                    disabled={!quizAnswers[quizStep]}
                    className="px-12 py-3 bg-white text-black rounded-full font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                  >
                    {t.next}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {view === "result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-4xl mx-auto py-12 px-4"
            >
              <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <button 
                  onClick={() => setView("home")}
                  className="flex items-center gap-4 group w-fit cursor-pointer"
                >
                  <div className="p-3.5 rounded-2xl bg-white/5 group-hover:bg-[#66fcf1]/20 transition-all border border-white/10 group-hover:border-[#66fcf1]/30">
                    <ArrowLeft className="w-6 h-6 text-[#66fcf1]" />
                  </div>
                  <div className="flex flex-col items-start translate-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t.back}</span>
                    <span className="font-bold text-lg leading-tight uppercase tracking-widest">{t.home}</span>
                  </div>
                </button>
                
                <div className="flex flex-col items-start md:items-end gap-2">
                   <div className="px-5 py-2 bg-[#66fcf1]/10 border border-[#66fcf1]/30 rounded-full backdrop-blur-xl">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#66fcf1]">Spectral Analysis Mode</span>
                   </div>
                   {nameResult && (
                    <h2 className="text-4xl md:text-7xl font-black uppercase text-white tracking-tighter drop-shadow-2xl">
                      {nameResult.name}
                    </h2>
                   )}
                </div>
              </div>

              <div className={cn(
                "p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] border-2 border-white/5 relative",
                theme === "dark" 
                  ? "bg-[#111111]/80 backdrop-blur-3xl" 
                  : "bg-white shadow-2xl shadow-[#66fcf1]/10"
              )}>
                {/* Decorative backgrounds */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#66fcf1]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#45a29e]/5 blur-[120px] rounded-full" />

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-12">
                    <div className="relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="text-[#66fcf1]/10"
                      >
                        <Stars className="w-32 h-32" />
                      </motion.div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-10 h-10 text-[#66fcf1]" />
                        </motion.div>
                      </div>
                    </div>
                    <p className="text-3xl font-black tracking-[0.3em] uppercase text-white animate-pulse">{t.analyzing}</p>
                  </div>
                ) : (
                  <div className="relative z-10">
                    {nameResult ? (
                      <NameResultView result={nameResult} lang={lang} t={t} />
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-none"
                      >
                        <div className="markdown-body">
                          <ReactMarkdown>
                            {aiResponse}
                          </ReactMarkdown>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 bg-black/60 backdrop-blur-3xl border border-white/10 px-6 py-2 flex items-center justify-around rounded-[2rem] shadow-2xl">
        <MobileNavBtn active={view === "home"} icon={<Sparkles className="w-5 h-5" />} onClick={() => setView("home")} />
        <MobileNavBtn active={view === "horoscope"} icon={<Calendar className="w-5 h-5" />} onClick={() => setView("horoscope")} />
        <MobileNavBtn active={view === "dualHoroscopia"} icon={<Heart className="w-5 h-5" />} onClick={() => setView("dualHoroscopia")} />
        <MobileNavBtn active={view === "nameAnalysis" && isDualMode} icon={<Stars className="w-5 h-5" />} onClick={() => {
          setIsDualMode(true);
          setView("nameAnalysis");
        }} />
        <MobileNavBtn active={view === "history"} icon={<History className="w-5 h-5" />} onClick={() => setView("history")} />
        <MobileNavBtn active={view === "settings"} icon={<ArrowLeft className="w-5 h-5 rotate-180" />} onClick={() => setView("settings")} />
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
        <div className="flex items-center gap-2">
           <Orbit className="w-5 h-5 text-[#66fcf1]" />
           <span className="font-black tracking-tighter text-xl">ASTRAL</span>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.4em]">
          Celestial Intelligence Engine • {new Date().getFullYear()}
        </p>
      </footer>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function NameResultView({ result, lang, t }: { result: { name: string; name2?: string; info: NameInfo | null; info2?: NameInfo | null; letterAnalysis?: string[]; letterAnalysis2?: string[]; summary?: string }; lang: Language; t: any }) {
  return (
    <div className="space-y-16">
      {result.summary && (
        <section className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#66fcf1]">{t.interpretation}</h4>
          <div className="markdown-body">
            <ReactMarkdown>{result.summary}</ReactMarkdown>
          </div>
        </section>
      )}

      <div className={cn("grid gap-12", result.name2 ? "md:grid-cols-2" : "grid-cols-1")}>
        {/* Name 1 Analysis */}
        <div className="space-y-12">
          {result.name2 && <h3 className="text-3xl font-black text-[#66fcf1] border-b border-white/10 pb-4">{result.name}</h3>}
          
          {result.info && (
            <div className="space-y-12">
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#66fcf1] opacity-50">{t.meaning}</h4>
                <p className="text-3xl font-bold leading-tight">
                  {lang === "en" ? result.info.meaning : result.info.uzMeaning}
                </p>
              </section>

              <section className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#66fcf1] opacity-50">{t.personalityTraits}</h4>
                <div className="flex flex-wrap gap-2">
                  {(lang === "en" ? result.info.traits : result.info.uzTraits).map((trait, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl font-bold text-xs">
                      {trait}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {result.letterAnalysis && (
            <section className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#66fcf1] opacity-50">{t.spectralTrace}</h4>
              <div className="grid gap-3">
                {result.letterAnalysis.map((line, idx) => (
                  <div key={idx} className="flex gap-4 items-start border-l border-[#66fcf1]/30 pl-4 py-1">
                    <p className="text-sm opacity-70 leading-relaxed italic">{line}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Name 2 Analysis */}
        {result.name2 && (
          <div className="space-y-12">
             <h3 className="text-3xl font-black text-[#66fcf1] border-b border-white/10 pb-4">{result.name2}</h3>
             
             {result.info2 && (
              <div className="space-y-12">
                <section className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#66fcf1] opacity-50">{t.meaning}</h4>
                  <p className="text-3xl font-bold leading-tight">
                    {lang === "en" ? result.info2.meaning : result.info2.uzMeaning}
                  </p>
                </section>

                <section className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#66fcf1] opacity-50">{t.personalityTraits}</h4>
                  <div className="flex flex-wrap gap-2">
                    {(lang === "en" ? result.info2.traits : result.info2.uzTraits).map((trait, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl font-bold text-xs">
                        {trait}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {result.letterAnalysis2 && (
              <section className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#66fcf1] opacity-50">{t.spectralTrace}</h4>
                <div className="grid gap-3">
                  {result.letterAnalysis2.map((line, idx) => (
                    <div key={idx} className="flex gap-4 items-start border-l border-[#66fcf1]/30 pl-4 py-1">
                      <p className="text-sm opacity-70 leading-relaxed italic">{line}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function SidebarItem({ active, icon, label, onClick }: { active?: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden",
        active 
          ? "bg-[#66fcf1]/10 text-[#66fcf1]" 
          : "hover:bg-white/[0.03] text-white/50 hover:text-white"
      )}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#66fcf1] rounded-r-full shadow-[0_0_15px_#66fcf1]" />}
      <div className={cn("transition-transform group-hover:scale-110", active ? "text-[#66fcf1]" : "")}>
        {icon}
      </div>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}

function MobileNavBtn({ active, icon, onClick }: { active?: boolean; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-2xl transition-all relative",
        active ? "text-[#66fcf1]" : "text-white/40"
      )}
    >
      {active && (
        <motion.div 
          layoutId="mobile-nav-indicator"
          className="absolute -top-1 w-10 h-1 bg-[#66fcf1] rounded-full shadow-[0_0_15px_#66fcf1]" 
        />
      )}
      {icon}
    </button>
  );
}

function FeatureCard({ icon, title, desc, onClick, color = "cyan", action }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void, color?: string, action?: string }) {
  const themes = {
    purple: "from-[#8b5cf6] shadow-[#8b5cf6]/10 hover:border-[#8b5cf6]/50",
    blue: "from-[#3b82f6] shadow-[#3b82f6]/10 hover:border-[#3b82f6]/50",
    cyan: "from-[#06b6d4] shadow-[#06b6d4]/10 hover:border-[#06b6d4]/50",
    yellow: "from-[#eab308] shadow-[#eab308]/10 hover:border-[#eab308]/50",
    pink: "from-[#ec4899] shadow-[#ec4899]/10 hover:border-[#ec4899]/50",
  };

  const themeHex = {
    purple: "#8b5cf6",
    blue: "#3b82f6",
    cyan: "#06b6d4",
    yellow: "#eab308",
    pink: "#ec4899",
  } as any;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={onClick}
      className={cn(
        "p-8 rounded-[3rem] bg-white/5 border border-white/5 backdrop-blur-3xl transition-all cursor-pointer group shadow-2xl relative overflow-hidden",
        themes[color as keyof typeof themes]
      )}
    >
      <div 
        className={cn(
          "p-4 rounded-2xl mb-8 w-fit transition-transform group-hover:rotate-12 duration-500"
        )}
        style={{ backgroundColor: `${themeHex[color as keyof typeof themeHex]}15`, color: themeHex[color as keyof typeof themeHex] }}
      >
        {icon}
      </div>

      <div className="space-y-2 mb-10">
        <h3 className="text-2xl font-black text-white leading-tight">{title}</h3>
        <p className="text-sm opacity-40 font-light leading-relaxed">{desc}</p>
      </div>

      <div 
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity group-hover:opacity-100 opacity-60"
        style={{ color: themeHex[color as keyof typeof themeHex] }}
      >
        {action || "Tahlil"} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

function ZodiacPill({ sign, lang, onClick, theme }: { sign: ZodiacSign, lang: Language, onClick: () => void, theme: string }) {
  return (
    <motion.button 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-8 rounded-[3rem] border border-white/5 flex flex-col items-center gap-4 transition-all group relative overflow-hidden bg-white/5 backdrop-blur-3xl",
        "hover:border-[#66fcf1]/30 hover:bg-[#66fcf1]/5"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#66fcf1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="text-6xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 drop-shadow-[0_0_20px_rgba(102,252,241,0.2)]">{sign.symbol}</span>
      <div className="text-center space-y-1 relative z-10">
        <p className="font-black text-xl tracking-tighter text-white">{lang === "en" ? sign.name : sign.uzName}</p>
        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">{sign.dateRange}</p>
      </div>
    </motion.button>
  );
}

function SignSelector({ selected, onSelect, theme, placeholder }: { selected: ZodiacSign | null, onSelect: (s: ZodiacSign) => void, theme: string, placeholder: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button 
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full p-6 rounded-3xl border border-white/10 flex items-center justify-between transition-all hover:border-[#66fcf1]/50",
          theme === "dark" ? "bg-white/5" : "bg-white shadow-2xl"
        )}
      >
        <div className="flex items-center gap-4">
           {selected && <span className="text-4xl">{selected.symbol}</span>}
           <span className="text-xl font-bold">
            {selected ? selected.name : placeholder}
          </span>
        </div>
        <ChevronRight className={cn("w-6 h-6 transition-transform opacity-30", open ? "rotate-90" : "")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "absolute z-[100] top-full mt-4 w-full max-h-96 overflow-y-auto rounded-3xl border border-white/10 backdrop-blur-3xl p-3 no-scrollbar",
              theme === "dark" ? "bg-black/90" : "bg-white/95 shadow-3xl"
            )}
          >
            {ZODIAC_SIGNS.map(s => (
              <button 
                key={s.id}
                onClick={() => { onSelect(s); setOpen(false); }}
                className="w-full text-left p-5 hover:bg-[#66fcf1] hover:text-black rounded-2xl flex items-center gap-6 transition-all group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{s.symbol}</span>
                <div>
                   <p className="font-black text-lg tracking-tight">{s.name}</p>
                   <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{s.dateRange}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
