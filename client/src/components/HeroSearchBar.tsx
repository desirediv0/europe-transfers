"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { IconArrowRight, IconLoader2 } from "@tabler/icons-react";

export interface SearchTab {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HeroSearchBarProps {
  tabs?: SearchTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  fields: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  disabled?: boolean;
  fieldCount?: 3 | 4 | 5;
}

export function HeroSearchBar({
  tabs,
  activeTab,
  onTabChange,
  fields,
  onSubmit,
  submitLabel = "See prices",
  submitting = false,
  disabled = false,
  fieldCount = 4,
}: HeroSearchBarProps) {
  const gridColsClass =
    fieldCount === 3 ? "sm:grid-cols-3" : fieldCount === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4";

  return (
    <div className="w-full max-w-4xl mx-auto">
      {tabs && tabs.length > 0 && (
        <Tabs value={activeTab} onValueChange={onTabChange} className="mb-3 flex justify-center sm:justify-start">
          <TabsList className="h-auto bg-black/40 backdrop-blur-md border border-white/15 rounded-full p-1 gap-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "rounded-full px-4 py-2 text-xs sm:text-sm font-bold gap-1.5 text-white/70 transition-all",
                  "data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-md"
                )}
              >
                <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="bg-white rounded-2xl sm:rounded-full shadow-xl border border-gray-100 p-2 flex flex-col sm:flex-row sm:items-stretch gap-1.5 sm:gap-0 sm:h-18">
        <div className={cn("grid grid-cols-1 flex-1 gap-1.5 sm:gap-0", gridColsClass)}>
          {fields}
        </div>

        <Button
          onClick={onSubmit}
          disabled={disabled || submitting}
          className="w-full sm:w-auto h-12 sm:h-full px-7 rounded-xl sm:rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-sm shrink-0 cursor-pointer"
        >
          {submitting ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {submitLabel}
              <IconArrowRight className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function SearchField({
  icon: Icon,
  label,
  children,
  divider = true,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full items-center gap-2.5 px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-none hover:bg-slate-50 transition-colors",
        divider && "sm:border-r sm:border-gray-200 last:border-r-0"
      )}
    >
      {Icon && <Icon className="h-4 w-4 text-gray-400 shrink-0" />}
      <div className="flex-1 min-w-0 leading-tight">
        <div className="text-xs text-gray-500 font-medium leading-none mb-1">{label}</div>
        {children}
      </div>
    </div>
  );
}
