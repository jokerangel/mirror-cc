import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin } from 'lucide-react';
import { DeductionDialogue } from './DeductionDialogue';

type DeductionView = 'landing' | 'history' | 'future' | 'dialogue';

export function DeductionSection({ particleRef: _particleRef }: { particleRef: React.RefObject<unknown> }) {
  const [view, setView] = useState<DeductionView>('landing');
  const [input, setInput] = useState('');
  const [initialPrompt, setInitialPrompt] = useState('');

  const startDeduction = (_type: 'history' | 'future', val: string) => {
    setInitialPrompt(val);
    setView('dialogue');
  };

  return (
    <div className="h-full w-full relative">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col justify-center gap-12"
          >
            <div className="text-center">
              <h2 className="text-mirror-accent/80 text-xl font-serif italic mb-2 tracking-[0.2em]">Parallel Reality</h2>
              <h1 className="text-5xl font-display text-white">你想推演哪一种可能？</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
              <button 
                onClick={() => setView('history')}
                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-mirror-accent/30 transition-all text-left"
              >
                <div className="text-mirror-accent mb-4"><Clock size={32} /></div>
                <h3 className="text-2xl font-display text-white mb-2">如果当初...</h3>
                <p className="text-white/50 text-sm">回溯历史的转折点，看看另一种选择会带来什么</p>
              </button>
              
              <button 
                onClick={() => setView('future')}
                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-mirror-accent/30 transition-all text-left"
              >
                <div className="text-mirror-gold mb-4"><MapPin size={32} /></div>
                <h3 className="text-2xl font-display text-white mb-2">如果未来...</h3>
                <p className="text-white/50 text-sm">剖析当下面临的决策，预演未来的轨迹</p>
              </button>
            </div>
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-center max-w-2xl mx-auto w-full gap-8"
          >
            <h2 className="text-3xl font-display text-white">那是哪一年？</h2>
            <div className="relative">
                <input 
                    type="text"
                    placeholder="输入时间，如'2023年'或'去年'"
                    className="w-full bg-white/5 border border-white/10 p-6 rounded-xl text-white outline-none focus:border-mirror-accent/50"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>
            <button 
                onClick={() => startDeduction('history', input)}
                className="self-center px-12 py-4 bg-mirror-accent text-mirror-deep font-bold rounded-full hover:bg-white transition-all"
            >
                下一步
            </button>
          </motion.div>
        )}

        {view === 'future' && (
          <motion.div
            key="future"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-center max-w-2xl mx-auto w-full gap-8"
          >
            <h2 className="text-3xl font-display text-white">你在考虑什么决定？</h2>
            <textarea 
                placeholder="描述你正在考虑的决定..."
                className="w-full h-48 bg-white/5 border border-white/10 p-6 rounded-xl text-white outline-none focus:border-mirror-accent/50 resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button 
                onClick={() => startDeduction('future', input)}
                className="self-center px-12 py-4 bg-mirror-gold text-mirror-deep font-bold rounded-full hover:bg-white transition-all"
            >
                开始分析
            </button>
          </motion.div>
        )}

        {view === 'dialogue' && (
          <motion.div
            key="dialogue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full"
          >
            <DeductionDialogue initialPrompt={initialPrompt} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
