import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import PlayerAvatar from '../components/PlayerAvatar';

export default function TierList() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(state.categories[0]?.id ?? '');
  const [search, setSearch] = useState('');

  const category = state.categories.find((c) => c.id === activeCategory);
  const tiersForCat = [...state.tiers]
    .filter((t) => t.category_id === activeCategory)
    .sort((a, b) => a.display_order - b.display_order);

  function getPlayersInTier(tierId: string) {
    const pts = state.playerTiers.filter((pt) => pt.tier_id === tierId);
    const players = pts.map((pt) => state.players.find((p) => p.id === pt.player_id)).filter(Boolean);
    if (!search) return players;
    return players.filter((p) => p!.username.toLowerCase().includes(search.toLowerCase()));
  }

  return (
    <div className="min-h-screen bg-grid relative overflow-hidden pt-20">
      <div className="orb w-80 h-80 top-20 right-[-60px]" style={{ background: 'rgba(124, 58, 237, 0.1)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: '2.5rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#e2e8f0',
                }}
              >
                Tier List
              </h1>
              <p style={{ color: 'rgba(148, 163, 184, 0.6)', fontSize: '0.9rem' }}>
                Official rankings across all game modes
              </p>
            </div>
            <input
              className="input-dark w-64"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {state.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: activeCategory === cat.id
                  ? '1px solid rgba(139, 92, 246, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeCategory === cat.id
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(255, 255, 255, 0.04)',
                color: activeCategory === cat.id ? '#a78bfa' : 'rgba(148, 163, 184, 0.7)',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: activeCategory === cat.id ? '0 0 12px rgba(139, 92, 246, 0.2)' : undefined,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tier rows */}
        {category && (
          <div className="flex flex-col gap-3">
            {tiersForCat.map((tier) => {
              const players = getPlayersInTier(tier.id);
              return (
                <div
                  key={tier.id}
                  className={`glass rounded-xl overflow-hidden ${tier.glow_class}`}
                  style={{ borderColor: `${tier.color}33` }}
                >
                  {/* Tier label */}
                  <div
                    className="flex items-center"
                    style={{ minHeight: '64px' }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '80px',
                        background: `linear-gradient(135deg, ${tier.color}33, ${tier.color}11)`,
                        borderRight: `2px solid ${tier.color}44`,
                        alignSelf: 'stretch',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Rajdhani, sans-serif',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          letterSpacing: '0.1em',
                          color: tier.color,
                          textShadow: `0 0 12px ${tier.color}88`,
                        }}
                      >
                        {tier.name}
                      </span>
                    </div>

                    {/* Players */}
                    <div className="flex-1 flex flex-wrap gap-2 px-4 py-3">
                      {players.length === 0 ? (
                        <span style={{ color: 'rgba(148, 163, 184, 0.25)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          No players ranked
                        </span>
                      ) : (
                        players.map((player) => {
                          if (!player) return null;
                          return (
                            <button
                              key={player.id}
                              onClick={() => navigate(`/player/${player.username}`)}
                              className="player-card flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = `${tier.color}55`;
                                (e.currentTarget as HTMLElement).style.background = `${tier.color}11`;
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                              }}
                            >
                              <PlayerAvatar username={player.username} size={28} />
                              <div className="text-left">
                                <div
                                  style={{
                                    fontFamily: 'Rajdhani, sans-serif',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    color: '#e2e8f0',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {player.username}
                                </div>
                                {player.country && (
                                  <div style={{ fontSize: '0.7rem', lineHeight: 1 }}>{player.country}</div>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
