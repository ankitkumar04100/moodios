import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, X, Download, Lightbulb } from 'lucide-react';

interface Spark {
  id: string;
  text: string;
  color: string;
  createdAt: number;
}

const sparkColors = [
  'from-pink-400 to-orange-400',
  'from-violet-400 to-blue-400',
  'from-emerald-400 to-teal-400',
  'from-amber-400 to-red-400',
  'from-cyan-400 to-indigo-400',
];

export default function CreativePage() {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [newSpark, setNewSpark] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Creative Playground</h1>
          <p className="text-muted-foreground mt-1">Capture ideas as sparks. Let them float and evolve.</p>
        </div>
        <div className="flex gap-2">
          {sparks.length > 0 && (
            <button onClick={exportSparks} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground" title="Export sparks">
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

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
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
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
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  y: [0, -4, 0],
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <div className={`rounded-xl p-5 bg-gradient-to-br ${spark.color} text-white shadow-lg`}>
                  <p className="text-sm font-medium leading-relaxed">{spark.text}</p>
                  <p className="text-xs opacity-60 mt-3">
                    {new Date(spark.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => removeSpark(spark.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
