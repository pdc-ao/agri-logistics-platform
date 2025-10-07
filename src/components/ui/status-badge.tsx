import React from 'react';
import clsx from 'clsx';

type Kind =
  | 'production'
  | 'schedule'
  | 'booking'
  | 'escrow'
  | 'document'
  | 'preorder'
  | 'generic';

interface Props {
  status: string;
  kind?: Kind;
  className?: string;
}

const colorMaps: Record<Kind, Record<string, string>> = {
  production: {
    PLANNED: 'bg-neutral-200 text-neutral-800',
    IN_PREPARATION: 'bg-amber-200 text-amber-800',
    PLANTED: 'bg-blue-200 text-blue-800',
    GROWING: 'bg-indigo-200 text-indigo-800',
    READY_TO_HARVEST: 'bg-green-200 text-green-800',
    HARVESTING: 'bg-green-300 text-green-900',
    HARVESTED: 'bg-emerald-300 text-emerald-900',
    CANCELLED: 'bg-rose-200 text-rose-800'
  },
  schedule: {
    PENDING: 'bg-neutral-200 text-neutral-700',
    IN_PROGRESS: 'bg-blue-200 text-blue-800',
    COMPLETED: 'bg-green-200 text-green-800',
    DELAYED: 'bg-amber-300 text-amber-900',
    SKIPPED: 'bg-neutral-300 text-neutral-800'
  },
  booking: {
    PENDING: 'bg-neutral-200 text-neutral-800',
    CONFIRMED: 'bg-blue-200 text-blue-800',
    IN_PROGRESS: 'bg-indigo-200 text-indigo-800',
    COMPLETED: 'bg-green-200 text-green-800',
    CANCELLED: 'bg-rose-200 text-rose-800'
  },
  escrow: {
    HELD: 'bg-amber-200 text-amber-900',
    RELEASED: 'bg-green-200 text-green-800',
    CANCELLED: 'bg-rose-200 text-rose-800'
  },
  document: {
    PENDING_REVIEW: 'bg-amber-200 text-amber-900',
    APPROVED: 'bg-green-200 text-green-800',
    REJECTED: 'bg-rose-200 text-rose-800'
  },
  preorder: {
    PENDING: 'bg-neutral-200 text-neutral-800',
    CONFIRMED: 'bg-blue-200 text-blue-800',
    COMPLETED: 'bg-green-200 text-green-800',
    CANCELLED: 'bg-rose-200 text-rose-800'
  },
  generic: {}
};

export function StatusBadge({ status, kind = 'generic', className }: Props) {
  const upper = status?.toUpperCase?.() || status;
  const map = colorMaps[kind];
  const color = map[upper] || 'bg-neutral-200 text-neutral-800';
  return (
    <span
      className={clsx(
        'inline-block rounded px-2 py-0.5 text-xs font-medium tracking-wide',
        color,
        className
      )}
    >
      {upper}
    </span>
  );
}