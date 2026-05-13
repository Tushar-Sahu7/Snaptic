import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 bg-primary text-primary-foreground overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Ready to save 50+ hours this semester?
          </h2>
          <p className="text-base sm:text-lg text-primary-foreground/70 max-w-xl">
            Join teachers who've replaced roll calls with face scans.
            Free to use. No hardware required.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              size="xl"
              variant="secondary"
              className="text-foreground"
              asChild
            >
              <Link to="/register">
                Sign Up Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="ghost"
              className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
