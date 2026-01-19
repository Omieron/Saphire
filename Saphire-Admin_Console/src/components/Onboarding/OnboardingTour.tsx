import { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const TOOLTIP_WIDTH = 320;
const PADDING = 20;

export default function OnboardingTour() {
    const { isActive, currentStep, currentStepData, totalSteps, nextStep, prevStep, skipTour } = useOnboarding();
    const { t } = useLanguage();
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isPositioned, setIsPositioned] = useState(false);

    const calculateTooltipPosition = useCallback(() => {
        if (!currentStepData) return;

        // Centered modal for welcome step
        if (currentStepData.position === 'center' || !currentStepData.targetSelector) {
            setTargetRect(null);
            setTooltipStyle({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            });
            setIsPositioned(true);
            return;
        }

        const el = document.querySelector(currentStepData.targetSelector) as HTMLElement;
        if (!el) {
            setTargetRect(null);
            setTooltipStyle({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            });
            setIsPositioned(true);
            return;
        }

        const rect = el.getBoundingClientRect();
        setTargetRect(rect);

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = 0;
        let left = 0;

        // Calculate position based on preferred direction
        switch (currentStepData.position) {
            case 'right':
                top = rect.top;
                left = rect.right + PADDING;
                break;
            case 'left':
                top = rect.top;
                left = rect.left - TOOLTIP_WIDTH - PADDING;
                break;
            case 'bottom':
                top = rect.bottom + PADDING;
                left = rect.left;
                break;
            case 'top':
                top = rect.top - PADDING - 200; // Approximate tooltip height
                left = rect.left;
                break;
        }

        // Keep within viewport
        if (left + TOOLTIP_WIDTH > viewportWidth - PADDING) {
            left = viewportWidth - TOOLTIP_WIDTH - PADDING;
        }
        if (left < PADDING) {
            left = PADDING;
        }
        if (top > viewportHeight - 250) {
            top = viewportHeight - 250;
        }
        if (top < PADDING) {
            top = PADDING;
        }

        setTooltipStyle({
            top: `${top}px`,
            left: `${left}px`,
        });
        setIsPositioned(true);
    }, [currentStepData]);

    // Reset positioned state when step changes
    useLayoutEffect(() => {
        setIsPositioned(false);
    }, [currentStep]);

    useEffect(() => {
        if (!isActive) return;

        // Use requestAnimationFrame for smoother initial positioning
        const frame = requestAnimationFrame(() => {
            calculateTooltipPosition();
        });

        window.addEventListener('resize', calculateTooltipPosition);
        window.addEventListener('scroll', calculateTooltipPosition);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', calculateTooltipPosition);
            window.removeEventListener('scroll', calculateTooltipPosition);
        };
    }, [isActive, currentStep, calculateTooltipPosition]);

    if (!isActive || !currentStepData) return null;

    const stepContent: Record<string, { title: string; desc: string }> = {
        welcome: { title: t.onboarding.welcome, desc: t.onboarding.welcomeDesc },
        sidebar: { title: t.onboarding.sidebar, desc: t.onboarding.sidebarDesc },
        dashboard: { title: t.onboarding.dashboard, desc: t.onboarding.dashboardDesc },
        masterData: { title: t.onboarding.masterData, desc: t.onboarding.masterDataDesc },
        qc: { title: t.onboarding.qc, desc: t.onboarding.qcDesc },
        theme: { title: t.onboarding.theme, desc: t.onboarding.themeDesc },
        language: { title: t.onboarding.language, desc: t.onboarding.languageDesc },
    };

    const content = stepContent[currentStepData.id];
    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;

    return (
        <>
            {/* Dark overlay with spotlight cutout */}
            <svg
                className="fixed inset-0 z-[100] pointer-events-none"
                width="100%"
                height="100%"
                style={{ position: 'fixed', top: 0, left: 0 }}
            >
                <defs>
                    <mask id="tour-spotlight">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 8}
                                y={targetRect.top - 8}
                                width={targetRect.width + 16}
                                height={targetRect.height + 16}
                                rx="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.75)"
                    mask="url(#tour-spotlight)"
                />
            </svg>

            {/* Glowing border around target */}
            {targetRect && (
                <div
                    className="fixed z-[101] pointer-events-none rounded-xl"
                    style={{
                        left: targetRect.left - 8,
                        top: targetRect.top - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                        border: '2px solid rgba(20, 184, 166, 0.8)',
                        boxShadow: '0 0 20px rgba(20, 184, 166, 0.4)',
                    }}
                />
            )}

            {/* Block clicks on background */}
            <div className="fixed inset-0 z-[99]" />

            {/* Tooltip card - hidden until positioned */}
            <div
                className="fixed z-[102] transition-opacity duration-150"
                style={{
                    width: TOOLTIP_WIDTH,
                    opacity: isPositioned ? 1 : 0,
                    visibility: isPositioned ? 'visible' : 'hidden',
                    ...tooltipStyle,
                }}
            >
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header accent bar */}
                    <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

                    <div className="p-5">
                        {/* Close button */}
                        <button
                            onClick={skipTour}
                            className="absolute top-3 right-3 p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>

                        {/* Icon for welcome */}
                        {isFirstStep && (
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                                    <Sparkles size={28} className="text-white" />
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <h3 className={`text-base font-bold text-[var(--color-text)] mb-2 pr-6 ${isFirstStep ? 'text-center pr-0' : ''}`}>
                            {content?.title}
                        </h3>

                        {/* Description */}
                        <p className={`text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4 ${isFirstStep ? 'text-center' : ''}`}>
                            {content?.desc}
                        </p>

                        {/* Progress & Step counter row */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalSteps }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep
                                            ? 'w-4 bg-gradient-to-r from-teal-500 to-emerald-500'
                                            : i < currentStep
                                                ? 'w-1.5 bg-teal-400'
                                                : 'w-1.5 bg-[var(--color-border)]'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">
                                {currentStep + 1}/{totalSteps}
                            </span>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex items-center gap-2">
                            {!isFirstStep ? (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                    {t.onboarding.previous}
                                </button>
                            ) : (
                                <button
                                    onClick={skipTour}
                                    className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                                >
                                    {t.onboarding.skip}
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
                            >
                                {isLastStep ? t.onboarding.done : t.onboarding.next}
                                {!isLastStep && <ChevronRight size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
