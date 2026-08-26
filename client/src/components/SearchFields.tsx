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
          <button type="button" className="flex w-full items-center text-left cursor-pointer outline-none border-0 bg-transparent p-0">
            <span className={cn("truncate text-sm", selected ? "text-navy font-semibold" : "text-gray-400 font-normal")}>
              {selected ? selected.label : placeholder}
            </span>
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
          <button type="button" className="flex w-full items-center text-left cursor-pointer outline-none border-0 bg-transparent p-0">
            <span className={cn("truncate text-sm", date ? "text-navy font-semibold" : "text-gray-400 font-normal")}>
              {date ? format(date, "EEE, MMM d") : "Select date"}
            </span>
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

const TIME_OPTIONS: string[] = (() => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hr = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      const min = m.toString().padStart(2, "0");
      times.push(`${hr}:${min} ${ampm}`);
    }
  }
  return times;
})();

export function DateTimePickerField({
  label = "Pickup date",
  date,
  time,
  onDateChange,
  onTimeChange,
  divider = true,
  minDate,
}: {
  label?: string;
  date: Date | null;
  time: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  divider?: boolean;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const disabledBefore = useMemo(() => minDate || new Date(new Date().setHours(0, 0, 0, 0)), [minDate]);

  return (
    <SearchField icon={IconCalendar} label={label} divider={divider}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="flex w-full items-center text-left cursor-pointer outline-none border-0 bg-transparent p-0">
            <span className={cn("truncate text-sm", date ? "text-navy font-semibold" : "text-gray-400 font-normal")}>
              {date ? `${format(date, "EEE, MMM d")}${time ? ` · ${time}` : ""}` : "Select date"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 z-50 bg-white shadow-2xl rounded-2xl border border-gray-100 flex" align="start" side="bottom" sideOffset={8}>
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(d) => { if (d) onDateChange(d); }}
            disabled={{ before: disabledBefore }}
          />
          <div className="w-36 border-l border-gray-100 max-h-[340px] overflow-y-auto p-2">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 px-2 py-1">Time</span>
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { onTimeChange(t); setOpen(false); }}
                className={cn(
                  "block w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100",
                  time === t ? "bg-navy text-white hover:bg-navy" : "text-navy"
                )}
              >
                {t}
              </button>
            ))}
          </div>
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-30 hover:border-gray-400 transition-colors cursor-pointer shrink-0"
        >
          <IconMinus className="h-3 w-3" />
        </button>
        <span className="text-sm text-navy font-semibold w-4 text-center shrink-0">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-30 hover:border-gray-400 transition-colors cursor-pointer shrink-0"
        >
          <IconPlus className="h-3 w-3" />
        </button>
      </div>
    </SearchField>
  );
}
