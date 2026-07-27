"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-2xl border border-gray-100 shadow-2xl font-sans w-72 sm:w-80", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        month_caption: "relative flex items-center justify-center pt-1 pb-2 font-black text-navy text-sm",
        caption_label: "text-sm font-black text-navy",
        nav: "space-x-1 flex items-center",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex w-full justify-between mb-2",
        weekday: "text-gray-400 font-bold text-[11px] text-center w-9 uppercase tracking-wider",
        week: "flex w-full mt-1 justify-between",
        day: "h-9 w-9 p-0 font-bold text-xs flex items-center justify-center rounded-xl transition-all cursor-pointer hover:bg-gold/20 hover:text-navy text-navy",
        selected: "!bg-[#060C17] !text-white font-black shadow-lg rounded-xl [&>button]:!text-white [&>button]:!font-black",
        today: "bg-gold/20 text-navy font-bold border border-gold/40",
        outside: "text-gray-300 opacity-40 hover:opacity-70",
        disabled: "text-gray-300 opacity-30 cursor-not-allowed",
        button_previous: "h-8 w-8 bg-slate-100 hover:bg-gold hover:text-navy rounded-xl p-0 flex items-center justify-center text-navy transition-colors cursor-pointer border-0 absolute left-1 z-10",
        button_next: "h-8 w-8 bg-slate-100 hover:bg-gold hover:text-navy rounded-xl p-0 flex items-center justify-center text-navy transition-colors cursor-pointer border-0 absolute right-1 z-10",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }: { orientation?: string }) =>
          orientation === "left" ? (
            <IconChevronLeft className="h-4 w-4 stroke-[2.5]" />
          ) : (
            <IconChevronRight className="h-4 w-4 stroke-[2.5]" />
          ),
      } as Record<string, React.ComponentType<{ orientation?: string }>>}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
