import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { BarChart3, Download, Database, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { queryTimeline, exportCSV as exportDuckCSV, flushBatch, getStats, type MinuteAggregate } from '@/lib/duckdb';

export default function TimelinePage() {
  const { recentHistory } = useEmotionStore();
  const [duckData, setDuckData] = useState<MinuteAggregate[]>([]);
  const [duckStats, setDuckStats] = useState<{ totalMinutes: number; avgStress: number; avgEnergy: number; topMood: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDuckData = useCallback(async () => {
    setLoading(true);
    try {
      await flushBatch();
      const [data, stats] = await Promise.all([queryTimeline(1440), getStats()]);
      setDuckData(data);
      setDuckStats(stats);
    } catch {
      // DuckDB not available
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDuckData();
  }, [loadDuckData]);

  const chartData = useMemo(() => {
    return recentHistory.map((s, i) => ({
      time: new Date(s.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stress: Math.round(s.stressLevel * 100),
      energy: Math.round(s.energyLevel * 100),
      confidence: Math.round(s.confidence * 100),
      idx: i,
    }));
  }, [recentHistory]);

  const duckChartData = useMemo(() => {
    return duckData.map((row) => ({
      time: new Date(row.ts_minute).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stress: Math.round(row.stress_avg * 100),
      energy: Math.round(row.energy_avg * 100),
      confidence: Math.round(row.confidence_avg * 100),
      mood: row.mood,
      samples: row.sample_count,
    }));
  }, [duckData]);

  const exportLiveCSV = () => {
    const header = 'timestamp,mood,stress,energy,confidence\n';
    const rows = recentHistory.map((s) =>
      `${new Date(s.lastUpdated).toISOString()},${s.mood},${s.stressLevel.toFixed(3)},${s.energyLevel.toFixed(3)},${s.confidence.toFixed(3)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `emotion-live-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportAggregatedCSV = async () => {
    const csv = await exportDuckCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `emotion-aggregated-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Emotion Timeline</h1>
          <p className="text-muted-foreground mt-1">Your emotional journey, visualized locally.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={loadDuckData} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {recentHistory.length > 0 && (
            <button onClick={exportLiveCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Download size={14} /> Live CSV
            </button>
          )}
          {duckData.length > 0 && (
            <button onClick={exportAggregatedCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Database size={14} /> Aggregated CSV
            </button>
          )}
        </div>
      </div>

      {/* DuckDB Aggregated Stats */}
      {duckStats && duckStats.totalMinutes > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <Database size={16} className="text-mode-primary" /> DuckDB Local Analytics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Minutes Tracked', value: duckStats.totalMinutes },
              { label: 'Avg Stress', value: `${Math.round(duckStats.avgStress * 100)}%` },
              { label: 'Avg Energy', value: `${Math.round(duckStats.avgEnergy * 100)}%` },
              { label: 'Top Mood', value: duckStats.topMood },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-display font-bold text-lg text-foreground capitalize">{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DuckDB Minute-Level Chart */}
      {duckChartData.length > 1 && (
        <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
            <Database size={14} className="text-mode-primary" /> Minute-Level Aggregates
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={duckChartData}>
              <defs>
                <linearGradient id="dStressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dEnergyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="stress" stroke="hsl(0, 75%, 55%)" fill="url(#dStressGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="energy" stroke="hsl(200, 80%, 55%)" fill="url(#dEnergyGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {chartData.length < 3 ? (
        <motion.div className="glass rounded-2xl p-12 flex flex-col items-center text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BarChart3 size={48} className="text-muted-foreground/20 mb-4" />
          <p className="font-display text-lg text-foreground">Not enough live data yet</p>
          <p className="text-sm text-muted-foreground mt-1">Enable sensing and let it run for a minute to see your timeline.</p>
        </motion.div>
      ) : (
        <>
          {/* Live Stress & Energy Chart */}
          <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-display font-semibold text-foreground mb-4">Live Stress & Energy</h3>
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
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="stress" stroke="hsl(0, 75%, 55%)" fill="url(#stressGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="energy" stroke="hsl(200, 80%, 55%)" fill="url(#energyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Confidence */}
          <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
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
