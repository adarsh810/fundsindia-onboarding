'use client';

import { useState, useTransition, useEffect } from 'react';
import type { Status } from '@/lib/types';
import { SHADOW_SUBTLE } from '@/lib/elevation';

const OPTIONS: { value: Status; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done',        label: '✓ Done' },
];

interface Props {
  topicId: string;
  initial: Status;
  color: string;
}

export default function StatusToggle({ topicId, initial, color }: Props) {
  const [status, setStatus] = useState<Status>(initial);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onStatusChanged(e: Event) {
      const detail = (e as CustomEvent<{ topicId: string; status: Status }>).detail;
      if (detail.topicId === topicId) setStatus(detail.status);
    }
    window.addEventListener('topic-status-changed', onStatusChanged);
    return () => window.removeEventListener('topic-status-changed', onStatusChanged);
  }, [topicId]);

  async function update(s: Status) {
    setStatus(s);
    startTransition(async () => {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, status: s }),
      });
    });
  }

  return (
    <div className={`flex gap-2 ${pending ? 'opacity-70' : ''}`}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => update(opt.value)}
          className="flex-1 py-2.5 text-xs font-medium rounded-lg border transition-all active:scale-[0.97]"
          style={status === opt.value ? {
            border: `1.5px solid ${color}`,
            background: color,
            color: '#fff',
            boxShadow: `${SHADOW_SUBTLE}, 0 2px 8px ${color}28`,
          } : {
            border: '1.5px solid #E8E4DE',
            background: '#fff',
            color: '#6B6560',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
