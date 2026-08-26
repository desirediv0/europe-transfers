"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SearchField } from "@/components/HeroSearchBar";
import { cn } from "@/lib/utils";
import {
  IconMapPin,
  IconCalendar,
  IconUsers,
  IconMinus,
  IconPlus,
  IconChevronDown,
  IconSearch,
  IconCircleCheck,
} from "@tabler/icons-react";

export interface PickerOption {
  id: string;
  label: string;
  sublabel?: string;
}

export function DropdownPickerField({
  label,
  icon = IconMapPin,
  value,
  placeholder,
  options,
  onChange,
  divider = true,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
  placeholder: string;
  options: PickerOption[];
  onChange: (id: string, label: string) => void;
  divider?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((o) => o.id === value || o.label === value);

  const filtered = options.filter((o) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q);
  });

  return (
    <SearchField icon={icon} label={label} divider={divider}>
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
        <PopoverTrigger asChild>
          <button type="button" className="flex w-full items-center justify-between gap-1 text-left mt-0.5 cursor-pointer">
            <span className={cn("truncate text-sm font-bold", selected ? "text-navy" : "text-gray-400 font-medium")}>
              {selected ? selected.label : placeholder}
            </span>
            <IconChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[280px] z-50 bg-white shadow-2xl rounded-2xl border border-gray-100" align="start" side="bottom" sideOffset={8}>
          <div className="max-h-72 overflow-auto">
            <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 py-1 text-xs font-medium focus:outline-none focus:border-gold"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-1.5">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">No results found.</div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { onChange(opt.id, opt.label); setOpen(false); setQuery(""); }}
                    className={cn(
                      "flex w-full items-start rounded-lg px-3 py-2.5 text-xs text-left transition-colors hover:bg-slate-100",
                      (value === opt.id || value === opt.label) && "bg-slate-100 font-bold"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-navy">{opt.label}</span>
                      {opt.sublabel && <span className="text-[10px] text-gray-400">{opt.sublabel}</span>}
                    </div>
                    {(value === opt.id || value === opt.label) && <IconCircleCheck className="ml-auto h-4 w-4 text-gold shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </SearchField>
  );
}

export function DatePickerField({
  label = "Date",
  date,
  onChange,
  divider = true,
  minDate,
}: {
  label?: string;
  date: Date | null;
  onChange: (date: Date) => void;
  divider?: boolean;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const disabledBefore = useMemo(() => minDate || new Date(new Date().setHours(0, 0, 0, 0)), [minDate]);

  return (
    <SearchField icon={IconCalendar} label={label} divider={divider}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="flex w-full items-center justify-between gap-1 text-left mt-0.5 cursor-pointer">
            <span className={cn("truncate text-sm font-bold", date ? "text-navy" : "text-gray-400 font-medium")}>
              {date ? format(date, "EEE, MMM d") : "Select date"}
            </span>
            <IconChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50 bg-white shadow-2xl rounded-2xl border border-gray-100" align="start" side="bottom" sideOffset={8}>
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(d) => { if (d) onChange(d); setOpen(false); }}
            disabled={{ before: disabledBefore }}
          />
        </PopoverContent>
      </Popover>
    </SearchField>
  );
}

export function StepperField({
  label,
  icon = IconUsers,
  value,
  min = 1,
  max = 20,
  unitLabel,
  onChange,
  divider = false,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: number;
  min?: number;
  max?: number;
  unitLabel?: (n: number) => string;
  onChange: (n: number) => void;
  divider?: boolean;
}) {
  return (
    <SearchField icon={icon} label={label} divider={divider}>
      <div className="flex items-center justify-between gap-1 mt-0.5">
        <span className="text-sm font-bold text-navy">
          {value} {unitLabel ? unitLabel(value) : ""}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white disabled:opacity-30 hover:bg-navy/90 transition-colors cursor-pointer"
          >
            <IconMinus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white disabled:opacity-30 hover:bg-navy/90 transition-colors cursor-pointer"
          >
            <IconPlus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </SearchField>
  );
}
