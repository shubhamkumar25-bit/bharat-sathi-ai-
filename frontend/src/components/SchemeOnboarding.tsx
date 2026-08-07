import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { EligibilityProfile, EligibilityQuestion } from '../types/eligibility';
import { getOnboardingQuestions, getNextOnboardingQuestion, getOnboardingProgress } from '../utils/onboardingFlow';

interface SchemeOnboardingProps {
  onComplete: (profile: EligibilityProfile) => void;
  onSkip: () => void;
}

export function SchemeOnboarding({ onComplete, onSkip }: SchemeOnboardingProps) {
  const [profile, setProfile] = useState<EligibilityProfile>({});
  const [currentQuestion, setCurrentQuestion] = useState<EligibilityQuestion | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState<{ profile: EligibilityProfile; index: number }[]>([]);

  useEffect(() => {
    const nextQuestion = getNextOnboardingQuestion(profile, 0);
    setCurrentQuestion(nextQuestion);
  }, []);

  const handleAnswer = (value: string | boolean) => {
    const updatedProfile = { ...profile };
    
    if (currentQuestion) {
      switch (currentQuestion.id) {
        case 'name':
          updatedProfile.name = value as string;
          break;
        case 'age':
          updatedProfile.age = parseInt(value as string);
          break;
        case 'gender':
          updatedProfile.gender = value as any;
          break;
        case 'maritalStatus':
          updatedProfile.maritalStatus = value as any;
          break;
        case 'state':
          updatedProfile.state = value as string;
          break;
        case 'district':
          updatedProfile.district = value as string;
          break;
        case 'areaType':
          updatedProfile.areaType = value as any;
          break;
        case 'casteCategory':
          updatedProfile.casteCategory = value as any;
          break;
        case 'minorityStatus':
          updatedProfile.minorityStatus = value as any;
          break;
        case 'disabilityStatus':
          updatedProfile.disabilityStatus = value as any;
          break;
        case 'occupation':
          updatedProfile.occupation = value as any;
          break;
        // Student-specific
        case 'educationLevel':
          updatedProfile.educationLevel = value as any;
          break;
        case 'courseStream':
          updatedProfile.courseStream = value as any;
          break;
        case 'institutionType':
          updatedProfile.institutionType = value as any;
          break;
        // Farmer-specific
        case 'landOwnership':
          updatedProfile.landOwnership = value as any;
          break;
        case 'landSize':
          updatedProfile.landSize = value as any;
          break;
        case 'farmingType':
          updatedProfile.farmingType = value as any;
          break;
        // Employee-specific
        case 'employmentType':
          updatedProfile.employmentType = value as any;
          break;
        case 'employmentSector':
          updatedProfile.employmentSector = value as any;
          break;
        // Entrepreneur-specific
        case 'businessType':
          updatedProfile.businessType = value as any;
          break;
        case 'businessStage':
          updatedProfile.businessStage = value as any;
          break;
        case 'msmeStatus':
          updatedProfile.msmeStatus = value as any;
          break;
        // Unemployed-specific
        case 'unemployedEducation':
          updatedProfile.unemployedEducation = value as any;
          break;
        case 'skills':
          updatedProfile.skills = value as any;
          break;
        case 'employmentPreference':
          updatedProfile.employmentPreference = value as any;
          break;
        // Income
        case 'annualIncome':
          updatedProfile.annualIncome = value as any;
          break;
        // Additional context
        case 'hasDependents':
          updatedProfile.hasDependents = value as boolean;
          break;
        case 'seekingScholarship':
          updatedProfile.seekingScholarship = value as boolean;
          break;
        case 'seekingEmployment':
          updatedProfile.seekingEmployment = value as boolean;
          break;
        case 'seekingHousing':
          updatedProfile.seekingHousing = value as boolean;
          break;
        case 'seekingHealthcare':
          updatedProfile.seekingHealthcare = value as boolean;
          break;
        case 'seekingFinancialAssistance':
          updatedProfile.seekingFinancialAssistance = value as boolean;
          break;
        case 'seekingPension':
          updatedProfile.seekingPension = value as boolean;
          break;
      }
    }

    // Save current state to history before moving forward
    setHistory([...history, { profile: { ...profile }, index: currentIndex }]);
    setProfile(updatedProfile);
    
    // Move to next question
    const nextIndex = currentIndex + 1;
    const nextQuestion = getNextOnboardingQuestion(updatedProfile, nextIndex);
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setCurrentIndex(nextIndex);
    } else {
      // All questions answered
      handleSubmit(updatedProfile);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setProfile(previousState.profile);
      setCurrentIndex(previousState.index);
      const previousQuestion = getNextOnboardingQuestion(previousState.profile, previousState.index);
      setCurrentQuestion(previousQuestion);
    }
  };

  const handleSkip = () => {
    // Skip to show all schemes with empty profile
    onComplete({});
  };

  const handleSubmit = (finalProfile: EligibilityProfile) => {
    setIsLoading(true);
    setShowResults(true);
    
    // Simulate processing time
    setTimeout(() => {
      onComplete(finalProfile);
    }, 1500);
  };

  const progress = getOnboardingProgress(profile);

  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="animate-spin mb-4">
          <Sparkles className="w-12 h-12 text-saffron-500" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-2">
          Finding schemes for you...
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Matching your profile with government schemes
        </p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-slate-600 dark:text-slate-300">
          Please complete all questions to find schemes.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400 mb-4">
          <ShieldCheck className="h-4 w-4" />
          Government Schemes
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white mb-3">
          Find Government Schemes You May Be Eligible For
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Answer a few simple questions and Bharat Sathi AI will find relevant government schemes for you.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Step {currentQuestion.step} of {currentQuestion.totalSteps} — {getStepTitle(currentQuestion.step)}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {progress.current} of {progress.total} completed
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-800">
          <div
            className="bg-saffron-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 dark:text-white mb-6">
          {currentQuestion.question}
        </h2>

        {/* Input Type: Choice */}
        {currentQuestion.type === 'choice' && currentQuestion.options && (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="focus-ring text-left p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-saffron-500 hover:bg-saffron-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-saffron-500 dark:hover:bg-saffron-950/20 transition-all"
              >
                <span className="text-base sm:text-lg font-medium text-slate-950 dark:text-white">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Input Type: Input */}
        {currentQuestion.type === 'input' && (
          <div>
            <input
              type={currentQuestion.id === 'age' ? 'number' : 'text'}
              placeholder={currentQuestion.placeholder}
              className="focus-ring w-full p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-lg text-slate-950 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  handleAnswer(e.currentTarget.value);
                }
              }}
              autoFocus
            />
            <button
              onClick={() => {
                const input = document.querySelector('input') as HTMLInputElement;
                if (input?.value) {
                  handleAnswer(input.value);
                }
              }}
              className="mt-4 w-full sm:w-auto px-6 py-3 bg-saffron-500 text-white font-semibold rounded-2xl hover:bg-saffron-600 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Input Type: Select */}
        {currentQuestion.type === 'select' && currentQuestion.options && (
          <div>
            <select
              className="focus-ring w-full p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 text-lg text-slate-950 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              onChange={(e) => handleAnswer(e.target.value)}
              autoFocus
            >
              <option value="">Select an option</option>
              {currentQuestion.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Privacy Message */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-6 dark:bg-slate-800">
        <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
          <ShieldCheck className="inline h-4 w-4 mr-1 text-saffron-500" />
          Your information is used only to identify government schemes that may be relevant to you. You can skip questions that are not required.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleBack}
          className="focus-ring flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="inline h-5 w-5 mr-2" />
          Back
        </button>
        <button
          onClick={handleSkip}
          className="focus-ring flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          Skip & Explore All Schemes
        </button>
      </div>
    </div>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return 'Basic Information';
    case 2:
      return 'Location';
    case 3:
      return 'Social/Economic Eligibility';
    case 4:
      return 'Education & Employment';
    case 5:
      return 'Family & Income';
    case 6:
      return 'Additional Information';
    default:
      return 'Information';
  }
}
