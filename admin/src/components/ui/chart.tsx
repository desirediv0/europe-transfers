import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export const ChartContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <div className="h-[280px] w-full">{children}</div>
    </div>
  );
};

export { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, LabelList, Line, LineChart, PolarAngleAxis, RadialBar, RadialBarChart, XAxis, YAxis };
