'use client';

import { useState } from 'react';

const PALETTE = [
  ['#2D6A4F','#B7E4C7'],['#1B4F72','#AED6F1'],['#6B3FA0','#D7BDE2'],
  ['#B7410E','#FAD7A0'],['#7B68C8','#E8E4FF'],['#1f6f6a','#B4EDE8'],
  ['#9a6a16','#FBF2DD'],['#9d2f2f','#F8E7E3'],
];

interface L1TrackManagerProps {
  tracks: { id: string; label: string; color: string; accent: string; isCustom?: boolean }[];
  section: string;
  onLabelChange: (id: string, label: string, isCustom: boolean) => void;
  onRemove: (id: string, isCustom: boolean) => void;
  onAdd: (label: string, color: string, accent: string) => void;
}

export default function L1TrackManager({
  tracks, section, onLabelChange, onRemove, onAdd,
}: L1TrackManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PALETTE[4][0]);
  const [newAccent, setNewAccent] = useState(PALETTE[4][1]);
  const [saving, setSaving] = useState(false);

  function startEdit(id: string, label: string) {
    setEditingId(id);
    setEditText(label);
  }

  async function saveEdit(id: string, isCustom: boolean) {
    const t = editText.trim();
    if (!t) { setEditingId(null); return; }
    setSaving(true);
    await fetch('/api/l1-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, l1Id: id, label: t }),
    });
    onLabelChange(id, t, isCustom);
    setEditingId(null);
    setSaving(false);
  }

  async function removeTrack(id: string, isCustom: boolean) {
    if (!confirm('Remove this track? Topics inside will be hidden.')) return;
    if (isCustom) {
      await fetch('/api/l1-custom', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
    } else {
      await fetch('/api/l1-meta', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, l1Id: id, hidden: true }),
      });
    }
    onRemove(id, isCustom);
  }

  async function addTrack() {
    const t = newLabel.trim();
    if (!t) return;
    setSaving(true);
    const res = await fetch('/api/l1-custom', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', section, label: t, color: newColor, accent: newAccent, position: tracks.length + 1 }),
    });
    const { track } = await res.json();
    if (track) onAdd(t, newColor, newAccent);
    setNewLabel(''); setAdding(false); setSaving(false);
  }

  return (
    <div className="space-y-1 mb-4">
      {tracks.map(tr => (
        <div key={tr.id} className="group flex items-center gap-2 px-3 py-2 bg-white border border-[#E8E4DE] rounded-lg">
          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: tr.color }} />
          {editingId === tr.id ? (
            <input
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveEdit(tr.id, !!tr.isCustom);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onBlur={() => saveEdit(tr.id, !!tr.isCustom)}
              disabled={saving}
              className="flex-1 text-[13px] font-semibold text-[#1C1C1A] bg-transparent border-b border-[#9B9590] outline-none"
            />
          ) : (
            <span className="flex-1 text-[13px] font-semibold text-[#1C1C1A] truncate">{tr.label}</span>
          )}
          <button
            type="button"
            onClick={() => startEdit(tr.id, tr.label)}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-[11px] text-[#9B9590] hover:text-[#1C1C1A] transition-opacity shrink-0"
            title="Rename"
          >✎</button>
          <button
            type="button"
            onClick={() => removeTrack(tr.id, !!tr.isCustom)}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-[11px] text-[#9B9590] hover:text-red-500 transition-opacity shrink-0"
            title="Remove"
          >✕</button>
        </div>
      ))}

      {adding ? (
        <div className="border border-[#E8E4DE] rounded-lg p-3 bg-white space-y-2">
          <input
            autoFocus
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTrack()}
            placeholder="Track name…"
            className="w-full text-[13px] text-[#1C1C1A] bg-[#FAF8F5] border border-[#D8D3CC] rounded-md px-3 py-1.5 focus:outline-none focus:border-[#9B9590]"
          />
          <div className="flex flex-wrap gap-1.5">
            {PALETTE.map(([c, a]) => (
              <button key={c} type="button" onClick={() => { setNewColor(c); setNewAccent(a); }}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${newColor === c ? 'scale-110 border-[#1C1C1A]' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addTrack} disabled={!newLabel.trim() || saving}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white bg-[#1C1C1A] hover:bg-black disabled:opacity-40 transition-colors">
              Add
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="text-[11px] text-[#9B9590] hover:text-[#4A4540] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)}
          className="w-full text-[12px] text-[#9B9590] hover:text-[#4A4540] border border-dashed border-[#D8D3CC] hover:border-[#9B9590] rounded-lg py-2 transition-colors">
          + Add track
        </button>
      )}
    </div>
  );
}
