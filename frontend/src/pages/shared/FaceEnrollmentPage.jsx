import AuthFaceEnrollmentCard from "@/features/auth/components/AuthFaceEnrollmentCard";
import { motion } from "motion/react";

export default function FaceEnrollmentPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Face ID Setup
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Setup your biometric profile for automated attendance. This will allow you to mark attendance with a single glance.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AuthFaceEnrollmentCard />
      </motion.div>
    </div>
  );
}
