import { useReducedMotion } from '../hooks/useReducedMotion';

interface AstroRingsProps {
  size?: number;
  className?: string;
}

const TILT = 0.45;

// ── Ringlet ──
interface Ringlet {
  rx: number;
  opacity: number;
  strokeWidth: number;
  color: 'cool' | 'bright' | 'warm';
  dash?: string;
}

// ── Band configuration — models Saturn's ring structure ──
interface BandConfig {
  name: string;
  start: number;
  end: number;
  spacing: number;
  baseOpacity: number;
  opacityDecay: number; // how much opacity fades from inner to outer edge
  strokeWidth: number;
  color: Ringlet['color'];
  waveFreq?: number; // density-wave oscillations per unit rx
  waveAmp?: number; // amplitude as fraction of baseOpacity
  dashEvery?: number; // every Nth ring is dashed
  particleEvery?: number; // every Nth ring uses particle dash pattern
}

const BANDS: BandConfig[] = [
  // D ring — innermost, very faint
  { name: 'D', start: 136, end: 144, spacing: 2.5, baseOpacity: 0.14, opacityDecay: 0.3, strokeWidth: 0.35, color: 'cool' },

  // C ring — moderate, diffuse inner
  { name: 'C', start: 146, end: 160, spacing: 2.0, baseOpacity: 0.22, opacityDecay: 0.2, strokeWidth: 0.45, color: 'cool', dashEvery: 4 },

  // B ring inner — brightness ramping up
  { name: 'B-inner', start: 161.5, end: 168, spacing: 1.3, baseOpacity: 0.38, opacityDecay: -0.30, strokeWidth: 0.55, color: 'bright', waveFreq: 0.55, waveAmp: 0.20 },

  // B ring core — brightest, strong density waves
  { name: 'B-core', start: 169, end: 182, spacing: 1.2, baseOpacity: 0.52, opacityDecay: 0.05, strokeWidth: 0.65, color: 'bright', waveFreq: 0.70, waveAmp: 0.25 },

  // Cassini Division — sharp inner edge, nearly empty
  { name: 'Cassini-inner', start: 183, end: 186, spacing: 1.5, baseOpacity: 0.08, opacityDecay: 0.5, strokeWidth: 0.30, color: 'cool' },
  { name: 'Cassini-core', start: 187.5, end: 195, spacing: 3.0, baseOpacity: 0.04, opacityDecay: 0.0, strokeWidth: 0.22, color: 'cool', particleEvery: 1 },
  { name: 'Cassini-outer', start: 196, end: 199, spacing: 1.5, baseOpacity: 0.07, opacityDecay: -0.3, strokeWidth: 0.30, color: 'cool' },

  // A ring — bright, with Encke gap
  { name: 'A-inner', start: 200, end: 212, spacing: 1.5, baseOpacity: 0.42, opacityDecay: 0.05, strokeWidth: 0.55, color: 'bright', waveFreq: 0.50, waveAmp: 0.15 },
  { name: 'A-mid', start: 213, end: 242, spacing: 1.6, baseOpacity: 0.38, opacityDecay: 0.15, strokeWidth: 0.50, color: 'bright', waveFreq: 0.45, waveAmp: 0.18, dashEvery: 5 },

  // Encke gap — narrow, sharp
  { name: 'Encke', start: 243, end: 246, spacing: 2.0, baseOpacity: 0.05, opacityDecay: 0.0, strokeWidth: 0.25, color: 'cool' },

  // A ring outer — extended
  { name: 'A-outer', start: 247, end: 278, spacing: 1.8, baseOpacity: 0.28, opacityDecay: 0.55, strokeWidth: 0.45, color: 'warm', dashEvery: 4 },

  // F ring — thin, extended
  { name: 'F', start: 280, end: 298, spacing: 2.0, baseOpacity: 0.15, opacityDecay: 0.40, strokeWidth: 0.38, color: 'cool', particleEvery: 3 },

  // Outer diffuse — fading into darkness
  { name: 'outer', start: 300, end: 328, spacing: 3.0, baseOpacity: 0.09, opacityDecay: 0.75, strokeWidth: 0.30, color: 'cool', particleEvery: 2 },

  // Outermost haze — barely there, just a whisper of ring
  { name: 'haze', start: 332, end: 350, spacing: 4.5, baseOpacity: 0.04, opacityDecay: 0.80, strokeWidth: 0.22, color: 'cool' },
];

function buildRinglets(): Ringlet[] {
  const rings: Ringlet[] = [];

  for (const band of BANDS) {
    const count = Math.floor((band.end - band.start) / band.spacing);
    for (let i = 0; i <= count; i++) {
      const rx = band.start + i * band.spacing;
      const progress = (rx - band.start) / (band.end - band.start);

      // Density wave modulation
      let waveFactor = 1;
      if (band.waveFreq && band.waveAmp) {
        waveFactor = 1 + band.waveAmp * Math.sin(rx * band.waveFreq);
      }

      // Opacity fades linearly from inner to outer edge
      const fadeFactor = 1 - progress * band.opacityDecay;
      const opacity = Math.max(0.02, band.baseOpacity * waveFactor * fadeFactor);

      // Dash pattern
      let dash: string | undefined;
      if (band.dashEvery && i % band.dashEvery === 0) {
        dash = '0.5 8';
      }
      if (band.particleEvery && i % band.particleEvery === 0) {
        dash = `0.3 ${38 + i * 2}`;
      }

      rings.push({ rx, opacity, strokeWidth: band.strokeWidth, color: band.color, dash });
    }
  }

  return rings;
}

const RINGLETS = buildRinglets();

// ── Color helper ──
function ringColor(color: Ringlet['color'], opacity: number): string {
  const base = color === 'bright' ? '100,200,240' : color === 'warm' ? '110,185,225' : '80,175,225';
  return `rgba(${base},${opacity.toFixed(3)})`;
}

export default function AstroRings({ size = 620, className = '' }: AstroRingsProps) {
  const reduced = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Split ringlets into two interleaved planes by index parity —
  // each plane gets rings at all radii for a complete structure.
  const planeA = RINGLETS.filter((_, i) => i % 2 === 0);
  const planeB = RINGLETS.filter((_, i) => i % 2 === 1);

  const brightA = planeA.filter(r => r.strokeWidth >= 0.6);
  const normalA = planeA.filter(r => r.strokeWidth < 0.6 && r.strokeWidth >= 0.35);
  const faintA = planeA.filter(r => r.strokeWidth < 0.35);
  const brightB = planeB.filter(r => r.strokeWidth >= 0.6);
  const normalB = planeB.filter(r => r.strokeWidth < 0.6 && r.strokeWidth >= 0.35);
  const faintB = planeB.filter(r => r.strokeWidth < 0.35);

  const ANGLE_A = 32;
  const ANGLE_B = -32;

  // Shared ring rendering helper
  function renderRingGroup(bright: Ringlet[], normal: Ringlet[], faint: Ringlet[], prefix: string) {
    // Mobile: skip SVG blur filters for GPU performance
    const glowFilter = isMobile ? undefined : 'url(#ar-glow)';
    return (
      <>
        <g filter={glowFilter}>
          {bright.map((r, i) => (
            <ellipse
              key={`${prefix}b-${i}`}
              cx="300" cy="300" rx={r.rx} ry={r.rx * TILT}
              fill="none"
              stroke={ringColor(r.color, r.opacity)}
              strokeWidth={r.strokeWidth}
              strokeDasharray={r.dash}
              style={{ animation: reduced ? 'none' : `ringPulse 6s ease-in-out infinite ${(i * 0.15) % 2.5}s` }}
            />
          ))}
        </g>
        {normal.map((r, i) => (
          <ellipse
            key={`${prefix}n-${i}`}
            cx="300" cy="300" rx={r.rx} ry={r.rx * TILT}
            fill="none"
            stroke={ringColor(r.color, r.opacity)}
            strokeWidth={r.strokeWidth}
            strokeDasharray={r.dash}
            style={{ animation: reduced ? 'none' : `ringPulse 6s ease-in-out infinite ${(i * 0.12) % 3}s` }}
          />
        ))}
        {faint.map((r, i) => (
          <ellipse
            key={`${prefix}f-${i}`}
            cx="300" cy="300" rx={r.rx} ry={r.rx * TILT}
            fill="none"
            stroke={ringColor(r.color, r.opacity)}
            strokeWidth={r.strokeWidth}
            strokeDasharray={r.dash}
            style={{ animation: reduced ? 'none' : `ringPulse 8s ease-in-out infinite ${(i * 0.25) % 3}s` }}
          />
        ))}
        {/* Shadow overlay — one per plane, rotates with the rings */}
        <ellipse cx="300" cy="300" rx="300" ry={300 * TILT}
          fill="url(#ring-lighting)"
          style={{ pointerEvents: 'none' }}
        />
      </>
    );
  }

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* ── Wide ambient halo ── */}
      <div
        className="absolute rounded-full"
        style={{
          width: '75%', height: '75%', left: '12.5%', top: '12.5%',
          background: 'radial-gradient(circle at 50% 50%, rgba(35,130,200,0.14) 0%, rgba(20,90,160,0.05) 40%, transparent 70%)',
          filter: 'blur(20px)',
          animation: reduced ? 'none' : 'ringGlow 8s ease-in-out infinite',
        }}
      />

      {/* ── Central core glow ── */}
      <div
        className="absolute rounded-full"
        style={{
          width: '55%', height: '55%', left: '22.5%', top: '22.5%',
          background: 'radial-gradient(circle at 50% 50%, rgba(90,200,248,0.45) 0%, rgba(60,170,232,0.18) 30%, transparent 60%)',
          filter: 'blur(10px)',
          animation: reduced ? 'none' : 'ringGlow 5s ease-in-out infinite',
        }}
      />

      <svg
        viewBox="0 0 600 600"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          <filter id="ar-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ar-glow-strong" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ar-glow-wide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <linearGradient id="ring-lighting" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#010b18" stopOpacity="0" />
            <stop offset="25%" stopColor="#010b18" stopOpacity="0.03" />
            <stop offset="45%" stopColor="#010b18" stopOpacity="0.15" />
            <stop offset="65%" stopColor="#010b18" stopOpacity="0.38" />
            <stop offset="85%" stopColor="#010b18" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#010b18" stopOpacity="0.78" />
          </linearGradient>
        </defs>

        {/* ── Outermost diffuse halo — unrotated ── */}
        <circle cx="300" cy="300" r="290"
          fill="none" stroke="rgba(45,135,205,0.06)" strokeWidth="16"
          filter={isMobile ? undefined : 'url(#ar-glow-wide)'}
          style={{ animation: reduced ? 'none' : 'ringPulse 10s ease-in-out infinite' }}
        />

        {/* ═══════════════════════════════════════════════════════
            PLANE A — rotated +32° (upper-right → lower-left)
            ═══════════════════════════════════════════════════════ */}
        <g transform={`rotate(${ANGLE_A} 300 300)`}>
          {renderRingGroup(brightA, normalA, faintA, 'a')}
        </g>

        {/* ═══════════════════════════════════════════════════════
            PLANE B — rotated -32° (upper-left → lower-right)
            ═══════════════════════════════════════════════════════ */}
        <g transform={`rotate(${ANGLE_B} 300 300)`}>
          {renderRingGroup(brightB, normalB, faintB, 'b')}
        </g>

      </svg>
    </div>
  );
}
