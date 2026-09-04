import type { AppState } from '../types';

const TIER_META: Record<string, { color: string; glow_class: string }> = {
  HT1: { color: '#fbbf24', glow_class: 'tier-glow-t1' },
  LT1: { color: '#f59e0b', glow_class: 'tier-glow-t1' },
  HT2: { color: '#10b981', glow_class: 'tier-glow-t2' },
  LT2: { color: '#059669', glow_class: 'tier-glow-t2' },
  HT3: { color: '#3b82f6', glow_class: 'tier-glow-t3' },
  LT3: { color: '#2563eb', glow_class: 'tier-glow-t3' },
  HT4: { color: '#a855f7', glow_class: 'tier-glow-t4' },
  LT4: { color: '#9333ea', glow_class: 'tier-glow-t4' },
  HT5: { color: '#6b7280', glow_class: 'tier-glow-t5' },
  LT5: { color: '#4b5563', glow_class: 'tier-glow-t5' },
};

const TIER_NAMES = ['HT1','LT1','HT2','LT2','HT3','LT3','HT4','LT4','HT5','LT5'];
const CATEGORY_NAMES = ['Crystal','Sword','Axe','Mace','UHC','Pot','SMP'];

export function buildInitialData(): AppState {
  const categories = CATEGORY_NAMES.map((name, i) => ({
    id: `cat-${i}`,
    name,
    slug: name.toLowerCase(),
    display_order: i,
  }));

  const tiers = categories.flatMap((cat) =>
    TIER_NAMES.map((name, j) => ({
      id: `tier-${cat.id}-${j}`,
      category_id: cat.id,
      name,
      color: TIER_META[name].color,
      glow_class: TIER_META[name].glow_class,
      display_order: j,
      description: '',
    }))
  );

  const playerDefs = [
    { username: 'DragonSlayerX', country: '🇺🇸', tiers: { crystal: 'HT1', sword: 'HT1', axe: 'LT1' } },
    { username: 'CrystalGod420', country: '🇬🇧', tiers: { crystal: 'LT1', mace: 'HT2' } },
    { username: 'MaceWarrior', country: '🇩🇪', tiers: { mace: 'HT1', crystal: 'HT2' } },
    { username: 'SwordLegend', country: '🇫🇷', tiers: { sword: 'LT1', axe: 'HT2', uhc: 'HT3' } },
    { username: 'NethriteShadow', country: '🇧🇷', tiers: { crystal: 'HT2', sword: 'HT2', pot: 'LT2' } },
    { username: 'UHCMaster99', country: '🇨🇦', tiers: { uhc: 'HT1', sword: 'LT2', smp: 'HT3' } },
    { username: 'PotionKingPvP', country: '🇳🇱', tiers: { pot: 'HT1', uhc: 'LT2' } },
    { username: 'AxeElite', country: '🇸🇪', tiers: { axe: 'HT1', crystal: 'HT3' } },
    { username: 'SMPProdigy', country: '🇦🇺', tiers: { smp: 'HT1', sword: 'HT3' } },
    { username: 'VoidWalker', country: '🇰🇷', tiers: { crystal: 'HT3', mace: 'HT3' } },
    { username: 'BladeStorm', country: '🇯🇵', tiers: { sword: 'HT3', axe: 'HT3' } },
    { username: 'CrystalPhoenix', country: '🇲🇽', tiers: { crystal: 'LT2', pot: 'HT3' } },
    { username: 'IronFistPvP', country: '🇮🇹', tiers: { mace: 'LT2', smp: 'HT2' } },
    { username: 'GhostBladePvP', country: '🇪🇸', tiers: { sword: 'LT2', uhc: 'HT4' } },
    { username: 'ThunderAxe', country: '🇵🇱', tiers: { axe: 'LT2', crystal: 'HT4' } },
    { username: 'RuneKnight', country: '🇷🇺', tiers: { crystal: 'LT3', sword: 'HT4' } },
    { username: 'ObsidianFury', country: '🇨🇳', tiers: { mace: 'HT4', pot: 'LT3' } },
    { username: 'NightFallPvP', country: '🇮🇳', tiers: { smp: 'LT3', crystal: 'HT5' } },
    { username: 'StarForged', country: '🇿🇦', tiers: { uhc: 'HT3', axe: 'LT3' } },
    { username: 'EclipsePvP', country: '🇦🇷', tiers: { sword: 'HT5', crystal: 'LT5' } },
  ];

  const now = new Date().toISOString();
  const players = playerDefs.map((p, i) => ({
    id: `player-${i}`,
    username: p.username,
    uuid: undefined,
    country: p.country,
    avatar_url: undefined,
    notes: '',
    created_at: now,
  }));

  const playerTiers: AppState['playerTiers'] = [];
  const testHistory: AppState['testHistory'] = [];

  playerDefs.forEach((def, pi) => {
    const player = players[pi];
    Object.entries(def.tiers).forEach(([catSlug, tierName]) => {
      const cat = categories.find((c) => c.slug === catSlug);
      const tier = tiers.find((t) => t.category_id === cat?.id && t.name === tierName);
      if (!cat || !tier) return;

      const ptId = `pt-${player.id}-${cat.id}`;
      playerTiers.push({
        id: ptId,
        player_id: player.id,
        tier_id: tier.id,
        category_id: cat.id,
        ranked_at: now,
      });

      testHistory.push({
        id: `th-${player.id}-${cat.id}`,
        player_id: player.id,
        category_id: cat.id,
        tier_id: tier.id,
        tested_at: now,
      });
    });
  });

  return { categories, tiers, players, playerTiers, testHistory };
}

export const TIER_COLORS: Record<string, { color: string; glow_class: string }> = TIER_META;
export const TIER_ORDER = TIER_NAMES;
