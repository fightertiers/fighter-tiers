import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppState, Category, Tier, Player, PlayerTier, TestHistory } from '../types';
import { buildInitialData } from '../lib/initialData';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'fighter-tiers-data';

function loadFromStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface AppContextType {
  state: AppState;
  // Categories
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  renameCategory: (id: string, name: string) => void;
  reorderCategories: (ids: string[]) => void;
  // Tiers
  addTier: (categoryId: string, name: string, color: string) => void;
  deleteTier: (id: string) => void;
  updateTier: (id: string, patch: Partial<Tier>) => void;
  reorderTiers: (categoryId: string, ids: string[]) => void;
  // Players
  addPlayer: (username: string, country?: string, uuid?: string) => void;
  deletePlayer: (id: string) => void;
  updatePlayer: (id: string, patch: Partial<Player>) => void;
  // Player-Tier assignments
  assignPlayerTier: (playerId: string, categoryId: string, tierId: string) => void;
  removePlayerTier: (playerId: string, categoryId: string) => void;
  movePlayerTier: (playerId: string, fromCatId: string, toTierId: string, toCatId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    return loadFromStorage() ?? buildInitialData();
  });

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Supabase sync (load from DB if connected)
  useEffect(() => {
    if (!supabase) return;
    async function fetchAll() {
      if (!supabase) return;
      const [cats, tiers, players, pts, tests] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('tiers').select('*').order('display_order'),
        supabase.from('players').select('*').order('created_at'),
        supabase.from('player_tiers').select('*').order('ranked_at'),
        supabase.from('test_history').select('*').order('tested_at', { ascending: false }),
      ]);
      if (cats.data && tiers.data && players.data && pts.data && tests.data) {
        setState({
          categories: cats.data,
          tiers: tiers.data,
          players: players.data,
          playerTiers: pts.data,
          testHistory: tests.data,
        });
      }
    }
    fetchAll();
  }, []);

  function mutate(fn: (prev: AppState) => AppState) {
    setState((prev) => {
      const next = fn(prev);
      return next;
    });
  }

  function genId() {
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function getTierGlowClass(color: string): string {
    // Map common tier colors to glow classes
    const map: Record<string, string> = {
      '#fbbf24': 'tier-glow-t1', '#f59e0b': 'tier-glow-t1',
      '#10b981': 'tier-glow-t2', '#059669': 'tier-glow-t2',
      '#3b82f6': 'tier-glow-t3', '#2563eb': 'tier-glow-t3',
      '#a855f7': 'tier-glow-t4', '#9333ea': 'tier-glow-t4',
      '#6b7280': 'tier-glow-t5', '#4b5563': 'tier-glow-t5',
    };
    return map[color.toLowerCase()] ?? 'tier-glow-t5';
  }

  const ctx: AppContextType = {
    state,

    addCategory(name) {
      const id = genId();
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const cat: Category = { id, name, slug, display_order: state.categories.length };
      mutate((s) => ({ ...s, categories: [...s.categories, cat] }));
      // Also add default tiers for this category
      const tierNames = ['HT1','LT1','HT2','LT2','HT3','LT3','HT4','LT4','HT5','LT5'];
      const tierColors: Record<string,{color:string;glow_class:string}> = {
        HT1:{color:'#fbbf24',glow_class:'tier-glow-t1'},LT1:{color:'#f59e0b',glow_class:'tier-glow-t1'},
        HT2:{color:'#10b981',glow_class:'tier-glow-t2'},LT2:{color:'#059669',glow_class:'tier-glow-t2'},
        HT3:{color:'#3b82f6',glow_class:'tier-glow-t3'},LT3:{color:'#2563eb',glow_class:'tier-glow-t3'},
        HT4:{color:'#a855f7',glow_class:'tier-glow-t4'},LT4:{color:'#9333ea',glow_class:'tier-glow-t4'},
        HT5:{color:'#6b7280',glow_class:'tier-glow-t5'},LT5:{color:'#4b5563',glow_class:'tier-glow-t5'},
      };
      const newTiers: Tier[] = tierNames.map((n, i) => ({
        id: `${genId()}-${n}`,
        category_id: id,
        name: n,
        color: tierColors[n].color,
        glow_class: tierColors[n].glow_class,
        display_order: i,
      }));
      mutate((s) => ({ ...s, tiers: [...s.tiers, ...newTiers] }));
    },

    deleteCategory(id) {
      mutate((s) => ({
        ...s,
        categories: s.categories.filter((c) => c.id !== id),
        tiers: s.tiers.filter((t) => t.category_id !== id),
        playerTiers: s.playerTiers.filter((pt) => pt.category_id !== id),
        testHistory: s.testHistory.filter((th) => th.category_id !== id),
      }));
    },

    renameCategory(id, name) {
      mutate((s) => ({
        ...s,
        categories: s.categories.map((c) =>
          c.id === id ? { ...c, name, slug: name.toLowerCase().replace(/\s+/g, '-') } : c
        ),
      }));
    },

    reorderCategories(ids) {
      mutate((s) => ({
        ...s,
        categories: ids
          .map((id, i) => {
            const cat = s.categories.find((c) => c.id === id);
            return cat ? { ...cat, display_order: i } : null;
          })
          .filter(Boolean) as Category[],
      }));
    },

    addTier(categoryId, name, color) {
      const existing = state.tiers.filter((t) => t.category_id === categoryId);
      const tier: Tier = {
        id: genId(),
        category_id: categoryId,
        name,
        color,
        glow_class: getTierGlowClass(color),
        display_order: existing.length,
      };
      mutate((s) => ({ ...s, tiers: [...s.tiers, tier] }));
    },

    deleteTier(id) {
      mutate((s) => ({
        ...s,
        tiers: s.tiers.filter((t) => t.id !== id),
        playerTiers: s.playerTiers.filter((pt) => pt.tier_id !== id),
        testHistory: s.testHistory.filter((th) => th.tier_id !== id),
      }));
    },

    updateTier(id, patch) {
      mutate((s) => ({
        ...s,
        tiers: s.tiers.map((t) => {
          if (t.id !== id) return t;
          const updated = { ...t, ...patch };
          if (patch.color) updated.glow_class = getTierGlowClass(patch.color);
          return updated;
        }),
      }));
    },

    reorderTiers(categoryId, ids) {
      mutate((s) => ({
        ...s,
        tiers: s.tiers.map((t) => {
          if (t.category_id !== categoryId) return t;
          const idx = ids.indexOf(t.id);
          return idx >= 0 ? { ...t, display_order: idx } : t;
        }),
      }));
    },

    addPlayer(username, country, uuid) {
      const player: Player = {
        id: genId(),
        username,
        uuid,
        country,
        avatar_url: undefined,
        notes: '',
        created_at: new Date().toISOString(),
      };
      mutate((s) => ({ ...s, players: [...s.players, player] }));
    },

    deletePlayer(id) {
      mutate((s) => ({
        ...s,
        players: s.players.filter((p) => p.id !== id),
        playerTiers: s.playerTiers.filter((pt) => pt.player_id !== id),
        testHistory: s.testHistory.filter((th) => th.player_id !== id),
      }));
    },

    updatePlayer(id, patch) {
      mutate((s) => ({
        ...s,
        players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },

    assignPlayerTier(playerId, categoryId, tierId) {
      const existing = state.playerTiers.find(
        (pt) => pt.player_id === playerId && pt.category_id === categoryId
      );
      const now = new Date().toISOString();

      // Add to test history
      const th: TestHistory = {
        id: genId(),
        player_id: playerId,
        category_id: categoryId,
        tier_id: tierId,
        tested_at: now,
      };

      if (existing) {
        mutate((s) => ({
          ...s,
          playerTiers: s.playerTiers.map((pt) =>
            pt.player_id === playerId && pt.category_id === categoryId
              ? { ...pt, tier_id: tierId, ranked_at: now }
              : pt
          ),
          testHistory: [...s.testHistory, th],
        }));
      } else {
        const pt: PlayerTier = {
          id: genId(),
          player_id: playerId,
          tier_id: tierId,
          category_id: categoryId,
          ranked_at: now,
        };
        mutate((s) => ({
          ...s,
          playerTiers: [...s.playerTiers, pt],
          testHistory: [...s.testHistory, th],
        }));
      }
    },

    removePlayerTier(playerId, categoryId) {
      mutate((s) => ({
        ...s,
        playerTiers: s.playerTiers.filter(
          (pt) => !(pt.player_id === playerId && pt.category_id === categoryId)
        ),
      }));
    },

    movePlayerTier(playerId, _fromCatId, toTierId, toCatId) {
      ctx.assignPlayerTier(playerId, toCatId, toTierId);
    },
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
