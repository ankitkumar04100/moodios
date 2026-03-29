import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Layers, Shield, Target, Sparkles, BarChart3, Settings, Info, PauseCircle, PlayCircle, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import PermissionsSheet from '@/components/PermissionsSheet';
import ParticleBackground from '@/components/ParticleBackground';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useSoundscape } from '@/hooks/useSoundscape';
import { enableSoundscape, disableSoundscape, isSoundscapeEnabled } from '@/core/audio/soundscapeEngine'; 

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/modes', icon: Layers, label: 'Modes' },
  { to: '/timeline', icon: BarChart3, label: 'Timeline' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/about', icon: Info, label: 'About' },
];

const sidebarExtraItems = [
  { to: '/shield', icon: Shield, label: 'Shield' },
  { to: '/focus', icon: Target, label: 'Focus' },
  { to: '/creative', icon: Sparkles, label: 'Creative' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { activeMood, sensingActive, sensingMode, killSwitch, toggleSensing, emotion } = useEmotionStore();
  const location = useLocation();
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  useSoundscape();

  const moodClass = activeMood === 'neutral' ? '' : `mood-${activeMood}`;

  return (
    <div className={`min-h-screen flex flex-col ${moodClass} film-grain`}>
      <ParticleBackground />
      <VoiceAssistant />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-mode-primary to-mode-glow"
              animate={{ scale: sensingActive ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 2, repeat: sensingActive ? Infinity : 0 }}
            />
            <h1 className="font-display text-lg font-bold tracking-tight text-foreground">MoodiOS</h1>
          </div>

          <div className="flex items-center gap-2">
            {sensingActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full glass-subtle text-xs font-medium text-muted-foreground"
              >
                <span className="w-2 h-2 rounded-full bg-mode-primary animate-pulse" />
                {activeMood.charAt(0).toUpperCase() + activeMood.slice(1)} · {Math.round(emotion.confidence * 100)}%
                {sensingMode === 'simulation' && (
                  <span className="text-amber-500 ml-1">SIM</span>
                )}
              </motion.div>
            )}

            <button
              onClick={() => {
                if (soundOn) { disableSoundscape(); setSoundOn(false); }
                else { enableSoundscape(); setSoundOn(true); }
              }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              aria-label={soundOn ? 'Disable soundscape' : 'Enable soundscape'}
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
              onClick={() => setPermissionsOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
              aria-label="Sensor permissions"
            >
              <SlidersHorizontal size={18} />
            </button>

            <button
              onClick={sensingActive ? killSwitch : toggleSensing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                sensingActive
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  : 'bg-mode-primary/10 text-mode-primary hover:bg-mode-primary/20'
              }`}
              aria-label={sensingActive ? 'Kill switch - pause all sensing' : 'Enable sensing'}
            >
              {sensingActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
              <span className="hidden sm:inline">{sensingActive ? 'Pause' : 'Sense'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav (desktop) — Settings & About at bottom */}
        <nav className="hidden md:flex flex-col gap-1 p-3 w-16 lg:w-48 shrink-0">
          {/* Main items (Home, Modes, Timeline) */}
          {navItems.slice(0, 3).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-mode-primary/15 text-mode-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <Icon size={18} />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
          
          {/* Extra items */}
          {sidebarExtraItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-mode-primary/15 text-mode-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <Icon size={18} />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Settings & About at bottom */}
          {navItems.slice(3).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-mode-primary/15 text-mode-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <Icon size={18} />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom nav (mobile/tablet) */}
      <nav className="md:hidden sticky bottom-0 z-50 glass flex justify-around py-1.5 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition-colors ${
                isActive ? 'text-mode-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <PermissionsSheet open={permissionsOpen} onOpenChange={setPermissionsOpen} />
    </div>
  );
}
