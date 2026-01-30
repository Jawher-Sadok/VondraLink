
import React from 'react';
import { Home, Compass, ShoppingBag, Heart, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileDockProps {
  activeView?: 'home' | 'explore';
  setActiveView?: (view: 'home' | 'explore') => void;
}

const MobileDock: React.FC<MobileDockProps> = ({ activeView = 'home', setActiveView }) => {
  const handleNavClick = (view: 'home' | 'explore') => {
    if (setActiveView) {
      setActiveView(view);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 w-full max-w-md md:hidden pointer-events-none">
      <div className="glass rounded-[2rem] h-20 px-4 flex items-center justify-between pointer-events-auto border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleNavClick('home')}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            activeView === 'home' ? 'bg-teal text-background shadow-[0_0_20px_#20E2D7]' : 'text-white/40 hover:text-white'
          }`}
        >
          <Home size={22} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleNavClick('explore')}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            activeView === 'explore' ? 'bg-teal text-background shadow-[0_0_20px_#20E2D7]' : 'text-white/40 hover:text-white'
          }`}
        >
          <Compass size={22} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <ShoppingBag size={22} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <Heart size={22} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <MoreVertical size={22} />
        </motion.button>
      </div>
    </div>
  );
};

export default MobileDock;
