import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Sparkles, Plus, X, Download, Lightbulb, Palette, Shuffle, Wand2 } from 'lucide-react';

interface Spark {
  id: string;
  text: string;
  color: string;
  createdAt: number;
}

const sparkColors = [
  'from-pink-500/90 to-orange-400/90',
  'from-violet-500/90 to-blue-400/90',
  'from-emerald-500/90 to-teal-400/90',
  'from-amber-500/90 to-red-400/90',
  'from-cyan-500/90 to-indigo-400/90',
  'from-rose-500/90 to-pink-400/90',
  'from-lime-500/90 to-green-400/90',
  'from-fuchsia-500/90 to-purple-400/90',
];

const inspirationPrompts = [
  "What if everything was connected?",
  "Flip the problem upside down.",
  "What would a child do?",
  "Remove one constraint — which one?",
  "Combine two unrelated things.",
  "What's the opposite approach?",
  "If money didn't exist, then what?",
  "Make it 10x simpler.",
  "What would nature do?",
  "What breaks if you go faster?",
];

const palettes = [
  ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  ['#2C3E50', '#E74C3C', '#ECF0F1', '#3498DB', '#2ECC71'],
  ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'],
  ['#0F0C29', '#302B63', '#24243E', '#FF416C', '#FF4B2B'],
];

export default function CreativePage() {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [newSpark, setNewSpark] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(inspirationPrompts[0]);
  const [activePalette, setActivePalette] = useState(0);

  // Deterministic prompt cycling — no randomness
  const [promptIndex, setPromptIndex] = useState(0);
  const shufflePrompt = () => {
    const nextIdx = (promptIndex + 1) % inspirationPrompts.length;
    setPromptIndex(nextIdx);
    setCurrentPrompt(inspirationPrompts[nextIdx]);
  };

  const addSpark = () => {
    if (!newSpark.trim()) return;
    setSparks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: newSpark.trim(),
        color: sparkColors[prev.length % sparkColors.length],
        createdAt: Date.now(),
      },
    ]);
    setNewSpark('');
    setIsAdding(false);
  };

  const removeSpark = (id: string) => setSparks((prev) => prev.filter((s) => s.id !== id));

  const exportSparks = () => {
    const text = sparks.map((s) => `• ${s.text}`).join('\n');
    const blob = new Blob([`Creative Sparks — ${new Date().toLocaleDateString()}\n\n${text}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sparks.txt';
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-mode-primary uppercase tracking-widest font-display flex items-center gap-1.5">
            <Sparkles size={14} /> Creative Space
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">Creative Playground</h1>
          <p className="text-muted-foreground mt-1 text-sm">Capture ideas as sparks. Let them float and evolve.</p>
        </div>
        <div className="flex gap-2">
          {sparks.length > 0 && (
            <button onClick={exportSparks} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground" title="Export sparks">
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Inspiration Widget */}
      <motion.div
        className="glass rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-mode-primary/5 via-mode-glow/5 to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-mode-primary/10 flex items-center justify-center shrink-0">
            <Wand2 size={22} className="text-mode-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wide">Inspiration Prompt</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentPrompt}
                className="font-display text-lg font-semibold text-foreground mt-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                "{currentPrompt}"
              </motion.p>
            </AnimatePresence>
          </div>
          <button
            onClick={shufflePrompt}
            className="p-2.5 rounded-xl bg-mode-primary/10 text-mode-primary hover:bg-mode-primary/20 transition-colors"
          >
            <Shuffle size={18} />
          </button>
        </div>
      </motion.div>

      {/* Color Palette Widget */}
      <motion.div
        className="glass rounded-xl p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-mode-primary" />
          <span className="font-display text-sm font-semibold text-foreground">Mood Palette</span>
        </div>
        <div className="flex gap-3">
          {palettes.map((palette, pi) => (
            <button
              key={pi}
              onClick={() => setActivePalette(pi)}
              className={`flex gap-0.5 p-1 rounded-lg transition-all ${activePalette === pi ? 'ring-2 ring-mode-primary scale-105' : 'opacity-60 hover:opacity-100'}`}
            >
              {palette.map((color, ci) => (
                <div key={ci} className="w-6 h-6 sm:w-8 sm:h-8 rounded" style={{ background: color }} />
              ))}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Add Spark */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            className="glass rounded-xl p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <textarea
              value={newSpark}
              onChange={(e) => setNewSpark(e.target.value)}
              placeholder="What's on your mind? Capture that spark..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none font-body text-sm"
              rows={3}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addSpark(); } }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={addSpark} className="px-4 py-1.5 text-sm rounded-lg bg-mode-primary text-primary-foreground font-medium">Save Spark</button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setIsAdding(true)}
            className="w-full glass rounded-xl p-5 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus size={18} />
            <span className="font-display font-medium">Capture a Spark</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sparks Grid */}
      {sparks.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Lightbulb size={48} className="opacity-20 mb-4" />
          <p className="font-display text-lg">No sparks yet</p>
          <p className="text-sm">Your creative ideas will appear here as floating cards</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {sparks.map((spark, i) => (
              <motion.div
                key={spark.id}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  y: [0, -6, 0],
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <div className={`rounded-2xl p-5 bg-gradient-to-br ${spark.color} text-white shadow-xl backdrop-blur`}>
                  <p className="text-sm font-medium leading-relaxed">{spark.text}</p>
                  <p className="text-xs opacity-60 mt-3">
                    {new Date(spark.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => removeSpark(spark.id)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={12} className="text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
