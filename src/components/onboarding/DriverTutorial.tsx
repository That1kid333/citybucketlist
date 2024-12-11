import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  image: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to Private Rider Association',
    description: 'As a driver, you\'ll have access to exclusive ride requests from our members. Let\'s get you started with the basics.',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop'
  },
  {
    title: 'Managing Your Schedule',
    description: 'Set your availability and working hours. Toggle your status to "Available" when you\'re ready to accept rides.',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&auto=format&fit=crop'
  },
  {
    title: 'Accepting Rides',
    description: 'When a ride request comes in, you\'ll receive a notification. Review the details and accept or decline within 5 minutes.',
    image: 'https://images.unsplash.com/photo-1532939163844-547f958e91b4?w=800&auto=format&fit=crop'
  },
  {
    title: 'Completing Rides',
    description: 'After completing a ride, mark it as finished in your dashboard. Your earnings will be automatically calculated.',
    image: 'https://images.unsplash.com/photo-1471174617910-3e9c04f58ff5?w=800&auto=format&fit=crop'
  }
];

export function DriverTutorial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCompletedSteps(prev => [...prev, currentStep]);
    } else {
      // Mark all steps as completed
      const allSteps = Array.from({ length: tutorialSteps.length }, (_, i) => i);
      setCompletedSteps(allSteps);
      // Navigate to driver portal
      navigate('/driver/portal');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    // Mark all steps as completed
    const allSteps = Array.from({ length: tutorialSteps.length }, (_, i) => i);
    setCompletedSteps(allSteps);
    // Navigate to driver portal
    navigate('/driver/portal');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-neutral-800">
        <div
          className="h-full bg-[#C69249] transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
          }}
        />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Step indicators */}
          <div className="flex justify-center mb-8">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full mx-1 ${
                  completedSteps.includes(index)
                    ? 'bg-[#C69249]'
                    : index === currentStep
                    ? 'bg-white'
                    : 'bg-neutral-700'
                }`}
              />
            ))}
          </div>

          {/* Current step content */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#C69249] mb-4">
              {tutorialSteps[currentStep].title}
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
              {tutorialSteps[currentStep].description}
            </p>
            <div className="relative rounded-lg overflow-hidden mb-8 aspect-video">
              <img
                src={tutorialSteps[currentStep].image}
                alt={tutorialSteps[currentStep].title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                currentStep === 0
                  ? 'text-neutral-600 cursor-not-allowed'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            <button
              onClick={handleSkip}
              className="text-neutral-400 hover:text-white"
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 rounded-lg font-medium bg-[#C69249] hover:bg-[#C69249]/90"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
