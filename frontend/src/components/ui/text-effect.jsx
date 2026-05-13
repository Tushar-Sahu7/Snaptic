import { motion, AnimatePresence } from "motion/react";

const defaultVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(8px)" },
};

const presetVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(12px)" },
  },
  slide: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
};

function TextEffect({
  children,
  per = "word",
  as = "p",
  variants,
  className,
  preset,
  delay = 0,
  speedReveal = 0.03,
  trigger = true,
}) {
  const selectedVariants = preset
    ? presetVariants[preset] || defaultVariants
    : variants || defaultVariants;

  const MotionTag = motion.create(as);

  if (per === "line") {
    const lines = typeof children === "string" ? children.split("\n") : [children];
    return (
      <AnimatePresence mode="popLayout">
        {trigger && (
          <MotionTag className={className}>
            {lines.map((line, i) => (
              <motion.span
                key={`line-${i}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={selectedVariants}
                transition={{
                  duration: 0.5,
                  delay: delay + i * 0.1,
                }}
                style={{ display: "block" }}
              >
                {line}
              </motion.span>
            ))}
          </MotionTag>
        )}
      </AnimatePresence>
    );
  }

  if (per === "char") {
    const text = typeof children === "string" ? children : "";
    const chars = text.split("");
    return (
      <AnimatePresence mode="popLayout">
        {trigger && (
          <MotionTag className={className} aria-label={text}>
            {chars.map((char, i) => (
              <motion.span
                key={`char-${i}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={selectedVariants}
                transition={{
                  duration: 0.3,
                  delay: delay + i * speedReveal,
                }}
                aria-hidden
                style={{ display: "inline-block", whiteSpace: "pre" }}
              >
                {char}
              </motion.span>
            ))}
          </MotionTag>
        )}
      </AnimatePresence>
    );
  }

  // per === "word" (default)
  const text = typeof children === "string" ? children : "";
  const words = text.split(" ");
  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag className={className} aria-label={text}>
          {words.map((word, i) => (
            <motion.span
              key={`word-${i}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-hidden
              variants={selectedVariants}
              transition={{
                duration: 0.3,
                delay: delay + i * speedReveal,
              }}
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {word}{" "}
            </motion.span>
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  );
}

export { TextEffect };
