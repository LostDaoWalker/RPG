import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  barClass?: string;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, label, barClass, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div ref={ref} className={cn("relative h-4 w-full overflow-hidden rounded-sm bg-background", className)} {...props}>
        <div className={cn("h-full transition-all duration-300", barClass)} style={{ width: `${pct}%` }} />
        {label && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {label}
          </span>
        )}
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
