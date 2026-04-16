import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import AuthFaceEnrollmentModal from "./AuthFaceEnrollmentModal";

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
      <Card className="rounded-xl border border-border bg-card shadow-sm h-full">
        <CardHeader className="pb-3 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-2">
                <ScanFace className="size-5" />
              </div>
              <CardTitle className="text-heading-3">Avatar & Face Enrollment</CardTitle>
              <CardDescription className="text-body text-muted-foreground">
                Register your face to save your avatar and biometric data.
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 gap-1.5 py-1 px-3 mt-1",
                isEnrolled
                  ? "bg-success-50 text-success-700 dark:bg-success-950/30 dark:text-success-400 border-success-200 dark:border-success-800/20"
                  : "bg-warning-50 text-warning-700 dark:bg-warning-950/30 dark:text-warning-400 border-warning-200 dark:border-warning-800/20"
              )}
            >
              {isEnrolled ? (
                <><CheckCircle2 className="size-3" /> Enrolled</>
              ) : (
                <><XCircle className="size-3" /> Not Enrolled</>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 pt-0 pb-6 sm:pb-8">
          <Separator className="mb-6 opacity-60" />

          {/* Enrolled State */}
          {isEnrolled && (
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border border-success-200 bg-success-50/50 p-4 dark:border-success-800/20 dark:bg-success-950/10">
                <div className="size-10 rounded-md bg-success-100 dark:bg-success-900/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 text-success-600 dark:text-success-400" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-body-bold">Avatar and biometric identity verified</p>
                  <p className="text-caption text-muted-foreground leading-relaxed">
                    Your face is saved as your profile avatar and registered for biometric recognition.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 h-10 rounded-md text-body-bold"
                  onClick={() => setModalOpen(true)}
                >
                  <RefreshCcw className="size-4 mr-2" />
                  Re-enroll Face
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-10 rounded-md text-body-bold text-destructive hover:bg-destructive/10"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="size-4 mr-2" />
                      )}
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-heading-3">Remove face enrollment?</AlertDialogTitle>
                      <AlertDialogDescription className="text-body">
                        This will delete your biometric data. You won't be able to
                        use face recognition for attendance until you re-enroll.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive-600 rounded-md"
                      >
                        Yes, remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {/* Not Enrolled State */}
          {!isEnrolled && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-8 rounded-lg border border-dashed border-border bg-muted/20">
                <div className="size-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <ScanFace className="size-7 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="text-center space-y-1 px-6">
                  <p className="text-body-bold">No face registered</p>
                  <p className="text-caption text-muted-foreground leading-relaxed max-w-xs">
                    Enroll your face to set your profile picture and enable secure biometric features.
                    Requires camera access and takes just a few seconds.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full rounded-md text-body-bold shadow-xs active:scale-97 duration-feedback"
                onClick={() => setModalOpen(true)}
              >
                <Camera className="size-5 mr-2" />
                Enroll Face
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Face Enrollment Modal */}
      <AuthFaceEnrollmentModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
