import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const EntryAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000), // Stage 1: Lamp on
      setTimeout(() => setStage(2), 2000), // Stage 2: Show Person/Desk
      setTimeout(() => setStage(3), 4000), // Stage 3: Zoom into mirror
      setTimeout(() => setStage(4), 5500), // Stage 4: Slogan
      setTimeout(() => setStage(5), 7500), // Stage 5: Greeting
      setTimeout(() => onComplete(), 9500), // Final transition
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-mirror-deep z-[100] flex items-center justify-center overflow-hidden">
      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute top-10 right-12 z-[110] text-[10px] uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
      >
        Skip Intro
      </button>

      <AnimatePresence mode="wait">
        {/* Stage 1-3: The Desk Scene */}
        {stage < 4 && (
          <motion.div 
            key="desk-scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* The Light Glow */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: stage >= 1 ? [0, 1, 0.8] : 0, 
                scale: stage >= 3 ? 4 : (stage >= 1 ? 1 : 0.5),
                x: stage >= 3 ? -100 : 0
              }}
              transition={{ 
                duration: stage >= 3 ? 3 : 0.2, 
                ease: stage >= 3 ? "easeInOut" : "easeOut",
                times: stage >= 1 && stage < 3 ? [0, 0.1, 1] : undefined
              }}
              className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(232,213,183,0.2)_0%,transparent_70%)] blur-3xl pointer-events-none"
            />

            {/* Desk & Mirror Silhouette */}
            <motion.div 
              animate={{ 
                scale: stage >= 3 ? 1.5 : 1,
                y: stage >= 3 ? 100 : 0,
                opacity: stage >= 2 ? 1 : 0
              }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="relative flex flex-col items-center"
            >
              <div className="relative flex flex-col items-center">
                {/* Mirror Frame */}
                <div className="w-80 h-[450px] border border-white/10 rounded-full bg-white/[0.02] backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-30" />
                   
                   {/* Internal Reflection Placeholder */}
                   <motion.div 
                      animate={{ opacity: stage >= 2 ? 0.3 : 0 }}
                      className="w-32 h-32 rounded-full bg-white/20 blur-2xl"
                   />
                </div>

                {/* Desk Surface Placeholder */}
                <div className="w-[800px] h-4 bg-white/5 mt-[-20px] blur-[2px]" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 4: Slogan */}
        {stage === 4 && (
          <motion.div
            key="slogan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <h1 className="text-6xl font-serif italic text-white tracking-widest">镜 中</h1>
            <p className="text-mirror-accent/40 uppercase tracking-[0.6em] text-sm font-light">看见另一种可能</p>
          </motion.div>
        )}

        {/* Stage 5: Greeting */}
        {stage === 5 && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-48 h-48 rounded-full glass-panel flex items-center justify-center shadow-[0_0_80px_rgba(232,213,183,0.1)]">
               <motion.div
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ repeat: Infinity, duration: 3 }}
                 className="text-4xl text-mirror-accent/60"
               >
                 👋
               </motion.div>
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-white/40 tracking-[0.3em] text-sm uppercase"
            >
              你好，老朋友
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
