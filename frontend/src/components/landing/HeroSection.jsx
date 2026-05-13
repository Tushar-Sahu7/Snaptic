import { Link } from "react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "motion/react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
];

/* ── Floating particles ─────────────────────────────────── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-foreground/5"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── 3D tilt card hook ───────────────────────────────────── */
function use3DTilt(strength = 8) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [strength, -strength]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-strength, strength]), {
    stiffness: 200,
    damping: 20,
  });

  function handleMouse(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }
  return { rotateX, rotateY, handleMouse, handleLeave };
}

export function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const previewY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const previewScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // 3D tilt for the dashboard preview
  const tilt = use3DTilt(6);

  // Scrolled nav styling
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[110vh] flex flex-col overflow-hidden">
      {/* ── Animated gradient orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-foreground/[0.03] blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-foreground/[0.04] blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-foreground/[0.02] blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Grid overlay ── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.025)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)]" />

      <FloatingParticles />

      {/* ── Radial fade ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />

      {/* ════════ NAV ════════ */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size="md" />

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">
                  Sign Up <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="outline" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ════════ HERO CONTENT ════════ */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center pt-24"
      >
        <AnimatedGroup
          variants={{
            container: {
              visible: { transition: { staggerChildren: 0.1 } },
            },
            item: {
              hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.9, type: "spring", bounce: 0.25 },
              },
            },
          }}
          className="flex flex-col items-center gap-6 max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-muted-foreground backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
              <span className="relative inline-flex size-2 rounded-full bg-foreground" />
            </span>
            Facial Recognition Attendance
          </motion.div>

          {/* Headline */}
          <TextEffect
            as="h1"
            per="word"
            preset="blur"
            delay={0.3}
            speedReveal={0.06}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Attendance in 2 minutes. 99.8% accurate.
          </TextEffect>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            Facial recognition attendance that eliminates proxy, saves class time,
            and gives every student a transparent record.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-3 pt-2"
          >
            <Button size="xl" className="group relative overflow-hidden" asChild>
              <Link to="/register">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="group" asChild>
              <a href="#how-it-works">
                See How It Works
                <motion.span
                  className="inline-block ml-1"
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ↓
                </motion.span>
              </a>
            </Button>
          </motion.div>
        </AnimatedGroup>

        {/* ════════ DASHBOARD PREVIEW (3D tilt) ════════ */}
        <motion.div
          style={{ y: previewY, scale: previewScale, perspective: 1200 }}
          className="mt-16 mb-12 w-full max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 80, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.8, type: "spring", bounce: 0.15 }}
            style={{
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
              transformStyle: "preserve-3d",
            }}
            onMouseMove={tilt.handleMouse}
            onMouseLeave={tilt.handleLeave}
            className="relative rounded-2xl border border-border/60 bg-card/50 p-2 shadow-2xl backdrop-blur-sm cursor-default"
          >
            {/* Glow ring */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-foreground/[0.08] to-transparent pointer-events-none" />

            {/* Browser chrome */}
            <div className="relative flex items-center gap-2 px-4 py-3 border-b border-border/40">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400/80" />
                <div className="size-3 rounded-full bg-yellow-400/80" />
                <div className="size-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 mx-8">
                <div className="mx-auto max-w-sm h-7 rounded-lg bg-secondary/80 flex items-center justify-center border border-border/30">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    snaptic.app/teacher/dashboard
                  </span>
                </div>
              </div>
            </div>

            <img
              src="/landing/dashboard.png"
              alt="Snaptic Teacher Dashboard"
              className="w-full rounded-b-xl"
              loading="eager"
            />

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent rounded-b-2xl" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ opacity: [0.4, 1, 0.4], y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-foreground/20 flex justify-center pt-2">
          <motion.div
            className="w-1 h-2.5 rounded-full bg-foreground/40"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
