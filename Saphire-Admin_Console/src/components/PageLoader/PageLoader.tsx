import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageLoader.css';

export default function PageLoader() {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start loading animation
        setIsLoading(true);
        setProgress(0);

        // Animate progress bar
        const timer1 = setTimeout(() => setProgress(30), 50);
        const timer2 = setTimeout(() => setProgress(60), 150);
        const timer3 = setTimeout(() => setProgress(90), 300);
        const timer4 = setTimeout(() => {
            setProgress(100);
            setTimeout(() => setIsLoading(false), 200);
        }, 400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [location.pathname]);

    if (!isLoading && progress === 0) return null;

    return (
        <>
            {/* Top progress bar */}
            <div className="page-loader-bar">
                <div
                    className="page-loader-progress"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Overlay with spinner (only during loading) */}
            {isLoading && progress < 100 && (
                <div className="page-loader-overlay">
                    <div className="page-loader-spinner">
                        <div className="spinner-ring" />
                        <div className="spinner-logo">S</div>
                    </div>
                </div>
            )}
        </>
    );
}
