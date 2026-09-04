import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import PlayerAvatar from '../components/PlayerAvatar';
import StatCard from '../components/StatCard';
import TierBadge from '../components/TierBadge';

export default function Home() {
  const navigate = useNavigate();
  const { state } = useApp();

  const totalPlayers = state.players.length;
  const totalTiers = state.tiers.length;
  const totalTests = state.testHistory.length;
  const lastUpdated = state.testHistory.length
    ? new Date(
        Math.max(...state.testHistory.map((t) => new Date(t.tested_at).getTime()))
      ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  // Featured: players with HT1 or LT1 tiers
  const t1TierIds = state.tiers.filter((t) => t.name === 'HT1' || t.name === 'LT1').map((t) => t.id);
  const featuredPts = state.playerTiers.filter((pt) => t1TierIds.includes(pt.tier_id));
  const featuredPlayerIds = [...new Set(featuredPts.map((pt) => pt.player_id))].slice(0, 6);
  const featuredPlayers = featuredPlayerIds.map((id) => state.players.find((p) => p.id === id)).filter(Boolean);

  // Recently ranked
  const recentPts = [...state.playerTiers]
    .sort((a, b) => new Date(b.ranked_at).getTime() - new Date(a.ranked_at).getTime())
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-grid relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-96 h-96 top-[-100px] left-[-100px] animate-orb" style={{ background: 'rgba(124, 58, 237, 0.15)' }} />
      <div className="orb w-80 h-80 top-40 right-[-80px] animate-orb" style={{ background: 'rgba(79, 70, 229, 0.12)', animationDelay: '-4s' }} />
      <div className="orb w-64 h-64 bottom-40 left-1/3 animate-orb" style={{ background: 'rgba(16, 185, 129, 0.08)', animationDelay: '-8s' }} />

      <div className="relative z-10">
        {/* Hero */}
        <section className="pt-36 pb-24 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div
              className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#a78bfa',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              ⚔ Competitive Minecraft PvP Rankings
            </div>

            <h1
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                letterSpacing: '0.05em',
                lineHeight: 0.95,
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              <span className="shimmer-text">Fighter</span>
              <br />
              <span style={{ color: '#e2e8f0' }}>Tiers</span>
            </h1>

            <p
              className="mx-auto mb-10"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.1rem',
                color: 'rgba(148, 163, 184, 0.8)',
                maxWidth: '540px',
                lineHeight: 1.7,
              }}
            >
              The definitive Minecraft PvP ranking platform. Track fighters across Crystal, Sword, Axe, Mace, UHC, Pot, and SMP.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="btn-primary text-base px-8 py-3" onClick={() => navigate('/tiers')}>
                ⚔ View Tier List
              </button>
              <button className="btn-secondary text-base px-8 py-3" onClick={() => navigate('/leaderboard')}>
                🏆 Leaderboard
              </button>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base px-8 py-3 flex items-center gap-2"
                style={{ color: '#7289da', borderColor: 'rgba(114, 137, 218, 0.3)' }}
              >
                <span style={{ fontSize: '1.1rem' }}>🎮</span> Discord
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Players" value={totalPlayers} icon="👤" accent="#a78bfa" />
            <StatCard label="Total Tiers" value={totalTiers} icon="🏅" accent="#fbbf24" />
            <StatCard label="Total Tests" value={totalTests} icon="⚔" accent="#10b981" />
            <StatCard label="Last Updated" value={lastUpdated} icon="📅" accent="#3b82f6" />
          </div>
        </section>

        {/* Featured Players */}
        {featuredPlayers.length > 0 && (
          <section className="px-4 pb-20">
            <div className="max-w-5xl mx-auto">
              <SectionHeader label="Featured Players" sub="Top-tier ranked fighters" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredPlayers.map((player) => {
                  if (!player) return null;
                  const pts = state.playerTiers.filter((pt) => pt.player_id === player.id);
                  const bestTierId = pts[0]?.tier_id;
                  return (
                    <button
                      key={player.id}
                      onClick={() => navigate(`/player/${player.username}`)}
                      className="glass rounded-xl p-4 flex flex-col items-center gap-3 hover:border-purple-500/30 transition-all duration-200 hover:scale-105"
                    >
                      <PlayerAvatar username={player.username} size={56} />
                      <div className="text-center">
                        <div
                          style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#e2e8f0',
                          }}
                        >
                          {player.username}
                        </div>
                        {player.country && <div className="text-base">{player.country}</div>}
                        {bestTierId && (
                          <div className="mt-1">
                            <TierBadge tierId={bestTierId} size="sm" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Recently Ranked */}
        {recentPts.length > 0 && (
          <section className="px-4 pb-24">
            <div className="max-w-5xl mx-auto">
              <SectionHeader label="Recently Ranked" sub="Latest tier assignments" />
              <div className="glass rounded-2xl overflow-hidden">
                {recentPts.map((pt, i) => {
                  const player = state.players.find((p) => p.id === pt.player_id);
                  const cat = state.categories.find((c) => c.id === pt.category_id);
                  if (!player || !cat) return null;
                  return (
                    <div
                      key={pt.id}
                      className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors cursor-pointer"
                      onClick={() => navigate(`/player/${player.username}`)}
                    >
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.75rem',
                          color: 'rgba(148, 163, 184, 0.4)',
                          width: '1.5rem',
                          textAlign: 'right',
                        }}
                      >
                        {i + 1}
                      </span>
                      <PlayerAvatar username={player.username} size={32} />
                      <div className="flex-1">
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, color: '#e2e8f0' }}>
                          {player.username}
                        </span>
                        {player.country && <span className="ml-1.5 text-sm">{player.country}</span>}
                      </div>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.75rem',
                          color: 'rgba(148, 163, 184, 0.5)',
                        }}
                      >
                        {cat.name}
                      </span>
                      <TierBadge tierId={pt.tier_id} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: '1.75rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#e2e8f0',
        }}
      >
        {label}
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(148, 163, 184, 0.5)' }}>
        {sub}
      </p>
    </div>
  );
}
