import { useState } from 'react';

interface TutorialStep {
  title: string;
  description: string;
  videoUrl?: string;
}

export function DriverTutorial() {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Our Platform",
      description: "Learn how to get started as a driver partner.",
      videoUrl: "https://example.com/welcome-video"
    },
    {
      title: "Using the Driver App",
      description: "Essential features and navigation guide.",
      videoUrl: "https://example.com/app-tutorial"
    },
    {
      title: "Best Practices",
      description: "Tips for providing excellent service.",
      videoUrl: "https://example.com/best-practices"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-neutral-900 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-[#F5A623] mb-6">
          {tutorialSteps[currentStep].title}
        </h2>
        
        <p className="text-neutral-300 mb-8">
          {tutorialSteps[currentStep].description}
        </p>

        {tutorialSteps[currentStep].videoUrl && (
          <div className="aspect-w-16 aspect-h-9 mb-8">
            <iframe
              src={tutorialSteps[currentStep].videoUrl}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-2 bg-neutral-800 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentStep === tutorialSteps.length - 1}
            className="px-6 py-2 bg-[#F5A623] text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
