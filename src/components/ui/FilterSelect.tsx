'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronsUpDown } from 'lucide-react';

export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const label = options.find((o) => o.value === value)?.label ?? value;

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger className="flex items-center gap-[5px] px-[8px] py-[6px] rounded-[8px] cursor-pointer outline-none select-none transition-colors hover:bg-[#ecebe4] aria-expanded:bg-[#ecebe4]">
        <span
          className="font-extrabold text-[32px] leading-[32px] tracking-[-0.64px] text-black whitespace-nowrap"
          style={{ fontFamily: 'var(--font-host-grotesk)' }}
        >
          {label}
        </span>
        <ChevronsUpDown className="size-6 text-black shrink-0" strokeWidth={2} />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          sideOffset={6}
          align="start"
          alignItemWithTrigger={false}
          className="isolate z-50"
        >
          <SelectPrimitive.Popup className="bg-[#ecebe4] rounded-[12px] p-[8px] min-w-[140px] outline-none">
            <SelectPrimitive.List>
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex items-center px-[8px] rounded-[8px] cursor-pointer outline-none select-none font-medium text-[18px] leading-[18px] tracking-[-0.36px] text-black h-[44px] data-[selected]:bg-[#fbfaf6] data-[highlighted]:bg-black/5"
                  style={{ fontFamily: 'var(--font-host-grotesk)' }}
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
