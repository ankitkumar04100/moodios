import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { BarChart3, Download, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TimelinePage() {
  const { recentHistory } = useEmotionStore();

  const chartData = useMemo(() => {
    return recentHistory.map((s, i) => ({
      time: new Date(s.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stress: Math.round(s.stressLevel * 100),
      energy: Math.round(s.energyLevel * 100),
      confidence: Math.round(s.confidence * 100),
      idx: i,
    }));
  }, [recentHistory]);

  const exportCSV = () => {
    const header = 'timestamp,mood,stress,energy,confidence\n';
    const rows = recentHistory.map((s) =>
      `${new Date(s.lastUpdated).toISOString()},${s.mood},${s.stressLevel.toFixed(3)},${s.energyLevel.toFixed(3)},${s.confidence.toFixed(3)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `emotion-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Emotion Timeline</h1>
          <p className="text-muted-foreground mt-1">Your emotional journey, visualized locally.</p>
        </div>
        <div className="flex gap-2">
          {recentHistory.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {chartData.length < 3 ? (
        <motion.div
          className="glass rounded-2xl p-12 flex flex-col items-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <BarChart3 size={48} className="text-muted-foreground/20 mb-4" />
          <p className="font-display text-lg text-foreground">Not enough data yet</p>
          <p className="text-sm text-muted-foreground mt-1">Enable sensing and let it run for a minute to see your timeline.</p>
        </motion.div>
      ) : (
        <>
          {/* Stress & Energy Chart */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-4">Stress & Energy</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="stress" stroke="hsl(0, 75%, 55%)" fill="url(#stressGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="energy" stroke="hsl(200, 80%, 55%)" fill="url(#energyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Confidence Chart */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-4">Detection Confidence</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--mode-primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--mode-primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="confidence" stroke="hsl(var(--mode-primary))" fill="url(#confGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Data Points', value: recentHistory.length },
              { label: 'Avg Stress', value: `${Math.round(recentHistory.reduce((a, s) => a + s.stressLevel, 0) / recentHistory.length * 100)}%` },
              { label: 'Avg Energy', value: `${Math.round(recentHistory.reduce((a, s) => a + s.energyLevel, 0) / recentHistory.length * 100)}%` },
              { label: 'Top Mood', value: getMostCommonMood(recentHistory) },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass rounded-xl p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-display font-bold text-lg text-foreground capitalize">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function getMostCommonMood(history: { mood: string }[]): string {
  const counts: Record<string, number> = {};
  history.forEach((s) => { counts[s.mood] = (counts[s.mood] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
}
