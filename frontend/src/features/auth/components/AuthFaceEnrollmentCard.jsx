import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ScanFace,
  Camera,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import AuthFaceEnrollmentModal from "./AuthFaceEnrollmentModal";
import { cn } from "@/lib/utils";

export default function FaceEnrollmentCard() {
  const { user, deleteFace } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEnrolled = user?.faceEnrolled;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteFace();
      toast.success("Face enrollment removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove enrollment");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className={cn(
                "p-3 rounded-2xl shadow-sm transition-colors duration-500",
                isEnrolled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <ScanFace className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight">Identity & Biometrics</CardTitle>
                <CardDescription className="text-sm">
                  Manage your biometric profile and verification status.
                </CardDescription>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={isEnrolled ? "enrolled" : "not-enrolled"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge 
                  variant={isEnrolled ? "default" : "secondary"}
                  className={cn(
                    "px-3 py-1 gap-1.5 font-semibold text-[10px] uppercase tracking-wider",
                    isEnrolled ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isEnrolled ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Enrolled</>
                  ) : (
                    <><XCircle className="w-3.5 h-3.5" /> Not Active</>
                  )}
                </Badge>
              </motion.div>
            </AnimatePresence>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/50 px-2 text-muted-foreground backdrop-blur-sm">System Status</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isEnrolled ? (
              <motion.div
                key="enrolled-content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Encrypted Identity Secured</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your high-dimensional biometric descriptor is stored using 256-bit encryption. It is used exclusively for class attendance verification.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setModalOpen(true)}
                    className="flex-1 gap-2 h-11 border-border/60 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh Profile
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={deleting}
                        className="w-11 h-11 p-0 border-border/60 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                      >
                        {deleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[400px]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Biometric Access?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will immediately delete your biometric signature. You will need to re-enroll before you can use face recognition for attendance.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, revoke access
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="not-enrolled-content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Action Required</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Complete your enrollment to enable seamless attendance tracking. The process takes less than 5 seconds and works in real-time.
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full gap-2 h-12 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all duration-300 active:scale-[0.99]"
                  onClick={() => setModalOpen(true)}
                >
                  <Camera className="w-4 h-4" />
                  Initialize Enrollment
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AuthFaceEnrollmentModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
