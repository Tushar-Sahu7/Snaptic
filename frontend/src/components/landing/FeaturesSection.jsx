import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ScanFace, History, ShieldCheck, Zap, Camera, Eye } from "lucide-react";

const features = [
  {
    icon: ScanFace,
    title: "Real-Time Face Scan",
    description:
      "AI-powered facial recognition verifies each student in under 3 seconds. No hardware required — just a browser camera.",
    visual: "scan",
  },
  {
    icon: History,
    title: "Transparent History",
    description:
      "Every session is logged with timestamps and facial verification proof. Students and teachers see the same immutable record.",
    visual: "history",
  },
  {
    icon: ShieldCheck,
    title: "Zero Proxy, Zero Bias",
    description:
      "Facial recognition truth means no one can mark attendance for someone else. The system is the single source of truth.",
    visual: "shield",
  },
];

/* ── Mini visual mockups for each feature ────────── */
function ScanVisual() {
  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-secondary/30 border border-border/30">
      {/* Scanning ring */}
      <motion.div
        className="absolute w-28 h-28 rounded-full border-2 border-foreground/20"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-20 h-20 rounded-full border-2 border-foreground/30"
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      {/* Center face icon */}
      <motion.div
        className="relative z-10 flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Camera className="size-6" />
      </motion.div>
      {/* Scan line */}
      <motion.div
        className="absolute left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent"
        animate={{ top: ["20%", "80%", "20%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-foreground/20 rounded-tl" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-foreground/20 rounded-tr" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-foreground/20 rounded-bl" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-foreground/20 rounded-br" />
      {/* Status text */}
      <motion.div
        className="absolute bottom-3 text-[10px] font-mono text-foreground/40 tracking-wider uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        scanning...
      </motion.div>
    </div>
  );
}

function HistoryVisual() {
  const rows = [
    { name: "Alice M.", time: "09:01 AM", status: "present" },
    { name: "Bob K.", time: "09:02 AM", status: "present" },
    { name: "Carol Z.", time: "—", status: "absent" },
  ];
  return (
    <div className="w-full h-44 flex flex-col justify-center overflow-hidden rounded-xl bg-secondary/30 border border-border/30 p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 px-1">
        <Eye className="size-3" />
        <span>Session Log — May 14, 2026</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/50 border border-border/20 text-xs"
          >
            <span className="font-medium">{row.name}</span>
            <span className="text-muted-foreground font-mono">{row.time}</span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                row.status === "present" ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              {row.status === "present" ? "✓ Verified" : "✗ Absent"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ShieldVisual() {
  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-secondary/30 border border-border/30">
      {/* Animated shield */}
      <motion.div
        className="relative z-10"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative flex items-center justify-center size-20 rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <ShieldCheck className="size-10" strokeWidth={1.5} />
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-foreground/20"
            animate={{ scale: [1, 1.2], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
      {/* Stats */}
      <div className="absolute bottom-3 flex gap-6 text-center">
        <div>
          <div className="text-sm font-bold">99.8%</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Accuracy</div>
        </div>
        <div>
          <div className="text-sm font-bold">0%</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Proxy</div>
        </div>
        <div>
          <div className="text-sm font-bold">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              LIVE
            </motion.span>
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Tracking</div>
        </div>
      </div>
    </div>
  );
}

const visuals = { scan: ScanVisual, history: HistoryVisual, shield: ShieldVisual };

function FeatureCard({ feature, index }) {
  const Visual = visuals[feature.visual];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        type: "spring",
        bounce: 0.2,
      }}
      whileHover={{
        y: -6,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      {/* Top visual area */}
      <div className="p-4 pb-0">
        <Visual />
      </div>

      {/* Content */}
      <div className="p-6 pt-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground">
            <feature.icon className="size-5" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold">{feature.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section id="features" ref={sectionRef} className="relative py-28 sm:py-36 overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-secondary/20" />
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-foreground/[0.015] blur-3xl" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-20"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.2em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4"
          >
            Features
          </motion.p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Built for{" "}
            <motion.span
              className="inline-block"
              whileInView={{ rotate: [0, -2, 0] }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              truth.
            </motion.span>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-5 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg"
          >
            Every feature exists to make attendance faster, fairer, and fully
            transparent.
          </motion.p>
        </motion.div>

        {/* Feature cards with interactive visuals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
