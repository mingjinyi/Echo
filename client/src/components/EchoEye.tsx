import { useReducedMotion } from '../hooks/useReducedMotion';

interface EchoEyeProps {
  size?: number;
  className?: string;
}

/**
 * EchoEye — Circular Bioluminescent Gaze
 *
 * A perfectly round deep-ocean eye with rich blue-cyan glow,
 * iris rings, pulsing pupil, and emanating light rays.
 */
export default function EchoEye({ size = 420, className = '' }: EchoEyeProps) {
  const reduced = useReducedMotion();
  const CX = 200;
  const CY = 200;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* ── Layer 0 — Deep ocean ambient aura ── */}
      <div
        className="absolute"
        style={{
          width: '200%', height: '200%', left: '-50%', top: '-50%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(40,150,230,0.20) 0%, rgba(20,100,200,0.08) 30%, rgba(10,60,160,0.02) 60%, transparent 80%)',
          filter: 'blur(24px)',
          animation: reduced ? 'none' : 'oceanAura 5s ease-in-out infinite',
        }}
      />

      {/* ── Layer 1 — Core luminous bloom ── */}
      <div
        className="absolute"
        style={{
          width: '130%', height: '130%', left: '-15%', top: '-15%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(80,190,245,0.45) 0%, rgba(50,160,230,0.25) 30%, rgba(30,120,200,0.08) 55%, transparent 75%)',
          filter: 'blur(10px)',
          animation: reduced ? 'none' : 'oceanPulse 4s ease-in-out infinite',
        }}
      />

      {/* ── Layer 2 — Inner bright ring glow ── */}
      <div
        className="absolute"
        style={{
          width: '80%', height: '80%', left: '10%', top: '10%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(120,210,250,0.35) 0%, rgba(80,180,240,0.15) 40%, transparent 70%)',
          filter: 'blur(6px)',
          animation: reduced ? 'none' : 'innerGlow 3s ease-in-out infinite',
        }}
      />

      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1, animation: reduced ? 'none' : 'eyeBlink 6s ease-in-out infinite' }}
      >
        <defs>
          {/* Iris — deep ocean blue gradient */}
          <radialGradient id="ge-iris" cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="rgba(100,210,250,0.70)" />
            <stop offset="25%" stopColor="rgba(50,170,240,0.55)" />
            <stop offset="50%" stopColor="rgba(30,130,220,0.38)" />
            <stop offset="75%" stopColor="rgba(15,80,180,0.18)" />
            <stop offset="100%" stopColor="rgba(5,40,140,0.06)" />
          </radialGradient>

          {/* Pupil — bright fluorescent core */}
          <radialGradient id="ge-pupil" cx="47%" cy="42%" r="55%">
            <stop offset="0%" stopColor="rgba(220,250,255,0.92)" />
            <stop offset="20%" stopColor="rgba(160,225,250,0.78)" />
            <stop offset="45%" stopColor="rgba(80,180,240,0.60)" />
            <stop offset="70%" stopColor="rgba(30,120,200,0.80)" />
            <stop offset="100%" stopColor="rgba(10,60,150,0.95)" />
          </radialGradient>

          {/* Iris ring gradient */}
          <radialGradient id="ge-iris-ring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(120,220,255,0.30)" />
            <stop offset="100%" stopColor="rgba(40,150,240,0.05)" />
          </radialGradient>

          <filter id="ge-glow" x="-400%" y="-400%" width="900%" height="900%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur3" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur3" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="ge-halo" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="ge-lid-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="ge-iris-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="ge-ray-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* ── Outer halo ── */}
        <circle cx={CX} cy={CY} r="185"
          fill="none"
          stroke="rgba(80,180,240,0.28)"
          strokeWidth="24"
          filter="url(#ge-halo)"
        />

        {/* ── Iris ── */}
        <circle cx={CX} cy={CY} r="130"
          fill="url(#ge-iris)"
          filter="url(#ge-iris-glow)" />

        {/* Iris inner glow fill */}
        <circle cx={CX} cy={CY} r="124"
          fill="url(#ge-iris-ring)" />

        {/* Iris concentric rings */}
        <circle cx={CX} cy={CY} r="108"
          fill="none" stroke="rgba(120,210,250,0.12)" strokeWidth="0.5" />
        <circle cx={CX} cy={CY} r="88"
          fill="none" stroke="rgba(100,200,245,0.08)" strokeWidth="0.4" />
        <circle cx={CX} cy={CY} r="68"
          fill="none" stroke="rgba(110,205,248,0.10)" strokeWidth="0.45" />

        {/* ── Pupil ── */}
        <circle cx={CX} cy={CY} r="36"
          fill="url(#ge-pupil)" filter="url(#ge-glow)" />

        {/* Inner pupil bright spots */}
        <circle cx={CX} cy={CY} r="14"
          fill="rgba(200,245,255,0.80)" />
        <circle cx={CX} cy={CY} r="6"
          fill="rgba(230,252,255,0.72)" />

        {/* ── Highlights — give the eye life ── */}
        <ellipse cx="178" cy="178" rx="13" ry="8"
          fill="rgba(220,245,255,0.62)"
          transform={`rotate(-20 ${178} ${178})`} />
        <ellipse cx="182" cy="175" rx="6" ry="3.5"
          fill="rgba(240,252,255,0.48)"
          transform={`rotate(-20 ${182} ${175})`} />
        <ellipse cx="226" cy="222" rx="7" ry="4.5"
          fill="rgba(200,235,250,0.34)"
          transform={`rotate(-15 ${226} ${222})`} />

        {/* ── Upper eyelid — bright fluorescent edge ── */}
        <path
          d={`M ${CX - 130} ${CY} A 130 75 0 0 1 ${CX + 130} ${CY}`}
          fill="none"
          stroke="rgba(120,210,250,0.62)"
          strokeWidth="3.0"
          strokeLinecap="round"
          filter="url(#ge-lid-glow)"
        />

        {/* ── Lower eyelid — visible, slightly thinner ── */}
        <path
          d={`M ${CX - 130} ${CY} A 130 70 0 0 0 ${CX + 130} ${CY}`}
          fill="none"
          stroke="rgba(100,200,245,0.45)"
          strokeWidth="2.0"
          strokeLinecap="round"
          filter="url(#ge-lid-glow)"
        />

        {/* ── Eyelid crease ── */}
        <path
          d={`M ${CX - 125} ${CY - 6} A 125 62 0 0 1 ${CX + 125} ${CY - 6}`}
          fill="none"
          stroke="rgba(90,190,240,0.26)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* ── Light rays emanating outward — 8 directions ── */}
        {/* Cardinal */}
        <line x1={CX} y1={CY} x2={CX} y2={CY - 156}
          stroke="rgba(100,200,245,0.18)" strokeWidth="1.8"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulse 3s ease-in-out infinite' }} />
        <line x1={CX} y1={CY} x2={CX} y2={CY + 156}
          stroke="rgba(100,200,245,0.18)" strokeWidth="1.8"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulse 3s ease-in-out infinite 0.4s' }} />
        <line x1={CX} y1={CY} x2={CX - 156} y2={CY}
          stroke="rgba(100,200,245,0.18)" strokeWidth="1.8"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulse 3s ease-in-out infinite 0.2s' }} />
        <line x1={CX} y1={CY} x2={CX + 156} y2={CY}
          stroke="rgba(100,200,245,0.18)" strokeWidth="1.8"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulse 3s ease-in-out infinite 0.6s' }} />
        {/* Diagonal */}
        <line x1={CX} y1={CY} x2={CX - 110} y2={CY - 110}
          stroke="rgba(80,180,240,0.12)" strokeWidth="1.2"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulseDiag 3s ease-in-out infinite 0.3s' }} />
        <line x1={CX} y1={CY} x2={CX + 110} y2={CY - 110}
          stroke="rgba(80,180,240,0.12)" strokeWidth="1.2"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulseDiag 3s ease-in-out infinite 0.5s' }} />
        <line x1={CX} y1={CY} x2={CX - 110} y2={CY + 110}
          stroke="rgba(80,180,240,0.12)" strokeWidth="1.2"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulseDiag 3s ease-in-out infinite 0.7s' }} />
        <line x1={CX} y1={CY} x2={CX + 110} y2={CY + 110}
          stroke="rgba(80,180,240,0.12)" strokeWidth="1.2"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulseDiag 3s ease-in-out infinite 0.9s' }} />

        {/* ── Echo arcs — bioluminescent ripples ── */}
        <path
          d={`M ${CX - 180} ${CY} A 170 55 0 0 1 ${CX + 180} ${CY}`}
          fill="none"
          stroke="rgba(60,170,235,0.22)" strokeWidth="1.1" strokeLinecap="round"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'arcPulse 4s ease-in-out infinite' }} />
        <path
          d={`M ${CX - 175} ${CY} A 165 60 0 0 0 ${CX + 175} ${CY}`}
          fill="none"
          stroke="rgba(50,160,230,0.18)" strokeWidth="1.0" strokeLinecap="round"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'arcPulse 4s ease-in-out infinite 0.5s' }} />
        <path
          d={`M ${CX - 190} ${CY} A 180 70 0 0 1 ${CX + 190} ${CY}`}
          fill="none"
          stroke="rgba(40,150,225,0.12)" strokeWidth="0.8" strokeLinecap="round"
          style={{ animation: reduced ? 'none' : 'arcPulseOuter 4s ease-in-out infinite' }} />
        <path
          d={`M ${CX - 185} ${CY} A 175 72 0 0 0 ${CX + 185} ${CY}`}
          fill="none"
          stroke="rgba(35,145,220,0.10)" strokeWidth="0.7" strokeLinecap="round"
          style={{ animation: reduced ? 'none' : 'arcPulseOuter 4s ease-in-out infinite 0.6s' }} />
      </svg>
    </div>
  );
}
