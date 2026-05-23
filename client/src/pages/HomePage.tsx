import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import EchoEye from '../components/EchoEye';
import AstroRings from '../components/AstroRings';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function HomePage() {
  const reduced = useReducedMotion();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleCTAClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setRipples(prev => [...prev, { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(prev => prev.slice(1)), 800);
  }, [reduced]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ================================================================
          Layer 0 — Deep cosmic starfield background
          ================================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Base abyss — deep space */}
        <div className="absolute inset-0" style={{ background: '#030810' }} />

        {/* Subtle star dots */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(60,100,180,0.05) 0%, transparent 50%)',
        }} />

        {/* Nebula glow 1 */}
        <div className="absolute" style={{
          width: '70%', height: '55%',
          left: '5%', top: '8%',
          background: 'radial-gradient(ellipse 50% 45% at 40% 35%, rgba(40,80,160,0.18) 0%, rgba(25,55,120,0.08) 35%, transparent 60%)',
          filter: 'blur(20px)',
        }} />

        {/* Nebula glow 2 */}
        <div className="absolute" style={{
          width: '60%', height: '50%',
          right: '3%', bottom: '12%',
          background: 'radial-gradient(ellipse 45% 40% at 60% 65%, rgba(30,60,140,0.15) 0%, rgba(20,40,100,0.06) 40%, transparent 60%)',
          filter: 'blur(18px)',
        }} />

        {/* Central glow */}
        <div className="absolute" style={{
          width: '55%', height: '40%',
          left: '22%', top: '28%',
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(100,150,210,0.06) 0%, rgba(70,110,160,0.02) 50%, transparent 70%)',
          filter: 'blur(30px)',
          animation: reduced ? 'none' : 'gazeAura 7s ease-in-out infinite',
        }} />

        {/* Vignette */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(3,8,16,0.45) 55%, rgba(3,8,16,0.80) 100%)',
          }}
        />
      </div>

      {/* ================================================================
          Layer 1 — Main content
          ================================================================ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pb-16">
        {/* ---- Center visual: AstroRings + Eye ---- */}
        <div className="relative flex items-center justify-center mb-10" style={{ marginTop: '-4vh' }}>
          {/* Astronomical instrument rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AstroRings size={620} />
          </div>

          {/* The Eye */}
          <div className={reduced ? '' : 'animate-fade-in'}
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <EchoEye size={420} />
          </div>
        </div>

        {/* ---- Title: 回声 ---- */}
        <h1
          className="text-5xl font-serif font-bold mb-1 tracking-[0.1em] text-center"
          style={{
            color: '#e2e8f0',
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.5s both',
          }}
        >
          回声
        </h1>

        {/* ---- English subtitle: ECHO ---- */}
        <p
          className="text-[11px] tracking-[0.28em] uppercase mb-8 text-center"
          style={{
            color: 'var(--color-text-muted)',
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.6s both',
          }}
        >
          ECHO
        </p>

        {/* ---- Poetic line ---- */}
        <p
          className="text-center text-sm tracking-[0.1em] mb-5"
          style={{
            fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
            color: 'var(--color-text-secondary)',
            fontWeight: 300,
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.7s both',
          }}
        >
          在这里，被理解是一件慢慢发生的事
        </p>

        {/* ---- Description lines ---- */}
        <p
          className="text-center text-xs leading-relaxed mb-1.5"
          style={{
            fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
            color: 'var(--color-text-muted)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.8s both',
          }}
        >
          不是测试，不是分类，不是问卷。
        </p>
        <p
          className="text-center text-xs leading-relaxed mb-12"
          style={{
            fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
            color: 'var(--color-text-muted)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.9s both',
          }}
        >
          是一段认真对话，帮你看见一个更完整的自己。
        </p>

        {/* ---- CTA ---- */}
        <Link
          to="/chat"
          onClick={handleCTAClick}
          className="relative inline-flex items-center px-10 py-2.5 rounded-full text-sm
                     overflow-hidden select-none transition-all duration-500
                     active:scale-[0.97] group"
          style={{
            background: 'rgba(65, 110, 160, 0.22)',
            border: '1px solid rgba(145, 195, 230, 0.25)',
            color: 'rgba(195, 215, 238, 0.92)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 1.0s both',
          }}
        >
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'rgba(95, 150, 200, 0.25)',
              border: '1px solid rgba(175, 215, 245, 0.40)',
            }}
          />
          {ripples.map(r => (
            <span key={r.id}
              className="absolute rounded-full bg-white/20 animate-cta-ripple pointer-events-none"
              style={{ left: r.x - 6, top: r.y - 6, width: 12, height: 12 }}
            />
          ))}
          <span className="relative z-10">开始对话</span>
        </Link>

        {/* ---- Prod ---- */}
        <p
          className="absolute bottom-8 left-0 right-0 text-center text-[11px] tracking-wider"
          style={{
            color: 'var(--color-border)',
            animation: reduced ? 'none' : 'fadeInUp 0.8s ease-out 1.4s both',
          }}
        >
          Prod. by Wenpei Jiao &amp; Jinyi Ming
        </p>
      </div>
    </div>
  );
}