import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 touch-manipulation [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-fg shadow-sm hover:bg-[color-mix(in_oklab,var(--color-primary)_92%,black)] active:scale-[0.98]",
        secondary:
          "bg-bg-elevated text-fg border border-border hover:bg-bg-subtle active:scale-[0.98]",
        outline:
          "border border-border-strong bg-transparent text-fg hover:bg-bg-subtle active:scale-[0.98]",
        ghost: "text-fg-muted hover:bg-bg-subtle hover:text-fg",
        soft: "bg-primary-soft text-primary hover:bg-[color-mix(in_oklab,var(--color-primary-soft)_85%,var(--color-primary))] active:scale-[0.98]",
        danger:
          "bg-danger text-white hover:bg-[color-mix(in_oklab,var(--color-danger)_90%,black)] active:scale-[0.98]",
      },
      size: {
        default: "h-12 min-h-11 px-4 py-2 sm:h-11",
        sm: "h-10 min-h-10 rounded-[var(--radius-sm)] px-3 text-xs sm:h-9",
        lg: "h-12 min-h-12 rounded-[var(--radius-lg)] px-6 text-base",
        icon: "h-11 w-11 min-h-11 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
