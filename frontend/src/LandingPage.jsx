import { useState, useEffect, useRef } from "react";
import LoginPage from "./LoginPage";
import { Link } from "react-router";

/* ─────────────────────── data ─────────────────────── */

const NAV_LINKS = ["Features", "How It Works"];

const STATS = [
  { value: "98%", label: "Recognition Accuracy" },
  { value: "<5min", label: "Full Class Processing" },
  { value: "0$", label: "Operational Cost" },
  { value: "50+", label: "Students Per Session" },
];

const FEATURES = [
  {
    icon: "◈",
    title: "Smart Batch Capture",
    desc: "8–12 optimized photos over 2–3 minutes. The system handles framing, lighting, and compression automatically while you keep teaching.",
  },
  {
    icon: "⬡",
    title: "On-Device Processing",
    desc: "WebCodecs + GPU acceleration runs entirely on the teacher's mobile device. No cloud. No server. No ongoing costs — ever.",
  },
  {
    icon: "◉",
    title: "Multi-Model Ensemble",
    desc: "BlazeFace detection feeds into EfficientNet-Lite recognition. Cross-frame validation pushes accuracy to 95–98% automatically.",
  },
  {
    icon: "◫",
    title: "Confidence Scoring",
    desc: "Every result is classified: high confidence auto-marks, uncertain cases surface for 1-tap review. Nothing is silently wrong.",
  },
  {
    icon: "⬕",
    title: "Offline First",
    desc: "Full attendance marking without network. IndexedDB storage + background sync reconciles data when connectivity returns.",
  },
  {
    icon: "◷",
    title: "Three-Role System",
    desc: "Admins oversee school-wide data. Teachers mark and analyze. Students track their own records. Every view is purpose-built.",
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Enroll Students",
    body: "Multi-angle capture in 60 seconds per student. Quality assessment runs in real-time — only sharp, well-lit samples are stored.",
    last: false,
  },
  {
    num: "02",
    title: "Start Attendance",
    body: "One button. The app captures 8–12 frames over 2–3 minutes as students settle. No posed photos. No roll call.",
    last: false,
  },
  {
    num: "03",
    title: "Review Results",
    body: "High-confidence detections auto-confirm. Edge cases surface in a compact review grid. Approve in seconds.",
    last: false,
  },
  {
    num: "04",
    title: "Analyze Patterns",
    body: "Attendance history, streaks, risk flags, and class trends update instantly. Export to PDF or CSV any time.",
    last: true,
  },
];

const CONF_VALUES = [92, 98, 76, 99, 85, 97];

/* ─────────────────────── hook ─────────────────────── */

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ─────────────────────── sub-components ─────────────────────── */

/**
 * Teal scanline that sweeps top → bottom.
 * Parent needs: position:relative + overflow:hidden
 */
function ScanLine() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* .scanline is a @utility in index.css */}
      <div className="scanline" />
    </div>
  );
}

/** Pulsing logo square */
function LogoDot() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-teal">
      <div className="h-2.5 w-2.5 rounded-full bg-teal animate-pulse-dot" />
    </div>
  );
}

/** KPI tile — used inside .divider-grid */
function StatCard({ value, label, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={[
        "flex flex-col gap-2 bg-dark px-8 py-10",
        "border-t-2 border-t-teal",
        "transition-all duration-700 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
      ].join(" ")}
      style={{ transitionDelay: `${delay}s` }}
    >
      <span className="font-mono text-5xl font-bold leading-none tracking-tight text-teal">
        {value}
      </span>
      <span className="font-mono text-xs uppercase tracking-widest text-white/40">
        {label}
      </span>
    </div>
  );
}

/** Feature capability card */
function FeatureCard({ icon, title, desc, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={[
        "group cursor-default bg-dark p-8",
        "border border-white/5",
        "hover:border-teal/40 hover:bg-teal/3",
        "transition-all duration-300",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      ].join(" ")}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="mb-5 font-mono text-3xl text-teal transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
        {icon}
      </div>
      <h3 className="mb-2.5 font-sans text-base font-bold text-white">
        {title}
      </h3>
      <p className="font-sans text-sm leading-7 text-white/45">{desc}</p>
    </div>
  );
}

/** Numbered workflow step */
function StepRow({ num, title, body, delay, last }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={[
        "flex gap-8 transition-all duration-700 ease-out",
        last ? "" : "pb-9 mb-9 border-b border-white/6",
        inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6",
      ].join(" ")}
      style={{ transitionDelay: `${delay}s` }}
    >
      <span className="w-16 shrink-0 font-mono text-[2.5rem] font-bold leading-none text-teal/25">
        {num}
      </span>
      <div>
        <h3 className="mb-2 font-sans text-[1.05rem] font-bold text-white">
          {title}
        </h3>
        <p className="font-sans text-sm leading-7 text-white/45">{body}</p>
      </div>
    </div>
  );
}

/** Single confidence bar row inside hero mockup */
function ConfBar({ conf }) {
  const high = conf > 90;
  return (
    <div className="mb-2.5 flex items-center gap-3">
      <div
        className={[
          "h-7 w-7 shrink-0 rounded-full border",
          high ? "border-teal/30 bg-teal/10" : "border-white/10 bg-white/5",
        ].join(" ")}
      />

      <div className="h-0.75 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={[
            "h-full rounded-full transition-all duration-1200 ease-out",
            high ? "bg-teal" : "bg-amber-500",
          ].join(" ")}
          style={{ width: `${conf}%` }}
        />
      </div>

      <span
        className={[
          "w-7 text-right font-mono text-[10px]",
          high ? "text-teal" : "text-amber-500",
        ].join(" ")}
      >
        {conf}%
      </span>
    </div>
  );
}

/* ─────────────────────── page ─────────────────────── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark font-sans text-white">
      {/* ══════════════════════════ NAV ══════════════════════════ */}
      <nav
        className={[
          "fixed inset-x-0 top-0 z-50 flex h-17.5 items-center",
          "justify-between px-5 lg:px-20 transition-all duration-500",
          scrolled ? "nav-glass" : "bg-transparent",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoDot />
          <span className="font-mono text-lg font-bold tracking-wider">
            SNAP<span className="text-teal">TIC</span>
          </span>
        </div>

        {/* Links + auth */}
        <div className="flex items-center gap-4 md:gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replaceAll(" ", "-")}`}
              className="hidden font-mono text-[11px] tracking-widest text-white/50 no-underline transition-colors duration-200 hover:text-teal md:block"
            >
              {l.toUpperCase()}
            </a>
          ))}

          {/* Sign Up — filled */}
          <Link
            to="/signup"
            className="cursor-pointer border-0 bg-teal px-3 py-2 md:px-5 md:py-2.5 font-mono text-[10px] md:text-[11px] font-bold tracking-widest text-dark transition-opacity duration-200 hover:opacity-80"
          >
            SIGN UP
          </Link>

          {/* Login — ghost */}
          <Link
            to="/login"
            className="cursor-pointer border border-teal/40 bg-transparent px-3 py-2 md:px-5 md:py-2.5 font-mono text-[10px] md:text-[11px] font-bold tracking-widest text-teal transition-all duration-200 hover:bg-teal/10"
          >
            LOGIN
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section
        id="hero"
        className="relative flex min-h-screen flex-col justify-center overflow-hidden px-5 pb-24 pt-32 lg:px-20 bg-grid bg-size-[56px_56px]"
        /*
          v4: bg-grid references --background-image-grid from @theme.
          bg-[size:56px_56px] sets background-size via arbitrary value.
        */
      >
        {/* Radial glow overlay */}
        <div className="pointer-events-none absolute inset-0 bg-hero-radial" />

        {/* ── Copy ── */}
        <div className="relative z-10 max-w-2xl">
          {/* Label */}
          <div className="mb-8 inline-flex animate-fade-up-1 items-center gap-2 border border-teal/30 px-4 py-1.5">
            <span className="font-mono text-[11px] tracking-[0.16em] text-teal">
              ◆ ZERO-COST · ON-DEVICE · 98% ACCURACY
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-7 animate-fade-up-2 font-sans text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.02] tracking-tight">
            Attendance that
            <br />
            {/* text-outline-teal is a @utility in index.css */}
            <span className="text-outline-teal">sees every face.</span>
          </h1>

          {/* Sub */}
          <p className="mb-12 max-w-lg animate-fade-up-3 font-sans text-[clamp(1rem,1.8vw,1.15rem)] leading-[1.8] text-white/50">
            Snaptic uses WebCodecs and on-device AI to process an entire
            classroom in under 5 minutes — no hardware, no subscriptions, no
            server costs. Just your phone.
          </p>

          {/* Buttons */}
          <div className="flex animate-fade-up-4 flex-wrap gap-4">
            <Link
              to="/login"
              className="cursor-pointer border-0 bg-teal px-6 py-3 md:px-10 md:py-4 font-mono text-sm font-bold tracking-widest text-dark transition-opacity duration-200 hover:opacity-85"
            >
              GET STARTED →
            </Link>
            <button className="cursor-pointer border border-white/20 bg-transparent px-6 py-3 md:px-10 md:py-4 font-mono text-sm tracking-widest text-white/60 transition-all duration-200 hover:border-teal/50 hover:text-teal">
              WATCH DEMO ▶
            </button>
          </div>
        </div>

        {/* ── Floating confidence mockup ── */}
        <div className="absolute right-[7vw] top-1/2 z-10 hidden w-55 -translate-y-1/2 animate-float lg:block">
          <div className="relative overflow-hidden border border-teal/20 bg-dark-900 p-5 backdrop-blur-xl">
            <ScanLine />

            <p className="mb-4 font-mono text-[10px] tracking-widest text-teal">
              SESSION ACTIVE ●
            </p>

            {CONF_VALUES.map((c, i) => (
              <ConfBar key={i} conf={c} />
            ))}

            <div className="mt-4 border-t border-teal/20 bg-teal/6 px-2 py-2 font-mono text-[10px] text-teal">
              ◆ 5 / 6 AUTO-MARKED
            </div>
          </div>
        </div>

        {/* ── Scroll indicator ── */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 animate-fade-up-5">
          <span className="font-mono text-[9px] tracking-[0.2em] text-white/20">
            SCROLL
          </span>
          {/*
            v4: bg-linear-to-t is the correct gradient class (bg-gradient-to-t in v3).
            bg-fade-down references --background-image-fade-down from @theme.
          */}
          <div className="h-10 w-px bg-fade-down" />
        </div>
      </section>

      {/* ══════════════════════════ STATS STRIP ══════════════════════════ */}
      {/*
        .divider-grid (@utility): sets background = teal-tinted + gap: 1px
        Each StatCard child has bg-dark, so the 1px gap reveals teal as hairline dividers.
        auto-fit grid + minmax keeps it responsive without a media query.
      */}
      <div
        className="divider-grid grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        {STATS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* ══════════════════════════ FEATURES ══════════════════════════ */}
      <section id="features" className="px-5 py-28 lg:px-20">
        <div className="mb-16">
          <p className="mb-3 font-mono text-[11px] tracking-[0.18em] text-teal">
            ◆ CAPABILITIES
          </p>
          <h2 className="font-sans text-[clamp(2rem,4vw,3rem)] font-black leading-[1.08] tracking-tight">
            Built for real
            <br />
            classrooms.
          </h2>
        </div>

        {/* divider-grid: same hairline-divider trick as stats */}
        <div
          className="divider-grid grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.07} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════ HOW IT WORKS ══════════════════════════ */}
      <section
        id="how-it-works"
        className="border-y border-teal/10 bg-teal/2.5 px-5 py-28 lg:px-20"
      >
        <div
          className="grid items-start gap-16 lg:gap-24"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {/* Steps column */}
          <div>
            <p className="mb-3 font-mono text-[11px] tracking-[0.18em] text-teal">
              ◆ WORKFLOW
            </p>
            <h2 className="mb-14 font-sans text-[clamp(1.9rem,3vw,2.8rem)] font-black leading-[1.08] tracking-tight">
              Four steps.
              <br />
              Under five minutes.
            </h2>

            {HOW_STEPS.map((s, i) => (
              <StepRow key={s.num} {...s} delay={i * 0.1} />
            ))}
          </div>

          {/* Processing mockup — sticky on desktop */}
          <div className="lg:sticky lg:top-24">
            <div className="relative overflow-hidden border border-teal/15 bg-dark-900/80 p-8 backdrop-blur-xl">
              <ScanLine />

              <p className="mb-6 font-mono text-[11px] tracking-widest text-teal">
                PROCESSING BATCH — SESSION 47
              </p>

              {/* 5 × 6 face-dot grid */}
              <div className="mb-6 grid grid-cols-5 gap-2.5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className={[
                      "aspect-square rounded-full flex items-center justify-center",
                      "text-[8px] font-bold",
                      i < 26
                        ? "border border-teal/30 bg-teal/10 text-teal"
                        : "border border-white/8 bg-white/5 text-white/25",
                    ].join(" ")}
                  >
                    {i < 26 ? "✓" : "?"}
                  </div>
                ))}
              </div>

              <p className="mb-5 font-mono text-[11px] text-white/35">
                26 confirmed · 4 need review
              </p>

              {/* Progress bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                {/*
                  v4 gradient: bg-linear-to-r with from-/to- works natively.
                  Or we can use the registered bg-bar-teal token from @theme.
                */}
                <div className="h-full w-[86%] rounded-full bg-bar-teal" />
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[10px] text-white/25">0%</span>
                <span className="font-mono text-[11px] font-bold text-teal">
                  86% complete
                </span>
                <span className="font-mono text-[10px] text-white/25">
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CTA ══════════════════════════ */}
      <section className="relative flex flex-col items-center overflow-hidden px-5 py-36 text-center lg:px-20 bg-grid bg-size-[56px_56px]">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 bg-cta-radial" />

        <div className="relative z-10 max-w-xl">
          {/* Badge */}
          <div className="mb-8 inline-flex animate-fade-up-1 items-center border border-teal/25 px-4 py-1.5">
            <span className="font-mono text-[10px] tracking-[0.16em] text-teal/70">
              ◆ OPEN SOURCE · COLLEGE PROJECT
            </span>
          </div>

          {/* Headline */}
          <h2 className="mb-5 animate-fade-up-2 font-sans text-[clamp(2.2rem,5vw,3.6rem)] font-black leading-[1.06] tracking-tight">
            Try Snaptic
            <br />
            <span className="text-teal">for free.</span>
          </h2>

          {/* Body */}
          <p className="mb-12 animate-fade-up-3 font-sans text-base leading-[1.8] text-white/40">
            Built as a final-year computer science project. Free to use, open to
            contribute. No account required to explore the demo.
          </p>

          {/* Buttons */}
          <div className="flex animate-fade-up-4 flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="cursor-pointer border-0 bg-teal px-6 py-3 md:px-10 md:py-4 font-mono text-sm font-bold tracking-widest text-dark transition-opacity duration-200 hover:opacity-85"
            >
              CREATE ACCOUNT →
            </Link>
            <a href="https://github.com/Tushar-Sahu7/Snaptic">
              <button className="cursor-pointer border border-white/15 bg-transparent px-6 py-3 md:px-10 md:py-4 font-mono text-sm tracking-widest text-white/60 transition-all duration-200 hover:border-teal/50 hover:text-teal">
                VIEW ON GITHUB ↗
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-white/6 px-5 py-8 lg:px-20">
        <span className="font-mono text-base font-bold tracking-wider">
          SNAP<span className="text-teal">TIC</span>
        </span>

        <span className="font-mono text-[10px] tracking-widest text-white/20">
          © 2025 SNAPTIC · COLLEGE PROJECT · BUILT ON WEB STANDARDS
        </span>

        <div className="flex gap-7">
          {["GitHub", "Docs", "Contact"].map((l) => (
            <a
              key={l}
              href="#"
              className="font-mono text-[10px] tracking-widest text-white/30 no-underline transition-colors duration-200 hover:text-teal"
            >
              {l.toUpperCase()}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}