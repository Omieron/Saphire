import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { templateApi, recordApi, taskAssignmentApi } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal';
import Header from '../../components/Header';

// Types
interface Field {
    id: number;
    fieldKey: string;
    label: string;
    inputType: string;
    targetValue?: number;
    minValue?: number;
    maxValue?: number;
    required: boolean;
    options?: string | string[];
    unit?: string;
}

interface Section {
    id: number;
    name: string;
    displayOrder: number;
    isRepeatable: boolean;
    repeatCount?: number;
    fields: Field[];
}

interface Template {
    id: number;
    name: string;
    sections: Section[];
}

// Helper Components
function PassFailButton({ value, onChange, labels }: { value: boolean | null; onChange: (v: boolean) => void; labels: { yes: string; no: string } }) {
    return (
        <div className="grid grid-cols-2 gap-2 mt-1">
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`py-2 px-3 rounded-lg font-black text-[11px] uppercase tracking-tighter transition-all active:scale-95 border-2 ${value === true
                    ? 'bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-500/20'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-teal-500/30'
                    }`}
            >
                ✓ {labels.yes}
            </button>
            <button
                type="button"
                onClick={() => onChange(false)}
                className={`py-2 px-3 rounded-lg font-black text-[11px] uppercase tracking-tighter transition-all active:scale-95 border-2 ${value === false
                    ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/20'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-red-500/30'
                    }`}
            >
                ✗ {labels.no}
            </button>
        </div>
    );
}

function NumericInput({ value, onChange, field, placeholder }: { value: string; onChange: (v: string) => void; field: Field; placeholder?: string }) {
    return (
        <div className="space-y-1.5 mt-1">
            <div className="relative">
                <input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || '—'}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:border-teal-500 bg-[var(--color-bg)] text-[var(--color-text)] font-bold placeholder:text-[var(--color-text-secondary)] outline-none transition-all"
                />
                {field.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[var(--color-text-secondary)]">
                        {field.unit}
                    </span>
                )}
            </div>
            {(field.minValue !== undefined || field.maxValue !== undefined) && (
                <div className="flex gap-2 text-[8px] font-bold tracking-widest uppercase text-[var(--color-text-secondary)] px-1">
                    {field.minValue !== undefined && <span>Min: {field.minValue}</span>}
                    {field.maxValue !== undefined && <span>Max: {field.maxValue}</span>}
                    {field.targetValue !== undefined && <span className="text-teal-500">Tar: {field.targetValue}</span>}
                </div>
            )}
        </div>
    );
}

export default function QcEntry() {
    const { templateId } = useParams();
    const [searchParams] = useSearchParams();
    const machineId = searchParams.get('machineId');
    const productId = searchParams.get('productId');
    const taskId = searchParams.get('taskId');
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [now, setNow] = useState(new Date());
    const [taskEndTime, setTaskEndTime] = useState<Date | null>(null);
    const [isGracePeriod, setIsGracePeriod] = useState(false);
    const [graceSeconds, setGraceSeconds] = useState(600); // 10 minutes
    const [isExpired, setIsExpired] = useState(false);
    const [showGraceModal, setShowGraceModal] = useState(false);
    const [showHardExpiryModal, setShowHardExpiryModal] = useState(false);

    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [values, setValues] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [selectedSampleNum, setSelectedSampleNum] = useState<number | null>(null);
    const [showBackConfirm, setShowBackConfirm] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    useEffect(() => {
        if (templateId) {
            templateApi.getById(parseInt(templateId))
                .then(res => setTemplate(res.data.data))
                .catch(err => console.error('Template fetch error:', err))
                .finally(() => setLoading(false));

            if (taskId) {
                taskAssignmentApi.getById(parseInt(taskId))
                    .then((res: any) => {
                        const task = res.data.data;
                        if (task && task.schedules) {
                            const currentDay = now.getDay() === 0 ? 7 : now.getDay();
                            const todayStr = now.toISOString().split('T')[0];
                            const schedule = task.schedules.find((s: any) =>
                                (s.dayOfWeek === currentDay) || (s.specificDate === todayStr)
                            );
                            if (schedule) {
                                const [h, m] = schedule.endTime.split(':').map(Number);
                                const end = new Date();
                                end.setHours(h, m, 0, 0);
                                setTaskEndTime(end);

                                // Check if already in grace period upon landing
                                if (now > end) {
                                    const diffSeconds = Math.floor((now.getTime() - end.getTime()) / 1000);
                                    if (diffSeconds < 600) {
                                        setIsGracePeriod(true);
                                        setShowGraceModal(true);
                                        setGraceSeconds(600 - diffSeconds);
                                    } else {
                                        setIsExpired(true);
                                        setShowHardExpiryModal(true);
                                    }
                                }
                            }
                        }
                    })
                    .catch((e: any) => console.error('Task fetch error:', e));
            }
        }
    }, [templateId, taskId]);

    useEffect(() => {
        if (templateId && machineId) {
            const saved = localStorage.getItem(`qc_draft_${templateId}_${machineId}`);
            if (saved) {
                try {
                    setValues(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to load draft');
                }
            }
        }
    }, [templateId, machineId]);

    useEffect(() => {
        if (templateId && machineId && Object.keys(values).length > 0) {
            localStorage.setItem(`qc_draft_${templateId}_${machineId}`, JSON.stringify(values));
        }
    }, [values, templateId, machineId]);

    useEffect(() => {
        const timer = setInterval(() => {
            const currentNow = new Date();
            setNow(currentNow);

            if (taskEndTime && !isExpired) {
                if (currentNow > taskEndTime) {
                    if (!isGracePeriod) {
                        setIsGracePeriod(true);
                        setShowGraceModal(true);
                    } else {
                        setGraceSeconds(prev => {
                            if (prev <= 1) {
                                setIsExpired(true);
                                setShowHardExpiryModal(true);
                                return 0;
                            }
                            return prev - 1;
                        });
                    }
                }
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [taskEndTime, isGracePeriod, isExpired, templateId]); // templateId added to force reset if needed

    const updateValue = useCallback((key: string, val: any) => {
        setValues(prev => ({ ...prev, [key]: val }));
    }, []);

    const getSampleStatus = useCallback((sectionId: number, sampleNum: number): 'empty' | 'partial' | 'passed' | 'failed' => {
        const section = template?.sections.find(s => s.id === sectionId);
        if (!section) return 'empty';

        let filled = 0;
        let hasFailed = false;

        section.fields.forEach(field => {
            const key = `${field.fieldKey}_sample_${sampleNum}`;
            const val = values[key];

            if (val !== undefined && val !== null && val !== '') {
                filled++;
                const inputType = (field.inputType || '').toUpperCase();
                if ((inputType === 'PASS_FAIL' || inputType === 'PASSFAIL' || inputType === 'BOOLEAN') && val === false) {
                    hasFailed = true;
                }
                if ((inputType === 'NUMERIC' || inputType === 'NUMBER' || inputType === 'DECIMAL')) {
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal)) {
                        if ((field.minValue !== undefined && numVal < field.minValue) ||
                            (field.maxValue !== undefined && numVal > field.maxValue)) {
                            hasFailed = true;
                        }
                    }
                }
            }
        });

        if (filled === 0) return 'empty';
        if (hasFailed) return 'failed';
        if (filled < section.fields.length) return 'partial';
        return 'passed';
    }, [template, values]);

    const getProgress = useCallback(() => {
        if (!template) return { filled: 0, total: 0 };
        let filled = 0;
        let total = 0;

        template.sections.forEach(section => {
            if (section.isRepeatable && section.repeatCount && section.repeatCount > 1) {
                for (let i = 1; i <= section.repeatCount; i++) {
                    section.fields.forEach(field => {
                        total++;
                        if (values[`${field.fieldKey}_sample_${i}`] !== undefined && values[`${field.fieldKey}_sample_${i}`] !== null && values[`${field.fieldKey}_sample_${i}`] !== '') {
                            filled++;
                        }
                    });
                }
            } else {
                section.fields.forEach(field => {
                    total++;
                    if (values[field.fieldKey] !== undefined && values[field.fieldKey] !== null && values[field.fieldKey] !== '') {
                        filled++;
                    }
                });
            }
        });
        return { filled, total };
    }, [template, values]);

    const handleBack = () => {
        if (Object.keys(values).length > 0) setShowBackConfirm(true);
        else navigate('/dashboard');
    };

    const handleSubmit = async () => {
        if (isExpired) {
            alert(t.qcEntry.timeEndedMessage);
            return;
        }
        setShowSubmitConfirm(false);
        setSubmitting(true);
        try {
            const valuesArray: any[] = [];
            template?.sections.forEach(section => {
                if (section.isRepeatable && section.repeatCount && section.repeatCount > 1) {
                    for (let i = 1; i <= section.repeatCount; i++) {
                        section.fields.forEach(field => {
                            const val = values[`${field.fieldKey}_sample_${i}`];
                            if (val !== undefined && val !== null && val !== '') {
                                valuesArray.push({
                                    fieldId: field.id,
                                    repeatIndex: i,
                                    groupKey: `sample_${i}`,
                                    [typeof val === 'boolean' ? 'valueBoolean' : (typeof val === 'number' || !isNaN(val) ? 'valueNumber' : 'valueText')]: typeof val === 'boolean' ? val : (typeof val === 'number' || !isNaN(val) ? parseFloat(val) : String(val))
                                });
                            }
                        });
                    }
                } else {
                    section.fields.forEach(field => {
                        const val = values[field.fieldKey];
                        if (val !== undefined && val !== null && val !== '') {
                            valuesArray.push({
                                fieldId: field.id,
                                [typeof val === 'boolean' ? 'valueBoolean' : (typeof val === 'number' || !isNaN(val) ? 'valueNumber' : 'valueText')]: typeof val === 'boolean' ? val : (typeof val === 'number' || !isNaN(val) ? parseFloat(val) : String(val))
                            });
                        }
                    });
                }
            });

            const prog = getProgress();
            await recordApi.create({
                templateId: parseInt(templateId!),
                machineId: machineId ? parseInt(machineId) : null,
                productId: productId ? parseInt(productId) : null,
                taskAssignmentId: taskId ? parseInt(taskId) : null,
                headerData: { submittedAt: new Date().toISOString(), totalFields: prog.total, filledFields: prog.filled },
                values: valuesArray
            });

            localStorage.removeItem(`qc_draft_${templateId}_${machineId}`);
            setSubmitted(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error('Submit error:', error);
            alert('Kayıt gönderilemedi!');
        } finally {
            setSubmitting(false);
        }
    };

    const openSamplePanel = (sectionId: number, sampleNum: number) => {
        setSelectedSectionId(sectionId);
        setSelectedSampleNum(sampleNum);
    };

    const closeSamplePanel = () => {
        setSelectedSectionId(null);
        setSelectedSampleNum(null);
    };

    const navigateSample = (direction: 'prev' | 'next') => {
        if (!selectedSectionId || !selectedSampleNum) return;
        const section = template?.sections.find(s => s.id === selectedSectionId);
        if (!section || !section.repeatCount) return;
        const newNum = direction === 'prev' ? selectedSampleNum - 1 : selectedSampleNum + 1;
        if (newNum >= 1 && newNum <= section.repeatCount) setSelectedSampleNum(newNum);
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        </div>
    );

    if (submitted) return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl shadow-teal-500/20 animate-bounce">
                <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-[var(--color-text)] uppercase tracking-tighter">{t.qcEntry.success}</h2>
        </div>
    );

    if (!template || !template.sections?.length) return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <p className="text-[var(--color-text)] font-medium mb-6">Şablon bulunamadı veya boş.</p>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-transparent text-teal-600 border-2 border-teal-600/20 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-teal-600/5 active:scale-95 transition-all flex items-center gap-2"
            >
                <ChevronLeft size={20} />
                Geri Dön
            </button>
        </div>
    );

    const prog = getProgress();
    const nonRepeatableSections = template.sections.filter(s => !s.isRepeatable || !s.repeatCount || s.repeatCount <= 1);
    const repeatableSections = template.sections.filter(s => s.isRepeatable && s.repeatCount && s.repeatCount > 1);
    const activeSection = selectedSectionId ? template.sections.find(s => s.id === selectedSectionId) : null;
    const isPanelOpen = !!(activeSection && selectedSampleNum);

    return (
        <div className="min-h-screen bg-[var(--color-bg)] pb-10">
            <ConfirmModal show={showBackConfirm} title="Çıkmak istediğinize emin misiniz?" message="Girdiğiniz veriler otomatik olarak kaydedildi." onConfirm={() => navigate('/dashboard')} onCancel={() => setShowBackConfirm(false)} confirmText="Çık" confirmColor="red" />
            <ConfirmModal show={showSubmitConfirm} title="Onaya göndermek istiyor musunuz?" message={`${prog.filled} / ${prog.total} alan dolduruldu.`} onConfirm={handleSubmit} onCancel={() => setShowSubmitConfirm(false)} confirmText="Gönder" confirmColor="teal" />
            <ConfirmModal
                show={showGraceModal}
                title={t.qcEntry.timeWarning}
                message={t.qcEntry.graceMessage}
                onConfirm={() => setShowGraceModal(false)}
                onCancel={() => setShowGraceModal(false)}
                confirmText={t.common.ok}
                confirmColor="red"
                singleButton={true}
            />
            <ConfirmModal
                show={showHardExpiryModal}
                title={t.qcEntry.timeEnded}
                message={t.qcEntry.timeEndedMessage}
                onConfirm={() => navigate('/dashboard')}
                onCancel={() => navigate('/dashboard')}
                confirmText={t.common.ok}
                confirmColor="red"
                singleButton={true}
            />

            <Header
                title={t.qcEntry.title}
                subtitle={template?.name}
                showBack
                onBack={handleBack}
                centerContent={
                    (isGracePeriod || isExpired) && (
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${isExpired ? 'bg-red-500 shadow-red-500/40' : 'bg-amber-500 shadow-amber-500/40'} shadow-lg border border-white/30 animate-pulse`}>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80 leading-none mb-0.5">
                                    {isExpired ? t.qcEntry.timeEnded : t.qcEntry.gracePeriod}
                                </span>
                                <span className="font-mono text-base font-black leading-none">
                                    {isExpired ? '00:00' : `${Math.floor(graceSeconds / 60)}:${(graceSeconds % 60).toString().padStart(2, '0')}`}
                                </span>
                            </div>
                        </div>
                    )
                }
                rightActions={
                    <button
                        onClick={() => setShowSubmitConfirm(true)}
                        disabled={submitting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-teal-900/20 active:scale-95 transition-all disabled:opacity-50 border-2 border-white/20"
                    >
                        <Send size={16} />
                        {submitting ? '...' : t.qcEntry.submit}
                    </button>
                }
            />

            <main className="p-4 sm:p-6 lg:p-8">
                <div className="app-container space-y-12">
                    {/* Non-repeatable sections */}
                    {nonRepeatableSections.map(section => (
                        <div key={section.id} className="space-y-6">
                            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                                <h2 className="text-sm font-black text-[var(--color-text)] uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                    {section.name}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.fields.map(field => {
                                    const inputType = (field.inputType || '').toUpperCase();
                                    const val = values[field.fieldKey];
                                    const isLong = inputType === 'TEXT' || inputType === 'PHOTO';

                                    return (
                                        <div
                                            key={field.id}
                                            className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm hover:border-teal-500/20 transition-all group ${isLong ? 'md:col-span-2' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-[13px] font-black text-[var(--color-text)] uppercase tracking-wide flex items-center gap-1">
                                                    {field.required && <span className="text-red-500">*</span>} {field.label}
                                                </label>
                                            </div>

                                            <div className="mt-1">
                                                {(inputType === 'PASS_FAIL' || inputType === 'PASSFAIL' || inputType === 'BOOLEAN') && (
                                                    <PassFailButton value={val ?? null} onChange={(v) => updateValue(field.fieldKey, v)} labels={{ yes: t.common.yes, no: t.common.no }} />
                                                )}
                                                {(inputType === 'NUMERIC' || inputType === 'NUMBER' || inputType === 'DECIMAL') && (
                                                    <NumericInput value={val ?? ''} onChange={(v) => updateValue(field.fieldKey, v)} field={field} />
                                                )}
                                                {inputType === 'TEXT' && (
                                                    <textarea
                                                        value={val ?? ''}
                                                        onChange={(e) => updateValue(field.fieldKey, e.target.value)}
                                                        className="w-full px-4 py-3 text-sm rounded-lg border border-[var(--color-border)] focus:border-teal-500 bg-[var(--color-bg)] text-[var(--color-text)] font-medium outline-none transition-all placeholder:text-slate-300"
                                                        rows={2}
                                                        placeholder={t.qcEntry.enterNote}
                                                    />
                                                )}
                                                {inputType === 'SELECT' && field.options && (
                                                    <div className="relative mt-1">
                                                        <select
                                                            value={val ?? ''}
                                                            onChange={(e) => updateValue(field.fieldKey, e.target.value)}
                                                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-teal-500 rounded-lg px-4 py-2.5 text-xs font-bold text-[var(--color-text)] appearance-none outline-none transition-all"
                                                        >
                                                            <option value="">{t.qcEntry.selectOption}</option>
                                                            {(Array.isArray(field.options) ? field.options : field.options.split(/[\n,]/)).map((opt, i) => (
                                                                <option key={i} value={opt.trim()}>{opt.trim()}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-secondary)]">
                                                            <ChevronRight size={14} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Repeatable sections */}
                    {repeatableSections.map(section => (
                        <div key={section.id} className="space-y-6">
                            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                                <h2 className="text-sm font-black text-[var(--color-text)] uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                    {section.name}
                                </h2>
                                <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">
                                    {section.repeatCount} {t.qcEntry.samples}
                                </span>
                            </div>
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                                    {Array.from({ length: section.repeatCount! }, (_, i) => i + 1).map(num => {
                                        const status = getSampleStatus(section.id, num);
                                        const isSelected = selectedSectionId === section.id && selectedSampleNum === num;
                                        return (
                                            <button
                                                key={num}
                                                onClick={() => openSamplePanel(section.id, num)}
                                                className={`h-12 w-12 rounded-lg font-black text-xs transition-all relative flex items-center justify-center border-2 ${isSelected ? 'bg-teal-600 text-white border-teal-600 shadow-lg scale-110 z-10' :
                                                    status === 'passed' ? 'bg-teal-500 text-white border-teal-500' :
                                                        status === 'failed' ? 'bg-red-500 text-white border-red-500' :
                                                            status === 'partial' ? 'bg-amber-500 text-white border-amber-500' :
                                                                'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {isPanelOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-fade-in" onClick={closeSamplePanel} />
                    <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[var(--color-bg)] shadow-2xl z-[70] flex flex-col animate-slide-in-right border-l border-[var(--color-border)]">
                        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-5 flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigateSample('prev')} disabled={selectedSampleNum <= 1} className="p-2 bg-white/10 rounded-lg disabled:opacity-30 active:scale-95 transition-all"><ChevronLeft size={20} /></button>
                                <div className="text-center">
                                    <h3 className="font-black text-xs uppercase tracking-widest">{activeSection.name}</h3>
                                    <p className="text-[10px] font-medium opacity-60">S: {selectedSampleNum}</p>
                                </div>
                                <button onClick={() => navigateSample('next')} disabled={selectedSampleNum >= (activeSection.repeatCount || 1)} className="p-2 bg-white/10 rounded-lg disabled:opacity-30 active:scale-95 transition-all"><ChevronRight size={20} /></button>
                            </div>
                            <button onClick={closeSamplePanel} className="p-2 bg-white/10 rounded-lg active:scale-95 transition-all"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-bg)]">
                            {activeSection.fields.map(field => {
                                const key = `${field.fieldKey}_sample_${selectedSampleNum}`;
                                const inputType = (field.inputType || '').toUpperCase();
                                const val = values[key];
                                return (
                                    <div key={field.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
                                        <label className="text-[13px] font-black text-[var(--color-text)] uppercase tracking-wide flex items-center gap-1">
                                            {field.required && <span className="text-red-500">*</span>} {field.label}
                                        </label>
                                        <div className="mt-1">
                                            {(inputType === 'PASS_FAIL' || inputType === 'PASSFAIL' || inputType === 'BOOLEAN') && (
                                                <PassFailButton value={val ?? null} onChange={(v) => updateValue(key, v)} labels={{ yes: t.common.yes, no: t.common.no }} />
                                            )}
                                            {(inputType === 'NUMERIC' || inputType === 'NUMBER' || inputType === 'DECIMAL') && (
                                                <NumericInput value={val ?? ''} onChange={(v) => updateValue(key, v)} field={field} />
                                            )}
                                            {inputType === 'TEXT' && (
                                                <textarea value={val ?? ''} onChange={(e) => updateValue(key, e.target.value)} className="w-full px-4 py-3 text-sm rounded-lg border border-[var(--color-border)] focus:border-teal-500 bg-[var(--color-bg)] text-[var(--color-text)] font-medium outline-none transition-all placeholder:text-[var(--color-text-secondary)]" rows={3} placeholder={t.qcEntry.enterNote} />
                                            )}
                                            {inputType === 'SELECT' && field.options && (
                                                <div className="relative mt-1">
                                                    <select value={val ?? ''} onChange={(e) => updateValue(key, e.target.value)} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-teal-500 rounded-lg px-4 py-2.5 text-xs font-bold text-[var(--color-text)] appearance-none outline-none transition-all">
                                                        <option value="">{t.qcEntry.selectOption}</option>
                                                        {(Array.isArray(field.options) ? field.options : field.options.split(/[\n,]/)).map((opt, i) => (
                                                            <option key={i} value={opt.trim()}>{opt.trim()}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-secondary)]">
                                                        <ChevronRight size={14} className="rotate-90" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                            <button onClick={closeSamplePanel} className="w-full py-4 bg-teal-600 text-white rounded-lg font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all">{t.common.ok}</button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
