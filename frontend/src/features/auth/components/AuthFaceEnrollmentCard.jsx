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
  CardFooter,
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
      toast.success("Face removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove face");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="relative overflow-hidden border-border bg-card shadow-sm max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex-none size-10 rounded-xl flex items-center justify-center transition-colors duration-500",
                isEnrolled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <ScanFace className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight">Face ID</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {isEnrolled ? "Your face is ready for attendance." : "Setup your face for attendance."}
                </CardDescription>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={isEnrolled ? "enrolled" : "not-enrolled"}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge 
                  variant={isEnrolled ? "default" : "secondary"}
                  className="px-3 py-0.5 gap-1.5 whitespace-nowrap"
                >
                  {isEnrolled ? (
                    <><CheckCircle2 className="size-3" /> Ready</>
                  ) : (
                    <><XCircle className="size-3" /> Not Setup</>
                  )}
                </Badge>
              </motion.div>
            </AnimatePresence>
          </div>
        </CardHeader>

        <CardContent className="py-8">
          <AnimatePresence mode="wait">
            {isEnrolled ? (
              <motion.div
                key="enrolled-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="size-40 rounded-full border border-border p-1 bg-muted/30 overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Face" 
                      className="size-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-accent/50 rounded-full">
                      <ScanFace className="size-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="not-enrolled-content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col items-center justify-center py-4"
              >
                <div className="size-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                  <ScanFace className="size-10" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Take a photo to start marking attendance with your face.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex gap-2 pt-4 border-t bg-muted/5">
          {isEnrolled ? (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => setModalOpen(true)}
              >
                <RefreshCcw data-icon="inline-start" />
                Change Photo
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={deleting}
                    className="rounded-xl h-11 w-11 border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  >
                    {deleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Face ID?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will not be able to mark attendance using your face until you setup again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Button
              className="w-full rounded-xl h-11"
              onClick={() => setModalOpen(true)}
            >
              <Camera data-icon="inline-start" />
              Setup Face ID
            </Button>
          )}
        </CardFooter>
      </Card>

      <AuthFaceEnrollmentModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
