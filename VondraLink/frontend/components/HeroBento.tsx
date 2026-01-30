import React, { useState, useRef } from "react";
import {
  getRecommendations,
  transformRecommendations,
} from "../services/apiService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Gift,
  Upload,
  Zap,
  DollarSign,
  Repeat,
  ArrowRight,
} from "lucide-react";

export type ShoppingTask = "vibe" | "tradeoff" | "gift";

interface HeroBentoProps {
  onSearch: (query: string, budget?: number, image?: File) => void;
  isSearching: boolean;
  activeTask: ShoppingTask;
  setActiveTask: (task: ShoppingTask) => void;
}

const HeroBento: React.FC<HeroBentoProps> = ({
  onSearch,
  isSearching,
  activeTask,
  setActiveTask,
  
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [vibeBudget, setVibeBudget] = useState<string>("");
  const [tradeOffBudget, setTradeOffBudget] = useState<string>("");
  const [giftBudget, setGiftBudget] = useState<string>("");
  const [substituteQuery, setSubstituteQuery] = useState("");
  const [giftQuery, setGiftQuery] = useState("");
  const [giftRecommendations, setGiftRecommendations] = useState<any>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  // Handler for Gift Recommendations
  const handleGiftRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setGiftRecommendations(null);
    try {
      const payload = {
        description: giftQuery,
      };
      const recs = await getRecommendations(payload);
      const transformed = transformRecommendations(recs);
      setGiftRecommendations(transformed);
    } catch (err) {
      setGiftRecommendations(null);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setImage(file);
  };

  const tasks = [
    { id: "vibe", label: "Vibe Match", icon: <Scan size={15} /> },
    { id: "tradeoff", label: "Trade-Off", icon: <Repeat size={15} /> },
    { id: "gift", label: "Gift Finder", icon: <Gift size={15} /> },
  ];

  return (
    <div className="flex flex-col items-center pt-32 px-6 max-w-5xl mx-auto w-full relative z-20">
      {/* Refined Task Switcher */}
      <div className="glass p-1.5 rounded-[1.5rem] flex items-center gap-1 mb-16 shadow-smooth relative z-30">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => setActiveTask(task.id as ShoppingTask)}
            className={`relative px-8 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2.5 overflow-hidden ${
              activeTask === task.id
                ? "text-white"
                : "opacity-40 hover:opacity-80"
            }`}>
            {activeTask === task.id && (
              <motion.div
                layoutId="activeTaskHighlight"
                className="absolute inset-0 bg-white/10 dark:bg-white/10 light:bg-black/5 border border-white/20 shadow-inner"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{task.icon}</span>
            <span className="relative z-10 tracking-widest uppercase">
              {task.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTask === "vibe" && (
          <motion.div
            key="vibe-block"
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="w-full glass rounded-[3rem] p-10 md:p-14 flex flex-col md:flex-row gap-12 relative overflow-hidden shadow-smooth dark:shadow-glow-teal/5">
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center text-teal mb-8 shadow-inner border border-teal/20">
                <Scan size={28} />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">
                Vibe-on-a-Budget
              </h2>
              <p className="opacity-50 text-md max-w-sm mb-10 leading-relaxed">
                Reverse search luxury aesthetics to find secret value matches
                under your limit.
              </p>

              <div className="space-y-5">
                <div className="glass h-16 rounded-2xl flex items-center px-6 gap-4 border-white/5 focus-within:border-teal/40 transition-all shadow-inner group">
                  <DollarSign
                    size={20}
                    className="opacity-20 group-focus-within:opacity-60 transition-opacity"
                  />
                  <input
                    type="number"
                    placeholder="Maximum Price Cap (USD)"
                    value={vibeBudget}
                    onChange={(e) => setVibeBudget(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-lg font-mono placeholder:opacity-20"
                  />
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 0 40px rgba(32, 226, 215, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    onSearch(
                      "Visual search match",
                      Number(vibeBudget) || undefined,
                      image ?? undefined,
                    )
                  }
                  className="w-full bg-teal text-background font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all">
                  {isSearching ? (
                    <Zap size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Zap size={20} /> INITIATE SCAN
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="
    md:w-1/2
    aspect-square
    md:aspect-auto
    h-80
    border-2 border-dashed border-white/10
    rounded-[2.5rem]
    flex items-center justify-center
    overflow-hidden
    cursor-pointer
    group
    hover:border-teal/50
    transition-all
    relative
    shadow-2xl
    bg-white/[0.01]
  ">
              {image ? (
                <>
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="
            max-w-full max-h-full
            object-contain
            transition-transform duration-700
            group-hover:scale-105
            drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]
          "
                    />
                  </div>

                  {/* Scan line stays correct */}
                  <motion.div
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="scan-line pointer-events-none"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-teal group-hover:bg-teal/10 transition-all shadow-inner">
                    <Upload size={32} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.25em] opacity-30">
                    Drop Reference Visual
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
            </div>
          </motion.div>
        )}

        {activeTask === "tradeoff" && (
          <motion.div
            key="tradeoff-block"
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="w-full glass rounded-[3rem] p-10 md:p-14 flex flex-col gap-10 relative overflow-hidden shadow-smooth">
            <div className="relative z-10">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner border border-blue-500/20">
                  <Repeat size={28} />
                </div>
                <div>
                  <h2 className="text-4xl font-extrabold tracking-tight">
                    Trade-Off Engine
                  </h2>
                  <p className="opacity-50 text-sm">
                    Strip the brand premium, retain the high-tier specs.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <textarea
                  value={substituteQuery}
                  onChange={(e) => setSubstituteQuery(e.target.value)}
                  placeholder="e.g. Find me a premium alternative to the Pro Studio headphones that focuses on bass response and active noise canceling for under $200..."
                  className="w-full h-44 bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border border-white/5 dark:border-white/5 light:border-black/5 rounded-[2rem] p-8 text-xl focus:outline-none focus:ring-1 focus:ring-teal/40 transition-all shadow-inner placeholder:opacity-10 resize-none"
                />

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="glass h-16 rounded-2xl flex items-center px-6 gap-4 border-white/5 focus-within:border-teal/40 transition-all flex-1 shadow-inner group">
                    <DollarSign
                      size={20}
                      className="opacity-20 group-focus-within:opacity-60 transition-opacity"
                    />
                    <input
                      type="number"
                      placeholder="My Spending Limit"
                      value={tradeOffBudget}
                      onChange={(e) => setTradeOffBudget(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-lg font-mono"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      onSearch(
                        substituteQuery,
                        Number(tradeOffBudget) || undefined,
                      )
                    }
                    className="bg-white/10 hover:bg-white/20 dark:bg-white/10 light:bg-black/5 text-current px-12 rounded-2xl font-bold flex items-center justify-center gap-3 border border-white/10 transition-all whitespace-nowrap h-16 shadow-lg">
                    IDENTIFY VALUE <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[140px] -mr-[20rem] -mt-[20rem] pointer-events-none" />
          </motion.div>
        )}

        {activeTask === "gift" && (
          <motion.div
            key="gift-block"
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="w-full glass rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-smooth dark:shadow-glow-coral/5">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center text-coral mb-10 shadow-inner border border-coral/20">
                <Gift size={28} />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">
                Gift Manifestation
              </h2>

              <div className="flex flex-col gap-8">
                <div className="relative">
                  <input
                    value={giftQuery}
                    onChange={(e) => setGiftQuery(e.target.value)}
                    placeholder="Describe their lifestyle, soul, or aesthetic..."
                    className="w-full bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border border-white/5 dark:border-white/5 light:border-black/5 rounded-2xl px-8 py-6 text-xl focus:outline-none focus:ring-1 focus:ring-coral/40 transition-all shadow-inner placeholder:opacity-10"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="glass h-16 rounded-2xl flex items-center px-6 gap-4 border-white/5 focus-within:border-coral/40 transition-all flex-1 shadow-inner group">
                    <DollarSign
                      size={20}
                      className="opacity-20 group-focus-within:opacity-60 transition-opacity"
                    />
                    <input
                      type="number"
                      placeholder="Max Budget Target"
                      value={giftBudget}
                      onChange={(e) => setGiftBudget(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-lg font-mono"
                    />
                  </div>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 40px rgba(255, 126, 95, 0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGiftRecommendations}
                    className="bg-coral text-white px-16 rounded-2xl font-bold shadow-smooth transition-all h-16">
                    {isLoadingRecommendations
                      ? "LOADING..."
                      : "SEARCH LIFESTYLE"}
                  </motion.button>
                </div>

                {/* Gift Recommendations Results */}
                {giftRecommendations && giftRecommendations.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h4 className="text-lg font-bold text-coral mb-4">
                      Recommended Products ({giftRecommendations.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {giftRecommendations.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-white/5 border border-coral/20 hover:bg-white/10 hover:border-coral/40 transition-all">
                          <h5 className="font-semibold text-white mb-3 leading-tight">
                            {item.title}
                          </h5>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/20 text-coral text-sm font-medium hover:bg-coral hover:text-white transition-all">
                              View on Best Buy →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    "Nomadic Creative",
                    "Dark Academia",
                    "Solar Punk",
                    "Minimalist Tech",
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setGiftQuery(
                          `A premium gift for someone into ${tag} aesthetic...`,
                        )
                      }
                      className="px-6 py-3 rounded-full glass border-white/5 text-[11px] font-bold opacity-40 hover:opacity-100 hover:bg-white/10 transition-all whitespace-nowrap uppercase tracking-widest">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-coral/5 rounded-full blur-[140px] -ml-[15rem] -mb-[15rem] pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroBento;
