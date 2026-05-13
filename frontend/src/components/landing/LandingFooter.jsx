import { Logo } from "@/components/shared/logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size="sm" />
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Snaptic. Built for teachers, by
          students.
        </p>
      </div>
    </footer>
  );
}
