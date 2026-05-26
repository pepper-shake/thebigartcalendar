import { EventType } from '@/types';

export const eventTypeColors: Record<
  EventType,
  { bg: string; text: string; dot: string; label: string }
> = {
  gallery:     { bg: 'bg-blue-50',    text: 'text-blue-600',   dot: 'bg-blue-500',    label: 'Gallery' },
  performance: { bg: 'bg-violet-50',  text: 'text-violet-600', dot: 'bg-violet-500',  label: 'Performance' },
  fair:        { bg: 'bg-amber-50',   text: 'text-amber-600',  dot: 'bg-amber-500',   label: 'Art Fair' },
  auction:     { bg: 'bg-rose-50',    text: 'text-rose-600',   dot: 'bg-rose-500',    label: 'Auction' },
  workshop:    { bg: 'bg-emerald-50', text: 'text-emerald-600',dot: 'bg-emerald-500', label: 'Workshop' },
};

interface Props {
  type: EventType;
  size?: 'sm' | 'md';
}

export function EventTypeBadge({ type, size = 'sm' }: Props) {
  const c = eventTypeColors[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${c.bg} ${c.text} ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
