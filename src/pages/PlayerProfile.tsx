import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import PlayerAvatar from '../components/PlayerAvatar';
import TierBadge from '../components/TierBadge';

function getRating(tierName: string): number {
  const map: Record<string, number> = {
    HT1: 2000, LT1: 1800, HT2: 1600, LT2: 1400,
    HT3: 1200, LT3: 1000, HT4: 800, LT4: 600,
    HT5: 400, LT5: 200,
  };
  return map[tierName] ?? 0;
}

export default function PlayerProfile() {
  const { username } = useParams<{ username: string }>();
  const { state } = useApp();
  const navigate = useNavigate();

  const player = state.players.find((p) => p.username.toLowerCase() === username?.toLowerCase());

  if (!player) {
    return (
      <div className="min-h-screen bg-grid pt-20 flex items-center justify-center">
        <div className="text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❓</div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#e2e8f0' }}>
            Player Not Found
          </h1>
          <p style={{ color: 'rgba(148, 163, 184, 0.5)', margin: '0.5rem 0 1.5rem' }}>
            "{username}" is not in our database.
          </p>
          <button className="btn-secondary" onClick={() => navigate('/players')}>
            Back to Players
          </button>
        </div>
      </div>
    );
  }

  const pts = state.playerTiers.filter((pt) => pt.player_id === player.id);
  const history = [...state.testHistory]
    .filter((th) => th.player_id === player.id)
    .sort((a, b) => new Date(b.tested_at).getTime() - new Date(a.tested_at).getTime());

  let bestTierId: string | null = null;
  let bestRating = 0;
  pts.forEach((pt) => {
    const tier = state.tiers.find((t) => t.id === pt.tier_id);
    if (!tier) return;
    const r = getRating(tier.name);
    if (r > bestRating) { bestRating = r; bestTierId = tier.id; }
  });

  const joinedDate = new Date(player.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-grid pt-20 relative overflow-hidden">
      <div className="orb w-96 h-96 top-10 right-[-100px]" style={{ background: 'rgba(124, 58, 237, 0.12)' }} />
      <div className="orb w-64 h-64 top-60 left-[-60px]" style={{ background: 'rgba(16, 185, 129, 0.08)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6"
          style={{ color: 'rgba(148, 163, 184, 0.5)', fontFamily: 'Rajdhani, sans-serif', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', background: 'none' }}
        >
          ← Back
        </button>

        {/* Profile hero */}
        <div className="glass rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: `radial-gradient(ellipse at top right, ${bestTierId ? (state.tiers.find(t => t.id === bestTierId)?.color ?? '#7c3aed') : '#7c3aed'}, transparent)` }}
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <PlayerAvatar username={player.username} size={96} className="ring-2 ring-purple-500/30" />
              {player.country && (
                <div
                  className="absolute -bottom-1 -right-1 text-xl leading-none rounded-full w-8 h-8 flex items-center justify-center"
                  style={{ background: 'rgba(5, 5, 15, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {player.country}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '2.5rem', letterSpacing: '0.05em', color: '#e2e8f0', lineHeight: 1 }}>
                {player.username}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {bestTierId && <TierBadge tierId={bestTierId} size="lg" />}
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#a78bfa' }}>
                  Rating: {bestRating.toLocaleString()}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'rgba(148, 163, 184, 0.5)' }}>
                  Tests: {history.length}
                </span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(148, 163, 184, 0.4)', marginTop: '0.5rem' }}>
                Member since {joinedDate}
              </p>
              {player.notes && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(148, 163, 184, 0.7)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                  "{player.notes}"
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 flex-shrink-0">
              {[
                { label: 'Best Tier', value: bestTierId ? (state.tiers.find(t => t.id === bestTierId)?.name ?? '—') : '—' },
                { label: 'Game Modes', value: pts.length },
                { label: 'Total Tests', value: history.length },
              ].map(({ label, value }) => (
                <div key={label} className="text-right">
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#e2e8f0' }}>{value}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Tiers */}
          <div className="glass rounded-2xl p-6">
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: '1rem' }}>
              Current Rankings
            </h2>
            {pts.length === 0 ? (
              <p style={{ color: 'rgba(148, 163, 184, 0.4)', fontStyle: 'italic', fontSize: '0.9rem' }}>Not yet ranked in any category</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pts.map((pt) => {
                  const cat = state.categories.find((c) => c.id === pt.category_id);
                  const tier = state.tiers.find((t) => t.id === pt.tier_id);
                  return (
                    <div key={pt.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, color: '#e2e8f0', fontSize: '1rem' }}>
                        {cat?.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {tier && <TierBadge tierId={tier.id} size="md" />}
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.4)' }}>
                          {getRating(tier?.name ?? '').toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Test History */}
          <div className="glass rounded-2xl p-6">
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: '1rem' }}>
              Test History
            </h2>
            {history.length === 0 ? (
              <p style={{ color: 'rgba(148, 163, 184, 0.4)', fontStyle: 'italic', fontSize: '0.9rem' }}>No tests recorded</p>
            ) : (
              <div className="flex flex-col gap-0 max-h-64 overflow-y-auto">
                {history.map((th) => {
                  const cat = state.categories.find((c) => c.id === th.category_id);
                  const tier = state.tiers.find((t) => t.id === th.tier_id);
                  const date = new Date(th.tested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
                  return (
                    <div key={th.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <div>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                          {cat?.name}
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(148, 163, 184, 0.4)', marginLeft: '0.5rem' }}>
                          {date}
                        </span>
                      </div>
                      {tier && <TierBadge tierId={tier.id} size="sm" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
