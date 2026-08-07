import { useState } from 'react';
import { ChevronRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { EligibilityProfile, EligibilityQuestion } from '../types/eligibility';
import { getNextQuestion, calculateProgress, getCurrentStep, getAgeCategory } from '../utils/eligibilityFlow';

interface EligibilityFlowProps {
  onComplete: (profile: EligibilityProfile) => void;
}

export function EligibilityFlow({ onComplete }: EligibilityFlowProps) {
  const [profile, setProfile] = useState<EligibilityProfile>({});
  const [currentQuestion, setCurrentQuestion] = useState<EligibilityQuestion | null>(getNextQuestion(profile));
  const [inputValue, setInputValue] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const progress = calculateProgress(profile);
  const currentStep = getCurrentStep(profile);

  const handleAnswer = (value: string) => {
    setIsTransitioning(true);
    
    const updatedProfile = { ...profile };
    
    switch (currentQuestion?.id) {
      case 'age':
        const age = parseInt(value);
        updatedProfile.age = age;
        updatedProfile.ageCategory = getAgeCategory(age);
        break;
      case 'gender':
        updatedProfile.gender = value as any;
        break;
      case 'occupation':
        updatedProfile.occupation = value as any;
        break;
      case 'education_type':
        updatedProfile.educationType = value as any;
        break;
      case 'institution_type':
        updatedProfile.institutionType = value as any;
        break;
      case 'current_class':
        updatedProfile.currentClass = value;
        break;
      case 'land_ownership':
        updatedProfile.landOwnership = value === 'true';
        break;
      case 'farm_size':
        updatedProfile.farmSize = value;
        break;
      case 'irrigation_status':
        updatedProfile.irrigationStatus = value === 'true';
        break;
      case 'marital_status':
        updatedProfile.maritalStatus = value as any;
        break;
      case 'women_status':
        updatedProfile.womenStatus = value as any;
        break;
      case 'pension_status':
        updatedProfile.pensionStatus = value as any;
        break;
      case 'disability_status':
        updatedProfile.disabilityStatus = value as any;
        break;
      case 'living_status':
        updatedProfile.livingStatus = value as any;
        break;
      case 'employment_type':
        updatedProfile.employmentType = value as any;
        break;
      case 'monthly_income':
        updatedProfile.monthlyIncome = value as any;
        break;
      case 'annual_income':
        updatedProfile.annualIncome = value as any;
        break;
      case 'state':
        updatedProfile.state = value;
        break;
      case 'district':
        updatedProfile.district = value;
        break;
      case 'taluka':
        updatedProfile.taluka = value;
        break;
      case 'village':
        updatedProfile.village = value;
        break;
      case 'caste_category':
        updatedProfile.casteCategory = value as any;
        break;
      case 'minority_status':
        updatedProfile.minorityStatus = value as any;
        break;
      case 'bpl_apl_status':
        updatedProfile.bplAplStatus = value as any;
        break;
      case 'ration_card_type':
        updatedProfile.rationCardType = value as any;
        break;
    }

    setProfile(updatedProfile);
    setInputValue('');

    setTimeout(() => {
      const nextQuestion = getNextQuestion(updatedProfile);
      setCurrentQuestion(nextQuestion);
      setIsTransitioning(false);

      if (!nextQuestion) {
        onComplete(updatedProfile);
      }
    }, 300);
  };

  const handleBack = () => {
    // For simplicity, we'll restart the flow
    // In a more complex implementation, you'd track history
    setProfile({});
    setCurrentQuestion(getNextQuestion({}));
    setInputValue('');
  };

  const handleSkip = () => {
    if (currentQuestion?.id.includes('caste') || 
        currentQuestion?.id.includes('minority') || 
        currentQuestion?.id.includes('bpl') || 
        currentQuestion?.id.includes('ration')) {
      // Skip optional questions
      handleAnswer('none');
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="animate-spin text-saffron-500" size={40} />
        <p className="text-slate-600 dark:text-slate-300">Analyzing your profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
          <Sparkles className="h-4 w-4" />
          Smart Eligibility Check
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">
          Let's find the right schemes for you
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-300">
            Step {currentStep} of 8
          </span>
          <span className="font-medium text-saffron-600 dark:text-saffron-400">
            {progress}% Complete
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-saffron-500 to-orange-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="space-y-6">
          {/* Question */}
          <div>
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Answer Options */}
          {currentQuestion.type === 'choice' && currentQuestion.options && (
            <div className="grid gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="focus-ring group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-saffron-300 hover:bg-saffron-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-saffron-700 dark:hover:bg-saffron-950/20"
                >
                  <div className="relative z-10 font-medium text-slate-700 dark:text-slate-200 group-hover:text-saffron-700 dark:group-hover:text-saffron-300">
                    {option.label}
                  </div>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-saffron-500/10 to-transparent transition-transform duration-300 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'input' && (
            <div className="space-y-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    handleAnswer(inputValue.trim());
                  }
                }}
              />
              <button
                onClick={() => inputValue.trim() && handleAnswer(inputValue.trim())}
                disabled={!inputValue.trim()}
                className="focus-ring w-full rounded-2xl bg-slate-950 p-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Continue
              </button>
            </div>
          )}

          {currentQuestion.type === 'select' && currentQuestion.options && (
            <div className="space-y-3">
              <select
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Select an option</option>
                {currentQuestion.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => inputValue.trim() && handleAnswer(inputValue.trim())}
                disabled={!inputValue.trim()}
                className="focus-ring w-full rounded-2xl bg-slate-950 p-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Continue
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleBack}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <ArrowLeft size={16} />
              Start Over
            </button>

            {(currentQuestion.question.includes('(Optional)')) && (
              <button
                onClick={handleSkip}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p>I'll only ask questions relevant to your profile</p>
      </div>
    </div>
  );
}
