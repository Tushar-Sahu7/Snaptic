import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Clock, UserX, ShieldOff, CalendarX } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Time Wasted",
    stat: "50+",
    statLabel: "hours lost / semester",
    description:
      "Roll calls eat 10+ minutes every session. That's time students could spend learning.",
  },
  {
    icon: UserX,
    title: "Proxy Attendance",
    stat: "38%",
    statLabel: "of students admit it",
    description:
      "Students sign in for absent friends. Manual systems can't detect it.",
  },
  {
    icon: ShieldOff,
    title: "Favoritism & Bias",
    stat: "0",
    statLabel: "proof of presence",
    description:
      "Subjective marking leads to disputes. No verifiable proof of attendance.",
  },
  {
    icon: CalendarX,
    title: "No Transparency",
    stat: "∞",
    statLabel: "unresolved disputes",
    description:
      "Students can't see their own records. Disputes escalate without evidence.",
  },
];

function ProblemCard({ problem, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        type: "spring",
        bounce: 0.2,
      }}
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-7 overflow-hidden cursor-default"
      style={{ perspective: 800 }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Animated border glow on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-foreground/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="mb-5 inline-flex items-center justify-center size-12 rounded-xl bg-secondary border border-border/30"
          whileHover={{ rotate: -10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <problem.icon className="size-5 text-foreground" strokeWidth={1.5} />
        </motion.div>

        {/* Big stat */}
        <div className="mb-3">
          <span className="text-3xl font-bold tracking-tight">{problem.stat}</span>
          <span className="text-xs text-muted-foreground ml-2 uppercase tracking-wider">
            {problem.statLabel}
          </span>
        </div>

        <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {problem.description}
        </p>
      </div>

      {/* Decorative corner glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-foreground/[0.03] blur-2xl group-hover:bg-foreground/[0.06] transition-colors duration-500" />
    </motion.div>
  );
}

export function ProblemSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={sectionRef} className="relative py-28 sm:py-36 overflow-hidden">
      {/* Parallax bg element */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-foreground/[0.015] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-foreground/[0.02] blur-3xl" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Section header with scroll-trigger */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-20"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4"
          >
            The Problem
          </motion.p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Attendance is{" "}
            <span className="relative">
              broken
              <motion.span
                className="absolute bottom-1 left-0 right-0 h-[3px] bg-foreground/20 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{ originX: 0 }}
              />
            </span>
            .
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-5 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg"
          >
            Traditional methods waste time, enable cheating, and leave no
            auditable trail. Snaptic fixes all four.
          </motion.p>
        </motion.div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => (
            <ProblemCard key={problem.title} problem={problem} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
