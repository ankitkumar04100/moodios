import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import {
  BarChart3, Download, Database, RefreshCw, Clock, Activity, Zap, Brain,
  TrendingUp, TrendingDown, Minus, ChevronRight, Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell,
} from 'recharts';
import { queryTimeline, exportCSV as exportDuckCSV, flushBatch, getStats, type MinuteAggregate } from '@/lib/duckdb';
import type { Mood } from '@/types/emotion';

const MOOD_COLORS: Record<string, string> = {
  calm: 'hsl(175, 60%, 42%)',
  focus: 'hsl(220, 85%, 55%)',
  creative: 'hsl(320, 75%, 55%)',
  tired: 'hsl(35, 60%, 50%)',
  motivated: 'hsl(0, 75%, 55%)',
  neutral: 'hsl(220, 15%, 55%)',
};

const MOOD_ICONS: Record<string, string> = {
  calm: '🌊', focus: '🎯', creative: '✨', tired: '🌙', motivated: '🔥', neutral: '⚡',
};

function formatTime(timestamp: number | string): string {
  const d = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatTimeShort(timestamp: number | string): string {
  const d = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getRelativeTime(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (Math.abs(diff) < 0.02) return <Minus size={12} className="text-muted-foreground" />;
  return diff > 0
    ? <TrendingUp size={12} className="text-red-400" />
    : <TrendingDown size={12} className="text-green-400" />;
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs space-y-1.5 min-w-[140px]">
      <p className="font-display font-semibold text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.dataKey}</span>
          </div>
          <span className="font-mono text-foreground font-medium">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function TimelinePage() {
  const { recentHistory } = useEmotionStore();
  const [duckData, setDuckData] = useState<MinuteAggregate[]>([]);
  const [duckStats, setDuckStats] = useState<{ totalMinutes: number; avgStress: number; avgEnergy: number; topMood: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'aggregated'>('live');

  const loadDuckData = useCallback(async () => {
    setLoading(true);
    try {
      await flushBatch();
      const [data, stats] = await Promise.all([queryTimeline(1440), getStats()]);
      setDuckData(data);
      setDuckStats(stats);
    } catch { /* DuckDB unavailable */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadDuckData(); }, [loadDuckData]);

  // Live chart data
  const chartData = useMemo(() =>
    recentHistory.map((s) => ({
      time: formatTime(s.lastUpdated),
      stress: Math.round(s.stressLevel * 100),
      energy: Math.round(s.energyLevel * 100),
      confidence: Math.round(s.confidence * 100),
      mood: s.mood,
    })),
  [recentHistory]);

  // DuckDB chart data
  const duckChartData = useMemo(() =>
    duckData.map((row) => ({
      time: formatTimeShort(row.ts_minute),
      stress: Math.round(row.stress_avg * 100),
      energy: Math.round(row.energy_avg * 100),
      confidence: Math.round(row.confidence_avg * 100),
      mood: row.mood,
      samples: row.sample_count,
    })),
  [duckData]);

  // Mood distribution from live data
  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    recentHistory.forEach((s) => { counts[s.mood] = (counts[s.mood] || 0) + 1; });
    const total = recentHistory.length || 1;
    return Object.entries(counts)
      .map(([mood, count]) => ({ mood, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [recentHistory]);

  // Recent activity feed
  const recentActivity = useMemo(() => {
    const entries = recentHistory.slice(-30).reverse();
    const activity: { mood: Mood; timestamp: number; stress: number; energy: number; confidence: number; isTransition: boolean }[] = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const prev = entries[i + 1];
      activity.push({
        mood: e.mood,
        timestamp: e.lastUpdated,
        stress: e.stressLevel,
        energy: e.energyLevel,
        confidence: e.confidence,
        isTransition: !!prev && prev.mood !== e.mood,
      });
    }
    return activity;
  }, [recentHistory]);

  const exportLiveCSV = () => {
    const header = 'timestamp,mood,stress,energy,confidence\n';
    const rows = recentHistory.map((s) =>
      `${new Date(s.lastUpdated).toISOString()},${s.mood},${s.stressLevel.toFixed(3)},${s.energyLevel.toFixed(3)},${s.confidence.toFixed(3)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `moodios-live-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportAggregatedCSV = async () => {
    const csv = await exportDuckCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `moodios-aggregated-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const currentEmotion = recentHistory[recentHistory.length - 1];
  const previousEmotion = recentHistory[recentHistory.length - 2];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <p className="text-xs text-mode-primary uppercase tracking-widest font-display">MoodiOS Analytics</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Emotion Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {recentHistory.length > 0
              ? `${recentHistory.length} data points • Session started ${getRelativeTime(recentHistory[0]?.lastUpdated || Date.now())}`
              : 'Your emotional journey, visualized locally.'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={loadDuckData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium glass text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {recentHistory.length > 0 && (
            <button
              onClick={exportLiveCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium glass text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download size={13} /> Export CSV
            </button>
          )}
        </div>
      </motion.div>

      {/* Live Summary Cards */}
      {currentEmotion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            {
              label: 'Current Mood',
              value: currentEmotion.mood,
              icon: Brain,
              sub: MOOD_ICONS[currentEmotion.mood] || '⚡',
              isText: true,
            },
            {
              label: 'Stress Level',
              value: currentEmotion.stressLevel,
              icon: Activity,
              trend: previousEmotion?.stressLevel,
              color: 'text-red-400',
            },
            {
              label: 'Energy Level',
              value: currentEmotion.energyLevel,
              icon: Zap,
              trend: previousEmotion?.energyLevel,
              color: 'text-blue-400',
            },
            {
              label: 'Confidence',
              value: currentEmotion.confidence,
              icon: Sparkles,
              trend: previousEmotion?.confidence,
              color: 'text-mode-primary',
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              className="glass rounded-2xl p-4 relative overflow-hidden group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-mode-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <card.icon size={14} className={`mb-2 ${card.color || 'text-mode-primary'}`} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{card.label}</p>
              {card.isText ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">{card.sub}</span>
                  <p className="font-display text-xl font-bold text-foreground capitalize">{String(card.value)}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                    {Math.round((card.value as number) * 100)}%
                  </p>
                  {card.trend !== undefined && (
                    <TrendIndicator current={card.value as number} previous={card.trend} />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tab Switch */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit">
        {(['live', 'aggregated'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab
                ? 'bg-mode-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'live' ? 'Live Feed' : 'Aggregated'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'live' ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            {chartData.length < 3 ? (
              <motion.div
                className="glass rounded-2xl p-12 flex flex-col items-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                  <BarChart3 size={48} className="text-muted-foreground/20 mb-4" />
                </motion.div>
                <p className="font-display text-lg text-foreground">Not enough data yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">Enable sensing and wait a moment to see your live emotion timeline.</p>
              </motion.div>
            ) : (
              <>
                {/* Main Live Chart */}
                <motion.div
                  className="glass rounded-2xl p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                    <Activity size={14} className="text-mode-primary" />
                    Stress & Energy — Live
                    <span className="ml-auto text-[10px] text-muted-foreground font-normal">
                      {chartData.length} samples
                    </span>
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="stressGradL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="energyGradL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="confGradL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--mode-primary))" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="hsl(var(--mode-primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="stress" stroke="hsl(0, 75%, 55%)" fill="url(#stressGradL)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="energy" stroke="hsl(200, 80%, 55%)" fill="url(#energyGradL)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="confidence" stroke="hsl(var(--mode-primary))" fill="url(#confGradL)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-5 mt-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 rounded" /> Stress</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 rounded" /> Energy</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded border border-dashed border-mode-primary" /> Confidence</span>
                  </div>
                </motion.div>

                {/* Mood Distribution */}
                {moodDistribution.length > 0 && (
                  <motion.div
                    className="glass rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                      <Brain size={14} className="text-mode-primary" /> Mood Distribution
                    </h3>
                    <div className="space-y-3">
                      {moodDistribution.map((m, i) => (
                        <motion.div
                          key={m.mood}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3"
                        >
                          <span className="text-base w-6 text-center">{MOOD_ICONS[m.mood] || '⚡'}</span>
                          <span className="text-xs text-foreground font-medium capitalize w-16">{m.mood}</span>
                          <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: MOOD_COLORS[m.mood] || MOOD_COLORS.neutral }}
                              initial={{ width: 0 }}
                              animate={{ width: `${m.pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{m.pct}%</span>
                          <span className="text-[10px] text-muted-foreground tabular-nums w-12 text-right">({m.count})</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recent Activity Feed */}
                <motion.div
                  className="glass rounded-2xl p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-mode-primary" />
                    Recent Activity
                    <span className="ml-auto text-[10px] text-muted-foreground font-normal">
                      Last {recentActivity.length} readings
                    </span>
                  </h3>
                  <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                    {recentActivity.map((entry, i) => (
                      <motion.div
                        key={`${entry.timestamp}-${i}`}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-secondary/30 ${
                          entry.isTransition ? 'border-l-2 border-mode-primary bg-mode-primary/5' : ''
                        }`}
                      >
                        <span className="text-base w-6 text-center shrink-0">
                          {MOOD_ICONS[entry.mood] || '⚡'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground capitalize">{entry.mood}</span>
                            {entry.isTransition && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-mode-primary/15 text-mode-primary font-medium">
                                transition
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Activity size={9} /> {Math.round(entry.stress * 100)}%
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Zap size={9} /> {Math.round(entry.energy * 100)}%
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Sparkles size={9} /> {Math.round(entry.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-muted-foreground font-mono">{formatTime(entry.timestamp)}</p>
                          <p className="text-[9px] text-muted-foreground/60">{getRelativeTime(entry.timestamp)}</p>
                        </div>
                        <ChevronRight size={12} className="text-muted-foreground/30 shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Session Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Data Points', value: recentHistory.length, icon: BarChart3 },
                    { label: 'Avg Stress', value: `${Math.round(recentHistory.reduce((a, s) => a + s.stressLevel, 0) / recentHistory.length * 100)}%`, icon: Activity },
                    { label: 'Avg Energy', value: `${Math.round(recentHistory.reduce((a, s) => a + s.energyLevel, 0) / recentHistory.length * 100)}%`, icon: Zap },
                    { label: 'Top Mood', value: getMostCommonMood(recentHistory), icon: Brain },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="glass rounded-xl p-4 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <stat.icon size={14} className="mx-auto mb-1.5 text-mode-primary" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="font-display font-bold text-lg text-foreground capitalize">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="aggregated"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* DuckDB Stats */}
            {duckStats && duckStats.totalMinutes > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5"
                >
                  <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                    <Database size={14} className="text-mode-primary" /> Local Analytics (DuckDB)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Minutes Tracked', value: duckStats.totalMinutes, icon: Clock },
                      { label: 'Avg Stress', value: `${Math.round(duckStats.avgStress * 100)}%`, icon: Activity },
                      { label: 'Avg Energy', value: `${Math.round(duckStats.avgEnergy * 100)}%`, icon: Zap },
                      { label: 'Top Mood', value: duckStats.topMood, icon: Brain },
                    ].map((s, i) => (
                      <motion.div
                        key={s.label}
                        className="text-center p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <s.icon size={14} className="mx-auto mb-1.5 text-mode-primary" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                        <p className="font-display font-bold text-lg text-foreground capitalize">{s.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* DuckDB Chart */}
                {duckChartData.length > 1 && (
                  <motion.div
                    className="glass rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-foreground flex items-center gap-2 text-sm">
                        <Database size={14} className="text-mode-primary" /> Minute-Level Aggregates
                      </h3>
                      <button
                        onClick={exportAggregatedCSV}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Download size={11} /> Export
                      </button>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={duckChartData}>
                        <defs>
                          <linearGradient id="dStressG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="dEnergyG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={30} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="stress" stroke="hsl(0, 75%, 55%)" fill="url(#dStressG)" strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="energy" stroke="hsl(200, 80%, 55%)" fill="url(#dEnergyG)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {/* Mood over time bar chart */}
                {duckChartData.length > 1 && (
                  <motion.div
                    className="glass rounded-2xl p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                      <Brain size={14} className="text-mode-primary" /> Mood Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={duckChartData}>
                        <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                        <Tooltip
                          content={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="glass rounded-xl p-2 text-xs">
                                <p className="font-display font-semibold text-foreground">{label}</p>
                                <p className="text-muted-foreground capitalize">{payload[0]?.payload?.mood}</p>
                                <p className="text-[10px] text-muted-foreground">{payload[0]?.payload?.samples} samples</p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="samples" radius={[4, 4, 0, 0]}>
                          {duckChartData.map((entry, i) => (
                            <Cell key={i} fill={MOOD_COLORS[entry.mood] || MOOD_COLORS.neutral} opacity={0.7} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-3 text-[10px] text-muted-foreground">
                      {Object.entries(MOOD_ICONS).map(([mood, icon]) => (
                        <span key={mood} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: MOOD_COLORS[mood] }} />
                          {icon} {mood}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                className="glass rounded-2xl p-12 flex flex-col items-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Database size={48} className="text-muted-foreground/20 mb-4" />
                <p className="font-display text-lg text-foreground">No aggregated data yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  DuckDB aggregates data every minute. Enable sensing and wait for data to accumulate.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getMostCommonMood(history: { mood: string }[]): string {
  const counts: Record<string, number> = {};
  history.forEach((s) => { counts[s.mood] = (counts[s.mood] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
}
