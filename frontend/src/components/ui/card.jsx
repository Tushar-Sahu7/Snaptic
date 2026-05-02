import * as React from "react";

import { cn } from "@/lib/utils";

import { cva } from "class-variance-authority";

const cardVariants = cva(
  "group/card flex flex-col gap-4 overflow-hidden rounded-xl py-4 text-sm has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07),0_1px_4px_-2px_rgba(0,0,0,0.05)] ring-1 ring-foreground/5 hover:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1),0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-shadow duration-300",
        adaptive: "bg-transparent text-card-foreground ring-0 md:bg-card md:shadow-sm md:ring-1 md:ring-foreground/5",
        ghost: "bg-transparent text-card-foreground ring-0",
      },
      size: {
        default: "gap-4 py-4",
        sm: "gap-3 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Card({ className, variant, size, ...props }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        "group-data-[variant=adaptive]/card:px-1 md:group-data-[variant=adaptive]/card:px-4",
        "group-data-[variant=ghost]/card:px-0",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-4 group-data-[size=sm]/card:px-3",
        "group-data-[variant=adaptive]/card:px-1 md:group-data-[variant=adaptive]/card:px-4",
        "group-data-[variant=ghost]/card:px-0",
        className,
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        "group-data-[variant=adaptive]/card:border-t-0 group-data-[variant=adaptive]/card:bg-transparent group-data-[variant=adaptive]/card:px-1 md:group-data-[variant=adaptive]/card:border-t md:group-data-[variant=adaptive]/card:bg-muted/50 md:group-data-[variant=adaptive]/card:px-4",
        "group-data-[variant=ghost]/card:border-t-0 group-data-[variant=ghost]/card:bg-transparent group-data-[variant=ghost]/card:px-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
