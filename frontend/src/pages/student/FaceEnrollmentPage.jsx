import AuthFaceEnrollmentCard from "@/features/auth/components/AuthFaceEnrollmentCard";

export default function FaceEnrollmentPage() {
  return (
    <div>

      <div>

        <h1>Face Enrollment</h1>

        <p>
          Register your face for biometric attendance verification.
        </p>

      </div>
      <AuthFaceEnrollmentCard />
    </div>
  );
}
