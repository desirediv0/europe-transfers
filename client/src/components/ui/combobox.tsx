"use client";

import { useState } from "react";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between rounded-lg border-gray-200 px-3.5 py-2.5 h-auto text-sm font-normal cursor-pointer",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value || placeholder}
          <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={!allowCustomValue}>
          <CommandInput
            placeholder={searchPlaceholder}
            className="text-sm"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustomValue && search.trim() ? (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(search.trim());
                    setSearch("");
                    setOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer"
                >
                  Use &quot;{search.trim()}&quot;
                </button>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup>
              {(allowCustomValue
                ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
                : options
              ).map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onMouseDown={(e) => e.preventDefault()}
                  onSelect={() => {
                    onChange(option === value ? "" : option);
                    setSearch("");
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <IconCheck className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
