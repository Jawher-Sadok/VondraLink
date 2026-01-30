
import React from 'react';
import { Bell, Sun, Moon, Home, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onNotifyClick: () => void;
  activeView?: 'home' | 'explore';
  setActiveView?: (view: 'home' | 'explore') => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onNotifyClick, activeView = 'home', setActiveView }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-6 pointer-events-auto">
        <div className="text-2xl font-extrabold tracking-tighter cyber-gradient-text select-none">VONDRALINK</div>
        
        {/* Navigation Tabs */}
        {setActiveView && (
          <div className="hidden md:flex items-center gap-2 glass rounded-2xl p-1.5">
            <button
              onClick={() => setActiveView('home')}
              className={`relative px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'home' ? 'text-white' : 'text-white/40 hover:text-white/80'
              }`}
            >
              {activeView === 'home' && (
                <motion.div
                  layoutId="activeViewHighlight"
                  className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Home size={14} className="relative z-10" />
              <span className="relative z-10 tracking-wider uppercase">Home</span>
            </button>
            <button
              onClick={() => setActiveView('explore')}
              className={`relative px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'explore' ? 'text-white' : 'text-white/40 hover:text-white/80'
              }`}
            >
              {activeView === 'explore' && (
                <motion.div
                  layoutId="activeViewHighlight"
                  className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Compass size={14} className="relative z-10" />
              <span className="relative z-10 tracking-wider uppercase">Explore</span>
            </button>
          </div>
        )}
      </div>

      

      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-12 h-12 rounded-2xl glass flex items-center justify-center transition-all hover:border-teal/50 hover:shadow-glow-teal/10 group"
          >
            {theme === 'dark' ? <Sun size={20} className="text-white/60 group-hover:text-white transition-colors" /> : <Moon size={20} className="text-black/60 group-hover:text-black transition-colors" />}
          </button>
          
          
          
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 glass p-1">
            <img src="https://icon2.cleanpng.com/20240405/jhu/transparent-icon-eagle-bird-of-prey-wildlife-feathers-realistic-image-of-powerful-brown-eagle660f93bcbc6111.18160230.webp" alt="User" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
