
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { TradeOffPair } from '../types';

const TradeOffEngine: React.FC<{ pair: TradeOffPair }> = ({ pair }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-[3rem] overflow-hidden shadow-smooth border-white/5 relative group"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Product Image Section */}
        <div className="lg:col-span-5 relative overflow-hidden bg-white/[0.02]">
          <div className="aspect-[4/5] lg:aspect-auto h-full overflow-hidden relative">
            <img 
              src={pair.smart.image} 
              alt={pair.smart.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent pointer-events-none" />
            
            {/* Savings Overlay */}
            <div className="absolute top-8 left-8">
              <div className="bg-teal text-background-dark font-mono font-black px-4 py-2 rounded-xl text-lg shadow-glow-teal/30 border border-white/20">
                -${pair.savings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-7 p-10 lg:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 rounded-full bg-teal/10 text-teal text-[10px] font-mono font-bold tracking-widest uppercase">
                Smart Choice Identified
              </div>
              <div className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
                Alternative to {pair.premium.brand}
              </div>
            </div>

            <h3 className="text-3xl font-extrabold tracking-tight mb-2">{pair.smart.name}</h3>
            <p className="text-white/40 font-mono text-sm mb-8 tracking-wide">{pair.smart.brand}</p>

            <div className="flex items-end gap-4 mb-8">
              <div className="text-4xl font-mono font-bold text-teal tracking-tighter">
                ${pair.smart.price.toLocaleString()}
              </div>
              <div className="text-white/20 font-mono text-sm line-through mb-1">
                Was ${pair.premium.price.toLocaleString()}
              </div>
            </div>

            {/* AI Insight Description - Replaces logic header and specs */}
            <div className="relative mb-12">
              <div className="flex items-start gap-4 p-8 bg-white/[0.03] rounded-[2rem] border border-white/5 relative overflow-hidden">
                <div className="mt-1 text-teal flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div className="relative z-10">
                  <p className="text-white/80 leading-relaxed text-lg font-medium italic">
                    {pair.matchReason}
                  </p>
                </div>
                {/* Decorative background blur */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-teal/5 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Button - PRODUCT LINK */}
          <a 
            href={pair.smart.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group/btn relative w-full bg-white dark:bg-white light:bg-background-dark text-background-dark dark:text-background-dark light:text-white rounded-2xl py-6 px-10 font-black flex items-center justify-between overflow-hidden shadow-smooth transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="relative z-10 text-lg uppercase tracking-widest flex items-center gap-3">
              View Smart Link <ExternalLink size={20} />
            </span>
            <div className="w-14 h-14 rounded-full bg-teal text-background-dark flex items-center justify-center relative z-10 group-hover/btn:rotate-[-45deg] transition-transform duration-500">
              <ArrowRight size={24} />
            </div>
            
            {/* Hover Background Effect */}
            <div className="absolute inset-0 bg-teal translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out z-0 opacity-10" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default TradeOffEngine;
