import { useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type DriftType = 'right' | 'left' | 'arc';

interface Particle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  blur: number;
  drift: DriftType;
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

const DRIFT_NAMES: Record<DriftType, string> = {
  right: 'particleDrift',
  left: 'particleDriftLeft',
  arc: 'particleDriftArc',
};

export default function ParticleField({ count = 18, className = '' }: ParticleFieldProps) {
  const reduced = useReducedMotion();

  const particles = useMemo<Particle[]>(() => {
    const drifts: DriftType[] = ['right', 'left', 'arc'];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 1.5 + Math.random() * 4.5,
      delay: Math.random() * 22,
      duration: 14 + Math.random() * 18,
      opacity: 0.10 + Math.random() * 0.25,
      blur: Math.random() > 0.55 ? 1 + Math.random() * 2.5 : 0,
      drift: drifts[i % 3],
    }));
  }, [count]);

  if (reduced) return null;

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(160, 190, 220, ${p.opacity})`,
            boxShadow: p.blur > 0 ? `0 0 ${p.blur * 3}px rgba(160,190,220,${p.opacity * 1.4})` : 'none',
            filter: p.blur > 0 ? `blur(${p.blur}px)` : 'none',
            animation: `${DRIFT_NAMES[p.drift]} ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
