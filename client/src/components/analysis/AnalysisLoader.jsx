import React, { useState, useEffect } from 'react';

const getSteps = (provider) => [
  "📄 Extracting resume content...",
  "🔍 Analyzing job requirements...",
  provider === 'gemini'
    ? "☁️ Sending to Google Gemini..."
    : "🧠 Running AI analysis on your device...",
  "✍️ Generating recommendations...",
  "✅ Finalizing results..."
];

export default function AnalysisLoader({ isAnalyzing, isSuccess, onComplete, provider = 'ollama' }) {
  const steps = getSteps(provider);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

  useEffect(() => {
    if (!isAnalyzing) return;

    // Step progression logic
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 2) { 
          return prev + 1;
        }
        return prev;
      });
    }, 7000); 

    // Fake progress bar logic
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 5 + 1;
        return Math.min(prev + increment, 90);
      });
    }, 1000);

    // Long wait message
    const longWaitTimeout = setTimeout(() => {
      setShowLongWaitMessage(true);
    }, 40000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(longWaitTimeout);
    };
  }, [isAnalyzing, steps.length]);

  // Handle completion navigation
  useEffect(() => {
    if (isSuccess && onComplete) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isSuccess, onComplete]);

  // Derived state for display
  const activeStepIndex = isSuccess ? steps.length - 1 : currentStep;
  const activeProgress = isSuccess ? 100 : progress;

  // Only show the loader when analyzing or when finishing on success
  if (!isAnalyzing && !isSuccess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F16]/90 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-[#1E1E2E] border border-[#2D2D3F] shadow-2xl flex flex-col items-center text-center">
        {/* Animated Icon / Spinner */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-[#6366F1]/20 rounded-full blur-xl animate-pulse"></div>
          {isSuccess ? (
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 relative z-10 transition-all duration-500 scale-110">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full border-4 border-[#2D2D3F] border-t-[#6366F1] animate-spin relative z-10"></div>
          )}
        </div>

        {/* Step Text */}
        <div className="h-10 flex items-center justify-center mb-6 w-full relative">
          {isSuccess ? (
            <h2 className="text-2xl font-bold font-['Syne'] text-emerald-400 opacity-100 transition-opacity duration-500">
              ✨ Analysis complete
            </h2>
          ) : (
            <div className="relative w-full overflow-hidden h-full flex items-center justify-center">
              {steps.map((step, index) => (
                <h2
                  key={step}
                  className={`absolute text-xl font-medium text-[#F1F5F9] transition-all duration-500 transform ${
                    index === activeStepIndex 
                      ? 'opacity-100 translate-y-0' 
                      : index < activeStepIndex 
                        ? 'opacity-0 -translate-y-8' 
                        : 'opacity-0 translate-y-8'
                  }`}
                >
                  {step}
                  {index === activeStepIndex && (
                    <span className="inline-flex ml-1">
                      <span className="animate-[pulse_1s_infinite]">.</span>
                      <span className="animate-[pulse_1s_infinite_200ms]">.</span>
                      <span className="animate-[pulse_1s_infinite_400ms]">.</span>
                    </span>
                  )}
                </h2>
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#0F0F16] rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full transition-all duration-300 ease-out rounded-full ${
              isSuccess ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5]'
            }`}
            style={{ width: `${activeProgress}%` }}
          />
        </div>

        {/* Subtext area */}
        <div className="h-12 w-full flex flex-col items-center justify-start text-sm text-[#94A3B8]">
          {!isSuccess && currentStep >= 2 ? (
            <p className="flex items-center gap-2 opacity-100 transition-opacity duration-500">
              {provider === 'gemini' ? (
                <>
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  Sending securely to Google Gemini
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Processing privately on your device
                </>
              )}
            </p>
          ) : (
             <div className="h-5"></div>
          )}
          
          {!isSuccess && showLongWaitMessage && (
            <p className="text-amber-400/80 mt-1 opacity-100 transition-opacity duration-500">
              Still working… this may take up to a minute
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
