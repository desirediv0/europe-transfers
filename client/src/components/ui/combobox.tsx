"use client";

import { useState, useRef, useEffect } from "react";
import { IconCheck, IconChevronDown, IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  /** When true, typing a value not in `options` lets the user select that typed text as a custom value. */
  allowCustomValue?: boolean;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  allowCustomValue = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = search.trim()
    ? options.filter((o) => o.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  const selectOption = (option: string) => {
    onChange(option === value ? "" : option);
    setSearch("");
    setOpen(false);
  };

  const applyCustomValue = () => {
    if (!search.trim()) return;
    onChange(search.trim());
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <IconChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-[100] mt-1 w-full rounded-lg border border-gray-100 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <IconSearch className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm outline-none placeholder:text-muted-foreground bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); setSearch(""); }
                if (e.key === "Enter" && allowCustomValue && filtered.length === 0) {
                  e.preventDefault();
                  applyCustomValue();
                }
              }}
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              allowCustomValue && search.trim() ? (
                <button
                  type="button"
                  onClick={applyCustomValue}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Use &quot;{search.trim()}&quot;
                </button>
              ) : (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
              )
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectOption(option)}
                  className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-50 cursor-pointer"
                >
                  <IconCheck className={cn("mr-2 h-4 w-4 shrink-0", value === option ? "opacity-100 text-gold" : "opacity-0")} />
                  <span className="truncate">{option}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
