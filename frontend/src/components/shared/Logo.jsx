import { Link } from "react-router";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { icon: "size-6 text-xs", text: "text-base" },
  md: { icon: "size-8 text-sm", text: "text-xl" },
  lg: { icon: "size-10 text-base", text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, className }) {
  const s = sizeMap[size] || sizeMap.md;

  return (
    <Link
      to="/"
      className={cn("flex items-center gap-2", className)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary font-heading font-bold text-primary-foreground",
          s.icon
        )}
      >
        S
      </div>
      {showText && (
        <span className={cn("font-heading font-semibold tracking-tight", s.text)}>
          Snaptic
        </span>
      )}
    </Link>
  );
}

export default Logo;
