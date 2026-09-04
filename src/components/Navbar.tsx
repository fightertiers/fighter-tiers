import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tiers', label: 'Tier List' },
  { to: '/players', label: 'Players' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/admin', label: 'Admin' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: 'rgba(5, 5, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 0 16px rgba(124, 58, 237, 0.5)',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1rem',
                letterSpacing: '0.05em',
              }}
            >
              FT
            </div>
            <div className="flex flex-col leading-none">
              <span
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Fighter Tiers
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(148, 163, 184, 0.5)',
                  textTransform: 'uppercase',
                }}
              >
                Minecraft PvP Rankings
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-6 h-0.5 rounded transition-all duration-300"
                style={{
                  background: 'rgba(167, 139, 250, 0.8)',
                  transform:
                    open && i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                    : open && i === 1 ? 'scaleX(0)'
                    : open && i === 2 ? 'rotate(-45deg) translate(5px, -5px)'
                    : undefined,
                }}
              />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: open ? '300px' : '0' }}
        >
          <div className="py-4 flex flex-col gap-2 border-t border-white/5">
            {LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `nav-link px-2 py-2 rounded-lg ${isActive ? 'active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
