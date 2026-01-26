
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBento, { ShoppingTask } from './components/HeroBento';
import TradeOffEngine from './components/TradeOffEngine';
import MobileDock from './components/MobileDock';
import { SearchState } from './types';
import { MOCK_PRODUCTS } from './constants';
import { analyzeShoppingIntent } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTask, setActiveTask] = useState<ShoppingTask>('vibe');
  const [search, setSearch] = useState<SearchState>({
    query: '',
    isSearching: false,
    results: MOCK_PRODUCTS
  });

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = async (query: string, budgetLimit?: number, image?: string) => {
    setSearch(prev => ({ ...prev, isSearching: true, query, budgetLimit }));
    
    const results = await analyzeShoppingIntent(query, budgetLimit, image);
    
    setSearch({
      query,
      budgetLimit,
      isSearching: false,
      imageInput: image,
      results: results.length > 0 ? results : MOCK_PRODUCTS
    });

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-teal/30 relative overflow-x-hidden">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="pb-32 relative z-10">
        <HeroBento 
          onSearch={handleSearch} 
          isSearching={search.isSearching} 
          activeTask={activeTask}
          setActiveTask={setActiveTask}
        />
        
        <div id="results" className="mt-24">
          <AnimatePresence mode="wait">
            {search.isSearching ? (
              <motion.div 
                key="loading-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-48 gap-8"
              >
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 rounded-full border-[3px] border-current opacity-5" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[3px] border-teal border-t-transparent shadow-[0_0_40px_rgba(32,226,215,0.3)]"
                  />
                  <div className="absolute inset-4 rounded-full border border-current opacity-5 animate-pulse" />
                </div>
                <div className="text-teal font-mono tracking-[0.5em] text-[10px] uppercase animate-pulse font-bold">
                  Parsing Market Substitutes...
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results-grid"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-12 max-w-7xl mx-auto px-6 pb-20"
              >
                {search.results.map((pair, idx) => (
                  <TradeOffEngine key={idx} pair={pair} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <MobileDock />
      
      {/* Refined Faded Modern Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: activeTask === 'vibe' ? '5%' : '-5%',
            y: activeTask === 'vibe' ? '5%' : '-5%',
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="bg-blob bg-teal top-[-25%] left-[-15%] scale-150" 
        />
        <motion.div 
          animate={{ 
            x: activeTask === 'gift' ? '-5%' : '5%',
            y: activeTask === 'gift' ? '-5%' : '5%',
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="bg-blob bg-coral bottom-[-25%] right-[-15%] scale-150" 
        />
        <div className="bg-blob bg-cyber-purple top-[45%] left-[-25%] opacity-[0.03] h-[50vw] w-[50vw]" />
        <div className="bg-blob bg-cyber-blue top-[15%] right-[-10%] opacity-[0.02] h-[40vw] w-[40vw]" />
      </div>
    </div>
  );
};

export default App;
