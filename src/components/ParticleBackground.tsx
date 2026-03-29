import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEmotionStore } from '@/stores/emotionStore';
import { perfBudgeter } from '@/lib/adaptive';
import * as THREE from 'three';

const MOOD_COLORS: Record<string, [number, number, number]> = { 
  calm: [0.3, 0.75, 0.7],
  focus: [0.35, 0.5, 0.85],
  creative: [0.85, 0.4, 0.7],
  tired: [0.6, 0.45, 0.35],
  motivated: [0.9, 0.3, 0.3],
  neutral: [0.5, 0.55, 0.7],
  stressed: [0.5, 0.4, 0.75],
  overwhelmed: [0.4, 0.4, 0.55],
  joyful: [0.95, 0.8, 0.3],
};

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const { activeMood, emotion } = useEmotionStore();
  
  const count = perfBudgeter.particleCount * 2;
  
  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
      
      sizes[i] = Math.random() * 0.08 + 0.02;
    }
    return { positions, velocities, sizes };
  }, [count]);
  
  const colorRef = useRef(new THREE.Color(...(MOOD_COLORS.neutral)));
  const targetColor = useRef(new THREE.Color(...(MOOD_COLORS.neutral)));
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const mc = MOOD_COLORS[activeMood] || MOOD_COLORS.neutral;
    targetColor.current.setRGB(mc[0], mc[1], mc[2]);
    colorRef.current.lerp(targetColor.current, delta * 2);
    
    const energy = emotion.energyLevel;
    const stress = emotion.stressLevel;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    
    // Mood-specific speed multipliers
    let speedMult = 1;
    if (activeMood === 'calm') speedMult = 0.3;
    else if (activeMood === 'stressed') speedMult = 0.2;
    else if (activeMood === 'overwhelmed') speedMult = 0.1;
    else if (activeMood === 'tired') speedMult = 0.15;
    else if (activeMood === 'motivated') speedMult = 2.5;
    else if (activeMood === 'creative') speedMult = 1.8;
    else if (activeMood === 'joyful') speedMult = 2.0;
    else if (activeMood === 'focus') speedMult = 0.6;
    
    const motionMult = perfBudgeter.motionMultiplier * speedMult;
    
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      arr[ix] += velocities[ix] * (0.5 + energy) * motionMult * 60 * delta;
      arr[ix + 1] += velocities[ix + 1] * (0.5 + energy) * motionMult * 60 * delta;
      arr[ix + 2] += velocities[ix + 2] * motionMult * 60 * delta;
      
      // Stress: cluster particles toward center
      if (stress > 0.5) {
        const pullStrength = (stress - 0.5) * 0.002;
        arr[ix] -= arr[ix] * pullStrength;
        arr[ix + 1] -= arr[ix + 1] * pullStrength;
      }
      
      // Joy: upward lift
      if (activeMood === 'joyful') {
        arr[ix + 1] += 0.003 * delta * 60;
      }
      
      // Wrap bounds
      if (arr[ix] > 10) arr[ix] = -10;
      if (arr[ix] < -10) arr[ix] = 10;
      if (arr[ix + 1] > 6) arr[ix + 1] = -6;
      if (arr[ix + 1] < -6) arr[ix + 1] = 6;
      if (arr[ix + 2] > 4) arr[ix + 2] = -4;
      if (arr[ix + 2] < -4) arr[ix + 2] = 4;
    }
    posAttr.needsUpdate = true;
    
    // Update material color
    const mat = meshRef.current.material as THREE.PointsMaterial;
    mat.color.copy(colorRef.current);
    mat.opacity = 0.4 + emotion.confidence * 0.3;
    
    // Rotation for cinematic feel
    meshRef.current.rotation.y += delta * 0.02 * motionMult;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function NebulaGlow() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { activeMood, emotion } = useEmotionStore();
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const mc = MOOD_COLORS[activeMood] || MOOD_COLORS.neutral;
    const target = new THREE.Color(mc[0], mc[1], mc[2]);
    mat.color.lerp(target, delta * 1.5);
    mat.opacity = 0.04 + emotion.energyLevel * 0.03;
    
    meshRef.current.scale.setScalar(3 + emotion.energyLevel * 1.5);
    meshRef.current.rotation.z += delta * 0.01;
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, -3]}>
      <circleGeometry args={[3, 64]} />
      <meshBasicMaterial transparent opacity={0.05} />
    </mesh>
  );
}

export default function ParticleBackground() {
  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    return (
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, hsl(var(--mode-primary) / 0.06), transparent 70%)',
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <NebulaGlow />
        <Particles />
      </Canvas>
    </div>
  );
}
