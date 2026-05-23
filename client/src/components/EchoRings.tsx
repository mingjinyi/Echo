import { useReducedMotion } from '../hooks/useReducedMotion';

interface EchoRingsProps {
  size?: number;
  ringCount?: number;
  className?: string;
}

export default function EchoRings({ size = 540, ringCount = 4, className = '' }: EchoRingsProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Central glow — breathes */}
      <div
        className="absolute rounded-full"
        style={{
          width: '25%',
          height: '25%',
          left: '37.5%',
          top: '37.5%',
          background: 'radial-gradient(circle, rgba(160,200,230,0.22) 0%, rgba(120,165,205,0.10) 30%, rgba(70,115,155,0.04) 55%, transparent 70%)',
          animation: reduced ? 'none' : 'echoBreathe 8s ease-in-out infinite',
        }}
      />

      {/* Outward-diffusing rings */}
      {Array.from({ length: ringCount }).map((_, i) => {
        const baseSize = 20 + i * 20;
        const delay = i * 3.2;
        const ringOpacity = 0.28 - i * 0.06;
        return (
          <div
            key={`out-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${baseSize}%`,
              height: `${baseSize}%`,
              left: `${(100 - baseSize) / 2}%`,
              top: `${(100 - baseSize) / 2}%`,
              border: `1.5px solid rgba(150, 195, 230, ${ringOpacity})`,
              boxShadow: i === 0 ? `0 0 25px rgba(145,190,225,${ringOpacity * 0.6})` : 'none',
              animation: reduced ? 'none' : `echoRipple 16s linear ${delay}s infinite`,
              opacity: 0,
            }}
          />
        );
      })}

      {/* Return echo — inward pulse */}
      <div
        className="absolute rounded-full"
        style={{
          width: '26%',
          height: '26%',
          left: '37%',
          top: '37%',
          border: '1px solid rgba(155,200,230,0.22)',
          boxShadow: '0 0 22px rgba(145,190,220,0.10)',
          animation: reduced ? 'none' : 'returnEcho 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '36%',
          height: '36%',
          left: '32%',
          top: '32%',
          border: '0.8px solid rgba(150,195,225,0.14)',
          animation: reduced ? 'none' : 'returnEcho 10s ease-in-out 3.5s infinite',
        }}
      />
    </div>
  );
}
