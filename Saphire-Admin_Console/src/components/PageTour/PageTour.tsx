import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './PageTour.css';

export interface PageTourStep {
    id: string;
    targetSelector: string;
    titleKey: string;
    descKey: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface PageTourProps {
    pageName: string;
    steps: PageTourStep[];
    translations: Record<string, { title: string; desc: string }>;
}

const TOOLTIP_WIDTH = 300;
const PADDING = 16;

export default function PageTour({ pageName, steps, translations }: PageTourProps) {
    const { t } = useLanguage();
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isPositioned, setIsPositioned] = useState(false);

    // Check if user has seen this page tour
    useEffect(() => {
        const seenKey = `pageTour_${pageName}`;
        const hasSeen = localStorage.getItem(seenKey) === 'true';

        if (!hasSeen && steps.length > 0) {
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [pageName, steps.length]);

    const currentStepData = steps[currentStep];

    const calculatePosition = useCallback(() => {
        if (!currentStepData) return;

        const el = document.querySelector(currentStepData.targetSelector) as HTMLElement;
        if (!el) {
            setTargetRect(null);
            setIsPositioned(true);
            return;
        }

        const rect = el.getBoundingClientRect();
        setTargetRect(rect);

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const position = currentStepData.position || 'bottom';

        let top = 0;
        let left = 0;

        switch (position) {
            case 'right':
                top = rect.top + rect.height / 2 - 60;
                left = rect.right + PADDING;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - 60;
                left = rect.left - TOOLTIP_WIDTH - PADDING;
                break;
            case 'bottom':
                top = rect.bottom + PADDING;
                left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
                break;
            case 'top':
                top = rect.top - PADDING - 120;
                left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
                break;
        }

        // Keep within viewport
        if (left + TOOLTIP_WIDTH > viewportWidth - PADDING) {
            left = viewportWidth - TOOLTIP_WIDTH - PADDING;
        }
        if (left < PADDING) left = PADDING;
        if (top > viewportHeight - 150) top = viewportHeight - 150;
        if (top < PADDING) top = PADDING;

        setTooltipStyle({ top: `${top}px`, left: `${left}px` });
        setIsPositioned(true);
    }, [currentStepData]);

    useLayoutEffect(() => {
        setIsPositioned(false);
    }, [currentStep]);

    useEffect(() => {
        if (!isActive) return;

        const frame = requestAnimationFrame(() => calculatePosition());
        window.addEventListener('resize', calculatePosition);
        window.addEventListener('scroll', calculatePosition);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', calculatePosition);
            window.removeEventListener('scroll', calculatePosition);
        };
    }, [isActive, currentStep, calculatePosition]);

    const endTour = () => {
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem(`pageTour_${pageName}`, 'true');
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
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

    if (!isActive || !currentStepData) return null;

    const content = translations[currentStepData.id];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    return (
        <>
            {/* Subtle overlay */}
            <div className="page-tour-overlay" onClick={endTour} />

            {/* Target highlight */}
            {targetRect && (
                <div
                    className="page-tour-highlight"
                    style={{
                        left: targetRect.left - 4,
                        top: targetRect.top - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className="page-tour-tooltip"
                style={{
                    width: TOOLTIP_WIDTH,
                    opacity: isPositioned ? 1 : 0,
                    visibility: isPositioned ? 'visible' : 'hidden',
                    ...tooltipStyle,
                }}
            >
                <div className="page-tour-card">
                    {/* Header */}
                    <div className="page-tour-header">
                        <div className="page-tour-icon">
                            <Lightbulb size={16} />
                        </div>
                        <span className="page-tour-badge">İpucu {currentStep + 1}/{steps.length}</span>
                        <button onClick={endTour} className="page-tour-close">
                            <X size={14} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="page-tour-content">
                        <h4 className="page-tour-title">{content?.title}</h4>
                        <p className="page-tour-desc">{content?.desc}</p>
                    </div>

                    {/* Footer */}
                    <div className="page-tour-footer">
                        {!isFirstStep ? (
                            <button onClick={prevStep} className="page-tour-btn-secondary">
                                <ChevronLeft size={14} />
                            </button>
                        ) : (
                            <button onClick={endTour} className="page-tour-btn-skip">Geç</button>
                        )}
                        <button onClick={nextStep} className="page-tour-btn-primary">
                            {isLastStep ? 'Tamam' : 'İleri'}
                            {!isLastStep && <ChevronRight size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
