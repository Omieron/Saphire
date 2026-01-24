import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { templateApi, recordApi } from '../../api';
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
        <div className="flex gap-2">
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${value === true
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                    : 'bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-teal-500/50'
                    }`}
            >
                ✓ {labels.yes}
            </button>
            <button
                type="button"
                onClick={() => onChange(false)}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${value === false
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-red-500/50'
                    }`}
            >
                ✗ {labels.no}
            </button>
        </div>
    );
}

function NumericInput({ value, onChange, field, placeholder }: { value: string; onChange: (v: string) => void; field: Field; placeholder?: string }) {
    return (
        <div className="space-y-2">
            <input
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || '—'}
                className="w-full px-4 py-4 text-lg rounded-xl border-2 transition-all bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] focus:border-teal-500"
            />
            {(field.minValue !== undefined || field.maxValue !== undefined) && (
                <div className="flex gap-2 text-xs">
                    {field.minValue !== undefined && (
                        <span className="px-2 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded">Min: {field.minValue}</span>
                    )}
                    {field.maxValue !== undefined && (
                        <span className="px-2 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded">Max: {field.maxValue}</span>
                    )}
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
        }
    }, [templateId]);

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

    const updateValue = useCallback((key: string, val: any) => {
        setValues(prev => ({ ...prev, [key]: val }));
    }, []);

    const getSampleStatus = useCallback((sectionId: number, sampleNum: number): 'empty' | 'partial' | 'passed' | 'failed' => {
        const section = template?.sections.find(s => s.id === sectionId);
        if (!section) return 'empty';

        let filled = 0;
        let total = section.fields.length;
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
        if (filled < total) return 'partial';
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
        <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
            <div className="text-center text-white">
                <CheckCircle2 size={64} className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold">{t.qcEntry.success}</h2>
            </div>
        </div>
    );

    if (!template || !template.sections?.length) return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <p className="text-[var(--color-text)] font-medium">Şablon bulunamadı veya boş.</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-teal-600 font-bold">Geri Dön</button>
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

            <Header
                title={t.qcEntry.title}
                subtitle={template?.name}
                showBack
                onBack={handleBack}
                rightActions={
                    <button
                        onClick={() => setShowSubmitConfirm(true)}
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-teal-700 rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Send size={18} />
                        {submitting ? '...' : t.qcEntry.submit}
                    </button>
                }
            />

            <main className="p-4">
                <div className="app-container space-y-6">
                    {nonRepeatableSections.map(section => (
                        <section key={section.id} className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-6 border border-[var(--color-border)] admin-card">
                            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
                                <div className="w-1 h-6 bg-teal-500 rounded-full" />
                                {section.name}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {section.fields.map(field => {
                                    const inputType = (field.inputType || '').toUpperCase();
                                    const val = values[field.fieldKey];
                                    return (
                                        <div key={field.id} className="space-y-2">
                                            <label className="font-bold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">{field.label}</label>
                                            {(inputType === 'PASS_FAIL' || inputType === 'PASSFAIL' || inputType === 'BOOLEAN') && (
                                                <PassFailButton value={val ?? null} onChange={(v) => updateValue(field.fieldKey, v)} labels={{ yes: t.common.yes, no: t.common.no }} />
                                            )}
                                            {(inputType === 'NUMERIC' || inputType === 'NUMBER' || inputType === 'DECIMAL') && (
                                                <NumericInput value={val ?? ''} onChange={(v) => updateValue(field.fieldKey, v)} field={field} />
                                            )}
                                            {inputType === 'TEXT' && (
                                                <textarea value={val ?? ''} onChange={(e) => updateValue(field.fieldKey, e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-border)] focus:border-teal-500 bg-[var(--color-surface)] text-[var(--color-text)]" rows={3} />
                                            )}
                                            {inputType === 'SELECT' && field.options && (
                                                <select value={val ?? ''} onChange={(e) => updateValue(field.fieldKey, e.target.value)} className="ios-select w-full">
                                                    <option value="">{t.qcEntry.selectOption}</option>
                                                    {(Array.isArray(field.options) ? field.options : field.options.split(/[\n,]/)).map((opt, i) => (
                                                        <option key={i} value={opt.trim()}>{opt.trim()}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}

                    {repeatableSections.map(section => (
                        <section key={section.id} className="bg-[var(--color-surface)] rounded-2xl shadow-sm p-6 border border-[var(--color-border)] admin-card">
                            <h2 className="text-xl font-bold text-[var(--color-text)] mb-1 flex items-center gap-3">
                                <div className="w-1 h-6 bg-teal-500 rounded-full" />
                                {section.name}
                            </h2>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-6 ml-4">{section.repeatCount} {t.qcEntry.samples}</p>

                            {/* Sample buttons grid */}
                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                                {Array.from({ length: section.repeatCount! }, (_, i) => i + 1).map(num => {
                                    const status = getSampleStatus(section.id, num);
                                    const isSelected = selectedSectionId === section.id && selectedSampleNum === num;
                                    return (
                                        <button
                                            key={num}
                                            onClick={() => openSamplePanel(section.id, num)}
                                            className={`h-12 rounded-xl font-bold transition-all relative ${isSelected ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' :
                                                status === 'passed' ? 'bg-teal-500/20 text-teal-700 border border-teal-500/30' :
                                                    status === 'failed' ? 'bg-red-500/20 text-red-700 border border-red-500/30' :
                                                        status === 'partial' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                                            'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                                                }`}
                                        >
                                            {num}
                                            {(status === 'passed' || status === 'failed') && (
                                                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${status === 'passed' ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'}`}>
                                                    {status === 'passed' ? '✓' : '✗'}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ))}

                </div>
            </main>

            {isPanelOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={closeSamplePanel} />
                    <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-[var(--color-surface)] shadow-2xl z-50 flex flex-col animate-slide-in-right">
                        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-5 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigateSample('prev')} disabled={selectedSampleNum <= 1} className="p-2 bg-white/20 rounded-xl disabled:opacity-30"><ChevronLeft size={24} /></button>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">Numune {selectedSampleNum}</h3>
                                    <p className="text-xs opacity-80 truncate max-w-[120px]">{activeSection.name}</p>
                                </div>
                                <button onClick={() => navigateSample('next')} disabled={selectedSampleNum >= (activeSection.repeatCount || 1)} className="p-2 bg-white/20 rounded-xl disabled:opacity-30"><ChevronRight size={24} /></button>
                            </div>
                            <button onClick={closeSamplePanel} className="p-2 bg-white/20 rounded-xl"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[var(--color-bg)]">
                            {activeSection.fields.map(field => {
                                const key = `${field.fieldKey}_sample_${selectedSampleNum}`;
                                const inputType = (field.inputType || '').toUpperCase();
                                const val = values[key];
                                return (
                                    <div key={field.id} className="space-y-2">
                                        <label className="font-bold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">{field.label}</label>
                                        {(inputType === 'PASS_FAIL' || inputType === 'PASSFAIL' || inputType === 'BOOLEAN') && (
                                            <PassFailButton value={val ?? null} onChange={(v) => updateValue(key, v)} labels={{ yes: t.common.yes, no: t.common.no }} />
                                        )}
                                        {(inputType === 'NUMERIC' || inputType === 'NUMBER' || inputType === 'DECIMAL') && (
                                            <NumericInput value={val ?? ''} onChange={(v) => updateValue(key, v)} field={field} />
                                        )}
                                        {inputType === 'TEXT' && (
                                            <textarea value={val ?? ''} onChange={(e) => updateValue(key, e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-border)] focus:border-teal-500 bg-[var(--color-surface)] text-[var(--color-text)]" rows={3} />
                                        )}
                                        {inputType === 'SELECT' && field.options && (
                                            <select value={val ?? ''} onChange={(e) => updateValue(key, e.target.value)} className="ios-select w-full">
                                                <option value="">{t.qcEntry.selectOption}</option>
                                                {(Array.isArray(field.options) ? field.options : field.options.split(/[\n,]/)).map((opt, i) => (
                                                    <option key={i} value={opt.trim()}>{opt.trim()}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-5 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                            <button onClick={closeSamplePanel} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 active:scale-95 transition-all">{t.common.ok}</button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
            `}</style>
        </div>
    );
}
