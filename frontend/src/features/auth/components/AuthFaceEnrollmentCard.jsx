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
      <Card className="rounded-2xl border shadow-sm h-full">
        <CardHeader className="pb-3 px-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <ScanFace className="size-5" />
              </div>
              <CardTitle>Avatar & Face Enrollment</CardTitle>
              <CardDescription>
                Register your face to save your avatar and biometric data.
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className={`shrink-0 gap-1.5 py-1 px-3 mt-1 ${
                isEnrolled
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}
            >
              {isEnrolled ? (
                <><CheckCircle2 className="size-3" /> Enrolled</>
              ) : (
                <><XCircle className="size-3" /> Not Enrolled</>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
          <Separator className="mb-6 opacity-60" />

          {/* Enrolled State */}
          {isEnrolled && (
            <div className="space-y-5">
              <div className="flex items-start gap-4 rounded-xl border bg-emerald-500/5 p-4 sm:p-5">
                <div className="size-10 sm:size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 sm:size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold">Avatar and biometric identity verified</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your face is saved as your profile avatar and registered for biometric recognition.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 h-12 rounded-xl font-semibold"
                  onClick={() => setModalOpen(true)}
                >
                  <RefreshCcw className="size-4 mr-2" />
                  Re-enroll Face
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-12 rounded-xl font-semibold text-destructive border-destructive/30 hover:bg-destructive/5"
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
                      <AlertDialogTitle>Remove face enrollment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete your biometric data. You won't be able to
                        use face recognition for attendance until you re-enroll.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-4 py-6 sm:py-8 rounded-xl border border-dashed bg-muted/30">
                <div className="size-14 sm:size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ScanFace className="size-7 sm:size-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-4 sm:px-6">
                  <p className="text-sm font-semibold">No face registered</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                    Enroll your face to set your profile picture and enable secure biometric features.
                    Requires camera access and takes just a few seconds.
                  </p>
                </div>
              </div>

              <Button
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/10 transition-colors"
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
