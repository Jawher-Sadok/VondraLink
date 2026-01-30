
import React from 'react';
import { Bell, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onNotifyClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onNotifyClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="text-2xl font-extrabold tracking-tighter cyber-gradient-text select-none">VONDRALINK</div>
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
