import { useLanguage } from '../contexts/LanguageContext';

interface LoadingScreenProps {
    onComplete?: () => void;
    minDuration?: number;
}

export default function LoadingScreen({ onComplete, minDuration = 1000 }: LoadingScreenProps) {
    const { t } = useLanguage();

    // Auto-complete after minimum duration
    if (onComplete) {
        setTimeout(onComplete, minDuration);
    }

    return (
        <div className="loading-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 via-emerald-500 to-teal-700">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Logo/Icon */}
            <div className="relative z-10 flex flex-col items-center">
                {/* App Icon */}
                <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm animate-bounce-slow">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-12 h-12 text-white"
                    >
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    {t.loading.title}
                </h1>
                <p className="text-white/80 text-lg mb-8">
                    {t.loading.subtitle}
                </p>

                {/* Loading indicator */}
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>

                <p className="text-white/60 text-sm mt-4">
                    {t.loading.preparing}
                </p>
            </div>

            {/* Custom animation styles */}
            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
