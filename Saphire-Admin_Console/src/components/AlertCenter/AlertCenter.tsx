import { useState, useRef, useEffect } from 'react';
import { Bell, X, Info, AlertTriangle, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import type { AppAlert } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AlertCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const { alerts, hasNewAlerts, markAsSeen, removeAlert, clearAlerts } = useNotifications();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!isOpen) {
            markAsSeen();
        }
        setIsOpen(!isOpen);
    };

    const handleAlertClick = (alert: AppAlert) => {
        if (alert.targetUrl) {
            navigate(alert.targetUrl);
            setIsOpen(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={18} />;
            case 'warning': return <AlertTriangle className="text-orange-500" size={18} />;
            case 'error': return <AlertCircle className="text-red-500" size={18} />;
            default: return <Info className="text-teal-500" size={18} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors relative group"
                title={t.common.notifications || 'Bildirimler'}
            >
                <Bell size={18} className="text-[var(--color-text-secondary)] group-hover:text-teal-500 transition-colors" />
                {hasNewAlerts && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-[var(--color-surface)] rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-teal-500/5">
                        <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                            <Bell size={16} className="text-teal-500" />
                            {t.common.notifications || 'Bildirimler'}
                        </h3>
                        {alerts.length > 0 && (
                            <button
                                onClick={clearAlerts}
                                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wider"
                            >
                                {t.common.clearAll || 'Tümünü Temizle'}
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="p-10 text-center space-y-2">
                                <div className="w-12 h-12 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto">
                                    <Bell size={20} className="text-[var(--color-text-secondary)] opacity-20" />
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                                    {t.common.noNotifications || 'Yeni bildirim yok'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--color-border)]">
                                {alerts.sort((a, b) => b.createdAt - a.createdAt).map((alert) => (
                                    <div
                                        key={alert.id}
                                        onClick={() => handleAlertClick(alert)}
                                        className={`p-4 flex gap-3 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer group ${alert.targetUrl ? 'active:scale-[0.98]' : ''}`}
                                    >
                                        <div className="mt-0.5">{getIcon(alert.type)}</div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs text-[var(--color-text)] leading-relaxed font-medium">
                                                {alert.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-[var(--color-text-secondary)] opacity-60">
                                                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {alert.targetUrl && (
                                                    <span className="text-[10px] text-teal-500 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {t.common.view || 'Görüntüle'}
                                                        <ExternalLink size={10} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeAlert(alert.id);
                                            }}
                                            className="p-1 h-fit text-[var(--color-text-secondary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-500/10"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
