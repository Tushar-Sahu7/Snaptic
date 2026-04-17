import { CheckCircle2 } from "lucide-react";


export const AttendanceStepper = ({ step, isFinalized, onStepClick }) => {
  const steps = [
    { id: 1, label: "Select", short: "Select" },
    { id: 2, label: "Scan", short: "Scan" },
    { id: 3, label: "Mark", short: "Mark" },
    { id: 4, label: "Review & Submit", short: "Review" },
  ];

  return (
    <div>

      {/* Background Line */}
      <div>

        <div
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      <div>

        {steps.map((s, idx) => {
          const isCompleted = step > s.id;
          const isActive = step === s.id;
          const isClickable =
            !isFinalized &&
            step !== s.id &&
            (s.id < step ||
              (s.id === 2 && step === 3) ||
              (s.id === 3 && step === 4));

          return (
            <button
              key={s.id}
              disabled={!isClickable}
              onClick={() => onStepClick(s.id)}
            >

              <div>
                {isCompleted ? (
                  <CheckCircle2 />
                ) : (
                  s.id
                )}
              </div>

              <span>
                <span>{s.label}</span>
                <span>{s.short}</span>
              </span>
            </button>

          );
        })}
      </div>
    </div>
  );
};
