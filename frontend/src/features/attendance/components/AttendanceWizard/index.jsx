import { useState, useCallback, useRef, useEffect } from "react";
import { useAttendanceSession } from "./useAttendanceSession";
import { useTimeLock } from "./useTimeLock";
import { useNavigate } from "react-router";

import { AttendanceStepper } from "./shared/AttendanceStepper";
import { ClassSelectionStep } from "./steps/ClassSelectionStep";
import { ScanStep } from "./steps/ScanStep";
import { MarkStep } from "./steps/MarkStep";
import { ReviewStep } from "./steps/ReviewStep";
import { AnimatePresence, motion } from "motion/react";

const EMPTY_ARRAY = [];

export default function AttendanceWizard({
  session: initialSession,
  students = EMPTY_ARRAY,
  profiles = EMPTY_ARRAY,
  records = EMPTY_ARRAY,
  classes = EMPTY_ARRAY,
  todaySessions = {},
  onSelectClass,
  autoStart = false,
  manual = false,
}) {
  const navigate = useNavigate();
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
    if (!initialSession) return 1;

    // 1. Finalized sessions always go to review
    if (initialSession.status === "finalized") return 4;
    
    // 2. If manual mode requested, go to manual mark (even if submitted, as we allow updates)
    if (manual) return 3;

    // 3. Submitted sessions go to review (if not manual)
    if (initialSession.status === "submitted") return 4;

    // 4. In-progress sessions go to scan
    if (autoStart || initialSession.status === "inprogress") return 2;

    return 1;
  });

  // 3. Time Locking Hook - Now only driven by backend status
  const { isFinalized } = useTimeLock(session);

  // 3.5 Auto-handle Manual Flag
  // We use a ref for handleFinishScan because we call it inside an effect

  // that depends on 'step', and we want the latest version of the handler
  // without re-running the effect when the handler itself is recreated.
  const handleFinishScanRef = useRef(handleFinishScan);
  useEffect(() => {
    handleFinishScanRef.current = handleFinishScan;
  }, [handleFinishScan]);

  useEffect(() => {
    if (
      manual &&
      session?.status === "inprogress" &&
      step === 3 &&
      !sessionLoading &&
      !absencesProcessed
    ) {
      handleFinishScanRef.current();
    }
  }, [step, session?.status, absencesProcessed, sessionLoading, manual]);

  // 4. Intercept Stepper/Back Navigation
  const handleStepChange = useCallback(
    async (s) => {
      // If going to step 1, we should clear the class selection via URL
      if (s === 1) {
        navigate("/teacher/take-attendance");
        return;
      }

      // If going to step 3 from step 4 and session is submitted, we must reopen
      if (s === 3 && step === 4 && session?.status === "submitted") {
        const reopened = await handleReopen();
        if (reopened) setStep(3);
      } else {
        setStep(s);
      }
    },
    [step, session?.status, isFinalized, handleReopen, navigate],
  );

  // Pre-process profiles into a lookup map for faster access in child steps
  const profileMap = (profiles || []).reduce((acc, p) => {
    if (p.userId) acc[p.userId.toString()] = p;
    return acc;
  }, {});

  const containerRef = useRef(null);

  // 5. Render
  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background flex flex-col"
    >


      <AttendanceStepper
        step={step}
        isFinalized={isFinalized}
        isSubmitted={isSubmitted}
        onStepClick={handleStepChange}
      />

      {/* 2. Content Area */}
      <main className="flex-1 flex flex-col relative">
        <div className="container mx-auto px-8 py-4 flex-1 flex flex-col relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 1.02 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 1,
                opacity: { duration: 0.3 }
              }}
              className="flex-1 flex flex-col"
            >
              {step === 1 && (
                <ClassSelectionStep
                  session={session}
                  classes={classes}
                  todaySessions={todaySessions}
                  studentsCount={students.length}
                  onSelectClass={onSelectClass}
                  onContinue={setStep}
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
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
