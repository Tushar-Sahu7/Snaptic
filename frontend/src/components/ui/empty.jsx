import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

function Empty({
  className,
  ...props
}) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-6 p-12 text-center",
        "animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out",
        className
      )}
      {...props} />
  );
}

function EmptyHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-md flex-col items-center gap-4", className)}
      {...props} />
  );
}

const emptyMediaVariants = cva(
  "mb-4 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0 transition-all duration-700",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: [
          "size-24 rounded-[32px] bg-zinc-50 dark:bg-zinc-900/50",
          "border border-zinc-100 dark:border-zinc-800/50 shadow-sm",
          "text-zinc-400 dark:text-zinc-500",
          "relative overflow-hidden group-hover:scale-105 group-hover:rotate-3",
          "[&_svg]:size-10"
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
    >
      {/* Decorative background element for tactile feel */}
      {variant === "icon" && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
      )}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {props.children}
      </div>
    </div>
  );
}

function EmptyTitle({
  className,
  ...props
}) {
  return (
    <h2
      data-slot="empty-title"
      className={cn(
        "text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50",
        className
      )}
      {...props} />
  );
}

function EmptyDescription({
  className,
  ...props
}) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-base text-zinc-500 dark:text-zinc-400 font-medium max-w-[320px] leading-relaxed",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props} />
  );
}

function EmptyContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 mt-2",
        className
      )}
      {...props} />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
