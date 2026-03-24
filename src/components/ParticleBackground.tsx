import { useEffect, useRef, useCallback } from 'react';
import { useEmotionStore } from '@/stores/emotionStore';
import { perfBudgeter } from '@/lib/adaptive';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

const MOOD_HUES: Record<string, number> = {
  calm: 175,
  focus: 220,
  creative: 320,
  tired: 35,
  motivated: 0,
  neutral: 200,
};

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const { activeMood, emotion, sensingActive } = useEmotionStore();

  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initParticles = useCallback((count: number, w: number, h: number) => {
    const particles: Particle[] = [];
    const hue = MOOD_HUES[activeMood] ?? 200;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        hue: hue + (Math.random() - 0.5) * 30,
      });
    }
    return particles;
  }, [activeMood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const count = perfBudgeter.particleCount;
    particlesRef.current = initParticles(count, window.innerWidth, window.innerHeight);

    const animate = (timestamp: number) => {
      perfBudgeter.recordFrame(timestamp);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const energy = emotion.energyLevel;
      const hue = MOOD_HUES[activeMood] ?? 200;
      const motionMult = perfBudgeter.motionMultiplier;

      ctx.clearRect(0, 0, w, h);

      // Nebula gradient backdrop
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.7);
      grad.addColorStop(0, `hsla(${hue}, 60%, 50%, ${0.06 + energy * 0.04})`);
      grad.addColorStop(0.5, `hsla(${hue + 30}, 40%, 30%, ${0.03 + energy * 0.02})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Particles
      for (const p of particlesRef.current) {
        p.x += p.vx * (0.5 + energy) * motionMult;
        p.y += p.vy * (0.5 + energy) * motionMult;
        p.hue += (hue - p.hue) * 0.02;

        // Wrap
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.8 + energy * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.opacity * (0.6 + emotion.confidence * 0.4)})`;
        ctx.fill();

        // Bloom glow for larger particles
        if (p.size > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.08})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [activeMood, prefersReduced, initParticles, emotion.energyLevel, emotion.confidence]);

  if (prefersReduced) {
    return (
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, hsla(${MOOD_HUES[activeMood] ?? 200}, 50%, 40%, 0.08), transparent 70%)`,
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
