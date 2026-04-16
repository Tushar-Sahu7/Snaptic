import * as React from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/**
 * Snaptic Logo Component
 * Redesigned for visual balance and better rhythm.
 */
export function Logo({ size = "md", showText = true, className }) {
  const sizeClasses = {
    sm: {
      container: "gap-1.5",
      icon: "size-8 rounded-md text-lg font-black",
      text: "text-lg",
    },
    md: {
      container: "gap-2",
      icon: "size-9 rounded-md text-xl font-black",
      text: "text-xl",
    },
    lg: {
      container: "gap-2.5",
      icon: "size-10 rounded-md text-2xl font-black",
      text: "text-2xl",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <Link
      to="/"
      className={cn(
        "group flex flex-col items-center transition-opacity hover:opacity-90",
        currentSize.container,
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105 active:scale-95 duration-200",
          currentSize.icon
        )}
      >
        <span>S</span>
      </div>
      {showText && (
        <span
          className={cn(
            "font-sans font-bold tracking-tight text-foreground",
            currentSize.text
          )}
        >
          Snaptic
        </span>
      )}
    </Link>
  );
}

export default Logo;
