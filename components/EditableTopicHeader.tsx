'use client';

import { useEffect, useRef, useState } from 'react';

type Field = 'title' | 'desc';

function defaultSubtitle(title: string): string {
  const t = title.trim().toLowerCase();
  return `Core concepts and context around ${t}`;
}

interface Props {
  topicId: string;
  initialTitle: string;
  initialDesc: string;
  baseTitle: string;
  baseDesc: string;
  trackColor: string;
}

export default function EditableTopicHeader({
  topicId,
  initialTitle,
  initialDesc,
  baseTitle,
  baseDesc,
  trackColor,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);
  const [editing, setEditing] = useState<Field | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [hover, setHover] = useState<Field | null>(null);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  const isOverridden = title !== baseTitle || desc !== baseDesc;

  useEffect(() => {
    if (editing === 'title' && titleRef.current) focusEnd(titleRef.current);
    if (editing === 'desc' && descRef.current) focusEnd(descRef.current);
  }, [editing]);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 1400);
    return () => clearTimeout(t);
  }, [justSaved]);

  function focusEnd(el: HTMLElement) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  async function commit(field: Field, nextValueRaw: string) {
    const next = nextValueRaw.replace(/\s+/g, ' ').trim();
    const prev = field === 'title' ? title : desc;
    const base = field === 'title' ? baseTitle : baseDesc;
    const effective = next.length === 0 ? base : next;

    setEditing(null);
    if (effective === prev) return; // no-op

    // Optimistic update
    if (field === 'title') setTitle(effective);
    else setDesc(effective);

    setSaving(true);
    try {
      const res = await fetch('/api/topic-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          title: field === 'title' ? effective : title,
          desc: field === 'desc' ? effective : desc,
        }),
      });
      if (!res.ok) throw new Error('save-failed');
      setJustSaved(true);
    } catch {
      // Revert on failure
      if (field === 'title') setTitle(prev);
      else setDesc(prev);
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!isOverridden || saving) return;
    setSaving(true);
    const prevTitle = title;
    const prevDesc = desc;
    setTitle(baseTitle);
    setDesc(baseDesc);
    try {
      const res = await fetch('/api/topic-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, reset: true }),
      });
      if (!res.ok) throw new Error('reset-failed');
      setJustSaved(true);
    } catch {
      setTitle(prevTitle);
      setDesc(prevDesc);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(field: Field, e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      // Restore original text and exit
      const el = e.currentTarget;
      el.innerText = field === 'title' ? title : desc;
      setEditing(null);
      el.blur();
    } else if (e.key === 'Enter' && !e.shiftKey && field === 'title') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    } else if (e.key === 'Enter' && !e.shiftKey && field === 'desc') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
  }

  return (
    <div className="relative">
      {/* Title row */}
      <div
        className="group/title flex items-start gap-2 -mx-1 mb-1.5"
        onMouseEnter={() => setHover('title')}
        onMouseLeave={() => setHover(h => (h === 'title' ? null : h))}
      >
        <h1
          ref={titleRef}
          contentEditable={editing === 'title'}
          suppressContentEditableWarning
          spellCheck={editing === 'title'}
          onClick={() => editing !== 'title' && setEditing('title')}
          onBlur={e => editing === 'title' && commit('title', e.currentTarget.innerText)}
          onKeyDown={e => handleKeyDown('title', e)}
          className={[
            'font-[family-name:var(--font-playfair)] text-[22px] sm:text-[26px] font-bold text-[#1C1C1A] leading-snug px-1 rounded-md outline-none flex-1 min-w-0 transition-all duration-150',
            editing === 'title'
              ? 'bg-white ring-2 cursor-text'
              : 'cursor-text hover:bg-[#F5F2EE]/70',
          ].join(' ')}
          style={editing === 'title' ? { boxShadow: `0 0 0 2px ${trackColor}33` } : undefined}
        >
          {title}
        </h1>
        <EditAffordance
          visible={editing !== 'title'}
          emphasized={hover === 'title'}
          onClick={() => setEditing('title')}
          color={trackColor}
        />
      </div>

      {/* Description row */}
      <div
        className="group/desc flex items-start gap-2 -mx-1 mb-5"
        onMouseEnter={() => setHover('desc')}
        onMouseLeave={() => setHover(h => (h === 'desc' ? null : h))}
      >
        {editing === 'desc' ? (
          <p
            ref={descRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            onBlur={e => commit('desc', e.currentTarget.innerText)}
            onKeyDown={e => handleKeyDown('desc', e)}
            className="text-sm text-[#3A3530] leading-relaxed px-1 rounded-md outline-none flex-1 min-w-0 bg-white ring-2 cursor-text"
            style={{ boxShadow: `0 0 0 2px ${trackColor}33` }}
          >{desc}</p>
        ) : (
          <p
            onClick={() => setEditing('desc')}
            className="text-sm leading-relaxed px-1 rounded-md flex-1 min-w-0 cursor-text hover:bg-[#F5F2EE]/70 transition-all duration-150"
          >
            {desc
              ? <span className="text-[#6B6560]">{desc}</span>
              : <span className="text-[#B5AFA8] italic">{defaultSubtitle(title)}</span>
            }
          </p>
        )}
        <EditAffordance
          visible={editing !== 'desc'}
          emphasized={hover === 'desc'}
          onClick={() => setEditing('desc')}
          color={trackColor}
        />
      </div>

      {/* Status footer — reserved space to prevent layout shift */}
      <div className="flex items-center gap-2 h-4 -mt-4 mb-4 text-[10.5px] select-none">
        {saving && (
          <span className="flex items-center gap-1.5 text-[#9B9590]">
            <span className="w-1 h-1 rounded-full bg-[#9B9590] animate-pulse" />
            Saving…
          </span>
        )}
        {!saving && justSaved && (
          <span className="text-[#6DB07A]">✓ Saved</span>
        )}
        {!saving && !justSaved && isOverridden && (
          <>
            <span className="text-[#9B9590]">Edited</span>
            <span className="text-[#D5CFC8]">·</span>
            <button
              type="button"
              onClick={reset}
              className="text-[#9B9590] hover:text-[#1C1C1A] underline decoration-dotted underline-offset-2 transition-colors"
              title={`Reset to: “${baseTitle}”`}
            >
              Reset to original
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EditAffordance({
  visible,
  emphasized,
  onClick,
  color,
}: {
  visible: boolean;
  emphasized: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      aria-label="Edit"
      title="Edit"
      className={`shrink-0 mt-1.5 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 ${
        visible ? '' : 'opacity-0 -translate-x-1 pointer-events-none'
      }`}
      style={{
        background: emphasized ? `${color}22` : `${color}0F`,
        color,
        opacity: visible ? (emphasized ? 1 : 0.55) : 0,
      }}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  );
}
