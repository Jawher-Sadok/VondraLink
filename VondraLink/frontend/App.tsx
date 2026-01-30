import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroBento, { ShoppingTask } from "./components/HeroBento";
import TradeOffEngine from "./components/TradeOffEngine";
import MobileDock from "./components/MobileDock";
import HomePage from "./components/HomePage";
import { SearchState ,RecommendationRequest } from "./types";
import { searchProducts } from "./services/apiService";
import { getRecommendations } from "./services/apiService";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

// =====================
// QuestionGroup Component
// =====================
const QuestionGroup = ({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: { id: string; label: string; description?: string }[];
  value: string;
  onChange: (name: string, value: string) => void;
}) => (
  <div className="flex flex-col gap-4">
    <label className="text-sm font-semibold text-gray-300 ml-1">{label}</label>
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <label key={opt.id} className="group cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.id}
            className="peer sr-only"
            checked={value === opt.id}
            onChange={() => onChange(name, opt.id)}
            required
          />
          <div className="flex items-start gap-4 px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 transition-all 
            peer-checked:border-teal peer-checked:bg-teal/5 peer-checked:text-white group-hover:bg-white/10">
            <div className="mt-1 w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center peer-checked:border-teal shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-teal scale-0 peer-checked:scale-100 transition-transform" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium leading-relaxed">{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-gray-500 peer-checked:text-gray-400">{opt.description}</span>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  </div>
);

// =====================
// App Component
// =====================
const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTask, setActiveTask] = useState<ShoppingTask>("vibe");
  const [activeView, setActiveView] = useState<"home" | "explore">("home");

  // Generate or retrieve user ID from localStorage
  const [userId, setUserId] = useState<string>(() => {
    const stored = localStorage.getItem("vondralink_user_id");
    if (stored) return stored;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("vondralink_user_id", newId);
    return newId;
  });

  // All form choices
  const [formState, setFormState] = useState<any>({
    fullName: "",
    styleFocus: "",
    era: "",
    philosophy: "",
    treat: "",
    mode: "",
    aesthetic: "",
    sunday: "",
  });

  const [search, setSearch] = useState<SearchState>({
    query: "",
    isSearching: false,
    results: [],
  });

  const [recommendations, setRecommendations] = useState<RecommendationRequest>({
    description: "",
    isSearching: false,
    results: [],
  });

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormState((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const fullName = formData.get("fullName") as string;

    // Map formState into nested JSON structure
    const jsonPayload = {
      user_id: "u_999",
      demographics: {
        gender: mapStyleFocusToGender(formState.styleFocus),
        generation: mapEraToGeneration(formState.era),
      },
      wealth_signals: {
        shopping_philosophy: mapPhilosophy(formState.philosophy),
        treat_preference: mapTreat(formState.treat),
      },
      derived_richness_tier: "Luxury", // Hardcoded for now
      lifestyle: {
        archetype: mapMode(formState.mode),
        vibe: mapAesthetic(formState.aesthetic),
        hobbies: mapSundayToHobbies(formState.sunday),
        mission: "Building a Home Office", // Example placeholder
      },
      context: {
        recent_purchase_text: "Bought a Herman Miller Embody chair",
        last_searches: ["ergonomic mouse", "desk mat", "cable organizer"],
      },
    };

    console.log("Collected JSON:", JSON.stringify(jsonPayload, null, 2));
    setHasEntered(true);
  };

  // =====================
  // Mapping Helpers
  // =====================
  const mapStyleFocusToGender = (val: string) => {
    switch (val) {
      case "masculine": return "Male";
      case "feminine": return "Female";
      case "neutral":
      case "mixed": return "Non-binary";
      default: return "Unknown";
    }
  };

  const mapEraToGeneration = (val: string) => {
    switch (val) {
      case "genz": return "Gen Z";
      case "millennial": return "Millennial";
      case "genx": return "Gen X";
      default: return "Unknown";
    }
  };

  const mapPhilosophy = (val: string) => {
    switch (val) {
      case "value": return "The Value Hunter";
      case "researcher": return "The Researcher";
      case "bifl": return "Buy It For Life";
      case "enthusiast": return "The Enthusiast";
      default: return "Unknown";
    }
  };

  const mapTreat = (val: string) => {
    switch (val) {
      case "small": return "Small & Sweet";
      case "upgrade": return "The Solid Upgrade";
      case "splurge": return "The Big Splurge";
      default: return "Unknown";
    }
  };

  const mapMode = (val: string) => {
    switch (val) {
      case "creator": return "The Creator";
      case "optimizer": return "The Optimizer";
      case "nester": return "The Nester";
      case "explorer": return "The Explorer";
      default: return "Unknown";
    }
  };

  const mapAesthetic = (val: string) => {
    switch (val) {
      case "minimalist": return "Minimalist";
      case "industrial": return "Industrial";
      case "retro": return "Retro";
      case "cyber": return "Cyber";
      default: return "Unknown";
    }
  };

  const mapSundayToHobbies = (val: string) => {
    switch (val) {
      case "focus": return ["Coding", "Writing"];
      case "grind": return ["Gaming", "Hardware"];
      case "recharge": return ["Yoga", "Meditation"];
      case "out": return ["Hiking", "Cycling"];
      case "hosting": return ["Cooking", "Mixology"];
      default: return [];
    }
  };

  // =====================
  // Search Handler
  // =====================
  const handleSearch = async (query: string, budgetLimit?: number, image?: File) => {
    setSearch((prev) => ({ ...prev, isSearching: true, query, budgetLimit }));
    
    const results = await searchProducts(query, budgetLimit, image, userId);
    
    setSearch({
      query,
      budgetLimit,
      isSearching: false,
      imageInput: image,
      results: results,
    });

    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  };

  // =====================
  // Render
  // =====================
  return (
    <div className="min-h-screen font-sans selection:bg-teal/30 relative overflow-x-hidden bg-background-dark text-white">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ x: activeTask === "vibe" ? "5%" : "-5%", y: activeTask === "vibe" ? "5%" : "-5%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="bg-blob bg-teal top-[-25%] left-[-15%] scale-150 absolute opacity-20"
        />
        <motion.div
          animate={{ x: activeTask === "gift" ? "-5%" : "5%", y: activeTask === "gift" ? "-5%" : "5%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="bg-blob bg-coral bottom-[-25%] right-[-15%] scale-150 absolute opacity-20"
        />
      </div>

      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-50 flex flex-col items-center justify-center min-h-screen py-20 px-6"
          >
            <div className="max-w-2xl w-full p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-teal/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="text-teal" size={32} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome</h1>
                <p className="text-white/50">Enter your details to unlock the personalized shopping engine.</p>
              </div>

              <form className="flex flex-col gap-10 max-w-2xl mx-auto" onSubmit={handleGateSubmit}>
                {/* Identity */}
                <div className="flex flex-col gap-3 border-b border-white/5 pb-8">
                  <label className="text-sm font-bold text-teal uppercase tracking-widest ml-1">Identity</label>
                  <input
                    required
                    name="fullName"
                    type="text"
                    placeholder="Your Full Name"
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-teal transition-all text-white placeholder:text-gray-600"
                    value={formState.fullName}
                    onChange={(e) => handleRadioChange("fullName", e.target.value)}
                  />
                </div>

                {/* All Questions */}
                <QuestionGroup
                  label="What is your style focus?"
                  name="styleFocus"
                  options={[
                    { id: "masculine", label: 'Masculine / Menswear', description: 'Sharp cuts, utility, and structured silhouettes.' },
                    { id: "feminine", label: 'Feminine / Womenswear', description: 'Softer lines, chic aesthetics, and fitted styles.' },
                    { id: "neutral", label: 'Gender Neutral / Unisex', description: 'Oversized fits, streetwear, and utility-first gear.' },
                    { id: "mixed", label: 'Gifting / Mixed', description: "I'm shopping for others or browsing for the household." },
                  ]}
                  value={formState.styleFocus}
                  onChange={handleRadioChange}
                />

                <QuestionGroup
                  label="Which 'Era' resonates with you most?"
                  name="era"
                  options={[
                    { id: "genz", label: 'The New Wave (Gen Z)', description: 'I chase what\'s next. I love bold, experimental, and viral trends.' },
                    { id: "millennial", label: 'The Golden Era (Millennial)', description: 'I value experiences and nostalgia. Give me that 90s/00s comfort.' },
                    { id: "genx", label: 'The Classic (Gen X / Mature)', description: 'I prefer timeless design. Quality and reliability over hype.' },
                  ]}
                  value={formState.era}
                  onChange={handleRadioChange}
                />

                <QuestionGroup
                  label="What’s your shopping philosophy?"
                  name="philosophy"
                  options={[
                    { id: "value", label: 'The Value Hunter', description: 'I love the thrill of finding a hidden gem, a dupe, or the best bang-for-my-buck.' },
                    { id: "researcher", label: 'The Researcher', description: 'I read every review. I want the reliable, top-rated choice in the mid-range.' },
                    { id: "bifl", label: "The 'Buy It For Life' Purist", description: "I hate replacing things. I'll pay a premium once for something that lasts forever." },
                    { id: "enthusiast", label: 'The Enthusiast', description: "I want the absolute cutting-edge. If it's the best performance/design, the price is secondary." },
                  ]}
                  value={formState.philosophy}
                  onChange={handleRadioChange}
                />

                <QuestionGroup
                  label="You've had a great month. How do you treat yourself?"
                  name="treat"
                  options={[
                    { id: "small", label: 'Small & Sweet', description: 'A nice dinner out, a new book, or a fresh game.' },
                    { id: "upgrade", label: 'The Solid Upgrade', description: 'A new pair of kicks, a gadget refresh, or a weekend getaway.' },
                    { id: "splurge", label: 'The Big Splurge', description: 'A designer piece, high-end tech, or an exclusive experience.' },
                  ]}
                  value={formState.treat}
                  onChange={handleRadioChange}
                />

                <QuestionGroup
                  label="Which describes your current 'Mode'?"
                  name="mode"
                  options={[
                    { id: "creator", label: 'The Creator', description: 'I make things. My space is full of tools, sketchbooks, code, or cameras.' },
                    { id: "optimizer", label: 'The Optimizer', description: 'I need efficiency. I want my workflow to be fast, ergonomic, and distraction-free.' },
                    { id: "nester", label: 'The Nester', description: 'Home is my sanctuary. I care about comfort, lighting, cooking, and hosting.' },
                    { id: "explorer", label: 'The Explorer', description: "I'm rarely at a desk. I need gear that travels well and survives the outdoors." },
                  ]}
                  value={formState.mode}
                  onChange={handleRadioChange}
                />

                <QuestionGroup
                  label="Pick the aesthetic that feels like 'You'."
                  name="aesthetic"
                  options={[
                    { id: "minimalist", label: 'Minimalist', description: 'Less is more. Clean lines, matte white/black, no clutter.' },
                    { id: "industrial", label: 'Industrial & Raw', description: 'Exposed brick, dark wood, leather, steel, and warm lighting.' },
                    { id: "retro", label: 'Retro / Heritage', description: 'Nostalgic vibes. Analog tech, 90s colors, vinyl, and classic design.' },
                    { id: "cyber", label: 'Cyber / Future', description: 'RGB lighting, neon accents, transparent tech, and bold geometry.' },
                  ]}
                  value={formState.aesthetic}
                  onChange={handleRadioChange}
                />

                <QuestionGroup
                  label="It’s a free Sunday. What are you likely doing?"
                  name="sunday"
                  options={[
                    { id: "focus", label: 'Deep Focus', description: 'Coding, Writing, or Learning something new.' },
                    { id: "grind", label: 'The Grind', description: 'Gaming, Streaming, or Tinkering with hardware.' },
                    { id: "recharge", label: 'Recharging', description: 'Reading, Yoga, Meditation, or Spa day.' },
                    { id: "out", label: 'Getting Out', description: 'Hiking, Photography, Cycling, or Gym.' },
                    { id: "hosting", label: 'Hosting', description: 'Cooking intricate meals, Coffee brewing, or Mixology.' },
                  ]}
                  value={formState.sunday}
                  onChange={handleRadioChange}
                />

                <button
                  type="submit"
                  className="mt-8 bg-teal text-background-dark py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl shadow-teal/20"
                >
                  Generate Experience <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Header 
              theme={theme} 
              toggleTheme={toggleTheme} 
              onNotifyClick={() => setHasEntered(false)}
              activeView={activeView}
              setActiveView={setActiveView}
            />
            <main className="pb-32 relative z-10">
              <AnimatePresence mode="wait">
                {activeView === "home" ? (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HomePage userProfile={formState} recommendedProducts={[]} userId={userId} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="explore"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HeroBento
                      onSearch={handleSearch}
                      isSearching={search.isSearching}
                      activeTask={activeTask}
                      setActiveTask={setActiveTask}
                    />
                    <div id="results" className="mt-24">
                      <AnimatePresence mode="wait">
                        {search.isSearching ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-48">
                            <div className="w-20 h-20 border-t-2 border-teal rounded-full animate-spin mb-4" />
                            <p className="font-mono text-[10px] uppercase tracking-widest text-teal">Analysing Market...</p>
                          </motion.div>
                        ) : search.results.length > 0 ? (
                          <motion.div key="results" className="grid grid-cols-1 gap-12 max-w-7xl mx-auto px-6">
                            {search.results.map((pair, idx) => <TradeOffEngine key={idx} pair={pair} />)}
                          </motion.div>
                        ) : (
                          <div className="text-center py-48 opacity-40">
                            <Search size={48} className="mx-auto mb-4" />
                            <p>Results will appear here...</p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
            <MobileDock activeView={activeView} setActiveView={setActiveView} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
