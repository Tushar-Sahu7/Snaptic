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
      <Card>
        <CardHeader>
          <div>

            <div>
              <div>
                <ScanFace />
              </div>

              <CardTitle>Avatar & Face Enrollment</CardTitle>
              <CardDescription>
                Register your face to save your avatar and biometric data.
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {isEnrolled ? (
                <><CheckCircle2 /> Enrolled</>
              ) : (
                <><XCircle /> Not Enrolled</>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Separator />


          {/* Enrolled State */}
          {isEnrolled && (
            <div>
              <div>
                <div>
                  <ShieldCheck />
                </div>
                <div>
                  <p>Avatar and biometric identity verified</p>
                  <p>
                    Your face is saved as your profile avatar and registered for biometric recognition.
                  </p>
                </div>
              </div>


              <div>
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(true)}
                >
                  <RefreshCcw />
                  Re-enroll Face
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 />
                      ) : (
                        <Trash2 />
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
                      >
                        Yes, remove
                      </AlertDialogAction>
                    </AlertDialogFooter>

                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {!isEnrolled && (
            <div>
              <div>
                <div>
                  <ScanFace />
                </div>
                <div>
                  <p>No face registered</p>
                  <p>
                    Enroll your face to set your profile picture and enable secure biometric features.
                    Requires camera access and takes just a few seconds.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
              >
                <Camera />
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
