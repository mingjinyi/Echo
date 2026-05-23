import { useReducedMotion } from '../hooks/useReducedMotion';

interface EchoEyeProps {
  size?: number;
  className?: string;
}

/**
 * EchoEye — Deep Ocean Luminous Gaze
 *
 * Bioluminescent deep-sea eye with rich blue-cyan glow.
 * Animated color shifts, pulsing pupil, light rays emanating outward.
 * Echo arcs like rippling water bioluminescence.
 */
export default function EchoEye({ size = 440, className = '' }: EchoEyeProps) {
  const reduced = useReducedMotion();
  const h = size * (190 / 440);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: h }}
      aria-hidden="true"
    >
      {/* ================================================================
          Layer 0 — Deep ocean ambient aura
          ================================================================ */}
      <div
        className="absolute"
        style={{
          width: '200%',
          height: '320%',
          left: '-50%',
          top: '-110%',
          background:
            'radial-gradient(ellipse 50% 48% at 50% 50%, rgba(40,150,230,0.20) 0%, rgba(20,100,200,0.08) 30%, rgba(10,60,160,0.02) 60%, transparent 80%)',
          filter: 'blur(24px)',
          animation: reduced ? 'none' : 'oceanAura 5s ease-in-out infinite',
        }}
      />

      {/* ================================================================
          Layer 1 — Core luminous bloom
          ================================================================ */}
      <div
        className="absolute"
        style={{
          width: '130%',
          height: '200%',
          left: '-15%',
          top: '-50%',
          background:
            'radial-gradient(ellipse 50% 48% at 50% 50%, rgba(80,190,245,0.45) 0%, rgba(50,160,230,0.25) 30%, rgba(30,120,200,0.08) 55%, transparent 75%)',
          filter: 'blur(10px)',
          animation: reduced ? 'none' : 'oceanPulse 4s ease-in-out infinite',
        }}
      />

      {/* ================================================================
          Layer 2 — Inner bright ring glow
          ================================================================ */}
      <div
        className="absolute"
        style={{
          width: '80%',
          height: '120%',
          left: '10%',
          top: '-10%',
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(120,210,250,0.35) 0%, rgba(80,180,240,0.15) 40%, transparent 70%)',
          filter: 'blur(6px)',
          animation: reduced ? 'none' : 'innerGlow 3s ease-in-out infinite',
        }}
      />

      <svg
        viewBox="0 0 440 190"
        width={size}
        height={h}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1, animation: reduced ? 'none' : 'eyeBlink 6s ease-in-out infinite' }}
      >
        <defs>
          {/* Iris — deep ocean blue gradient */}
          <radialGradient id="ge-iris" cx="50%" cy="48%" r="52%">
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

          {/* Deep ocean iris ring gradient */}
          <radialGradient id="ge-iris-ring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(120,220,255,0.30)" />
            <stop offset="100%" stopColor="rgba(40,150,240,0.05)" />
          </radialGradient>

          {/* Strong pupil glow — bright fluorescent bloom */}
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

          {/* Outer halo glow */}
          <filter id="ge-halo" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Lid glow */}
          <filter id="ge-lid-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Iris glow */}
          <filter id="ge-iris-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Light ray glow */}
          <filter id="ge-ray-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* ================================================================
            Layer 1 — Outer halo (bright ghost contour)
            ================================================================ */}
        <path
          d="M 35 95 Q 130 15 220 18 Q 310 15 405 95 Q 310 168 220 172 Q 130 168 35 95 Z"
          fill="none"
          stroke="rgba(80,180,240,0.28)"
          strokeWidth="24"
          filter="url(#ge-halo)"
        />

        {/* ================================================================
            Layer 2 — Iris (large, bright gradient, glowing)
            ================================================================ */}
        <ellipse cx="220" cy="92" rx="100" ry="76"
          fill="url(#ge-iris)"
          filter="url(#ge-iris-glow)" />

        {/* Iris inner glow fill */}
        <ellipse cx="220" cy="92" rx="95" ry="72"
          fill="url(#ge-iris-ring)" />

        {/* Iris rings — subtle concentric structure */}
        <ellipse cx="220" cy="92" rx="82" ry="62"
          fill="none" stroke="rgba(120,210,250,0.12)" strokeWidth="0.5" />
        <ellipse cx="220" cy="92" rx="65" ry="50"
          fill="none" stroke="rgba(100,200,245,0.08)" strokeWidth="0.4" />

        {/* ================================================================
            Layer 3 — Pupil (bright fluorescent core, strong glow)
            ================================================================ */}
        <ellipse cx="220" cy="92" rx="34" ry="31"
          fill="url(#ge-pupil)" filter="url(#ge-glow)" />

        {/* Inner pupil — bright center point */}
        <ellipse cx="220" cy="92" rx="12" ry="11"
          fill="rgba(200,245,255,0.80)" />
        <ellipse cx="220" cy="92" rx="5" ry="4.5"
          fill="rgba(230,252,255,0.72)" />

        {/* ================================================================
            Layer 4 — Highlights (bright reflections, give life)
            ================================================================ */}
        <ellipse cx="204" cy="78" rx="11" ry="7"
          fill="rgba(220,245,255,0.62)"
          transform="rotate(-16 204 78)" />
        <ellipse cx="208" cy="76" rx="5" ry="3"
          fill="rgba(240,252,255,0.48)"
          transform="rotate(-16 208 76)" />
        <ellipse cx="238" cy="106" rx="6" ry="4"
          fill="rgba(200,235,250,0.34)"
          transform="rotate(-12 238 106)" />

        {/* ================================================================
            Layer 5 — Upper eyelid (bright, fluorescent edge)
            ================================================================ */}
        <path
          d="M 30 95 Q 130 12 220 16 Q 310 12 410 95"
          fill="none"
          stroke="rgba(120,210,250,0.62)"
          strokeWidth="3.0"
          strokeLinecap="round"
          filter="url(#ge-lid-glow)"
        />

        {/* ================================================================
            Layer 6 — Lower eyelid (visible, slightly thinner)
            ================================================================ */}
        <path
          d="M 35 95 Q 130 170 220 174 Q 310 170 405 95"
          fill="none"
          stroke="rgba(100,200,245,0.45)"
          strokeWidth="2.0"
          strokeLinecap="round"
          filter="url(#ge-lid-glow)"
        />

        {/* ================================================================
            Layer 7 — Eyelid crease (visible fold)
            ================================================================ */}
        <path
          d="M 32 84 Q 130 -2 220 2 Q 310 -2 408 84"
          fill="none"
          stroke="rgba(90,190,240,0.26)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* ================================================================
            Layer 8 — Light rays emanating outward (bioluminescent)
            ================================================================ */}
        {/* Cardinal rays */}
        <line x1="220" y1="92" x2="220" y2="8"
          stroke="rgba(100,200,245,0.18)" strokeWidth="1.8"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulse 3s ease-in-out infinite' }} />
        <line x1="220" y1="92" x2="220" y2="175"
          stroke="rgba(100,200,245,0.18)" strokeWidth="1.8"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulse 3s ease-in-out infinite 0.4s' }} />
        <line x1="220" y1="92" x2="90" y2="92"
          stroke="rgba(100,200,245,0.18)" strokeWidth="1.8"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulse 3s ease-in-out infinite 0.2s' }} />
        <line x1="220" y1="92" x2="350" y2="92"
          stroke="rgba(100,200,245,0.18)" strokeWidth="1.8"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulse 3s ease-in-out infinite 0.6s' }} />
        {/* Diagonal rays */}
        <line x1="220" y1="92" x2="130" y2="35"
          stroke="rgba(80,180,240,0.12)" strokeWidth="1.2"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulseDiag 3s ease-in-out infinite 0.3s' }} />
        <line x1="220" y1="92" x2="310" y2="35"
          stroke="rgba(80,180,240,0.12)" strokeWidth="1.2"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulseDiag 3s ease-in-out infinite 0.5s' }} />
        <line x1="220" y1="92" x2="130" y2="150"
          stroke="rgba(80,180,240,0.12)" strokeWidth="1.2"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulseDiag 3s ease-in-out infinite 0.7s' }} />
        <line x1="220" y1="92" x2="310" y2="150"
          stroke="rgba(80,180,240,0.12)" strokeWidth="1.2"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'rayPulseDiag 3s ease-in-out infinite 0.9s' }} />

        {/* ================================================================
            Layer 9 — Echo arcs (elliptical diffusion, bioluminescent)
            ================================================================ */}
        <path
          d="M 10 95 Q 130 -20 220 -15 Q 310 -20 430 95"
          fill="none"
          stroke="rgba(60,170,235,0.22)" strokeWidth="1.1" strokeLinecap="round"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'arcPulse 4s ease-in-out infinite' }} />
        <path
          d="M 15 95 Q 130 200 220 205 Q 310 200 425 95"
          fill="none"
          stroke="rgba(50,160,230,0.18)" strokeWidth="1.0" strokeLinecap="round"
          filter="url(#ge-ray-glow)"
          style={{ animation: reduced ? 'none' : 'arcPulse 4s ease-in-out infinite 0.5s' }} />
        <path
          d="M -5 95 Q 130 -45 220 -40 Q 310 -45 445 95"
          fill="none"
          stroke="rgba(40,150,225,0.12)" strokeWidth="0.8" strokeLinecap="round"
          style={{ animation: reduced ? 'none' : 'arcPulseOuter 4s ease-in-out infinite' }} />
        <path
          d="M 0 95 Q 130 230 220 235 Q 310 230 440 95"
          fill="none"
          stroke="rgba(35,145,220,0.10)" strokeWidth="0.7" strokeLinecap="round"
          style={{ animation: reduced ? 'none' : 'arcPulseOuter 4s ease-in-out infinite 0.6s' }} />
      </svg>
    </div>
  );
}