import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-2 border-primary-dark bg-primary text-white shadow-[0_4px_0_0_var(--primary-dark)] hover:bg-[#61e002] active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--primary-dark)]",
        secondary:
          "border-2 border-secondary-dark bg-secondary text-white shadow-[0_4px_0_0_var(--secondary-dark)] hover:bg-[#2bc2ff] active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--secondary-dark)]",
        outline:
          "border-2 border-border bg-white text-foreground shadow-[0_4px_0_0_#e5e5e5] hover:bg-muted active:translate-y-0.5 active:shadow-[0_2px_0_0_#e5e5e5]",
        ghost:
          "border-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground shadow-none normal-case tracking-normal font-semibold",
        link: "border-transparent text-secondary underline-offset-4 hover:underline shadow-none normal-case tracking-normal font-semibold",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
