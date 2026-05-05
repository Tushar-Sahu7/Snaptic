import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function FaceScanningHUD({ 
  active = false, 
  progress = 0, 
  status = "scanning", // scanning | success | error
  guide = "",
  className 
}) {
  return (
    <div className={cn("absolute inset-0 z-10 pointer-events-none overflow-hidden", className)}>
      {/* HUD Corners */}
      <div className="absolute inset-10 border-2 border-transparent">
        {/* Top Left */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: active ? 1 : 0.3, scale: 1 }}
          className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary"
        />
        {/* Top Right */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: active ? 1 : 0.3, scale: 1 }}
          className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary"
        />
        {/* Bottom Left */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: active ? 1 : 0.3, scale: 1 }}
          className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary"
        />
        {/* Bottom Right */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: active ? 1 : 0.3, scale: 1 }}
          className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary"
        />
      </div>

      {/* Scanning Line */}
      <AnimatePresence>
        {active && status === "scanning" && (
          <motion.div
            initial={{ top: "10%" }}
            animate={{ top: "90%" }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            }}
            className="absolute left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          />
        )}
      </AnimatePresence>

      {/* Progress Ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-64 h-64 -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/10"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="754"
            animate={{ strokeDashoffset: 754 * (1 - progress) }}
            className={cn(
              "text-primary transition-colors duration-300",
              status === "success" && "text-green-500",
              status === "error" && "text-red-500"
            )}
          />
        </svg>
      </div>

      {/* Guide & Status Label */}
      <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={guide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase backdrop-blur-md border",
              status === "scanning" && "bg-black/40 border-primary/30 text-primary",
              status === "success" && "bg-green-500/20 border-green-500/30 text-green-400",
              status === "error" && "bg-red-500/20 border-red-500/30 text-red-400"
            )}
          >
            {guide || (status === "scanning" ? "Initializing Scan" : status)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Background Dimming / Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
    </div>
  );
}
