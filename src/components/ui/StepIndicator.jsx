import { Check } from "lucide-react";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-red-600 transition-all duration-300 -z-10"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      ></div>

      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={label} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                ${
                  isActive
                    ? "bg-red-600 border-red-600 text-white"
                    : isCompleted
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                }
              `}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            <span
              className={`mt-2 text-xs font-semibold ${
                isActive || isCompleted ? "text-slate-800" : "text-gray-400"
              } hidden sm:block`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
