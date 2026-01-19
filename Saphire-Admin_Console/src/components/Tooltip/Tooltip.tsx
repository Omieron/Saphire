import { useState, useRef } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ text, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800',
    };

    return (
        <div className="relative inline-flex">
            <button
                type="button"
                className="p-1 text-[var(--color-text-secondary)] hover:text-teal-400 transition-colors"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
            >
                <Info size={14} />
            </button>
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-50 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg max-w-xs whitespace-normal ${positionClasses[position]}`}
                    style={{ minWidth: '200px' }}
                >
                    {text}
                    <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
                </div>
            )}
        </div>
    );
}
