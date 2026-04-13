import AuthFaceEnrollmentCard from "@/features/auth/components/AuthFaceEnrollmentCard";

export default function FaceEnrollmentPage() {
  return (
    <div className="flex flex-col gap-6 max-w-xl w-full pb-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight">Face Enrollment</h1>
        <p className="text-sm text-muted-foreground">
          Register your face for biometric attendance verification.
        </p>
      </div>
      <AuthFaceEnrollmentCard />
    </div>
  );
}
