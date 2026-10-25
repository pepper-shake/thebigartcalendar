'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronsUpDown } from 'lucide-react';

export function FilterSelect({
  value,
  onChange,
  options,
  size = 'md',
}: {
  value: string;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
  size?: 'sm' | 'md';
}) {
  const label = options.find((o) => o.value === value)?.label ?? value;
  const textStyle =
    size === 'sm'
      ? { fontSize: 24, lineHeight: '24px', letterSpacing: '-0.48px' }
      : { fontSize: 32, lineHeight: '32px', letterSpacing: '-0.64px' };

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger className="flex items-center gap-[5px] px-[8px] py-[6px] cursor-pointer outline-none select-none transition-colors hover:bg-ink/5 aria-expanded:bg-ink/5">
        <span
          className="font-light text-ink whitespace-nowrap"
          style={{ fontFamily: 'var(--font-serif)', ...textStyle }}
        >
          {label}
        </span>
        <ChevronsUpDown className="size-5 text-ink shrink-0" strokeWidth={1.25} />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          sideOffset={6}
          align="start"
          alignItemWithTrigger={false}
          className="isolate z-50"
        >
          <SelectPrimitive.Popup className="bg-page p-[8px] min-w-(--anchor-width) outline-none shadow-[0_4px_20px_rgb(56_52_48/0.15)]">
            <SelectPrimitive.List>
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex items-center px-[8px] cursor-pointer outline-none select-none font-light text-[20px] leading-[20px] text-ink h-[44px] whitespace-nowrap data-[selected]:italic data-[highlighted]:bg-ink/5"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
