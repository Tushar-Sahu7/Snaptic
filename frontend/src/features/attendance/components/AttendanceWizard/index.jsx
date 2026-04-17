import { useState, useCallback, useRef, useEffect } from "react";
import { useAttendanceSession } from "./useAttendanceSession";
import { useTimeLock } from "./useTimeLock";
import { AttendanceHeader } from "./shared/AttendanceHeader";
import { AttendanceStepper } from "./shared/AttendanceStepper";
import { ClassSelectionStep } from "./steps/ClassSelectionStep";
import { ScanStep } from "./steps/ScanStep";
import { MarkStep } from "./steps/MarkStep";
import { ReviewStep } from "./steps/ReviewStep";

export default function AttendanceWizard({
  session: initialSession,
  students = [],
  profiles = [],
  records = [],
  classes = [],
  todaySessions = {},
  onSelectClass,
}) {
  // 1. Core Logic Hook
  const {
    session,
    attendanceState,
    loading: sessionLoading,
    isSubmitted,
    absencesProcessed,
    handleMarkManual,
    handleFinishScan,
    handleSubmit,
    handleReopen,
  } = useAttendanceSession({
    initialSession,
    students,
    records,
  });

  // 1.5 Biometric Model Pre-loading
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const faceApiRef = useRef(null);

  useEffect(() => {
    async function preloadModels() {
      try {
        const faceapi = await import("@vladmandic/face-api");
        faceApiRef.current = faceapi;
        const MODEL_URL = "/models";
        // Load in sequence for potential progress tracking, though Promise.all is faster
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log("[AttendanceWizard] Biometric Models Pre-loaded");
      } catch (err) {
        console.error("Model preload failed:", err);
      }
    }
    preloadModels();
  }, []);

  // 2. Wizard State
  const [step, setStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const isManual = params.get("manual") === "true";

    if (!initialSession) return 1;

    // Finalized is always locked to review
    if (initialSession.status === "finalized") return 4;

    // If user explicitly asked for manual mode (e.g. "Update Attendance"), go to step 3
    if (isManual) return 3;

    // Default for submitted is usually review, but we already handled the explicit manual intent above
    if (initialSession.status === "submitted") return 4;

    if (initialSession.status === "ended") return 3;
    if (
      params.get("autoStart") === "true" ||
      initialSession.status === "inProgress"
    )
      return 2;

    return 1;
  });



  // 3. Time Locking Hook
  const { timeLeft, endTimeFormatted, isFinalized } = useTimeLock(
    session,
    () => {
      setStep(4); // Move to review step when time expires
    },
  );

  // 3.5 Auto-handle Manual Flag
  // We use a ref for handleFinishScan because we call it inside an effect
  // that depends on 'step', and we want the latest version of the handler
  // without re-running the effect when the handler itself is recreated.
  const handleFinishScanRef = useRef(handleFinishScan);
  useEffect(() => {
    handleFinishScanRef.current = handleFinishScan;
  }, [handleFinishScan]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isManualMode = params.get("manual") === "true";

    if (
      isManualMode &&
      session?.status === "inProgress" &&
      step === 3 &&
      !sessionLoading &&
      !absencesProcessed
    ) {
      handleFinishScanRef.current();
    }
  }, [step, session?.status, absencesProcessed, sessionLoading]);

  // 4. Intercept Stepper/Back Navigation
  const handleStepChange = useCallback(
    async (s) => {
      // If going to step 3 from step 4 and session is submitted, we must reopen
      if (s === 3 && step === 4 && session?.status === "submitted") {
        const reopened = await handleReopen();
        if (reopened) setStep(3);
      } else {
        setStep(s);
      }
    },
    [step, session?.status, isFinalized, handleReopen],
  );

  // Pre-process profiles into a lookup map for faster access in child steps
  const profileMap = (profiles || []).reduce((acc, p) => {
    if (p.userId) acc[p.userId.toString()] = p;
    return acc;
  }, {});

  const containerRef = useRef(null);

  // 4.5 Immersive Handlers
  const toggleFullscreen = useCallback(() => {
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    }
  }, []);

  const handleSelectClassWithFullscreen = useCallback(
    (cls, mode) => {
      toggleFullscreen();
      onSelectClass?.(cls, mode);
    },
    [onSelectClass, toggleFullscreen],
  );

  const handleContinueWithFullscreen = useCallback(
    (s) => {
      if (s === 2) toggleFullscreen();
      setStep(s);
    },
    [toggleFullscreen],
  );

  // 5. Render
  return (
    <div
      ref={containerRef}
    >

      {/* 1. Header & Stepper */}
      <div>

        <AttendanceHeader
          session={session}
          isFinalized={isFinalized}
          timeLeft={timeLeft}
          endTimeFormatted={endTimeFormatted}
          step={step}
        />

        <AttendanceStepper
          step={step}
          isFinalized={isFinalized}
          onStepClick={handleStepChange}
        />
      </div>

      {/* 2. Content Area */}
      <main>

        {step === 1 && (
          <ClassSelectionStep
            session={session}
            classes={classes}
            todaySessions={todaySessions}
            studentsCount={students.length}
            onSelectClass={handleSelectClassWithFullscreen}
            onContinue={handleContinueWithFullscreen}
          />
        )}

        {step === 2 && (
          <ScanStep
            session={session}
            students={students}
            profiles={profileMap}
            attendanceState={attendanceState}
            isFinalized={isFinalized}
            loading={sessionLoading}
            modelsLoaded={modelsLoaded}
            faceApi={faceApiRef.current}
            onMarkPresent={(id) => handleMarkManual(id, "present", "face")}
            onComplete={async () => {
              await handleFinishScan();
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <MarkStep
            students={students}
            profiles={profileMap}
            attendanceState={attendanceState}
            isFinalized={isFinalized}
            loading={sessionLoading}
            onMarkManual={handleMarkManual}
            onBackToScan={() => handleStepChange(2)}
            onConfirm={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <ReviewStep
            session={session}
            students={students}
            profiles={profileMap}
            attendanceState={attendanceState}
            isFinalized={isFinalized}
            isSubmitted={isSubmitted}
            loading={sessionLoading}
            onSubmit={handleSubmit}
            onToggleStatus={handleMarkManual}
            onEdit={() => handleStepChange(3)}
          />
        )}
      </main>


    </div>
  );
}
