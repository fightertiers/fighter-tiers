import { useNavigate } from 'react-router-dom';
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

interface LeaderboardEntry {
  playerId: string;
  username: string;
  country?: string;
  bestTierId: string | null;
  bestTierName: string;
  rating: number;
  tests: number;
  categories: string[];
}

export default function Leaderboard() {
  const { state } = useApp();
  const navigate = useNavigate();

  const entries: LeaderboardEntry[] = state.players.map((player) => {
    const pts = state.playerTiers.filter((pt) => pt.player_id === player.id);
    const tests = state.testHistory.filter((th) => th.player_id === player.id).length;

    let bestTierId: string | null = null;
    let bestTierName = 'Unranked';
    let rating = 0;

    pts.forEach((pt) => {
      const tier = state.tiers.find((t) => t.id === pt.tier_id);
      if (!tier) return;
      const r = getRating(tier.name);
      if (r > rating) {
        rating = r;
        bestTierId = tier.id;
        bestTierName = tier.name;
      }
    });

    const categories = pts
      .map((pt) => state.categories.find((c) => c.id === pt.category_id)?.name)
      .filter(Boolean) as string[];

    return { playerId: player.id, username: player.username, country: player.country, bestTierId, bestTierName, rating, tests, categories };
  });

  const ranked = [...entries].filter((e) => e.rating > 0).sort((a, b) => b.rating - a.rating);
  const unranked = entries.filter((e) => e.rating === 0);

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd visual positions

  return (
    <div className="min-h-screen bg-grid pt-20">
      <div className="orb w-96 h-96 top-20 right-[-80px]" style={{ background: 'rgba(251, 191, 36, 0.08)' }} />
      <div className="orb w-64 h-64 bottom-40 left-[-60px]" style={{ background: 'rgba(124, 58, 237, 0.1)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '2.5rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#e2e8f0' }}>
            Leaderboard
          </h1>
          <p style={{ color: 'rgba(148, 163, 184, 0.6)', fontSize: '0.9rem' }}>
            Top fighters ranked by peak tier rating
          </p>
        </div>

        {/* Podium */}
        {top3.length === 3 && (
          <div className="flex items-end justify-center gap-4 mb-16">
            {podiumOrder.map((idx) => {
              const entry = top3[idx];
              const rank = idx + 1;
              const heights = ['h-32', 'h-44', 'h-28'];
              const glows = ['glow-blue', 'glow-gold', ''];
              const crowns = ['🥈', '🥇', '🥉'];
              const accents = ['#94a3b8', '#fbbf24', '#b45309'];

              return (
                <button
                  key={entry.playerId}
                  onClick={() => navigate(`/player/${entry.username}`)}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                  style={{ flex: '0 0 auto', width: '140px' }}
                >
                  <div className="text-2xl">{crowns[idx]}</div>
                  <PlayerAvatar
                    username={entry.username}
                    size={idx === 0 ? 64 : 52}
                    className="ring-2 group-hover:scale-105 transition-transform"
                  />
                  <div className="text-center">
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0' }}>
                      {entry.username}
                    </div>
                    {entry.country && <div>{entry.country}</div>}
                    {entry.bestTierId && <TierBadge tierId={entry.bestTierId} size="sm" />}
                  </div>
                  <div
                    className={`w-full rounded-t-xl flex items-center justify-center ${heights[idx]}`}
                    style={{
                      background: `linear-gradient(to top, ${accents[idx]}33, ${accents[idx]}11)`,
                      border: `1px solid ${accents[idx]}44`,
                      borderBottom: 'none',
                    }}
                  >
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: accents[idx] }}>
                      #{rank}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden mb-8">
          <div
            className="grid gap-0 px-5 py-3 border-b border-white/5"
            style={{
              gridTemplateColumns: '3rem 1fr 8rem 6rem 4rem 5rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(148, 163, 184, 0.4)',
            }}
          >
            <span>#</span>
            <span>Player</span>
            <span>Best Tier</span>
            <span>Rating</span>
            <span>Tests</span>
            <span>Modes</span>
          </div>

          {rest.map((entry, i) => {
            const rank = i + 4;
            return (
              <button
                key={entry.playerId}
                onClick={() => navigate(`/player/${entry.username}`)}
                className="w-full grid gap-0 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors cursor-pointer text-left items-center"
                style={{ gridTemplateColumns: '3rem 1fr 8rem 6rem 4rem 5rem' }}
              >
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: 'rgba(148, 163, 184, 0.5)' }}>
                  {rank}
                </span>
                <div className="flex items-center gap-3">
                  <PlayerAvatar username={entry.username} size={28} />
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>
                      {entry.username}
                    </div>
                    {entry.country && <span style={{ fontSize: '0.8rem' }}>{entry.country}</span>}
                  </div>
                </div>
                <div>{entry.bestTierId ? <TierBadge tierId={entry.bestTierId} size="sm" /> : <span style={{ color: 'rgba(148, 163, 184, 0.3)', fontSize: '0.8rem' }}>—</span>}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#a78bfa' }}>
                  {entry.rating.toLocaleString()}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'rgba(148, 163, 184, 0.6)' }}>
                  {entry.tests}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(148, 163, 184, 0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {entry.categories.length}
                </div>
              </button>
            );
          })}
        </div>

        {/* Unranked section */}
        {unranked.length > 0 && (
          <div>
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148, 163, 184, 0.4)', marginBottom: '0.75rem' }}>
              Unranked Players
            </h3>
            <div className="glass rounded-xl overflow-hidden">
              {unranked.map((entry) => (
                <button
                  key={entry.playerId}
                  onClick={() => navigate(`/player/${entry.username}`)}
                  className="w-full flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <PlayerAvatar username={entry.username} size={28} />
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, color: 'rgba(148, 163, 184, 0.6)', fontSize: '0.95rem' }}>
                    {entry.username}
                  </span>
                  {entry.country && <span style={{ fontSize: '0.85rem' }}>{entry.country}</span>}
                  <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Pending
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
