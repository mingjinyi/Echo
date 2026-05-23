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

  // A ring outer
  { name: 'A-outer', start: 247, end: 262, spacing: 1.8, baseOpacity: 0.28, opacityDecay: 0.50, strokeWidth: 0.45, color: 'warm', dashEvery: 4 },

  // F ring — thin, just outside A
  { name: 'F', start: 264, end: 276, spacing: 1.8, baseOpacity: 0.16, opacityDecay: 0.35, strokeWidth: 0.40, color: 'cool', particleEvery: 3 },

  // Outer diffuse — fading into darkness
  { name: 'outer', start: 278, end: 296, spacing: 2.8, baseOpacity: 0.10, opacityDecay: 0.70, strokeWidth: 0.32, color: 'cool', particleEvery: 2 },
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

// ── Lit-side highlight arcs — specular glints on the sunlit face ──
interface LitArc {
  rx: number;
  opacity: number;
  strokeWidth: number;
  path: string;
}

function buildLitArcs(): LitArc[] {
  const specs = [
    { rx: 165, opacity: 0.35, strokeWidth: 0.9 },
    { rx: 175, opacity: 0.38, strokeWidth: 0.8 },
    { rx: 205, opacity: 0.30, strokeWidth: 0.8 },
    { rx: 225, opacity: 0.24, strokeWidth: 0.7 },
    { rx: 250, opacity: 0.18, strokeWidth: 0.6 },
    { rx: 270, opacity: 0.10, strokeWidth: 0.5 },
    { rx: 285, opacity: 0.06, strokeWidth: 0.4 },
  ];

  return specs.map(s => {
    const ry = s.rx * TILT;
    // Quarter arc: top → left side (counter-clockwise), the "sunlit" face
    return {
      ...s,
      path: `M 300 ${300 - ry} A ${s.rx} ${ry} 0 0 0 ${300 - s.rx} 300`,
    };
  });
}

const LIT_ARCS = buildLitArcs();

// ── Inclined rings — slight gravitational warps in the ring plane ──
// These add organic imperfection: no real ring system is perfectly flat.
interface InclinedRing {
  rx: number;
  opacity: number;
  strokeWidth: number;
  angle: number; // degrees of rotation from horizontal
  color: Ringlet['color'];
}

const INCLINED_RINGS: InclinedRing[] = [
  { rx: 168, opacity: 0.30, strokeWidth: 0.55, angle: 5, color: 'bright' },
  { rx: 175, opacity: 0.34, strokeWidth: 0.50, angle: -6, color: 'bright' },
  { rx: 210, opacity: 0.26, strokeWidth: 0.50, angle: 4, color: 'bright' },
  { rx: 232, opacity: 0.20, strokeWidth: 0.45, angle: -7, color: 'warm' },
  { rx: 254, opacity: 0.14, strokeWidth: 0.40, angle: 6, color: 'warm' },
  { rx: 272, opacity: 0.09, strokeWidth: 0.35, angle: -5, color: 'cool' },
  { rx: 288, opacity: 0.05, strokeWidth: 0.30, angle: 8, color: 'cool' },
];

// ── Color helper ──
function ringColor(color: Ringlet['color'], opacity: number): string {
  const base = color === 'bright' ? '100,200,240' : color === 'warm' ? '110,185,225' : '80,175,225';
  return `rgba(${base},${opacity.toFixed(3)})`;
}

export default function AstroRings({ size = 620, className = '' }: AstroRingsProps) {
  const reduced = useReducedMotion();

  // Split for selective filter application (perf: only brightest rings get glow filter)
  const brightRings = RINGLETS.filter(r => r.strokeWidth >= 0.6);
  const normalRings = RINGLETS.filter(r => r.strokeWidth < 0.6 && r.strokeWidth >= 0.35);
  const faintRings = RINGLETS.filter(r => r.strokeWidth < 0.35);

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* ── Wide outer halo ── */}
      <div
        className="absolute"
        style={{
          width: '90%', height: '38%', left: '5%', top: '31%',
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(35,130,200,0.12) 0%, rgba(20,90,160,0.04) 40%, transparent 70%)',
          filter: 'blur(18px)', borderRadius: '50%',
          animation: reduced ? 'none' : 'ringGlow 8s ease-in-out infinite',
        }}
      />

      {/* ── Ring-plane core glow ── */}
      <div
        className="absolute"
        style={{
          width: '64%', height: '26%', left: '18%', top: '37%',
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(90,200,248,0.42) 0%, rgba(60,170,232,0.16) 28%, transparent 62%)',
          filter: 'blur(8px)', borderRadius: '50%',
          animation: reduced ? 'none' : 'ringGlow 5s ease-in-out infinite',
        }}
      />

      {/* ── Directional light — offset glow on the sunlit upper-left ── */}
      <div
        className="absolute"
        style={{
          width: '48%', height: '28%', left: '10%', top: '28%',
          background: 'radial-gradient(ellipse 50% 50% at 38% 42%, rgba(165,225,252,0.20) 0%, rgba(105,185,228,0.07) 35%, transparent 65%)',
          filter: 'blur(12px)', borderRadius: '50%',
          animation: reduced ? 'none' : 'ringGlow 6s ease-in-out infinite 1.5s',
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
          <filter id="ar-lit-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── Realistic lighting: sun at top-left, shadow at bottom-right ── */}
          <linearGradient id="ring-lighting" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#010b18" stopOpacity="0" />
            <stop offset="25%" stopColor="#010b18" stopOpacity="0.03" />
            <stop offset="45%" stopColor="#010b18" stopOpacity="0.15" />
            <stop offset="65%" stopColor="#010b18" stopOpacity="0.38" />
            <stop offset="85%" stopColor="#010b18" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#010b18" stopOpacity="0.78" />
          </linearGradient>
        </defs>

        {/* ── Outermost diffuse halo ── */}
        <ellipse cx="300" cy="300" rx="297" ry={297 * TILT}
          fill="none" stroke="rgba(45,135,205,0.06)" strokeWidth="16"
          filter="url(#ar-glow-wide)"
          style={{ animation: reduced ? 'none' : 'ringPulse 10s ease-in-out infinite' }}
        />

        {/* ═══════════════════════════════════════════════════════
            BRIGHT RINGLETS — with glow filter
            ═══════════════════════════════════════════════════════ */}
        <g filter="url(#ar-glow)">
          {brightRings.map((r, i) => (
            <ellipse
              key={`b-${i}`}
              cx="300" cy="300" rx={r.rx} ry={r.rx * TILT}
              fill="none"
              stroke={ringColor(r.color, r.opacity)}
              strokeWidth={r.strokeWidth}
              strokeDasharray={r.dash}
              style={{ animation: reduced ? 'none' : `ringPulse 6s ease-in-out infinite ${(i * 0.15) % 2.5}s` }}
            />
          ))}
        </g>

        {/* ═══════════════════════════════════════════════════════
            NORMAL RINGLETS — no filter (perf)
            ═══════════════════════════════════════════════════════ */}
        {normalRings.map((r, i) => (
          <ellipse
            key={`n-${i}`}
            cx="300" cy="300" rx={r.rx} ry={r.rx * TILT}
            fill="none"
            stroke={ringColor(r.color, r.opacity)}
            strokeWidth={r.strokeWidth}
            strokeDasharray={r.dash}
            style={{ animation: reduced ? 'none' : `ringPulse 6s ease-in-out infinite ${(i * 0.12) % 3}s` }}
          />
        ))}

        {/* ═══════════════════════════════════════════════════════
            FAINT RINGLETS — gap dust
            ═══════════════════════════════════════════════════════ */}
        {faintRings.map((r, i) => (
          <ellipse
            key={`f-${i}`}
            cx="300" cy="300" rx={r.rx} ry={r.rx * TILT}
            fill="none"
            stroke={ringColor(r.color, r.opacity)}
            strokeWidth={r.strokeWidth}
            strokeDasharray={r.dash}
            style={{ animation: reduced ? 'none' : `ringPulse 8s ease-in-out infinite ${(i * 0.25) % 3}s` }}
          />
        ))}

        {/* ═══════════════════════════════════════════════════════
            LIT-SIDE SPECULAR ARCS
            ═══════════════════════════════════════════════════════ */}
        <g filter="url(#ar-lit-glow)">
          {LIT_ARCS.map((arc, i) => (
            <path
              key={`lit-${i}`}
              d={arc.path}
              fill="none"
              stroke={`rgba(165,230,252,${arc.opacity})`}
              strokeWidth={arc.strokeWidth}
              strokeLinecap="round"
              style={{ animation: reduced ? 'none' : `ringPulse 5s ease-in-out infinite ${(i * 0.3) % 2.5}s` }}
            />
          ))}
        </g>

        {/* ═══════════════════════════════════════════════════════
            INCLINED RINGS — subtle gravitational warps (4-8°)
            Breaks the perfect uniformity; no real ring is flat.
            ═══════════════════════════════════════════════════════ */}
        {INCLINED_RINGS.map((ring, i) => (
          <ellipse
            key={`inc-${i}`}
            cx="300" cy="300"
            rx={ring.rx}
            ry={ring.rx * TILT}
            fill="none"
            stroke={ringColor(ring.color, ring.opacity)}
            strokeWidth={ring.strokeWidth}
            transform={`rotate(${ring.angle} 300 300)`}
            filter="url(#ar-glow)"
            style={{ animation: reduced ? 'none' : `ringPulse 6s ease-in-out infinite ${(i * 0.5) % 2.5}s` }}
          />
        ))}

        {/* ═══════════════════════════════════════════════════════
            SHADOW OVERLAY — realistic 3D lighting falloff
            Darkens the bottom-right (shadow side), leaves
            the top-left (sunlit side) bright and crisp.
            ═══════════════════════════════════════════════════════ */}
        <ellipse cx="300" cy="300" rx="300" ry={300 * TILT}
          fill="url(#ring-lighting)"
          style={{ pointerEvents: 'none' }}
        />

        {/* ═══════════════════════════════════════════════════════
            INNER GLOW — bioluminescent edge around the eye
            Rendered AFTER shadow so it always glows
            ═══════════════════════════════════════════════════════ */}
        <ellipse cx="300" cy="300" rx="133" ry={133 * TILT}
          fill="none" stroke="rgba(115,205,245,0.45)" strokeWidth="1.6"
          filter="url(#ar-glow-strong)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 3.8s' }} />

        <ellipse cx="300" cy="300" rx="127" ry={127 * TILT}
          fill="none" stroke="rgba(115,205,245,0.20)" strokeWidth="9"
          filter="url(#ar-glow-wide)"
          style={{ animation: reduced ? 'none' : 'ringGlow 5s ease-in-out infinite' }} />

        {/* ═══════════════════════════════════════════════════════
            ORBITAL DENSITY-WAVE HIGHLIGHTS
            ═══════════════════════════════════════════════════════ */}
        <path d={`M 300 300 A 264 ${Math.round(264 * TILT)} 0 0 1 ${300 + 264} 300`}
          fill="none" stroke="rgba(115,200,240,0.15)" strokeWidth="0.6"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 5s ease-in-out infinite 4.5s' }} />
        <path d={`M 300 300 A 264 ${Math.round(264 * TILT)} 0 0 0 ${300 - 264} 300`}
          fill="none" stroke="rgba(115,200,240,0.10)" strokeWidth="0.5"
          style={{ animation: reduced ? 'none' : 'ringPulse 5s ease-in-out infinite 5.0s' }} />
        <path d={`M 300 300 A 244 ${Math.round(244 * TILT)} 0 0 1 ${300 + 244} 300`}
          fill="none" stroke="rgba(110,195,238,0.11)" strokeWidth="0.45"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 5.5s' }} />
        <path d={`M 300 300 A 244 ${Math.round(244 * TILT)} 0 0 0 ${300 - 244} 300`}
          fill="none" stroke="rgba(110,195,238,0.07)" strokeWidth="0.4"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 6.0s' }} />
      </svg>
    </div>
  );
}
