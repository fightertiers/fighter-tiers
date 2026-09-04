import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../contexts/AppContext';
import type { Player, Tier } from '../types';
import PlayerAvatar from '../components/PlayerAvatar';
import TierBadge from '../components/TierBadge';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123';

type Tab = 'tiers' | 'players' | 'categories';

interface Toast { id: number; msg: string; type: 'success' | 'error' }

// ── Sortable player item ───────────────────────────────────────────────────
function SortablePlayer({ player, onRemove, onMove, tiers, tierId }: {
  player: Player;
  tierId: string;
  onRemove: () => void;
  onMove: (newTierId: string) => void;
  tiers: Tier[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: player.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      {...attributes}
    >
      <span {...listeners} className="drag-handle select-none text-lg cursor-grab active:cursor-grabbing">⠿</span>
      <PlayerAvatar username={player.username} size={28} />
      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, color: '#e2e8f0', flex: 1 }}>
        {player.username}
      </span>
      {player.country && <span>{player.country}</span>}
      <select
        className="input-dark"
        style={{ width: '90px', fontSize: '0.75rem', padding: '2px 6px' }}
        value={tierId}
        onChange={(e) => onMove(e.target.value)}
      >
        {tiers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <button className="btn-danger" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={onRemove}>✕</button>
    </div>
  );
}

// ── Sortable tier row ──────────────────────────────────────────────────────
function SortableTierRow({ tier, players, allPlayers, allTiers, onDelete, onUpdate, onAddPlayer, onRemovePlayer, onMovePlayer }: {
  tier: Tier;
  players: Player[];
  allPlayers: Player[];
  allTiers: Tier[];
  onDelete: () => void;
  onUpdate: (patch: Partial<Tier>) => void;
  onAddPlayer: (pid: string) => void;
  onRemovePlayer: (pid: string) => void;
  onMovePlayer: (pid: string, newTierId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tier.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(tier.name);
  const [expanded, setExpanded] = useState(true);
  const [addPid, setAddPid] = useState('');

  const availableToAdd = allPlayers.filter((p) => !players.find((pl) => pl.id === p.id));

  const sensors = useSensors(useSensor(PointerSensor));

  function handlePlayerDragEnd(event: DragEndEvent) {
    // Player reorder within this tier - visual only; persist order via arrayMove if needed
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: `${tier.color}33` }}
      className="glass rounded-xl overflow-hidden mb-3"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-white/5"
        style={{ background: `${tier.color}0d` }}
      >
        <span {...attributes} {...listeners} className="drag-handle select-none cursor-grab active:cursor-grabbing">⠿</span>

        {/* Tier name (editable) */}
        {editName ? (
          <input
            className="input-dark"
            style={{ width: '100px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: tier.color }}
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={() => { onUpdate({ name: nameVal }); setEditName(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onUpdate({ name: nameVal }); setEditName(false); } }}
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditName(true)}
            style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em', color: tier.color, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {tier.name}
          </button>
        )}

        {/* Color picker */}
        <input
          type="color"
          value={tier.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          title="Change tier color"
        />

        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.4)' }}>
          {players.length} players
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(148, 163, 184, 0.5)', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button className="btn-danger" onClick={onDelete}>Delete</button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePlayerDragEnd}>
            <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {players.map((p) => (
                <SortablePlayer
                  key={p.id}
                  player={p}
                  tierId={tier.id}
                  tiers={allTiers}
                  onRemove={() => onRemovePlayer(p.id)}
                  onMove={(newTierId) => onMovePlayer(p.id, newTierId)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {players.length === 0 && (
            <p style={{ color: 'rgba(148, 163, 184, 0.25)', fontSize: '0.8rem', padding: '0.5rem 0.75rem', fontStyle: 'italic' }}>
              No players in this tier
            </p>
          )}

          {/* Add player */}
          {availableToAdd.length > 0 && (
            <div className="flex gap-2 mt-2 px-1">
              <select
                className="input-dark flex-1"
                style={{ fontSize: '0.8rem' }}
                value={addPid}
                onChange={(e) => setAddPid(e.target.value)}
              >
                <option value="">Add player…</option>
                {availableToAdd.map((p) => (
                  <option key={p.id} value={p.id}>{p.username}</option>
                ))}
              </select>
              <button
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
                onClick={() => { if (addPid) { onAddPlayer(addPid); setAddPid(''); } }}
              >
                + Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Admin page ────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('ft-admin') === 'true');
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab] = useState<Tab>('tiers');
  const [activeCat, setActiveCat] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { state, addCategory, deleteCategory, renameCategory, reorderCategories,
    addTier, deleteTier, updateTier, reorderTiers,
    addPlayer, deletePlayer, updatePlayer,
    assignPlayerTier, removePlayerTier } = useApp();

  // New player form
  const [newPUsername, setNewPUsername] = useState('');
  const [newPCountry, setNewPCountry] = useState('');
  const [newPUuid, setNewPUuid] = useState('');

  // New category form
  const [newCatName, setNewCatName] = useState('');

  const sensors = useSensors(useSensor(PointerSensor));

  const currentCatId = activeCat || state.categories[0]?.id;

  function toast(msg: string, type: 'success' | 'error' = 'success') {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }

  function handleLogin() {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('ft-admin', 'true');
      setAuthed(true);
    } else {
      setPwErr(true);
      setTimeout(() => setPwErr(false), 2000);
    }
  }

  // ── Auth gate ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-sm" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <div className="text-center mb-8">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0' }}>
              Admin Access
            </h1>
            <p style={{ color: 'rgba(148, 163, 184, 0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Enter the admin password to continue
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="password"
              className={`input-dark ${pwErr ? 'ring-2 ring-red-500/50' : ''}`}
              placeholder="Password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {pwErr && (
              <p style={{ color: '#f87171', fontSize: '0.8rem', textAlign: 'center' }}>Incorrect password</p>
            )}
            <button className="btn-primary w-full py-3" onClick={handleLogin}>
              Enter Admin Panel
            </button>
            <p style={{ color: 'rgba(148, 163, 184, 0.3)', fontSize: '0.75rem', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
              Default: admin123 · Set VITE_ADMIN_PASSWORD to change
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tiersForCat = [...state.tiers]
    .filter((t) => t.category_id === currentCatId)
    .sort((a, b) => a.display_order - b.display_order);

  // ── Tier DnD ───────────────────────────────────────────────────────────
  function handleTierDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIds = tiersForCat.map((t) => t.id);
    const oldIdx = oldIds.indexOf(active.id as string);
    const newIdx = oldIds.indexOf(over.id as string);
    const newIds = arrayMove(oldIds, oldIdx, newIdx);
    reorderTiers(currentCatId, newIds);
    toast('Tier order updated');
  }

  return (
    <div className="min-h-screen bg-grid pt-20 relative">
      {/* Toasts */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast glass rounded-xl px-5 py-3 flex items-center gap-3"
            style={{
              borderColor: t.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              color: t.type === 'success' ? '#10b981' : '#f87171',
              minWidth: '220px',
            }}
          >
            <span>{t.type === 'success' ? '✓' : '✕'}</span>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>{t.msg}</span>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '2.5rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#e2e8f0' }}>
              Admin Panel
            </h1>
            <p style={{ color: 'rgba(148, 163, 184, 0.5)', fontSize: '0.85rem' }}>
              Manage tiers, players, and categories
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => { sessionStorage.removeItem('ft-admin'); setAuthed(false); }}
            style={{ fontSize: '0.8rem' }}
          >
            🔓 Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/5 pb-0">
          {(['tiers', 'players', 'categories'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.6rem 1.5rem',
                color: tab === t ? '#a78bfa' : 'rgba(148, 163, 184, 0.5)',
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? '2px solid #8b5cf6' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'all 0.2s',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tiers tab ── */}
        {tab === 'tiers' && (
          <div>
            {/* Category selector */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {state.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer',
                    border: currentCatId === cat.id ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: currentCatId === cat.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                    color: currentCatId === cat.id ? '#a78bfa' : 'rgba(148,163,184,0.6)',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <p style={{ color: 'rgba(148, 163, 184, 0.4)', fontSize: '0.8rem', marginBottom: '1rem', fontFamily: 'JetBrains Mono, monospace' }}>
              ⠿ Drag to reorder tiers · Click tier name to rename · Color picker to change color
            </p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTierDragEnd}>
              <SortableContext items={tiersForCat.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {tiersForCat.map((tier) => {
                  const playersInTier = state.playerTiers
                    .filter((pt) => pt.tier_id === tier.id)
                    .map((pt) => state.players.find((p) => p.id === pt.player_id))
                    .filter(Boolean) as Player[];

                  return (
                    <SortableTierRow
                      key={tier.id}
                      tier={tier}
                      players={playersInTier}
                      allPlayers={state.players}
                      allTiers={tiersForCat}
                      onDelete={() => { deleteTier(tier.id); toast('Tier deleted', 'error'); }}
                      onUpdate={(patch) => { updateTier(tier.id, patch); toast('Tier updated'); }}
                      onAddPlayer={(pid) => {
                        assignPlayerTier(pid, currentCatId, tier.id);
                        toast(`Player added to ${tier.name}`);
                      }}
                      onRemovePlayer={(pid) => {
                        removePlayerTier(pid, currentCatId);
                        toast('Player removed from tier');
                      }}
                      onMovePlayer={(pid, newTierId) => {
                        assignPlayerTier(pid, currentCatId, newTierId);
                        toast('Player moved');
                      }}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>

            {/* Add tier form */}
            <AddTierForm
              onAdd={(name, color) => {
                addTier(currentCatId, name, color);
                toast(`Tier "${name}" created`);
              }}
            />
          </div>
        )}

        {/* ── Players tab ── */}
        {tab === 'players' && (
          <div>
            {/* Add player */}
            <div className="glass rounded-xl p-5 mb-6">
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: '1rem' }}>
                Add Player
              </h3>
              <div className="flex flex-wrap gap-3">
                <input className="input-dark flex-1 min-w-[150px]" placeholder="Username *" value={newPUsername} onChange={(e) => setNewPUsername(e.target.value)} />
                <input className="input-dark w-32" placeholder="Country 🇺🇸" value={newPCountry} onChange={(e) => setNewPCountry(e.target.value)} />
                <input className="input-dark flex-1 min-w-[150px]" placeholder="Minecraft UUID (optional)" value={newPUuid} onChange={(e) => setNewPUuid(e.target.value)} />
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (!newPUsername.trim()) return;
                    addPlayer(newPUsername.trim(), newPCountry.trim() || undefined, newPUuid.trim() || undefined);
                    toast(`Player "${newPUsername}" added`);
                    setNewPUsername(''); setNewPCountry(''); setNewPUuid('');
                  }}
                >
                  + Add Player
                </button>
              </div>
            </div>

            {/* Player list */}
            <div className="glass rounded-2xl overflow-hidden">
              {state.players.map((player) => {
                const pts = state.playerTiers.filter((pt) => pt.player_id === player.id);
                return (
                  <div key={player.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
                    <PlayerAvatar username={player.username} size={36} />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#e2e8f0', fontSize: '1rem' }}>
                        {player.username}
                        {player.country && <span className="ml-2">{player.country}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {pts.map((pt) => (
                          <TierBadge key={pt.id} tierId={pt.tier_id} size="sm" />
                        ))}
                      </div>
                    </div>
                    <EditableField
                      label="Notes"
                      value={player.notes ?? ''}
                      onSave={(v) => { updatePlayer(player.id, { notes: v }); toast('Notes saved'); }}
                    />
                    <button
                      className="btn-danger"
                      onClick={() => {
                        if (confirm(`Delete "${player.username}"?`)) {
                          deletePlayer(player.id);
                          toast(`"${player.username}" deleted`, 'error');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Categories tab ── */}
        {tab === 'categories' && (
          <div>
            {/* Add category */}
            <div className="glass rounded-xl p-5 mb-6">
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#e2e8f0', marginBottom: '1rem' }}>
                Add Category
              </h3>
              <div className="flex gap-3">
                <input className="input-dark flex-1" placeholder="Category name (e.g. Crystal)" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (!newCatName.trim()) return;
                    addCategory(newCatName.trim());
                    toast(`Category "${newCatName}" added`);
                    setNewCatName('');
                  }}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Category list */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
              const { active, over } = e;
              if (!over || active.id === over.id) return;
              const ids = state.categories.map(c => c.id);
              const newIds = arrayMove(ids, ids.indexOf(active.id as string), ids.indexOf(over.id as string));
              reorderCategories(newIds);
              toast('Categories reordered');
            }}>
              <SortableContext items={state.categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {state.categories.map((cat) => (
                  <SortableCategoryRow
                    key={cat.id}
                    cat={cat}
                    tierCount={state.tiers.filter(t => t.category_id === cat.id).length}
                    playerCount={state.playerTiers.filter(pt => pt.category_id === cat.id).length}
                    onRename={(name) => { renameCategory(cat.id, name); toast('Category renamed'); }}
                    onDelete={() => {
                      if (confirm(`Delete category "${cat.name}" and all its tiers?`)) {
                        deleteCategory(cat.id);
                        toast(`"${cat.name}" deleted`, 'error');
                      }
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Tier Form ─────────────────────────────────────────────────────────
function AddTierForm({ onAdd }: { onAdd: (name: string, color: string) => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6b7280');

  return (
    <div className="glass rounded-xl p-4 mt-2 flex gap-3 items-center">
      <input className="input-dark flex-1" placeholder="New tier name (e.g. HT6)" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex items-center gap-2">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" title="Tier color" />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.4)' }}>{color}</span>
      </div>
      <button
        className="btn-primary"
        onClick={() => { if (name.trim()) { onAdd(name.trim(), color); setName(''); } }}
      >
        + Add Tier
      </button>
    </div>
  );
}

// ── Editable field ────────────────────────────────────────────────────────
function EditableField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  if (editing) {
    return (
      <input
        className="input-dark w-40"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { onSave(val); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { onSave(val); setEditing(false); } }}
        placeholder={label}
        autoFocus
      />
    );
  }
  return (
    <button
      onClick={() => setEditing(true)}
      style={{
        fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
        color: val ? 'rgba(148, 163, 184, 0.7)' : 'rgba(148, 163, 184, 0.25)',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer',
        maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
    >
      {val || `+ ${label}`}
    </button>
  );
}

// ── Sortable Category Row ─────────────────────────────────────────────────
function SortableCategoryRow({ cat, tierCount, playerCount, onRename, onDelete }: {
  cat: { id: string; name: string };
  tierCount: number;
  playerCount: number;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(cat.name);

  return (
    <div ref={setNodeRef} style={style} className="glass rounded-xl flex items-center gap-4 px-5 py-4 mb-2">
      <span {...attributes} {...listeners} className="drag-handle cursor-grab active:cursor-grabbing select-none">⠿</span>
      {editName ? (
        <input
          className="input-dark"
          style={{ width: '160px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem' }}
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          onBlur={() => { onRename(nameVal); setEditName(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { onRename(nameVal); setEditName(false); } }}
          autoFocus
        />
      ) : (
        <button onClick={() => setEditName(true)} style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0', background: 'none', border: 'none', cursor: 'pointer' }}>
          {cat.name}
        </button>
      )}
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.4)' }}>
        {tierCount} tiers · {playerCount} rankings
      </span>
      <div className="ml-auto flex gap-2">
        <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }} onClick={() => setEditName(true)}>
          Rename
        </button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
