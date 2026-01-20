import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, CheckCircle, XCircle, FileText, ChevronDown, ChevronRight, GripVertical, Settings } from 'lucide-react';
import { qcTemplateApi, type QcFormTemplate, type QcFormTemplateRequest, type QcFormSectionRequest, type QcFormFieldRequest } from '../../api/qcTemplate.api';
import { productApi, type Product } from '../../api/product.api';
import { machineApi, type Machine } from '../../api/machine.api';
import { useLanguage } from '../../contexts/LanguageContext';
import Tooltip from '../../components/Tooltip/Tooltip';
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
    options: string; // For SELECT type - comma-separated options
}

export default function QcTemplates() {
    const { t } = useLanguage();
    const [templates, setTemplates] = useState<QcFormTemplate[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
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

    // Field modal state
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [editingField, setEditingField] = useState<ControlPoint | null>(null);
    const [fieldForm, setFieldForm] = useState<ControlPoint>({
        id: '', label: '', inputType: 'NUMBER', unit: '', targetValue: '', minValue: '', maxValue: '', repeatCount: 1, required: true, options: ''
    });

    const fetchData = async () => {
        try {
            const [templatesRes, productsRes, machinesRes] = await Promise.all([
                qcTemplateApi.getAll(),
                productApi.getAll(),
                machineApi.getAll()
            ]);
            setTemplates(templatesRes.data.data || []);
            setProducts(productsRes.data.data || []);
            setMachines(machinesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

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
        // Convert existing fields to control points
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
                    options: Array.isArray(field.options) ? field.options.join('\\n') : (field.options || '')
                });
            });
        });
        setControlPoints(points);
        setShowBuilder(true);
    };

    const handleDeleteTemplate = async (id: number) => {
        if (!confirm(t.common.confirm)) return;
        try {
            await qcTemplateApi.delete(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleOpenFieldModal = (field?: ControlPoint) => {
        if (field) {
            setEditingField(field);
            setFieldForm({ ...field });
        } else {
            setEditingField(null);
            setFieldForm({
                id: `field-${Date.now()}`,
                label: '',
                inputType: 'NUMBER',
                unit: '',
                targetValue: '',
                minValue: '',
                maxValue: '',
                repeatCount: 1,
                required: true,
                options: ''
            });
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

    const handleRemoveField = (id: string) => {
        setControlPoints(prev => prev.filter(cp => cp.id !== id));
    };

    const handleSaveTemplate = async () => {
        if (!templateCode.trim() || !templateName.trim()) {
            alert('Please fill in code and name');
            return;
        }
        if (controlPoints.length === 0) {
            alert(t.qcTemplates.addAtLeastOne);
            return;
        }

        setSaving(true);
        try {
            // Build the sections and fields structure
            const fields: QcFormFieldRequest[] = controlPoints.map((cp, index) => ({
                fieldOrder: index + 1,
                fieldKey: cp.label.toLowerCase().replace(/\s+/g, '_'),
                label: cp.label,
                inputType: cp.inputType,
                minValue: cp.minValue ? parseFloat(cp.minValue) : undefined,
                maxValue: cp.maxValue ? parseFloat(cp.maxValue) : undefined,
                targetValue: cp.targetValue ? parseFloat(cp.targetValue) : undefined,
                unit: cp.unit || undefined,
                required: cp.required,
                // Convert newline-separated options to array for SELECT type
                options: cp.options ? cp.options.split(/[\n,]/).map(o => o.trim()).filter(o => o) : undefined,
            }));

            // Group by repeat count - fields with same repeatCount go in same section
            const repeatGroups = new Map<number, QcFormFieldRequest[]>();
            controlPoints.forEach((cp, index) => {
                const rc = cp.repeatCount || 1;
                if (!repeatGroups.has(rc)) {
                    repeatGroups.set(rc, []);
                }
                repeatGroups.get(rc)!.push(fields[index]);
            });

            const sections: QcFormSectionRequest[] = [];
            let sectionOrder = 1;
            repeatGroups.forEach((sectionFields, repeatCount) => {
                sections.push({
                    sectionOrder: sectionOrder++,
                    name: repeatCount > 1 ? `Tekrarlı Kontroller (${repeatCount}x)` : 'Kontrol Noktaları',
                    isRepeatable: repeatCount > 1,
                    repeatCount: repeatCount > 1 ? repeatCount : undefined,
                    fields: sectionFields,
                });
            });

            const request: QcFormTemplateRequest = {
                code: templateCode,
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

            if (editingTemplate) {
                await qcTemplateApi.update(editingTemplate.id, request);
            } else {
                await qcTemplateApi.create(request);
            }

            setShowBuilder(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Save failed. Check console for details.');
        } finally {
            setSaving(false);
        }
    };

    const filtered = templates.filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.code.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    // Template List View
    if (!showBuilder) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:w-auto" data-tour="qc-search">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                        <input
                            type="text"
                            placeholder={t.qcTemplates.searchTemplates}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
                        />
                    </div>
                    <button
                        onClick={handleAddTemplate}
                        data-tour="qc-add"
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm whitespace-nowrap"
                    >
                        <Plus size={16} />{t.qcTemplates.addTemplate}
                    </button>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-[var(--color-bg)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-8"></th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.code}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.name}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcTemplates.productMachine}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcTemplates.controlPoints}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.qcTemplates.noTemplates}</td></tr>
                            ) : (
                                filtered.map((template) => {
                                    const fieldCount = template.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || 0;
                                    return (
                                        <React.Fragment key={template.id}>
                                            <tr className="hover:bg-[var(--color-surface-hover)]">
                                                <td className="px-6 py-4">
                                                    <button onClick={() => setExpandedRow(expandedRow === template.id ? null : template.id)} className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                                                        {expandedRow === template.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-[var(--color-bg)] rounded font-mono text-xs">{template.code}</span></td>
                                                <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                                                    <span className="inline-flex items-center gap-2"><FileText size={14} className="text-[var(--color-text-secondary)]" />{template.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                                                    {template.productName || template.machineName || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[var(--color-text)]">{fieldCount} {t.qcTemplates.controlPoints.toLowerCase()}</td>
                                                <td className="px-6 py-4">
                                                    {template.active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium"><CheckCircle size={12} /> {t.common.active}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"><XCircle size={12} /> {t.common.inactive}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleEditTemplate(template)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Settings size={16} /></button>
                                                    <button onClick={() => handleDeleteTemplate(template.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                            {expandedRow === template.id && template.sections && template.sections.length > 0 && (
                                                <tr><td colSpan={7} className="px-12 py-4 bg-[var(--color-bg)]">
                                                    <div className="grid gap-2">
                                                        {template.sections.flatMap(section =>
                                                            section.fields?.map((field) => (
                                                                <div key={field.id} className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="font-medium text-sm">{field.label}</span>
                                                                        <span className="text-xs text-[var(--color-text-secondary)]">{field.inputType}</span>
                                                                        {field.unit && <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">{field.unit}</span>}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                                                                        {(field.minValue !== null || field.maxValue !== null) && (
                                                                            <span>Tolerans: {field.minValue ?? '-'} ~ {field.maxValue ?? '-'}</span>
                                                                        )}
                                                                        {section.repeatCount && section.repeatCount > 1 && (
                                                                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded">{section.repeatCount}x tekrar</span>
                                                                        )}
                                                                        {field.required && <span className="text-red-500">*</span>}
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

                {/* Page Tour */}
                <PageTour
                    pageName="qc-templates"
                    steps={LIST_TOUR_STEPS}
                    translations={{
                        search: { title: 'Şablon Ara', desc: 'QC şablonlarını isim veya kod ile arayabilirsiniz.' },
                        add: { title: 'Yeni Şablon', desc: 'Yeni bir kalite kontrol şablonu oluşturmak için tıklayın.' },
                    }}
                />
            </div >
        );
    }

    // Template Builder View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    {editingTemplate ? t.qcTemplates.editTemplate : t.qcTemplates.addTemplate}
                </h2>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-6">
                {/* Context Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            {t.qcTemplates.contextType}
                            <Tooltip text={(t.qcTemplates as Record<string, string>).tooltipContextType} />
                        </label>
                        <select
                            value={contextType}
                            onChange={(e) => setContextType(e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            {CONTEXT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{(t.qcTemplates as Record<string, string>)[ct.labelKey]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                            {contextType === 'PRODUCT' ? t.qcTemplates.selectProduct : t.qcTemplates.selectMachine}
                        </label>
                        {contextType === 'PRODUCT' ? (
                            <select
                                value={selectedProductId || ''}
                                onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">{t.qcTemplates.selectProduct}</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                            </select>
                        ) : (
                            <select
                                value={selectedMachineId || ''}
                                onChange={(e) => setSelectedMachineId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">{t.qcTemplates.selectMachine}</option>
                                {machines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.common.code}</label>
                        <input
                            type="text"
                            value={templateCode}
                            onChange={(e) => setTemplateCode(e.target.value.toUpperCase())}
                            placeholder="QC-001"
                            className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.qcTemplates.templateName}</label>
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Ürün Kalite Kontrolü"
                            className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t.common.description}</label>
                    <textarea
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                </div>

                {/* Options */}
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} className="w-4 h-4 text-teal-500 rounded" />
                        <span className="text-sm">{t.qcTemplates.requiresApproval}</span>
                        <Tooltip text={(t.qcTemplates as Record<string, string>).tooltipRequiresApproval} />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={allowPartialSave} onChange={(e) => setAllowPartialSave(e.target.checked)} className="w-4 h-4 text-teal-500 rounded" />
                        <span className="text-sm">{t.qcTemplates.allowPartialSave}</span>
                        <Tooltip text={(t.qcTemplates as Record<string, string>).tooltipAllowPartialSave} />
                    </label>
                </div>
            </div>

            {/* Control Points */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">{t.qcTemplates.controlPoints}</h3>
                    <button
                        onClick={() => handleOpenFieldModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        <Plus size={16} />{t.qcTemplates.addControlPoint}
                    </button>
                </div>

                {controlPoints.length === 0 ? (
                    <div className="text-center py-12 text-[var(--color-text-secondary)]">
                        <FileText size={48} className="mx-auto mb-4 opacity-30" />
                        <p>{t.qcTemplates.noControlPoints}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {controlPoints.map((cp, index) => (
                            <div key={cp.id} className="flex items-center gap-4 p-4 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] group">
                                <GripVertical size={16} className="text-[var(--color-text-secondary)] opacity-30 group-hover:opacity-100" />
                                <span className="w-6 h-6 flex items-center justify-center bg-teal-500/10 text-teal-500 rounded-full text-xs font-bold">{index + 1}</span>
                                <div className="flex-1">
                                    <div className="font-medium text-[var(--color-text)]">{cp.label}</div>
                                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] mt-1">
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">{cp.inputType}</span>
                                        {cp.unit && <span>{cp.unit}</span>}
                                        {cp.targetValue && <span>Ref: {cp.targetValue}</span>}
                                        {(cp.minValue || cp.maxValue) && <span>Tolerans: {cp.minValue || '-'} ~ {cp.maxValue || '-'}</span>}
                                        {cp.repeatCount > 1 && <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded">{cp.repeatCount}x</span>}
                                        {cp.required && <span className="text-red-500">{t.qcTemplates.required}</span>}
                                    </div>
                                </div>
                                <button onClick={() => handleOpenFieldModal(cp)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <Settings size={16} />
                                </button>
                                <button onClick={() => handleRemoveField(cp.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button onClick={() => setShowBuilder(false)} className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)]">
                    {t.common.cancel}
                </button>
                <button onClick={handleSaveTemplate} disabled={saving} className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50">
                    {saving ? t.common.loading : t.common.save}
                </button>
            </div>

            {/* Field Modal - Beautiful Version */}
            {showFieldModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl modal-content overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 px-6 py-4 border-b border-[var(--color-border)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                                    <FileText size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                                        {editingField ? t.qcTemplates.editControlPoint : t.qcTemplates.addControlPoint}
                                    </h3>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {editingField ? t.qcTemplates.editControlPointDesc : t.qcTemplates.addControlPointDesc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                            {/* Control Name */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                    {t.qcTemplates.controlName} <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fieldForm.label}
                                    onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                                    placeholder="Örn: Çap Ölçümü, Yüzey Kontrolü..."
                                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Type Selection */}
                            <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
                                <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Alan Tipi</div>
                                <div>
                                    <label className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mb-1.5">
                                        {t.qcTemplates.inputType}
                                        <Tooltip text={(t.qcTemplates as Record<string, string>).tooltipInputType} />
                                    </label>
                                    <select
                                        value={fieldForm.inputType}
                                        onChange={(e) => setFieldForm({ ...fieldForm, inputType: e.target.value, unit: '', options: '' })}
                                        className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    >
                                        {INPUT_TYPES.map(it => <option key={it.value} value={it.value}>{(t.qcTemplates as Record<string, string>)[it.labelKey] || it.value}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Unit & Tolerance - Only for NUMBER and DECIMAL */}
                            {(fieldForm.inputType === 'NUMBER' || fieldForm.inputType === 'DECIMAL') && (
                                <>
                                    <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
                                        <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Birim</div>
                                        <select
                                            value={fieldForm.unit}
                                            onChange={(e) => setFieldForm({ ...fieldForm, unit: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        >
                                            <option value="">Birim Yok</option>
                                            {Object.entries(UNIT_CATEGORIES).map(([category, units]) => (
                                                <optgroup key={category} label={category}>
                                                    {units.map((u: string) => <option key={u} value={u}>{u}</option>)}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
                                        <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Tolerans Değerleri</div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mb-1.5">
                                                    {t.qcTemplates.targetValue}
                                                    <Tooltip text={(t.qcTemplates as Record<string, string>).tooltipTargetValue} />
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fieldForm.targetValue}
                                                    onChange={(e) => setFieldForm({ ...fieldForm, targetValue: e.target.value })}
                                                    placeholder="52"
                                                    className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mb-1.5">
                                                    {t.qcTemplates.minValue}
                                                    <Tooltip text={(t.qcTemplates as Record<string, string>).tooltipMinMax} position="bottom" />
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fieldForm.minValue}
                                                    onChange={(e) => setFieldForm({ ...fieldForm, minValue: e.target.value })}
                                                    placeholder="50"
                                                    className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mb-1.5">
                                                    {t.qcTemplates.maxValue}
                                                    <Tooltip text={(t.qcTemplates as Record<string, string>).tooltipMinMax} position="bottom" />
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fieldForm.maxValue}
                                                    onChange={(e) => setFieldForm({ ...fieldForm, maxValue: e.target.value })}
                                                    placeholder="55"
                                                    className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Options - Only for SELECT type */}
                            {fieldForm.inputType === 'SELECT' && (
                                <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
                                    <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Seçenekler</div>
                                    <textarea
                                        value={fieldForm.options}
                                        onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })}
                                        placeholder="Her satıra bir seçenek yazın:&#10;İyi&#10;Orta&#10;Kötü"
                                        rows={4}
                                        className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                                    />
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                                        Operatör bu seçeneklerden birini seçecek
                                    </p>
                                </div>
                            )}

                            {/* Options Row */}
                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <label className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mb-1.5">
                                        {t.qcTemplates.repeatCount}
                                        <Tooltip text={(t.qcTemplates as Record<string, string>).tooltipRepeatCount} />
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={fieldForm.repeatCount}
                                        onChange={(e) => setFieldForm({ ...fieldForm, repeatCount: parseInt(e.target.value) || 1 })}
                                        className="w-full px-3 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    />
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">64 gözlü kalıp için 64 girin</p>
                                </div>
                                <div className="pt-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={fieldForm.required}
                                            onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-teal-400 transition-colors">
                                            {t.qcTemplates.required}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex gap-3">
                            <button
                                onClick={() => setShowFieldModal(false)}
                                className="flex-1 px-4 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl hover:bg-[var(--color-surface-hover)] font-medium transition-all"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                onClick={handleSaveField}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 font-medium shadow-lg shadow-teal-500/25 transition-all"
                            >
                                {editingField ? t.common.save : t.common.add}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
