import { useReducedMotion } from '../hooks/useReducedMotion';

interface AstroRingsProps {
  size?: number;
  className?: string;
}

/**
 * AstroRings — Deep Ocean Astronomical Instrument
 *
 * Glowing concentric rings with bioluminescent deep-sea aesthetic.
 * All thin uniform lines, no thick strokes.
 */
export default function AstroRings({ size = 620, className = '' }: AstroRingsProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Ambient glow — deep ocean bloom */}
      <div
        className="absolute rounded-full"
        style={{
          width: '55%', height: '55%', left: '22.5%', top: '22.5%',
          background: 'radial-gradient(circle, rgba(80,180,240,0.25) 0%, rgba(50,150,220,0.08) 35%, transparent 65%)',
          filter: 'blur(8px)',
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
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ar-glow-strong" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ar-glow-subtle" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ================================================================
            Layer 1 — Outer diffuse halo glow
            ================================================================ */}
        <circle cx="300" cy="300" r="290"
          fill="none" stroke="rgba(60,150,220,0.06)" strokeWidth="25"
          filter="url(#ar-glow-subtle)"
          style={{ animation: reduced ? 'none' : 'ringPulse 8s ease-in-out infinite' }} />

        {/* ================================================================
            Layer 2 — Grid system (radial sight lines)
            ================================================================ */}
        <line x1="20" y1="300" x2="580" y2="300"
          stroke="rgba(100,180,230,0.08)" strokeWidth="0.5" />
        <line x1="300" y1="20" x2="300" y2="580"
          stroke="rgba(100,180,230,0.08)" strokeWidth="0.5" />
        <line x1="88" y1="88" x2="512" y2="512"
          stroke="rgba(100,180,230,0.05)" strokeWidth="0.4" />
        <line x1="512" y1="88" x2="88" y2="512"
          stroke="rgba(100,180,230,0.05)" strokeWidth="0.4" />

        {/* ================================================================
            Layer 2 — Concentric rings (all thin uniform lines)
            ================================================================ */}

        {/* Ring 1: outermost thin solid */}
        <circle cx="300" cy="300" r="285"
          fill="none" stroke="rgba(80,170,225,0.10)" strokeWidth="0.6"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 0.5s' }} />

        {/* Ring 2: dotted ring */}
        <circle cx="300" cy="300" r="272"
          fill="none" stroke="rgba(90,180,230,0.12)" strokeWidth="0.8"
          strokeDasharray="0.5 8"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 0.8s' }} />

        {/* Ring 3: thin solid */}
        <circle cx="300" cy="300" r="258"
          fill="none" stroke="rgba(85,175,228,0.08)" strokeWidth="0.5"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 1.1s' }} />

        {/* Ring 4: dotted ring */}
        <circle cx="300" cy="300" r="244"
          fill="none" stroke="rgba(95,185,232,0.10)" strokeWidth="0.8"
          strokeDasharray="0.5 8"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 1.4s' }} />

        {/* Ring 5: thin solid */}
        <circle cx="300" cy="300" r="230"
          fill="none" stroke="rgba(90,180,230,0.09)" strokeWidth="0.5"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 1.7s' }} />

        {/* Ring 6: dotted ring */}
        <circle cx="300" cy="300" r="218"
          fill="none" stroke="rgba(88,178,226,0.10)" strokeWidth="0.8"
          strokeDasharray="0.5 8"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 2.0s' }} />

        {/* Ring 7: thin solid */}
        <circle cx="300" cy="300" r="205"
          fill="none" stroke="rgba(86,176,224,0.08)" strokeWidth="0.5"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 2.3s' }} />

        {/* Ring 8: dotted ring */}
        <circle cx="300" cy="300" r="192"
          fill="none" stroke="rgba(90,180,230,0.10)" strokeWidth="0.8"
          strokeDasharray="0.5 8"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 2.6s' }} />

        {/* Ring 9: thin solid */}
        <circle cx="300" cy="300" r="178"
          fill="none" stroke="rgba(86,176,224,0.08)" strokeWidth="0.5"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 2.9s' }} />

        {/* Ring 10: dotted ring */}
        <circle cx="300" cy="300" r="166"
          fill="none" stroke="rgba(95,185,232,0.09)" strokeWidth="0.8"
          strokeDasharray="0.5 8"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 3.2s' }} />

        {/* Ring 11: thin solid */}
        <circle cx="300" cy="300" r="154"
          fill="none" stroke="rgba(88,178,226,0.10)" strokeWidth="0.5"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 3.5s' }} />

        {/* ================================================================
            Layer 3 — Inner glow circle (where the eye sits)
            ================================================================ */}
        <circle cx="300" cy="300" r="145"
          fill="none" stroke="rgba(100,190,235,0.25)" strokeWidth="1.2"
          filter="url(#ar-glow-strong)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 3.8s' }} />

        {/* Inner ambient glow ring */}
        <circle cx="300" cy="300" r="135"
          fill="none" stroke="rgba(100,190,235,0.12)" strokeWidth="8"
          filter="url(#ar-glow-subtle)"
          style={{ animation: reduced ? 'none' : 'ringGlow 5s ease-in-out infinite' }} />

        {/* ================================================================
            Layer 4 — Cardinal markers (thin lines)
            ================================================================ */}
        <line x1="296" y1="15" x2="304" y2="15"
          stroke="rgba(100,190,235,0.20)" strokeWidth="0.8" strokeLinecap="round"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 4.1s' }} />
        <line x1="296" y1="585" x2="304" y2="585"
          stroke="rgba(100,190,235,0.16)" strokeWidth="0.8" strokeLinecap="round"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 4.4s' }} />
        <line x1="585" y1="296" x2="585" y2="304"
          stroke="rgba(100,190,235,0.16)" strokeWidth="0.8" strokeLinecap="round"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 4.7s' }} />
        <line x1="15" y1="296" x2="15" y2="304"
          stroke="rgba(100,190,235,0.16)" strokeWidth="0.8" strokeLinecap="round"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 5.0s' }} />

        {/* ================================================================
            Layer 5 — Orbital arcs (thick outer band)
            ================================================================ */}
        <path d="M 300 38 A 262 262 0 0 1 562 300"
          fill="none" stroke="rgba(100,185,232,0.12)" strokeWidth="0.6"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 5.3s' }} />
        <path d="M 300 562 A 262 262 0 0 1 38 300"
          fill="none" stroke="rgba(100,185,232,0.12)" strokeWidth="0.6"
          filter="url(#ar-glow)"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 5.6s' }} />
        <path d="M 38 300 A 262 262 0 0 1 300 38"
          fill="none" stroke="rgba(100,185,232,0.10)" strokeWidth="0.5"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 5.9s' }} />
        <path d="M 562 300 A 262 262 0 0 1 300 562"
          fill="none" stroke="rgba(100,185,232,0.10)" strokeWidth="0.5"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 6.2s' }} />

        {/* Second outer orbital band */}
        <path d="M 300 68 A 232 232 0 0 1 532 300"
          fill="none" stroke="rgba(100,185,232,0.10)" strokeWidth="0.5"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 6.5s' }} />
        <path d="M 68 300 A 232 232 0 0 1 300 532"
          fill="none" stroke="rgba(100,185,232,0.10)" strokeWidth="0.5"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 6.8s' }} />

        {/* Third outer orbital band */}
        <path d="M 300 20 A 280 280 0 0 1 580 300"
          fill="none" stroke="rgba(80,170,225,0.08)" strokeWidth="0.4"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 7.1s' }} />
        <path d="M 580 300 A 280 280 0 0 1 300 580"
          fill="none" stroke="rgba(80,170,225,0.08)" strokeWidth="0.4"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 7.4s' }} />
        <path d="M 300 580 A 280 280 0 0 1 20 300"
          fill="none" stroke="rgba(80,170,225,0.08)" strokeWidth="0.4"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 7.7s' }} />
        <path d="M 20 300 A 280 280 0 0 1 300 20"
          fill="none" stroke="rgba(80,170,225,0.08)" strokeWidth="0.4"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 8.0s' }} />

        {/* ================================================================
            Layer 6 — Crosshair inner markers (thin lines)
            ================================================================ */}
        <line x1="296" y1="300" x2="288" y2="300"
          stroke="rgba(100,190,235,0.12)" strokeWidth="0.5" strokeLinecap="round"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 5.9s' }} />
        <line x1="304" y1="300" x2="312" y2="300"
          stroke="rgba(100,190,235,0.12)" strokeWidth="0.5" strokeLinecap="round"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 6.2s' }} />
        <line x1="300" y1="296" x2="300" y2="288"
          stroke="rgba(100,190,235,0.12)" strokeWidth="0.5" strokeLinecap="round"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 6.5s' }} />
        <line x1="300" y1="304" x2="300" y2="312"
          stroke="rgba(100,190,235,0.12)" strokeWidth="0.5" strokeLinecap="round"
          style={{ animation: reduced ? 'none' : 'ringPulse 6s ease-in-out infinite 6.8s' }} />
      </svg>
    </div>
  );
}