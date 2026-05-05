import AuthFaceEnrollmentCard from "@/features/auth/components/AuthFaceEnrollmentCard";
import { motion } from "motion/react";

export default function FaceEnrollmentPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-2xl"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          Face ID Setup
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Secure your account and enable one-tap attendance with our advanced biometric recognition system.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md"
      >
        <AuthFaceEnrollmentCard />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 border-t pt-12 border-border/50">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-semibold text-foreground">Secure & Private</h3>
          <p className="text-sm text-muted-foreground">Biometric data is processed locally and never leaves your device's ecosystem.</p>
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-semibold text-foreground">One-Tap Attendance</h3>
          <p className="text-sm text-muted-foreground">Sign into classes instantly without needing to scan QR codes or enter PINs.</p>
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-semibold text-foreground">AI Powered</h3>
          <p className="text-sm text-muted-foreground">Our neural networks ensure high accuracy even in varying lighting conditions.</p>
        </div>
      </div>
    </div>
  );
}
