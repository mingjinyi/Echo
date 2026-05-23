import { useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Star {
  id: number;
  cx: number;
  cy: number;
  r: number;
  opacity: number;
  blur: number;
}

interface StarFieldProps {
  count?: number;
}

export default function StarField({ count = 240 }: StarFieldProps) {
  const reduced = useReducedMotion();

  const stars = useMemo<Star[]>(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() < 0.85 ? 0.3 + Math.random() * 1.4 : 1.5 + Math.random() * 2.5,
      opacity: 0.08 + Math.random() * 0.55,
      blur: Math.random() < 0.25 ? 0.8 + Math.random() * 1.8 : 0,
    })),
  [count]);

  if (reduced) return null;

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="sf-glow">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      {stars.map(s => (
        <circle
          key={s.id}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="rgba(170,205,235,1)"
          opacity={s.opacity}
          filter={s.blur > 0 ? 'url(#sf-glow)' : undefined}
          style={s.blur > 0 ? { filter: `blur(${s.blur}px)` } : undefined}
        />
      ))}
    </svg>
  );
}
