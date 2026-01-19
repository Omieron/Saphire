import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface OnboardingStep {
    id: string;
    targetSelector?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

// Tour steps - logical order: welcome -> sidebar sections -> header controls
const onboardingSteps: OnboardingStep[] = [
    { id: 'welcome', position: 'center' },
    { id: 'sidebar', targetSelector: 'aside', position: 'right' },
    { id: 'masterData', targetSelector: '[data-tour="master-data"]', position: 'right' },
    { id: 'qc', targetSelector: '[data-tour="qc"]', position: 'right' },
    { id: 'dashboard', targetSelector: '[data-tour="dashboard"]', position: 'bottom' },
    { id: 'language', targetSelector: '[data-tour="language"]', position: 'bottom' },
    { id: 'theme', targetSelector: '[data-tour="theme"]', position: 'bottom' },
];

interface OnboardingContextType {
    isActive: boolean;
    currentStep: number;
    currentStepData: OnboardingStep | null;
    totalSteps: number;
    startTour: () => void;
    endTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    hasSeenTour: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasSeenTour, setHasSeenTour] = useState(() => {
        return localStorage.getItem('hasSeenTour') === 'true';
    });

    useEffect(() => {
        // Auto-start tour for new users after a delay
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [hasSeenTour]);

    const startTour = () => {
        setCurrentStep(0);
        setIsActive(true);
    };

    const endTour = () => {
        setIsActive(false);
        setCurrentStep(0);
        setHasSeenTour(true);
        localStorage.setItem('hasSeenTour', 'true');
    };

    const nextStep = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const skipTour = () => {
        endTour();
    };

    const currentStepData = isActive ? onboardingSteps[currentStep] : null;

    return (
        <OnboardingContext.Provider
            value={{
                isActive,
                currentStep,
                currentStepData,
                totalSteps: onboardingSteps.length,
                startTour,
                endTour,
                nextStep,
                prevStep,
                skipTour,
                hasSeenTour,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
