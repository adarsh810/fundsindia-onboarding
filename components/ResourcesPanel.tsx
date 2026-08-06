'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import type { Resource, Status, GeneratedResource, ResourceBatch } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManagedResource {
  label: string;
  url?: string;
}

interface Summary {
  resource_url: string;
  resource_label: string;
  bullets: string[];
  generated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = {
  video: '▶', article: '✦', doc: '◈', book: '◉', tool: '⚙',
};

function isYouTubeChannel(url: string): boolean {
  return /youtube\.com\/@|youtube\.com\/channel\/|youtube\.com\/user\/|youtube\.com\/playlist/.test(url);
}

function canSummarise(r: ManagedResource): boolean {
  return !!r.url && !isYouTubeChannel(r.url);
}

// ─── Drag handle icon ─────────────────────────────────────────────────────────

function DragHandle(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="shrink-0 flex flex-col gap-[3px] px-0.5 py-1 cursor-grab active:cursor-grabbing touch-none opacity-30 hover:opacity-70 transition-opacity"
      title="Drag to reorder or move"
    >
      {[0, 1].map(i => (
        <span key={i} className="flex gap-[3px]">
          {[0, 1].map(j => (
            <span key={j} className="w-[3px] h-[3px] rounded-full bg-[#9B9590]" />
          ))}
        </span>
      ))}
    </button>
  );
}

// ─── Droppable section wrapper ────────────────────────────────────────────────

function DroppableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 min-h-[32px] rounded-xl transition-colors ${isOver ? 'bg-[#F0EDE8]' : ''}`}
    >
      {children}
    </div>
  );
}

// ─── Sortable resource row ────────────────────────────────────────────────────

function SortableRow({
  resource,
  section,
  trackColor,
  summary,
  isOpen,
  isDone,
  isGenerating,
  isToggling,
  err,
  editing,
  editText,
  saving,
  renamingLabel,
  renameText,
  onToggleOpen,
  onToggleDone,
  onSummarise,
  onAddNotes,
  onRemove,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onRegenerate,
  onRenameStart,
  onRenameChange,
  onRenameSave,
  onRenameCancel,
}: {
  resource: ManagedResource;
  section: 'primary' | 'additional';
  trackColor: string;
  summary?: Summary;
  isOpen: boolean;
  isDone: boolean;
  isGenerating: boolean;
  isToggling: boolean;
  err?: string;
  editing: boolean;
  editText: string;
  saving: boolean;
  renamingLabel: boolean;
  renameText: string;
  onToggleOpen: () => void;
  onToggleDone: () => void;
  onSummarise: () => void;
  onAddNotes: () => void;
  onRemove: () => void;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRegenerate: () => void;
  onRenameStart: () => void;
  onRenameChange: (v: string) => void;
  onRenameSave: () => void;
  onRenameCancel: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: resource.label,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const summarisable = canSummarise(resource);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-xl overflow-hidden bg-white transition-colors ${isDone && section === 'primary' ? 'border-[#D1EDDA]' : 'border-[#EEE9E2]'}`}
    >
      {/* Row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <DragHandle {...attributes} {...listeners} />

        {/* Done checkbox — primary only */}
        {section === 'primary' && (
          <button
            onClick={onToggleDone}
            disabled={isToggling}
            className="shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all hover:brightness-90"
            style={{ borderColor: isDone ? '#2D6A4F' : '#C8C2BA', background: isDone ? '#2D6A4F' : 'transparent' }}
          >
            {isDone && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        {/* Label — inline rename */}
        {renamingLabel ? (
          <input
            autoFocus
            value={renameText}
            onChange={e => onRenameChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); onRenameSave(); }
              if (e.key === 'Escape') onRenameCancel();
            }}
            onBlur={onRenameSave}
            className="text-[12px] flex-1 min-w-0 bg-transparent border-b border-[#9B9590] focus:outline-none text-[#1C1C1A] truncate"
          />
        ) : (
          <div className="flex items-center gap-1 flex-1 min-w-0 group/label overflow-hidden">
            {resource.url ? (
              <a
                href={resource.url} target="_blank" rel="noopener noreferrer"
                className={`text-[12px] min-w-0 truncate hover:underline underline-offset-2 transition-colors ${isDone && section === 'primary' ? 'line-through opacity-60' : ''}`}
                style={{ color: trackColor }}
              >
                {resource.label}
              </a>
            ) : (
              <span className={`text-[12px] min-w-0 truncate text-[#4A4540] ${isDone && section === 'primary' ? 'line-through opacity-60' : ''}`}>
                {resource.label}
              </span>
            )}
            <button
              type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onRenameStart(); }}
              className="shrink-0 opacity-0 group-hover/label:opacity-50 hover:!opacity-100 text-[10px] text-[#9B9590] hover:text-[#4A4540] transition-opacity leading-none"
              title="Rename"
            >
              ✎
            </button>
          </div>
        )}

        {/* Summarise / Notes button */}
        {!summarisable ? (
          <span className="shrink-0 text-[10px] text-[#C8C2BA] italic">n/a</span>
        ) : isGenerating ? (
          <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-medium" style={{ color: trackColor }}>
            <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${trackColor} transparent transparent transparent` }} />
            Reading…
          </span>
        ) : summary ? (
          <button
            onClick={onToggleOpen}
            className="shrink-0 flex items-center gap-1 text-[10px] font-semibold transition-all hover:opacity-80"
            style={{ color: trackColor }}
          >
            {isOpen ? '▲ Hide' : '▼ Notes'}
            <span className="text-[10px] bg-[#D1EDDA] text-[#1B5E2A] px-1.5 py-0.5 rounded-full ml-1">
              {summary.bullets.length}
            </span>
          </button>
        ) : (
          <div className="shrink-0 flex items-center gap-1.5">
            <button
              onClick={onSummarise}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all hover:brightness-95"
              style={{ borderColor: trackColor, color: trackColor }}
              title="AI-generate a summary"
            >
              ✦ AI
            </button>
            <button
              onClick={onAddNotes}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#D5CFC8] text-[#9B9590] hover:border-[#9B9590] hover:text-[#4A4540] transition-colors"
              title="Write your own notes"
            >
              ✎ Notes
            </button>
          </div>
        )}

        {/* Remove */}
        <button
          onClick={onRemove}
          className="shrink-0 text-[10px] text-[#C8C2BA] hover:text-red-400 transition-colors ml-1"
          title="Remove resource"
        >
          ✕
        </button>
      </div>

      {/* Error */}
      {err && (
        <div className="px-4 pb-2.5 flex items-center justify-between gap-2">
          <p className="text-[11px] text-red-500">{err}</p>
          <button onClick={onSummarise} className="text-[10px] text-red-400 hover:text-red-600 underline shrink-0">Retry</button>
        </div>
      )}

      {/* Notes edit panel */}
      {editing && (
        <NotesEditor
          value={editText}
          onChange={onEditChange}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          saving={saving}
          trackColor={trackColor}
        />
      )}

      {/* Notes view panel */}
      {summary && isOpen && !editing && (
        <div className="border-t border-[#EEE9E2] px-4 py-3 bg-[#FAF8F5]">
          <ul className="space-y-2">
            {summary.bullets.map((b, bi) => {
              const lines = b.split('\n');
              return (
                <li key={bi} className="flex items-start gap-2.5 text-[12px] text-[#3A3530] leading-snug">
                  <span className="shrink-0 mt-0.5 text-[10px] font-bold" style={{ color: trackColor }}>{bi + 1}.</span>
                  <div className="flex-1 min-w-0">
                    {lines.map((line, li) =>
                      /^\s*[-•]\s/.test(line) ? (
                        <div key={li} className="flex items-start gap-1.5 mt-1 ml-1">
                          <span className="shrink-0 text-[9px] mt-0.5 font-bold" style={{ color: trackColor }}>–</span>
                          <div className="flex-1 min-w-0"><RichLine text={line.replace(/^\s*[-•]\s+/, '')} /></div>
                        </div>
                      ) : (
                        <div key={li}><RichLine text={line} /></div>
                      )
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EEE9E2]">
            <p className="text-[10px] text-[#C8C2BA]">
              {new Date(summary.generated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={onStartEdit} className="text-[10px] text-[#9B9590] hover:text-[#4A4540] transition-colors">Edit</button>
              <button onClick={onRegenerate} className="text-[10px] text-[#9B9590] hover:text-[#4A4540] transition-colors">Re-generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RichLine — renders a line that may contain ![alt](url) image tokens ─────

function RichLine({ text }: { text: string }) {
  // Split the line into text and image segments.
  const IMG_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = IMG_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    const [, alt, url] = m;
    parts.push(
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={key++}
        src={url}
        alt={alt || 'image'}
        className="max-w-full rounded-lg border border-[#E8E4DE] mt-2 mb-1 block"
        style={{ maxHeight: 360 }}
        loading="lazy"
      />,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  if (parts.length === 0) return <span>{text}</span>;
  return <>{parts}</>;
}

// ─── NotesEditor — textarea with paste-to-upload and file picker ──────────────

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload-image', { method: 'POST', body: form });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error ?? 'Upload failed');
  }
  const { url } = await res.json();
  return url as string;
}

function NotesEditor({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  trackColor,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  trackColor: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function insertImage(file: File) {
    setUploading(true);
    setUploadErr('');
    try {
      const url = await uploadImage(file);
      const el = textareaRef.current;
      if (!el) return;
      const pos = el.selectionStart;
      const tag = `![${file.name.replace(/\.[^.]+$/, '')}](${url})`;
      const next = value.slice(0, pos) + tag + value.slice(pos);
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = pos + tag.length;
        el.focus();
      });
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items);
    const imgItem = items.find(i => i.type.startsWith('image/'));
    if (!imgItem) return;
    e.preventDefault();
    const file = imgItem.getAsFile();
    if (file) void insertImage(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void insertImage(file);
    e.target.value = '';
  }

  return (
    <div className="border-t border-[#EEE9E2] px-4 py-3 bg-[#FAF8F5]">
      <div className="relative">
        <textarea
          ref={textareaRef}
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={e => {
            const el = e.currentTarget;
            const pos = el.selectionStart;
            if (e.key === 'Tab') {
              e.preventDefault();
              const next = value.slice(0, pos) + '  ' + value.slice(el.selectionEnd);
              onChange(next);
              requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = pos + 2; });
              return;
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              const before = value.slice(0, pos);
              const currentLine = before.split('\n').pop() ?? '';
              const m = currentLine.match(/^(\d+)\.\s+\S/);
              if (m) {
                e.preventDefault();
                const insert = '\n' + (parseInt(m[1]) + 1) + '. ';
                onChange(value.slice(0, pos) + insert + value.slice(el.selectionEnd));
                requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = pos + insert.length; });
              }
            }
          }}
          className="w-full text-[12px] text-[#3A3530] leading-relaxed bg-white border border-[#D8D3CC] rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-[#9B9590] transition-colors"
          rows={Math.max(5, value.split('\n').length + 1)}
          placeholder="1. First note&#10;2. Second note&#10;   - sub-point&#10;&#10;Paste a screenshot or click 📎 to attach an image"
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
            <span className="text-[11px] text-[#6B6560] flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${trackColor} transparent transparent transparent` }} />
              Uploading image…
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <p className="text-[10px] text-[#C8C2BA] flex-1">Paste screenshot · Tab → sub-point · Enter → next bullet</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-[10px] text-[#9B9590] hover:text-[#4A4540] border border-[#D8D3CC] hover:border-[#9B9590] px-2 py-1 rounded-md transition-colors disabled:opacity-40"
          title="Attach image from file"
        >
          📎 Attach image
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {uploadErr && <p className="text-[10px] text-red-500 mt-1">{uploadErr}</p>}

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onSave}
          disabled={saving || uploading}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:brightness-90 disabled:opacity-50"
          style={{ background: trackColor }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="text-[11px] text-[#9B9590] hover:text-[#4A4540] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResourcesPanel({
  topicId,
  defaultResources,
  trackColor,
  currentStatus,
}: {
  topicId: string;
  defaultResources: Resource[];
  trackColor: string;
  currentStatus: Status;
}) {
  const [primary, setPrimary] = useState<ManagedResource[]>([]);
  const [additional, setAdditional] = useState<ManagedResource[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Summary state
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [summaryErrors, setSummaryErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  // Label rename state
  const [renamingLabel, setRenamingLabel] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  // Done state
  const [resourceDone, setResourceDone] = useState<Record<string, boolean>>({});
  const [togglingDone, setTogglingDone] = useState<string | null>(null);

  // Add resource
  const [addingPrimary, setAddingPrimary] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Generate more
  const [generatingMore, setGeneratingMore] = useState(false);
  const [genError, setGenError] = useState('');

  // DnD
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Load ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      fetch(`/api/resource-config?topicId=${topicId}`).then(r => r.json()),
      fetch(`/api/summarise?topicId=${topicId}`).then(r => r.json()),
      fetch(`/api/resource-progress?topicId=${topicId}`).then(r => r.json()),
    ]).then(async ([cfgData, summaryData, progressData]) => {
      // Summaries
      const smap: Record<string, Summary> = {};
      for (const s of summaryData.summaries ?? []) smap[s.resource_url] = s;
      setSummaries(smap);
      setResourceDone(progressData.progress ?? {});

      if (cfgData.config) {
        setPrimary(cfgData.config.primary_resources ?? []);
        setAdditional(cfgData.config.additional_resources ?? []);
      } else {
        // First visit — build defaults from hardcoded + generated resources
        const genData = await fetch(`/api/resources?topicId=${topicId}`).then(r => r.json());
        const flat: ManagedResource[] = (genData.batches ?? [])
          .flatMap((b: ResourceBatch) => (b.resources as GeneratedResource[]).map(r => ({ label: r.label, url: r.url })));
        setPrimary(defaultResources);
        setAdditional(flat);
      }
      setLoaded(true);
    });
  }, [topicId]);

  // ── Persist config ─────────────────────────────────────────────────────────

  const saveConfig = useCallback((p: ManagedResource[], a: ManagedResource[]) => {
    fetch('/api/resource-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, primary: p, additional: a }),
    });
  }, [topicId]);

  // ── DnD handlers ──────────────────────────────────────────────────────────

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const aId = String(active.id);
    const oId = String(over.id);
    if (aId === oId) return;

    const fromP = primary.findIndex(r => r.label === aId);
    const fromA = additional.findIndex(r => r.label === aId);

    const toP = oId === 'primary-drop' || primary.some(r => r.label === oId);
    const toA = oId === 'additional-drop' || additional.some(r => r.label === oId);

    let newP = [...primary];
    let newA = [...additional];

    if (fromP !== -1) {
      if (toA) {
        const item = primary[fromP];
        newP = primary.filter((_, i) => i !== fromP);
        const at = additional.findIndex(r => r.label === oId);
        newA = at >= 0 ? [...additional.slice(0, at), item, ...additional.slice(at)] : [...additional, item];
      } else if (toP) {
        const toIdx = primary.findIndex(r => r.label === oId);
        newP = arrayMove(primary, fromP, toIdx >= 0 ? toIdx : primary.length - 1);
      }
    } else if (fromA !== -1) {
      if (toP) {
        const item = additional[fromA];
        newA = additional.filter((_, i) => i !== fromA);
        const at = primary.findIndex(r => r.label === oId);
        newP = at >= 0 ? [...primary.slice(0, at), item, ...primary.slice(at)] : [...primary, item];
      } else if (toA) {
        const toIdx = additional.findIndex(r => r.label === oId);
        newA = arrayMove(additional, fromA, toIdx >= 0 ? toIdx : additional.length - 1);
      }
    }

    setPrimary(newP);
    setAdditional(newA);
    saveConfig(newP, newA);
  }

  // ── Label rename ───────────────────────────────────────────────────────────

  function startRename(label: string) {
    setRenamingLabel(label);
    setRenameText(label);
  }

  function saveRename() {
    const oldLabel = renamingLabel;
    const newLabel = renameText.trim();
    setRenamingLabel(null);
    if (!oldLabel || !newLabel || newLabel === oldLabel) return;

    const rename = (list: ManagedResource[]) =>
      list.map(r => r.label === oldLabel ? { ...r, label: newLabel } : r);

    const newP = rename(primary);
    const newA = rename(additional);
    setPrimary(newP);
    setAdditional(newA);

    // Migrate resourceDone key
    if (resourceDone[oldLabel] !== undefined) {
      setResourceDone(prev => {
        const next = { ...prev };
        next[newLabel] = next[oldLabel];
        delete next[oldLabel];
        return next;
      });
    }

    saveConfig(newP, newA);
  }

  function cancelRename() {
    setRenamingLabel(null);
    setRenameText('');
  }

  // ── Remove ─────────────────────────────────────────────────────────────────

  function remove(label: string, section: 'primary' | 'additional') {
    const newP = section === 'primary' ? primary.filter(r => r.label !== label) : primary;
    const newA = section === 'additional' ? additional.filter(r => r.label !== label) : additional;
    setPrimary(newP);
    setAdditional(newA);
    saveConfig(newP, newA);
  }

  // ── Add resource ──────────────────────────────────────────────────────────

  function confirmAddPrimary() {
    const label = newLabel.trim();
    if (!label) return;
    const url = newUrl.trim() || undefined;
    const newP = [...primary, { label, url }];
    setPrimary(newP);
    saveConfig(newP, additional);
    setNewLabel('');
    setNewUrl('');
    setAddingPrimary(false);
  }

  // ── Summarise ──────────────────────────────────────────────────────────────

  async function summarise(r: ManagedResource) {
    if (!r.url) return;
    setGenerating(r.url);
    setSummaryErrors(prev => { const n = { ...prev }; delete n[r.url!]; return n; });
    try {
      const res = await fetch('/api/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, resourceUrl: r.url, resourceLabel: r.label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setSummaries(prev => ({ ...prev, [r.url!]: data.summary }));
    } catch (e: unknown) {
      setSummaryErrors(prev => ({ ...prev, [r.url!]: e instanceof Error ? e.message : 'Error' }));
    } finally {
      setGenerating(null);
    }
  }

  function openFreshNotes(r: ManagedResource) {
    if (!r.url) return;
    setEditing(r.url);
    setEditText('');
    setOpen(prev => ({ ...prev, [r.url!]: true }));
  }

  async function saveEdit(url: string, label: string) {
    setSaving(true);
    const bullets: string[] = [];
    let current: string[] = [];
    for (const line of editText.split('\n')) {
      const m = line.match(/^\d+\.\s+([\s\S]*)/);
      if (m) {
        if (current.length) bullets.push(current.join('\n').trim());
        current = [m[1]];
      } else if (current.length) {
        current.push(line);
      }
    }
    if (current.length) bullets.push(current.join('\n').trim());
    const filtered = bullets.filter(Boolean);
    try {
      const res = await fetch('/api/summarise', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, resourceUrl: url, resourceLabel: label, bullets: filtered }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setSummaries(prev => ({ ...prev, [url]: data.summary }));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  // ── Done toggle ────────────────────────────────────────────────────────────

  async function toggleDone(r: ManagedResource) {
    const newDone = !resourceDone[r.label];
    setTogglingDone(r.label);
    setResourceDone(prev => ({ ...prev, [r.label]: newDone }));
    try {
      const res = await fetch('/api/resource-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          resourceLabel: r.label,
          done: newDone,
          totalResources: primary.length,
          currentTopicStatus: currentStatus,
        }),
      });
      const data = await res.json();
      if (data.newStatus) {
        window.dispatchEvent(new CustomEvent('topic-status-changed', { detail: { topicId, status: data.newStatus } }));
      }
    } finally {
      setTogglingDone(null);
    }
  }

  // ── Generate more ──────────────────────────────────────────────────────────

  async function generateMore() {
    setGeneratingMore(true);
    setGenError('');
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      if (data.batch) {
        const newItems: ManagedResource[] = (data.batch.resources as GeneratedResource[]).map(r => ({ label: r.label, url: r.url }));
        const newA = [...additional, ...newItems];
        setAdditional(newA);
        saveConfig(primary, newA);
      }
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setGeneratingMore(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!loaded) return null;

  const primaryDone = primary.filter(r => resourceDone[r.label]).length;
  const summarised = [...primary, ...additional].filter(r => r.url && summaries[r.url]).length;
  const total = [...primary, ...additional].filter(r => r.url && canSummarise(r)).length;
  const activeResource = activeId ? [...primary, ...additional].find(r => r.label === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590]">
              📚 Resources ({primary.length + additional.length})
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {primaryDone > 0 && <p className="text-[11px] text-[#9B9590]">{primaryDone}/{primary.length} done</p>}
              {summarised > 0 && <p className="text-[11px] text-[#9B9590]">{summarised}/{total} summarised</p>}
            </div>
          </div>
        </div>

        {/* Primary section */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C8C2BA] mb-2">Core reading</p>
          <SortableContext items={primary.map(r => r.label)} strategy={verticalListSortingStrategy}>
            <DroppableSection id="primary-drop">
              {primary.length === 0 ? (
                <p className="text-[11px] text-[#C8C2BA] text-center py-3">Drop resources here</p>
              ) : primary.map(r => (
                <SortableRow
                  key={r.label}
                  resource={r}
                  section="primary"
                  trackColor={trackColor}
                  summary={r.url ? summaries[r.url] : undefined}
                  isOpen={r.url ? (open[r.url] ?? false) : false}
                  isDone={resourceDone[r.label] ?? false}
                  isGenerating={r.url ? generating === r.url : false}
                  isToggling={togglingDone === r.label}
                  err={r.url ? summaryErrors[r.url] : undefined}
                  editing={editing === r.url}
                  editText={editText}
                  saving={saving}
                  renamingLabel={renamingLabel === r.label}
                  renameText={renameText}
                  onToggleOpen={() => r.url && setOpen(prev => ({ ...prev, [r.url!]: !prev[r.url!] }))}
                  onToggleDone={() => toggleDone(r)}
                  onSummarise={() => summarise(r)}
                  onAddNotes={() => openFreshNotes(r)}
                  onRemove={() => remove(r.label, 'primary')}
                  onStartEdit={() => { if (r.url && summaries[r.url]) { setEditing(r.url); setEditText(summaries[r.url].bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')); } }}
                  onEditChange={setEditText}
                  onSaveEdit={() => r.url && saveEdit(r.url, r.label)}
                  onCancelEdit={() => setEditing(null)}
                  onRegenerate={() => summarise(r)}
                  onRenameStart={() => startRename(r.label)}
                  onRenameChange={setRenameText}
                  onRenameSave={saveRename}
                  onRenameCancel={cancelRename}
                />
              ))}
            </DroppableSection>
          </SortableContext>

          {/* Add resource form / button */}
          {addingPrimary ? (
            <div className="mt-2 border border-[#E8E4DE] rounded-xl px-3 py-3 bg-[#FAF8F5] space-y-2">
              <input
                autoFocus
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Name (e.g. Andrej Karpathy — Intro to LLMs)"
                className="w-full text-[12px] text-[#3A3530] bg-white border border-[#D8D3CC] rounded-lg px-3 py-2 focus:outline-none focus:border-[#9B9590] transition-colors"
                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.nextElementSibling && (e.currentTarget.nextElementSibling as HTMLElement).focus(); }}
              />
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="URL (optional — YouTube, article, doc, …)"
                className="w-full text-[12px] text-[#3A3530] bg-white border border-[#D8D3CC] rounded-lg px-3 py-2 focus:outline-none focus:border-[#9B9590] transition-colors"
                onKeyDown={e => { if (e.key === 'Enter') confirmAddPrimary(); }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={confirmAddPrimary}
                  disabled={!newLabel.trim()}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:brightness-90 disabled:opacity-40"
                  style={{ background: trackColor }}
                >
                  Add
                </button>
                <button
                  onClick={() => { setAddingPrimary(false); setNewLabel(''); setNewUrl(''); }}
                  className="text-[11px] text-[#9B9590] hover:text-[#4A4540] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingPrimary(true)}
              className="mt-2 w-full text-[11px] text-[#9B9590] hover:text-[#4A4540] border border-dashed border-[#D8D3CC] hover:border-[#9B9590] rounded-xl py-2 transition-colors"
            >
              + Add resource
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#EEE9E2] mb-4" />

        {/* Additional section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C8C2BA]">✦ Additional reading</p>
            <button
              onClick={generateMore}
              disabled={generatingMore}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all disabled:opacity-50"
              style={{ borderColor: trackColor, color: trackColor }}
            >
              {generatingMore ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: `${trackColor} transparent transparent transparent` }} />
                  Generating…
                </>
              ) : '+ Generate more'}
            </button>
          </div>
          {genError && <p className="text-[11px] text-red-500 mb-2">{genError}</p>}
          <SortableContext items={additional.map(r => r.label)} strategy={verticalListSortingStrategy}>
            <DroppableSection id="additional-drop">
              {additional.length === 0 ? (
                <p className="text-[11px] text-[#C8C2BA] text-center py-3">No additional resources yet — generate some or drag core resources here</p>
              ) : additional.map(r => (
                <SortableRow
                  key={r.label}
                  resource={r}
                  section="additional"
                  trackColor={trackColor}
                  summary={r.url ? summaries[r.url] : undefined}
                  isOpen={r.url ? (open[r.url] ?? false) : false}
                  isDone={false}
                  isGenerating={r.url ? generating === r.url : false}
                  isToggling={false}
                  err={r.url ? summaryErrors[r.url] : undefined}
                  editing={editing === r.url}
                  editText={editText}
                  saving={saving}
                  renamingLabel={renamingLabel === r.label}
                  renameText={renameText}
                  onToggleOpen={() => r.url && setOpen(prev => ({ ...prev, [r.url!]: !prev[r.url!] }))}
                  onToggleDone={() => {}}
                  onSummarise={() => summarise(r)}
                  onAddNotes={() => openFreshNotes(r)}
                  onRemove={() => remove(r.label, 'additional')}
                  onStartEdit={() => { if (r.url && summaries[r.url]) { setEditing(r.url); setEditText(summaries[r.url].bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')); } }}
                  onEditChange={setEditText}
                  onSaveEdit={() => r.url && saveEdit(r.url, r.label)}
                  onCancelEdit={() => setEditing(null)}
                  onRegenerate={() => summarise(r)}
                  onRenameStart={() => startRename(r.label)}
                  onRenameChange={setRenameText}
                  onRenameSave={saveRename}
                  onRenameCancel={cancelRename}
                />
              ))}
            </DroppableSection>
          </SortableContext>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeResource && (
          <div className="border border-[#EEE9E2] rounded-xl bg-white px-3 py-2.5 flex items-center gap-2 shadow-lg opacity-90">
            <DragHandle />
            <span className="text-[12px] text-[#4A4540] truncate max-w-[220px]">{activeResource.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
