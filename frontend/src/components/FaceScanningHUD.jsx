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

      {/* Scanning Target Box (Minimalist) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="124"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/5"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="124"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="779"
              animate={{ strokeDashoffset: 779 * (1 - progress) }}
              className={cn(
                "text-primary transition-colors duration-500",
                status === "success" && "text-[oklch(0.7_0.2_150)]",
                status === "error" && "text-[oklch(0.7_0.2_20)]"
              )}
            />
          </svg>
          
          {/* Internal Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-4 h-[1px] bg-white absolute" />
            <div className="h-4 w-[1px] bg-white absolute" />
          </div>
        </div>
      </div>

      {/* Background Dimming / Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
    </div>
  );
}
