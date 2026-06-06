'use client';

import { useState, useTransition } from 'react';
import type { Status } from '@/lib/types';

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
          className="flex-1 py-2.5 text-xs font-medium rounded-lg border transition-all"
          style={{
            border: `1.5px solid ${status === opt.value ? color : '#E8E4DE'}`,
            background: status === opt.value ? color : '#fff',
            color: status === opt.value ? '#fff' : '#6B6560',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
