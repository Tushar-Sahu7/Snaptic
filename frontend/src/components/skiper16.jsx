import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import React, { useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const attendanceSteps = [
  {
    step: "Step 01",
    title: "Select Class",
    description: "Pick your session and student list from the dashboard.",
    imagePrefix: "attendance_step1",
  },
  {
    step: "Step 02",
    title: "AI Scan",
    description: "Automatically identify students with advanced Face AI.",
    imagePrefix: "attendance_step2",
  },
  {
    step: "Step 03",
    title: "Adjust",
    description: "Handle exceptions or manual marks with a single tap.",
    imagePrefix: "attendance_step3",
  },
  {
    step: "Step 04",
    title: "Review",
    description: "Double-check your records and sync them instantly.",
    imagePrefix: "attendance_step4",
  },
];

const revealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const StickyCard = ({
  i,
  title,
  imagePrefix,
  progress,
  range,
  targetScale,
}) => {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const src = `/landing/${imagePrefix}_${isDark ? "dark" : "light"}.png`;

  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="sticky top-[150px] flex items-center justify-center mb-[8vh]">
      <motion.div
        variants={revealVariants}
        style={{
          scale,
          top: `calc(${i * 30}px)`,
        }}
        className="relative w-full shadow-2xl rounded-2xl"
      >
        <div className="ring-background dark:inset-shadow-white/20 bg-background/80 backdrop-blur-sm relative mx-auto overflow-hidden rounded-2xl border p-3 shadow-2xl shadow-zinc-950/15 ring-1">
          <img
            src={src}
            alt={title}
            className="bg-background relative rounded-xl shadow-inner w-full h-auto object-contain"
          />
        </div>
      </motion.div>
    </div>
  );
};

const Skiper16 = () => {
  const container = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.floor(latest * 4);
    const safeIndex = Math.min(Math.max(index, 0), 3);
    if (safeIndex !== activeIndex) {
      setActiveIndex(safeIndex);
    }
  });

  const activeStep = attendanceSteps[activeIndex];

  return (
    <section
      id="how-it-works"
      ref={container}
      className="relative py-24 bg-background overflow-visible"
    >
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-7xl px-6"
      >
        {/* Centered Static Section Header */}
        <motion.div variants={revealVariants} className="mb-16 text-center">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-primary mb-4">
            How it works
          </h2>
          <h3 className="text-4xl font-bold dark:text-white sm:text-5xl tracking-tight leading-tight max-w-2xl mx-auto">
            Seamless Attendance in{" "}
            <span className="text-primary">4 Simple Steps</span>
          </h3>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Sticky Step Content */}
          <div className="lg:col-span-3">
            <motion.div
              variants={revealVariants}
              className="sticky top-[150px] z-20 space-y-6"
            >
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
                    {activeIndex + 1}
                  </span>
                  <span className="text-primary font-bold tracking-wider uppercase text-[10px]">
                    {activeStep.step}
                  </span>
                </div>
                <h3 className="text-3xl font-bold dark:text-white leading-tight">
                  {activeStep.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {activeStep.description}
                </p>
                
                {/* Visual Step Indicator */}
                <div className="flex gap-2 pt-4">
                  {attendanceSteps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === activeIndex ? "w-8 bg-primary" : "w-2 bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Sticky Card Stack */}
          <div className="lg:col-span-9 relative">
            <div className="flex flex-col items-center">
              {attendanceSteps.map((project, i) => {
                const targetScale = Math.max(
                  0.85,
                  1 - (attendanceSteps.length - i - 1) * 0.04,
                );
                return (
                  <StickyCard
                    key={`step_${i}`}
                    i={i}
                    {...project}
                    progress={scrollYProgress}
                    range={[i * 0.25, 1]}
                    targetScale={targetScale}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* No extra spacer here to allow natural scroll exit */}
    </section>
  );
};

export { Skiper16, StickyCard };
