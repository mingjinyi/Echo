import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: '首页', exact: true },
    { to: '/chat', label: '对话', exact: false },
    { to: '/profile', label: '画像', exact: false },
    { to: '/memory', label: '记忆', exact: false },
    { to: '/settings', label: '设置', exact: false },
  ];

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Primary — the "voice", solid diamond */}
              <g transform="translate(18, 19) rotate(45)">
                <rect x="-9.5" y="-9.5" width="19" height="19" rx="4"
                  fill="var(--color-accent-hover)" />
              </g>
              {/* Echo — offset, outlined, slightly smaller */}
              <g transform="translate(22, 22) rotate(45)">
                <rect x="-8" y="-8" width="16" height="16" rx="3.5"
                  fill="none" stroke="var(--color-accent)" strokeWidth="1.6" opacity="0.7" />
              </g>
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            回声
          </span>
          <span className="text-[10px] tracking-[0.2em] font-medium hidden sm:inline" style={{ color: 'var(--color-text-muted)' }}>
            ECHO
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex gap-1">
          {links.map(({ to, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="nav-link text-xs"
                style={active ? {
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-accent-glow)',
                  fontWeight: 400,
                } : {
                  color: 'var(--color-text-muted)',
                  fontWeight: 300,
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-2 rounded-lg transition-colors duration-200"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="sm:hidden border-t animate-fade-in-down"
          style={{
            background: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border-light)',
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {links.map(({ to, label, exact }) => {
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm transition-colors duration-200"
                  style={{
                    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    background: active ? 'var(--color-accent-glow)' : 'transparent',
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}