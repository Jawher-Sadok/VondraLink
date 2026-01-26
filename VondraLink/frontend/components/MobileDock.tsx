
import React from 'react';
import { Home, Compass, ShoppingBag, Heart, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileDock: React.FC = () => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 w-full max-w-md md:hidden pointer-events-none">
      <div className="glass rounded-[2rem] h-20 px-4 flex items-center justify-between pointer-events-auto border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        {[
          { icon: <Home size={22} />, active: true },
          { icon: <Compass size={22} />, active: false },
          { icon: <ShoppingBag size={22} />, active: false },
          { icon: <Heart size={22} />, active: false },
          { icon: <MoreVertical size={22} />, active: false },
        ].map((item, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              item.active ? 'bg-teal text-background shadow-[0_0_20px_#20E2D7]' : 'text-white/40 hover:text-white'
            }`}
          >
            {item.icon}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MobileDock;
