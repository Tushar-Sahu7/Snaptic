import { AnimatePresence, motion } from "motion/react";
import React from "react";

const defaultVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        type: "spring",
        bounce: 0.3,
      },
    },
  },
};

const presetVariants = {
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
      },
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    },
  },
  slide: {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.05 },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, type: "spring", stiffness: 260, damping: 20 },
      },
    },
  },
  blur: {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.05 },
      },
    },
    item: {
      hidden: { opacity: 0, filter: "blur(12px)", y: 20 },
      visible: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: { duration: 0.6 },
      },
    },
  },
};

function AnimatedGroup({
  children,
  className,
  variants,
  preset,
  as = "div",
  asChild = "div",
}) {
  const selectedVariants = preset
    ? presetVariants[preset] || defaultVariants
    : { container: variants?.container || defaultVariants.container, item: variants?.item || defaultVariants.item };

  const MotionComponent = motion.create(as);
  const MotionChild = motion.create(asChild);

  return (
    <AnimatePresence>
      <MotionComponent
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={selectedVariants.container}
        className={className}
      >
        {React.Children.map(children, (child, index) => (
          <MotionChild key={index} variants={selectedVariants.item}>
            {child}
          </MotionChild>
        ))}
      </MotionComponent>
    </AnimatePresence>
  );
}

export { AnimatedGroup };
