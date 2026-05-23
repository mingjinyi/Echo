import { Link } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import EchoEye from '../components/EchoEye';
import AstroRings from '../components/AstroRings';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SAMPLE_TRAITS = [
  { name: '共情倾向', value: 8 },
  { name: '反思能力', value: 9 },
  { name: '自我表露', value: 4 },
  { name: '社交能量', value: 3 },
  { name: '决策风格', value: 6 },
  { name: '情绪稳定性', value: 5 },
];

export default function HomePage() {
  const reduced = useReducedMotion();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [visualSize, setVisualSize] = useState({ eye: 420, rings: 620 });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 420) {
        setVisualSize({ eye: 240, rings: 350 });
      } else if (w < 640) {
        setVisualSize({ eye: 300, rings: 440 });
      } else if (w < 1024) {
        setVisualSize({ eye: 360, rings: 540 });
      } else {
        setVisualSize({ eye: 420, rings: 620 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCTAClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setRipples(prev => [...prev, { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(prev => prev.slice(1)), 800);
  }, [reduced]);

  return (
    <div className="relative">
      {/* ================================================================
          Layer 0 — Deep cosmic starfield background (fixed)
          ================================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: 'var(--home-bg)' }} />

        {/* Nebula effects — dark mode only */}
        <div className="absolute inset-0 hidden dark:block" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(60,100,180,0.05) 0%, transparent 50%)',
        }} />
        <div className="absolute hidden dark:block" style={{
          width: '70%', height: '55%', left: '5%', top: '8%',
          background: 'radial-gradient(ellipse 50% 45% at 40% 35%, rgba(40,80,160,0.18) 0%, rgba(25,55,120,0.08) 35%, transparent 60%)',
          filter: 'blur(20px)',
        }} />
        <div className="absolute hidden dark:block" style={{
          width: '60%', height: '50%', right: '3%', bottom: '12%',
          background: 'radial-gradient(ellipse 45% 40% at 60% 65%, rgba(30,60,140,0.15) 0%, rgba(20,40,100,0.06) 40%, transparent 60%)',
          filter: 'blur(18px)',
        }} />
        <div className="absolute hidden dark:block" style={{
          width: '55%', height: '40%', left: '22%', top: '28%',
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(100,150,210,0.06) 0%, rgba(70,110,160,0.02) 50%, transparent 70%)',
          filter: 'blur(30px)',
          animation: reduced ? 'none' : 'gazeAura 7s ease-in-out infinite',
        }} />

        {/* Vignette — dark mode only */}
        <div className="absolute inset-0 hidden dark:block"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(3,8,16,0.45) 55%, rgba(3,8,16,0.80) 100%)',
          }}
        />
      </div>

      {/* ================================================================
          Hero — full viewport
          ================================================================ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6">
        {/* ---- Center visual: AstroRings + Eye ---- */}
        <div className="relative flex items-center justify-center mb-6 sm:mb-8 home-visual" style={{ marginTop: '-5vh' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <AstroRings size={visualSize.rings} />
          </div>
          <div className={reduced ? '' : 'animate-fade-in'}
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <EchoEye size={visualSize.eye} />
          </div>
        </div>

        {/* ---- Title: 回声 ---- */}
        <h1
          className="text-4xl sm:text-5xl font-serif font-bold mb-1 tracking-[0.1em] text-center"
          style={{
            color: '#e2e8f0',
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.4s both',
          }}
        >
          回声
        </h1>

        {/* ---- English subtitle ---- */}
        <p
          className="text-[11px] tracking-[0.28em] uppercase mb-6 text-center"
          style={{
            color: 'var(--color-text-muted)',
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.5s both',
          }}
        >
          ECHO
        </p>

        {/* ---- Poetic line — now the visual center of the copy ---- */}
        <p
          className="text-base sm:text-lg md:text-xl text-center tracking-[0.06em] mb-5 max-w-md"
          style={{
            fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
            color: '#c8d6e5',
            fontWeight: 300,
            lineHeight: 1.9,
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.6s both',
          }}
        >
          在这里，被理解是一件慢慢发生的事
        </p>

        {/* ---- Description ---- */}
        <div
          className="text-center mb-10 max-w-sm"
          style={{
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.7s both',
          }}
        >
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-1" style={{ fontWeight: 300 }}>
            不是测试，不是分类，不是问卷。
          </p>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed" style={{ fontWeight: 300 }}>
            是一段认真对话，帮你看见一个更完整的自己。
          </p>
        </div>

        {/* ---- CTA — more visible while keeping the mood ---- */}
        <Link
          to="/chat"
          onClick={handleCTAClick}
          className="relative inline-flex items-center px-10 py-3 rounded-full text-sm
                     overflow-hidden select-none transition-all duration-500
                     active:scale-[0.97] group"
          style={{
            background: 'rgba(80, 130, 185, 0.38)',
            border: '1px solid rgba(160, 210, 245, 0.38)',
            color: 'rgba(215, 232, 248, 0.95)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 0.9s both',
          }}
        >
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'rgba(110, 165, 220, 0.40)',
              border: '1px solid rgba(190, 228, 252, 0.55)',
            }}
          />
          {ripples.map(r => (
            <span key={r.id}
              className="absolute rounded-full bg-white/25 animate-cta-ripple pointer-events-none"
              style={{ left: r.x - 6, top: r.y - 6, width: 12, height: 12 }}
            />
          ))}
          <span className="relative z-10">开始对话</span>
        </Link>

        {/* ---- Secondary hint ---- */}
        <p
          className="mt-5 text-xs text-[var(--color-text-muted)]"
          style={{
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 1.1s both',
          }}
        >
          或者，往下看看你会得到什么
        </p>

        {/* ---- Scroll indicator ---- */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          style={{
            animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out 1.4s both',
          }}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round"
            className={reduced ? '' : 'animate-bounce'}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </div>
      </div>

      {/* ================================================================
          Preview section — below the fold
          ================================================================ */}
      <div className="relative z-10 px-4 sm:px-6 pb-20">
        <div className="max-w-xl mx-auto">
          {/* Section heading */}
          <div
            className="text-center mb-10"
            style={{
              animation: reduced ? 'none' : 'fadeInUp 0.7s ease-out both',
            }}
          >
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              你会得到什么
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              一段认真对话之后，系统会为你生成一份文学化的人格画像
            </p>
          </div>

          {/* ---- Sample profile card ---- */}
          <div className="card-elevated mb-8">
            <div className="flex items-center justify-between mb-5">
              <span className="section-title mb-0">人物画像 · 示例</span>
              <span className="badge badge-primary">预览</span>
            </div>

            {/* Sample narrative */}
            <div className="profile-narrative opacity-85">
              <p>
                你是一个在人群中习惯保持沉默的人，但这种沉默并非空白——你的内心始终在高速运转，
                像一台永不关机的雷达，持续扫描着周围人的情绪和未说出口的话。
              </p>
              <p>
                你的同理心极强，几乎到了本能的程度：你不需要别人开口就能感知到他们的状态。
                这让你在亲密关系中备受信赖，但也常常让你感到疲惫——因为你总是在回应别人的频率，
                却很少有机会将自己的频率调至静音。
              </p>
              <p>
                你在"想被理解"和"不想被打扰"之间反复摇摆。这种矛盾不是缺陷，
                而是你性格中最真实的纹理——也是你之所以是你的原因。
              </p>
            </div>

            {/* Sample trait bars */}
            <div className="mt-6 pt-5 border-t border-[var(--color-border-light)] space-y-3">
              {SAMPLE_TRAITS.map((trait) => (
                <div key={trait.name} className="group">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--color-text-secondary)]">{trait.name}</span>
                    <span className="text-[var(--color-text-muted)] tabular-nums">{trait.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-border-light)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                      style={{
                        width: `${trait.value * 10}%`,
                        background: 'linear-gradient(90deg, rgba(100,160,210,0.55), rgba(130,190,230,0.65))',
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-[var(--color-text-muted)] pt-2 text-center">
                基于 12 个心理学维度的综合分析
              </p>
            </div>
          </div>

          {/* ---- Final CTA ---- */}
          <div className="text-center">
            <Link
              to="/chat"
              onClick={handleCTAClick}
              className="btn-primary inline-flex items-center px-10 py-3 text-sm"
            >
              开始你的对话
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] mt-3">
              完全免费 · 无需注册 · 对话即画像
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================
          Footer
          ================================================================ */}
      <div className="relative z-10 text-center pb-8">
        <p className="text-[11px] tracking-wider text-[var(--color-text-muted)]">
          Prod. by Wenpei Jiao &amp; Jinyi Ming
        </p>
      </div>
    </div>
  );
}
