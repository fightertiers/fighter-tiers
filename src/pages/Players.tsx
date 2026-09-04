import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import PlayerAvatar from '../components/PlayerAvatar';
import TierBadge from '../components/TierBadge';

export default function Players() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = state.players.filter((p) => {
    const matchSearch = p.username.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (catFilter === 'all') return true;
    return state.playerTiers.some(
      (pt) => pt.player_id === p.id && pt.category_id === catFilter
    );
  });

  function getBestTier(playerId: string) {
    const pts = state.playerTiers.filter((pt) => pt.player_id === playerId);
    if (!pts.length) return null;
    // Best = lowest display_order
    const best = pts.reduce((acc, pt) => {
      const tier = state.tiers.find((t) => t.id === pt.tier_id);
      const accTier = state.tiers.find((t) => t.id === acc.tier_id);
      if (!tier || !accTier) return acc;
      return tier.display_order < accTier.display_order ? pt : acc;
    }, pts[0]);
    return best.tier_id;
  }

  return (
    <div className="min-h-screen bg-grid pt-20">
      <div className="orb w-96 h-96 top-40 left-[-100px]" style={{ background: 'rgba(16, 185, 129, 0.08)' }} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '2.5rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#e2e8f0' }}>
            Players
          </h1>
          <p style={{ color: 'rgba(148, 163, 184, 0.6)', fontSize: '0.9rem' }}>
            {state.players.length} ranked fighters
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            className="input-dark w-64"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-dark w-auto"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((player) => {
            const pts = state.playerTiers.filter((pt) => pt.player_id === player.id);
            const bestTierId = getBestTier(player.id);

            return (
              <button
                key={player.id}
                onClick={() => navigate(`/player/${player.username}`)}
                className="glass rounded-xl p-5 flex items-start gap-4 text-left hover:border-purple-500/25 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
                style={{ cursor: 'pointer' }}
              >
                <PlayerAvatar username={player.username} size={52} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0' }}>
                      {player.username}
                    </span>
                    {player.country && <span>{player.country}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {pts.slice(0, 4).map((pt) => {
                      const cat = state.categories.find((c) => c.id === pt.category_id);
                      return (
                        <span
                          key={pt.id}
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.65rem',
                            color: 'rgba(148, 163, 184, 0.5)',
                            background: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: '3px',
                            padding: '1px 5px',
                          }}
                        >
                          {cat?.name}
                        </span>
                      );
                    })}
                    {pts.length > 4 && (
                      <span style={{ fontSize: '0.65rem', color: 'rgba(148, 163, 184, 0.4)' }}>
                        +{pts.length - 4}
                      </span>
                    )}
                  </div>
                  {bestTierId && (
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.4)', fontFamily: 'Inter, sans-serif' }}>Best:</span>
                      <TierBadge tierId={bestTierId} size="sm" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: 'rgba(148, 163, 184, 0.4)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.2rem' }}>No players found</p>
          </div>
        )}
      </div>
    </div>
  );
}
