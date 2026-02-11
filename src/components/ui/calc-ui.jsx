import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

function SurfaceCard({ className, ...props }) {
  return <div className={cn("border border-border bg-card", className)} {...props} />;
}

function SoftPanel({ className, ...props }) {
  return <div className={cn("border border-border bg-card", className)} {...props} />;
}

function CalcLabel({ className, ...props }) {
  return (
    <label
      className={cn("text-[0.86rem] font-semibold text-[var(--ink-700)]", className)}
      {...props}
    />
  );
}

const inputClassName =
  "w-full rounded-[var(--radius-xl)] border-0 bg-input px-[0.78rem] py-[0.58rem] text-foreground outline-none transition-colors duration-[160ms] placeholder:text-muted-foreground focus:bg-accent";

const CalcInput = React.forwardRef(function CalcInput(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(inputClassName, className)} {...props} />;
});

const CalcInputAdd = React.forwardRef(function CalcInputAdd(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(inputClassName, className)} {...props} />;
});

function CalcButton({
  className,
  variant = "primary",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-[var(--radius-lg)] border border-transparent px-[0.96rem] py-[0.56rem] text-[0.92rem] font-bold transition-colors duration-[160ms] cursor-pointer disabled:cursor-not-allowed disabled:border-border disabled:bg-secondary disabled:text-muted-foreground",
        variant === "primary" &&
          "border-[var(--primary-strong)] bg-primary text-primary-foreground hover:bg-[var(--primary-strong)]",
        variant === "soft" && "border-border bg-secondary/70 text-foreground hover:bg-accent",
        variant === "warm" &&
          "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger-foreground)] hover:bg-[var(--danger-hover)]",
        className,
      )}
      {...props}
    />
  );
}

function StatChip({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-muted px-[0.82rem] py-[0.56rem] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function WarningBox({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--warning-line)] bg-[var(--warning-soft)] text-[var(--warning-text)]",
        className,
      )}
      {...props}
    />
  );
}

function HeroNote({ className, ...props }) {
  return (
    <div
      className={cn("border border-border bg-muted text-[var(--ink-700)]", className)}
      {...props}
    />
  );
}

function SubtleNote({ className, ...props }) {
  return <span className={cn("text-muted-foreground", className)} {...props} />;
}

function CalcCheckChip({ className, ...props }) {
  return (
    <label
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-[var(--radius-lg)] bg-secondary px-4 text-sm text-[var(--ink-700)]",
        className,
      )}
      {...props}
    />
  );
}

function SoftIconButton({
  className,
  asChild = false,
  type = "button",
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(
        "border border-border bg-[var(--surface-control)] text-foreground transition-colors duration-[160ms] hover:bg-[var(--surface-control-hover)] disabled:opacity-[0.55]",
        className,
      )}
      {...props}
    />
  );
}

export {
  SurfaceCard,
  SoftPanel,
  CalcLabel,
  CalcInput,
  CalcInputAdd,
  CalcButton,
  StatChip,
  WarningBox,
  HeroNote,
  SubtleNote,
  CalcCheckChip,
  SoftIconButton,
};
