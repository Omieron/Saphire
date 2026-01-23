import React, { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Plus, Trash2, Search, CheckCircle, XCircle, FileText, ChevronDown, ChevronRight, GripVertical, Settings, Tablet, ClipboardCheck, Info, Package, Cpu, Camera, Edit3, Hash, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { qcTemplateApi, type QcFormTemplate, type QcFormTemplateRequest, type QcFormSectionRequest, type QcFormFieldRequest } from '../../api/qcTemplate.api';
import { productApi, type Product } from '../../api/product.api';
import { machineApi, type Machine } from '../../api/machine.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Toast from '../../components/Toast/Toast';
import PageTour from '../../components/PageTour/PageTour';

// Page tour steps for templates list
const LIST_TOUR_STEPS = [
    { id: 'search', targetSelector: '[data-tour="qc-search"]', titleKey: 'search', descKey: 'search', position: 'bottom' as const },
    { id: 'add', targetSelector: '[data-tour="qc-add"]', titleKey: 'add', descKey: 'add', position: 'left' as const },
];

// Input type options matching backend enum
const INPUT_TYPES = [
    { value: 'NUMBER', labelKey: 'typeNumber' },
    { value: 'DECIMAL', labelKey: 'typeDecimal' },
    { value: 'BOOLEAN', labelKey: 'typeBoolean' },
    { value: 'PASS_FAIL', labelKey: 'typePassFail' },
    { value: 'TEXT', labelKey: 'typeText' },
    { value: 'SELECT', labelKey: 'typeSelect' },
    { value: 'PHOTO', labelKey: 'typePhoto' },
    { value: 'SIGNATURE', labelKey: 'typeSignature' },
];

// Categorized units
const UNIT_CATEGORIES = {
    'Uzunluk': ['mm', 'cm', 'm', 'km', 'µm'],
    'Ağırlık': ['g', 'kg', 'ton', 'mg'],
    'Sıcaklık': ['°C', '°F', 'K'],
    'Basınç': ['bar', 'psi', 'Pa', 'kPa', 'MPa'],
    'Güç/Elektrik': ['W', 'kW', 'A', 'V', 'mA'],
    'Hacim': ['ml', 'L', 'm³', 'cm³'],
    'Zaman': ['s', 'ms', 'min', 'saat'],
    'Diğer': ['pcs', 'adet', '%', 'N', 'Nm', 'rpm', 'Hz']
};

// Context types matching backend enum
const CONTEXT_TYPES = [
    { value: 'MACHINE', labelKey: 'contextMachine' },
    { value: 'PRODUCT', labelKey: 'contextProduct' },
    { value: 'PROCESS', labelKey: 'contextProcess' },
    { value: 'GENERAL', labelKey: 'contextGeneral' },
];

interface ControlPoint {
    id: string;
    label: string;
    inputType: string;
    unit: string;
    targetValue: string;
    minValue: string;
    maxValue: string;
    repeatCount: number;
    required: boolean;
    options: string; // For SELECT type - newline or comma-separated options
    fieldKey?: string;
}

export default function QcTemplates() {
    const { t } = useLanguage();
    const [templates, setTemplates] = useState<QcFormTemplate[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    // Builder state
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<QcFormTemplate | null>(null);
    const [contextType, setContextType] = useState('PRODUCT');
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
    const [templateCode, setTemplateCode] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [requiresApproval, setRequiresApproval] = useState(true);
    const [allowPartialSave, setAllowPartialSave] = useState(true);
    const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
    const [saving, setSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [mockupOrientation, setMockupOrientation] = useState<'landscape' | 'portrait'>('landscape');

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<QcFormTemplate | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        showBuilder && currentLocation.pathname !== nextLocation.pathname
    );

    // Field modal state
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [editingField, setEditingField] = useState<ControlPoint | null>(null);
    const [fieldForm, setFieldForm] = useState<ControlPoint>({
        id: '', label: '', inputType: 'NUMBER', unit: '', targetValue: '', minValue: '', maxValue: '', repeatCount: 1, required: true, options: ''
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [templatesRes, productsRes, machinesRes] = await Promise.all([
                qcTemplateApi.getAll(debouncedSearch),
                productApi.getAll(),
                machineApi.getAll()
            ]);
            setTemplates(templatesRes.data.data || []);
            setProducts(productsRes.data.data || []);
            setMachines(machinesRes.data.data || []);
        } catch (error) { console.error('Failed to fetch:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [debouncedSearch]);

    const handleAddTemplate = () => {
        setEditingTemplate(null);
        setContextType('PRODUCT');
        setSelectedProductId(null);
        setSelectedMachineId(null);
        setTemplateCode('');
        setTemplateName('');
        setTemplateDescription('');
        setRequiresApproval(true);
        setAllowPartialSave(true);
        setControlPoints([]);
        setShowBuilder(true);
    };

    const handleEditTemplate = (template: QcFormTemplate) => {
        setEditingTemplate(template);
        setContextType(template.contextType);
        setSelectedProductId(template.productId);
        setSelectedMachineId(template.machineId);
        setTemplateCode(template.code);
        setTemplateName(template.name);
        setTemplateDescription(template.description || '');
        setRequiresApproval(template.requiresApproval);
        setAllowPartialSave(template.allowPartialSave);
        const points: ControlPoint[] = [];
        template.sections?.forEach(section => {
            section.fields?.forEach(field => {
                points.push({
                    id: `field-${field.id}`,
                    label: field.label,
                    inputType: field.inputType,
                    unit: field.unit || '',
                    targetValue: field.targetValue?.toString() || '',
                    minValue: field.minValue?.toString() || '',
                    maxValue: field.maxValue?.toString() || '',
                    repeatCount: section.repeatCount || 1,
                    required: field.required,
                    options: Array.isArray(field.options) ? field.options.join('\n') : (field.options || ''),
                    fieldKey: field.fieldKey
                });
            });
        });
        setControlPoints(points);
        setShowBuilder(true);
    };

    const handleDeleteClick = (item: QcFormTemplate) => { setDeleteTarget(item); };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await qcTemplateApi.delete(deleteTarget.id);
            setDeleteTarget(null);
            setToast({ show: true, message: t.common.recordDeleted, type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
            setToast({ show: true, message: 'Silme işlemi başarısız oldu!', type: 'error' });
        } finally { setDeleting(false); }
    };

    const handleOpenFieldModal = (field?: ControlPoint) => {
        if (field) {
            setEditingField(field);
            setFieldForm({ ...field });
        } else {
            setEditingField(null);
            setFieldForm({ id: `field-${Date.now()}`, label: '', inputType: 'NUMBER', unit: '', targetValue: '', minValue: '', maxValue: '', repeatCount: 1, required: true, options: '' });
        }
        setShowFieldModal(true);
    };

    const handleSaveField = () => {
        if (!fieldForm.label.trim()) return;
        if (editingField) {
            setControlPoints(prev => prev.map(cp => cp.id === editingField.id ? fieldForm : cp));
        } else {
            setControlPoints(prev => [...prev, fieldForm]);
        }
        setShowFieldModal(false);
    };

    const handleRemoveField = (id: string) => { setControlPoints(prev => prev.filter(cp => cp.id !== id)); };

    const handleSaveTemplate = () => {
        if (!templateCode.trim() || !templateName.trim()) {
            setToast({ show: true, message: 'Lütfen kod ve isim alanlarını doldurunuz!', type: 'error' });
            return;
        }
        if (controlPoints.length === 0) {
            setToast({ show: true, message: t.qcTemplates.addAtLeastOne, type: 'error' });
            return;
        }

        setShowSaveConfirm(true);
    };

    const processSaveTemplate = async () => {
        setShowSaveConfirm(false);
        setSaving(true);
        try {
            const fields: QcFormFieldRequest[] = controlPoints.map((cp, index) => ({
                fieldOrder: index + 1,
                fieldKey: cp.fieldKey || cp.label.toLowerCase().replace(/\s+/g, '_'),
                label: cp.label,
                inputType: cp.inputType,
                minValue: cp.minValue !== '' ? parseFloat(cp.minValue) : undefined,
                maxValue: cp.maxValue !== '' ? parseFloat(cp.maxValue) : undefined,
                targetValue: cp.targetValue !== '' ? parseFloat(cp.targetValue) : undefined,
                unit: cp.unit || undefined,
                required: cp.required,
                options: cp.options ? cp.options.split(/[\n,]/).map(o => o.trim()).filter(o => o) : undefined,
            }));

            const repeatGroups = new Map<number, QcFormFieldRequest[]>();
            controlPoints.forEach((cp, index) => {
                const rc = cp.repeatCount || 1;
                if (!repeatGroups.has(rc)) { repeatGroups.set(rc, []); }
                repeatGroups.get(rc)!.push(fields[index]);
            });

            const sections: QcFormSectionRequest[] = [];
            let sectionOrder = 1;
            repeatGroups.forEach((sectionFields, repeatCount) => {
                sections.push({
                    sectionOrder: sectionOrder++,
                    name: repeatCount > 1 ? `${t.qcTemplates.repeatedControls} (${repeatCount}x)` : t.qcTemplates.controlPointsSection,
                    isRepeatable: repeatCount > 1,
                    repeatCount: repeatCount > 1 ? repeatCount : undefined,
                    fields: sectionFields,
                });
            });

            const request: QcFormTemplateRequest = {
                code: templateCode.toUpperCase(),
                name: templateName,
                description: templateDescription || undefined,
                contextType,
                productId: contextType === 'PRODUCT' && selectedProductId ? selectedProductId : undefined,
                machineId: contextType === 'MACHINE' && selectedMachineId ? selectedMachineId : undefined,
                requiresApproval,
                allowPartialSave,
                active: true,
                sections,
            };

            if (editingTemplate) { await qcTemplateApi.update(editingTemplate.id, request); }
            else { await qcTemplateApi.create(request); }

            setShowBuilder(false);
            setToast({ show: true, message: t.common.success, type: 'success' });
            fetchData();
        } catch (error: any) {
            console.error('Failed to save:', error);
            setToast({ show: true, message: t.common.error, type: 'error' });
        } finally { setSaving(false); }
    };


    // Template List View
    if (!showBuilder) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative" data-tour="qc-search">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                        <input type="text" placeholder={t.qcTemplates.searchTemplates} value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 h-[40px]" />
                    </div>
                    <button onClick={handleAddTemplate} data-tour="qc-add" className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-bold h-[40px]">
                        <Plus size={18} />{t.qcTemplates.addTemplate}
                    </button>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-[var(--color-bg)]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider w-8"></th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.code}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.name}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcTemplates.productMachine}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcTemplates.controlPoints}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                            ) : templates.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.qcTemplates.noTemplates}</td></tr>
                            ) : (
                                templates.map((template) => {
                                    const fieldCount = template.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || 0;
                                    return (
                                        <React.Fragment key={template.id}>
                                            <tr className="hover:bg-[var(--color-surface-hover)] transition-colors">
                                                <td className="px-6 py-4">
                                                    <button onClick={() => setExpandedRow(expandedRow === template.id ? null : template.id)} className="p-1 text-[var(--color-text-secondary)] hover:text-teal-500 rounded-md transition-colors">
                                                        {expandedRow === template.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono text-teal-600 font-bold">{template.code}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-[var(--color-text)]">
                                                    <div className="flex items-center gap-2"><FileText size={16} className="text-teal-500" />{template.name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-[var(--color-text-secondary)]">
                                                    {template.contextType === 'PRODUCT' ? (
                                                        <span className="inline-flex items-center gap-1.5"><Package size={14} className="text-blue-500" /> {template.productName || '-'}</span>
                                                    ) : template.contextType === 'MACHINE' ? (
                                                        <span className="inline-flex items-center gap-1.5"><Cpu size={14} className="text-teal-500" /> {template.machineName || '-'}</span>
                                                    ) : <span className="italic opacity-50">General</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-teal-600">
                                                    <span className="bg-teal-500/10 px-2 py-1 rounded-lg">{fieldCount} Points</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {template.active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold"><CheckCircle size={12} /> {t.common.active}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold"><XCircle size={12} /> {t.common.inactive}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleEditTemplate(template)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Settings size={16} /></button>
                                                    <button onClick={() => handleDeleteClick(template)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                            {expandedRow === template.id && template.sections && (
                                                <tr><td colSpan={7} className="px-12 py-6 bg-[var(--color-bg)] shadow-inner">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {template.sections.flatMap(section =>
                                                            section.fields?.map((field) => (
                                                                <div key={field.id} className="flex flex-col p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="font-bold text-xs text-[var(--color-text)]">{field.label}</span>
                                                                        <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-500 rounded text-[9px] font-black uppercase tracking-widest">{field.inputType}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between gap-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
                                                                        {field.unit && <span className="bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">Unit: {field.unit}</span>}
                                                                        {field.targetValue !== undefined && <span>Tar: {field.targetValue}</span>}
                                                                        {section.repeatCount && section.repeatCount > 1 && <span className="text-purple-500 font-bold">{section.repeatCount}x REPEAT</span>}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </td></tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <PageTour pageName="qc-templates" steps={LIST_TOUR_STEPS} translations={{
                    search: { title: 'Şablon Ara', desc: 'QC şablonlarını isim veya kod ile arayabilirsiniz.' },
                    add: { title: 'Yeni Şablon', desc: 'Yeni bir kalite kontrol şablonu oluşturmak için tıklayın.' },
                }} />

                <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm}
                    title={t.common.deleteConfirm} message={t.common.deleteMessage} loading={deleting} />

                <Toast isOpen={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.message} type={toast.type} duration={3000} />
            </div >
        );
    }

    // Template Builder View
    return (
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 p-8 items-start mb-12 pb-8">
            {/* Left: Component Builder */}
            <div className="lg:col-span-5 space-y-8 pb-12">
                <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 p-6 rounded-2xl border border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
                            {editingTemplate ? <Edit3 size={24} /> : <Plus size={24} />}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight">
                                {editingTemplate ? t.qcTemplates.editTemplate : t.qcTemplates.addTemplate}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                {t.qcTemplates.formDescription}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-8">
                    {/* Header Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                <Info size={14} className="text-teal-500" /> {t.qcTemplates.contextType}
                            </label>
                            <select value={contextType} onChange={(e) => setContextType(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-bold transition-all h-[52px]">
                                {CONTEXT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{(t.qcTemplates as any)[ct.labelKey]}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                {contextType === 'PRODUCT' ? <Package size={14} className="text-blue-500" /> : <Cpu size={14} className="text-teal-500" />}
                                {contextType === 'PRODUCT' ? t.qcTemplates.selectProduct : t.qcTemplates.selectMachine}
                            </label>
                            {contextType === 'PRODUCT' ? (
                                <select value={selectedProductId || ''} onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-bold h-[52px]">
                                    <option value="">{t.qcTemplates.selectProduct}</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                                </select>
                            ) : (
                                <select value={selectedMachineId || ''} onChange={(e) => setSelectedMachineId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-bold h-[52px]">
                                    <option value="">{t.qcTemplates.selectMachine}</option>
                                    {machines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                <Hash size={14} className="text-teal-500" /> {t.common.code}
                            </label>
                            <input type="text" value={templateCode} onChange={(e) => setTemplateCode(e.target.value.toUpperCase())} placeholder="QC-001"
                                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-mono font-bold h-[52px]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                <Edit3 size={14} className="text-teal-500" /> {t.qcTemplates.templateName}
                            </label>
                            <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Ürün Kalite Kontrolü"
                                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-bold h-[52px]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1">{t.common.description}</label>
                        <textarea value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} rows={2}
                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 resize-none font-medium" />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <label className="flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-teal-500/50 transition-all flex-1">
                            <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} className="toggle" />
                            <span className="text-xs font-black uppercase tracking-wider">{t.qcTemplates.requiresApproval}</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-teal-500/50 transition-all flex-1">
                            <input type="checkbox" checked={allowPartialSave} onChange={(e) => setAllowPartialSave(e.target.checked)} className="toggle" />
                            <span className="text-xs font-black uppercase tracking-wider">{t.qcTemplates.allowPartialSave}</span>
                        </label>
                    </div>

                    {/* Control Points Builder */}
                    <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-[var(--color-text)] uppercase tracking-widest">{t.qcTemplates.controlPointsSection}</h4>
                            <button onClick={() => handleOpenFieldModal()} className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-600 hover:bg-teal-500 text-sm font-black rounded-xl transition-all hover:text-white">
                                <Plus size={16} /> ADD POINT
                            </button>
                        </div>

                        {controlPoints.length === 0 ? (
                            <div className="text-center py-12 bg-[var(--color-bg)] rounded-2xl border-2 border-dashed border-[var(--color-border)]">
                                <AlertTriangle size={32} className="mx-auto mb-4 opacity-20 text-teal-500" />
                                <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">{t.qcTemplates.noControlPoints}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {controlPoints.map((cp, index) => (
                                    <div key={cp.id} className="flex items-center gap-4 p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] group hover:border-teal-500/30 transition-all shadow-sm">
                                        <GripVertical size={18} className="text-[var(--color-text-secondary)] opacity-20 group-hover:opacity-100 cursor-grab" />
                                        <div className="w-8 h-8 flex items-center justify-center bg-teal-500 text-white rounded-lg text-xs font-black shadow-lg shadow-teal-500/10">{index + 1}</div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-[var(--color-text)]">{cp.label}</div>
                                            <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] font-black uppercase tracking-tighter mt-1">
                                                <span className="bg-teal-500/5 px-1.5 py-0.5 rounded border border-teal-500/10 text-teal-600">{cp.inputType}</span>
                                                {cp.unit && <span>| {cp.unit}</span>}
                                                {cp.repeatCount > 1 && <span className="text-purple-500 font-black tracking-widest">{cp.repeatCount}X REPEAT</span>}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenFieldModal(cp)} className="p-2 text-teal-500 hover:bg-teal-500/10 rounded-lg"><Edit3 size={16} /></button>
                                            <button onClick={() => handleRemoveField(cp.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowCancelConfirm(true)} className="px-8 py-4 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500/5 transition-all font-black text-sm flex-1 md:flex-none">
                        {t.common.cancel.toUpperCase()}
                    </button>
                    <button onClick={handleSaveTemplate} disabled={saving} className="px-12 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl hover:shadow-xl hover:shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-50 font-black text-sm flex-1 md:flex-none">
                        {saving ? t.common.loading.toUpperCase() : t.common.save.toUpperCase()}
                    </button>
                </div>
            </div>

            {/* Right: Live Operator Preview (Tablet Landscape Mockup) */}
            <div className="lg:col-span-6 sticky top-24 pt-4">
                <div className={`relative group mx-auto transition-all duration-500 ${mockupOrientation === 'landscape' ? 'max-w-[580px] w-full' : 'max-w-[340px] w-full'}`}>
                    {/* Tablet Frame */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[48px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                    <div className={`relative bg-[#0f172a] rounded-[32px] p-2.5 shadow-2xl border-[10px] border-[#1e293b] overflow-hidden transition-all duration-500 flex flex-col ${mockupOrientation === 'landscape' ? 'aspect-[16/10]' : 'aspect-[10/16]'}`}>
                        {/* Camera Hole */}
                        <div className={`absolute bg-white/10 rounded-full z-20 transition-all duration-500 ${mockupOrientation === 'landscape' ? 'left-2.5 top-1/2 -translate-y-1/2 w-1 h-1' : 'top-2.5 left-1/2 -translate-x-1/2 w-1 h-1'}`} />

                        {/* App Content */}
                        <div className="flex-1 bg-slate-50 rounded-[22px] overflow-hidden flex flex-col relative">
                            {/* App Bar (Saphire Mobile Style) */}
                            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3.5 flex flex-col gap-1 shadow-md relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Tablet size={14} className="text-white/80" />
                                        <h5 className="text-sm font-black text-white truncate max-w-[200px]">{templateName || 'QC Form Preview'}</h5>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded text-[8px] font-black uppercase tracking-widest border border-white/10">
                                            {mockupOrientation.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/10 rounded-full text-[7px] font-black text-white/90 uppercase tracking-widest">
                                        <ClipboardCheck size={8} className="text-white" />
                                        <span className="truncate max-w-[150px]">
                                            {contextType === 'PRODUCT'
                                                ? (products.find(p => p.id === selectedProductId)?.name || 'NO PRODUCT')
                                                : contextType === 'MACHINE'
                                                    ? (machines.find(m => m.id === selectedMachineId)?.name || 'NO MACHINE')
                                                    : 'GENERAL'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Form Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {controlPoints.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-2 animate-bounce">
                                            <Plus size={24} />
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase leading-relaxed tracking-wider">Add points to preview</p>
                                    </div>
                                ) : (
                                    <div className={`grid gap-3 transition-all duration-500 ${mockupOrientation === 'landscape' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                        {controlPoints.map((cp, i) => (
                                            <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 space-y-2 hover:border-teal-500/20 transition-all group/point">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[9px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-1">
                                                        {cp.required && <span className="text-red-500">*</span>} {cp.label}
                                                    </label>
                                                    {cp.unit && <span className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded text-[7px] font-black uppercase tracking-widest">{cp.unit}</span>}
                                                </div>

                                                {/* Specialized Mockup Inputs */}
                                                {cp.inputType === 'PASS_FAIL' ? (
                                                    <div className="grid grid-cols-2 gap-1.5">
                                                        <div className="py-1.5 border-2 border-teal-500 rounded-lg flex items-center justify-center text-teal-600 bg-teal-50 font-black text-[9px] shadow-sm">PASS</div>
                                                        <div className="py-1.5 border-2 border-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-black text-[9px]">FAIL</div>
                                                    </div>
                                                ) : cp.inputType === 'PHOTO' ? (
                                                    <div className="h-14 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center gap-0.5 group-hover/point:bg-slate-100 transition-colors">
                                                        <Camera size={14} className="text-slate-400" />
                                                        <span className="text-[7px] font-black text-slate-400 uppercase">CAPTURE</span>
                                                    </div>
                                                ) : (
                                                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                                                        <div className="w-full h-0.5 bg-slate-200 rounded-full animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button Preview */}
                            <div className="p-3 bg-white border-t border-slate-100 flex justify-end">
                                <button className="px-6 py-2.5 bg-[#0f172a] text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-95">
                                    SUBMIT <ArrowRight size={12} />
                                </button>
                            </div>

                            {/* Features Badge */}
                            <div className={`absolute pointer-events-none transition-all duration-500 ${mockupOrientation === 'landscape' ? 'bottom-16 right-4' : 'bottom-16 right-3'}`}>
                                {requiresApproval && (
                                    <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-lg border border-teal-100 flex items-center gap-1.5 text-teal-600 animate-in fade-in slide-in-from-right-2">
                                        <ShieldCheck size={10} /> <span className="text-[7px] font-black uppercase tracking-widest">APPROVAL</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Orientation Toggles - Segmented Control Style */}
                    <div className="mt-8 flex items-center bg-[var(--color-bg)] p-1 rounded-xl border border-[var(--color-border)] relative z-30 shadow-sm w-fit mx-auto">
                        <button
                            onClick={() => setMockupOrientation('landscape')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mockupOrientation === 'landscape'
                                ? 'bg-teal-500 text-white shadow-md'
                                : 'text-[var(--color-text-secondary)] hover:text-teal-500'
                                }`}
                        >
                            <Tablet size={14} className={mockupOrientation === 'landscape' ? 'rotate-90' : ''} />
                            Landscape
                        </button>
                        <button
                            onClick={() => setMockupOrientation('portrait')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mockupOrientation === 'portrait'
                                ? 'bg-teal-500 text-white shadow-md'
                                : 'text-[var(--color-text-secondary)] hover:text-teal-500'
                                }`}
                        >
                            <Tablet size={14} />
                            Portrait
                        </button>
                    </div>
                </div>
            </div>

            {/* Field Modal - High-end Style */}
            {showFieldModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 px-8 py-6 border-b border-[var(--color-border)] relative">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Settings size={100} />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
                                    <Edit3 size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight uppercase">
                                        {editingField ? t.qcTemplates.editControlPoint : t.qcTemplates.addControlPoint}
                                    </h3>
                                    <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Point Configuration</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Label / Prompt</label>
                                <input type="text" value={fieldForm.label} onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })} placeholder="Örn: Çap Ölçümü..."
                                    className="w-full px-4 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold text-sm h-[52px]" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">{t.qcTemplates.inputType}</label>
                                    <select value={fieldForm.inputType} onChange={(e) => setFieldForm({ ...fieldForm, inputType: e.target.value, unit: '', options: '' })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold text-xs h-[52px]">
                                        {INPUT_TYPES.map(it => <option key={it.value} value={it.value}>{(t.qcTemplates as any)[it.labelKey] || it.value}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Measurement Unit</label>
                                    <select value={fieldForm.unit} onChange={(e) => setFieldForm({ ...fieldForm, unit: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold text-xs h-[52px]">
                                        <option value="">No Unit</option>
                                        {Object.entries(UNIT_CATEGORIES).map(([cat, units]) => (
                                            <optgroup key={cat} label={cat}>{units.map((u: string) => <option key={u} value={u}>{u}</option>)}</optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {(fieldForm.inputType === 'NUMBER' || fieldForm.inputType === 'DECIMAL') && (
                                <div className="grid grid-cols-3 gap-3 bg-[var(--color-bg)] p-4 rounded-2xl border border-[var(--color-border)]">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase">Target</label>
                                        <input type="text" value={fieldForm.targetValue} onChange={(e) => setFieldForm({ ...fieldForm, targetValue: e.target.value })} placeholder="52"
                                            className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 text-center font-bold text-xs" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase">Min</label>
                                        <input type="text" value={fieldForm.minValue} onChange={(e) => setFieldForm({ ...fieldForm, minValue: e.target.value })} placeholder="50"
                                            className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 text-center font-bold text-xs" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[var(--color-text-secondary)] uppercase">Max</label>
                                        <input type="text" value={fieldForm.maxValue} onChange={(e) => setFieldForm({ ...fieldForm, maxValue: e.target.value })} placeholder="55"
                                            className="w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 text-center font-bold text-xs" />
                                    </div>
                                </div>
                            )}

                            {fieldForm.inputType === 'SELECT' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">Dropdown Options (Newline separated)</label>
                                    <textarea value={fieldForm.options} onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })} placeholder="Good\nAverage\nPoor" rows={3}
                                        className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold text-xs resize-none" />
                                </div>
                            )}

                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">{t.qcTemplates.repeatCount}</label>
                                    <input type="number" min="1" value={fieldForm.repeatCount} onChange={(e) => setFieldForm({ ...fieldForm, repeatCount: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold text-xs h-[52px]" />
                                </div>
                                <div className="pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)]">
                                        <input type="checkbox" checked={fieldForm.required} onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })} className="toggle" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t.qcTemplates.required}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex gap-4">
                            <button onClick={() => setShowFieldModal(false)} className="flex-1 px-6 py-4 border border-[var(--color-border)] text-[var(--color-text)] rounded-2xl hover:bg-[var(--color-surface-hover)] font-black text-xs uppercase tracking-widest">
                                {t.common.cancel}
                            </button>
                            <button onClick={handleSaveField} className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl hover:shadow-xl hover:shadow-teal-500/20 active:scale-95 transition-all font-black text-xs uppercase tracking-widest">
                                {editingField ? t.common.save : t.common.add}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={processSaveTemplate}
                title={t.common.saveConfirmTitle}
                message={t.common.saveConfirmMessage}
                variant="primary"
                simple={true}
                confirmLabel={t.common.save}
                cancelLabel={t.common.cancel}
            />

            {/* Cancel/Navigation Confirmation */}
            <ConfirmModal
                isOpen={showCancelConfirm || blocker.state === 'blocked'}
                onClose={() => {
                    setShowCancelConfirm(false);
                    if (blocker.state === 'blocked') blocker.reset();
                }}
                onConfirm={() => {
                    setShowCancelConfirm(false);
                    setShowBuilder(false);
                    if (blocker.state === 'blocked') blocker.proceed();
                }}
                title={t.common.cancelConfirm}
                message={t.common.cancelMessage}
                simple={true}
                variant="danger"
                confirmLabel={t.common.giveUp}
                cancelLabel={t.common.back}
            />

            <Toast isOpen={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.message} type={toast.type} duration={3000} />
        </div>
    );
}
