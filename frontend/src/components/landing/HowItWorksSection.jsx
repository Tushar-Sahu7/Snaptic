import { motion } from "motion/react";
import { UserPlus, ScanFace, ClipboardCheck, Send } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Enroll",
    description: "Teacher creates a class, students join and register their face through the browser camera.",
  },
  {
    icon: ScanFace,
    step: "02",
    title: "Scan",
    description: "When class starts, teacher opens a face scan session. Students are verified in real-time.",
  },
  {
    icon: ClipboardCheck,
    step: "03",
    title: "Review",
    description: "Attendance is auto-populated. Teacher reviews the biometric results before finalizing.",
  },
  {
    icon: Send,
    step: "04",
    title: "Submit",
    description: "One click to lock the record. Immutable, timestamped, and visible to everyone.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Four steps. Two minutes.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
            From enrollment to submission — the entire flow is designed to be
            fast, fair, and foolproof.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number circle */}
              <div className="relative z-10 mb-6 flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md">
                <step.icon className="size-6" strokeWidth={1.5} />
              </div>

              {/* Step number label */}
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">
                Step {step.step}
              </span>

              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
