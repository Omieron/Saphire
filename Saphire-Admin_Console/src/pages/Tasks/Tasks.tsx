import React, { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Clock, CheckCircle, XCircle, User, Cpu, Package, Calendar, Hash, ArrowRight, ShieldCheck, ShieldAlert, ChevronDown, ChevronRight, Settings, ClipboardCheck, FileText } from 'lucide-react';
import { taskAssignmentApi, type TaskAssignment, type TaskAssignmentType, type TaskSchedule } from '../../api/taskAssignment.api';
import { userApi } from '../../api/user.api';
import { qcTemplateApi, type QcFormTemplate } from '../../api/qcTemplate.api';
import { machineApi, type Machine } from '../../api/machine.api';
import { productApi, type Product } from '../../api/product.api';
import type { User as UserType } from '../../api/auth.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Toast from '../../components/Toast/Toast';

export default function Tasks() {
    const { t } = useLanguage();
    const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [templates, setTemplates] = useState<QcFormTemplate[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [editItem, setEditItem] = useState<TaskAssignment | null>(null);
    const [saving, setSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        templateId: 0,
        type: 'RECURRING' as TaskAssignmentType,
        machineId: null as number | null,
        productId: null as number | null,
        userIds: [] as number[],
        schedules: [] as TaskSchedule[]
    });

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        showForm && currentLocation.pathname !== nextLocation.pathname
    );

    const [deleteTarget, setDeleteTarget] = useState<TaskAssignment | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchData = async () => {
        try {
            const [assignmentsRes, usersRes, templatesRes, machinesRes, productsRes] = await Promise.all([
                taskAssignmentApi.getAll(),
                userApi.getAll(),
                qcTemplateApi.getAll(),
                machineApi.getAll(),
                productApi.getAll()
            ]);
            setAssignments(assignmentsRes.data.data || []);
            setUsers(usersRes.data.data || []);
            setTemplates(templatesRes.data.data || []);
            setMachines(machinesRes.data.data || []);
            setProducts(productsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditItem(null);
        setFormData({
            templateId: 0,
            type: 'RECURRING',
            machineId: null,
            productId: null,
            userIds: [],
            schedules: [{ startTime: '08:00', endTime: '09:00', dayOfWeek: 1 }]
        });
        setShowForm(true);
    };

    const handleEdit = (item: TaskAssignment) => {
        setEditItem(item);
        setFormData({
            templateId: item.templateId,
            type: item.type,
            machineId: item.machineId || null,
            productId: item.productId || null,
            userIds: item.assignedUsers.map(u => u.id),
            schedules: item.schedules.map(s => ({ ...s }))
        });
        setShowForm(true);
    };

    const handleAddSchedule = () => {
        const newSchedule: TaskSchedule = formData.type === 'RECURRING'
            ? { startTime: '09:00', endTime: '10:00', dayOfWeek: 1 }
            : { startTime: '09:00', endTime: '10:00', specificDate: new Date().toISOString().split('T')[0] };
        setFormData({ ...formData, schedules: [...formData.schedules, newSchedule] });
    };

    const handleRemoveSchedule = (index: number) => {
        const newSchedules = formData.schedules.filter((_, i) => i !== index);
        setFormData({ ...formData, schedules: newSchedules });
    };

    const updateSchedule = (index: number, field: keyof TaskSchedule, value: any) => {
        const newSchedules = formData.schedules.map((s, i) => i === index ? { ...s, [field]: value } : s);
        setFormData({ ...formData, schedules: newSchedules });
    };

    const toggleUser = (userId: number) => {
        setFormData(prev => {
            const userIds = prev.userIds.includes(userId)
                ? prev.userIds.filter(id => id !== userId)
                : [...prev.userIds, userId];
            return { ...prev, userIds };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.userIds.length === 0) {
            setToast({ show: true, message: 'Lütfen en az bir kullanıcı seçin!', type: 'error' });
            return;
        }
        if (formData.templateId === 0) {
            setToast({ show: true, message: 'Lütfen bir şablon seçiniz!', type: 'error' });
            return;
        }

        const selectedTemplate = templates.find(t => String(t.id) === String(formData.templateId));
        if (selectedTemplate?.contextType === 'MACHINE' && !formData.machineId) {
            setToast({ show: true, message: 'Lütfen bir makine seçiniz!', type: 'error' });
            return;
        }
        if (selectedTemplate?.contextType === 'PRODUCT' && !formData.productId) {
            setToast({ show: true, message: 'Lütfen bir ürün seçiniz!', type: 'error' });
            return;
        }

        if (formData.schedules.length === 0) {
            setToast({ show: true, message: 'Lütfen en az bir zaman aralığı ekleyin!', type: 'error' });
            return;
        }

        const hasInvalidTime = formData.schedules.some(s => s.endTime <= s.startTime);
        if (hasInvalidTime) {
            setToast({ show: true, message: t.tasks.invalidTimeRange, type: 'error' });
            return;
        }

        setShowSaveConfirm(true);
    };

    const processSubmit = async () => {
        setShowSaveConfirm(false);
        setSaving(true);
        try {
            if (editItem) {
                await taskAssignmentApi.update(editItem.id, formData);
            } else {
                await taskAssignmentApi.create(formData);
            }
            setShowForm(false);
            setToast({ show: true, message: t.tasks.taskSaved, type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
            setToast({ show: true, message: t.common.error, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await taskAssignmentApi.delete(deleteTarget.id);
            setDeleteTarget(null);
            setToast({ show: true, message: t.common.recordDeleted, type: 'success' });
            fetchData();
        } catch (error) {
            setToast({ show: true, message: t.common.error, type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    const groupedMachines = machines.reduce((acc, m) => {
        if (!acc[m.locationName]) acc[m.locationName] = [];
        acc[m.locationName].push(m);
        return acc;
    }, {} as Record<string, Machine[]>);

    const groupedTemplates = templates.reduce((acc, t) => {
        if (!acc[t.contextType]) acc[t.contextType] = [];
        acc[t.contextType].push(t);
        return acc;
    }, {} as Record<string, QcFormTemplate[]>);

    const filtered = assignments.filter(a => {
        const searchLower = search.toLowerCase();
        const machineName = a.machineId ? machines.find(m => m.id == a.machineId)?.name || '' : '';
        const productName = a.productId ? products.find(p => p.id == a.productId)?.name || '' : '';

        return a.templateName.toLowerCase().includes(searchLower) ||
            a.templateCode.toLowerCase().includes(searchLower) ||
            machineName.toLowerCase().includes(searchLower) ||
            productName.toLowerCase().includes(searchLower);
    });

    const selectedTemplate = templates.find(t => t.id === formData.templateId);
    const selectedMachine = machines.find(m => m.id === formData.machineId);
    const selectedProduct = products.find(p => p.id === formData.productId);
    const selectedUsers = users.filter(u => formData.userIds.includes(u.id));

    return (
        <div className="space-y-4">
            {!showForm ? (
                <>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                            <input type="text" placeholder={t.tasks.searchTasks} value={search} onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 h-[40px]" />
                        </div>
                        <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-bold h-[40px]">
                            <Plus size={18} />{t.tasks.addTask}
                        </button>
                    </div>

                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.tasks.title}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcTemplates.productMachine}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.tasks.assignToUsers}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.tasks.schedules}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.tasks.noTasks}</td></tr>
                                ) : (
                                    filtered.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <tr className="hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-[var(--color-text-secondary)]">
                                                            {expandedRow === item.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[var(--color-text)]">{item.templateName}</div>
                                                            <div className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase mt-0.5">{item.templateCode}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(item.machineId !== null && item.machineId !== undefined) ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-teal-500 flex items-center gap-1.5">
                                                                <Cpu size={12} /> {item.machineName || machines.find(m => String(m.id) === String(item.machineId))?.name || `M ID: ${item.machineId}`}
                                                            </span>
                                                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono ml-4">
                                                                {machines.find(m => String(m.id) === String(item.machineId))?.code || ''}
                                                            </span>
                                                        </div>
                                                    ) : (item.productId !== null && item.productId !== undefined) ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-blue-500 flex items-center gap-1.5">
                                                                <Package size={12} /> {item.productName || products.find(p => String(p.id) === String(item.productId))?.name || `P ID: ${item.productId}`}
                                                            </span>
                                                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono ml-4">
                                                                {products.find(p => String(p.id) === String(item.productId))?.code || ''}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-[var(--color-text-secondary)] italic">No Context (-)</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {item.assignedUsers.slice(0, 2).map(u => (
                                                            <div key={u.id} title={u.fullName} className="inline-flex items-center gap-1.5 px-2 py-1 bg-teal-500/5 border border-teal-500/10 rounded-full">
                                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                                                                    {u.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                </div>
                                                                <span className="text-xs font-bold text-teal-600 truncate max-w-[60px]">{u.fullName.split(' ')[0]}</span>
                                                            </div>
                                                        ))}
                                                        {item.assignedUsers.length > 2 && (
                                                            <div className="w-7 h-7 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-secondary)] shrink-0 shadow-sm">
                                                                +{item.assignedUsers.length - 2}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {item.schedules.slice(0, 1).map((s, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)]">
                                                                <Clock size={12} className="text-teal-500" /> {s.startTime} - {s.endTime}
                                                            </span>
                                                        ))}
                                                        <div className="flex gap-1">
                                                            <span className={`px-1.5 py-0.5 ${item.type === 'RECURRING' ? 'bg-purple-500/10 text-purple-500' : 'bg-orange-500/10 text-orange-500'} rounded text-[10px] font-black uppercase tracking-tighter`}>
                                                                {item.type === 'RECURRING' ? t.tasks.recurring : t.tasks.once}
                                                            </span>
                                                            {item.schedules.length > 1 && (
                                                                <span className="px-1.5 py-0.5 bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded text-[10px] font-bold">
                                                                    +{item.schedules.length - 1} More
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold"><CheckCircle size={12} /> {t.common.active}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold"><XCircle size={12} /> {t.common.inactive}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                            {expandedRow === item.id && (
                                                <tr className="bg-[var(--color-bg)] animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <td colSpan={6} className="px-12 py-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">{t.tasks.assignToUsers}</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {item.assignedUsers.map(u => (
                                                                        <div key={u.id} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                                                                            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                                                {u.fullName.split(' ').map(n => n[0]).join('')}
                                                                            </div>
                                                                            <span className="text-xs font-bold text-[var(--color-text)]">{u.fullName}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">{t.tasks.schedules}</h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {item.schedules.map((s, idx) => (
                                                                        <div key={idx} className="flex items-center gap-3 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                                                                            <div className="w-8 h-8 rounded-lg bg-teal-500/5 flex items-center justify-center text-teal-500 border border-teal-500/10">
                                                                                <Clock size={14} />
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] font-black text-[var(--color-text)]">
                                                                                    {item.type === 'RECURRING' ? (t.tasks.days as any)[s.dayOfWeek || 1] : s.specificDate}
                                                                                </span>
                                                                                <span className="text-[9px] text-[var(--color-text-secondary)] font-bold">{s.startTime} ~ {s.endTime}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm}
                        title={t.common.deleteConfirm} message={t.common.deleteMessage} loading={deleting} />

                    <Toast isOpen={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.message} type={toast.type} duration={3000} />
                </>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 items-start">
                    {/* Left: Planning Form */}
                    <div className="lg:col-span-7 space-y-8 pb-12">
                        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 p-6 rounded-2xl border border-teal-500/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
                                    {editItem ? <Pencil size={24} /> : <Plus size={24} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight">
                                        {editItem ? t.tasks.editTask : t.tasks.addTask}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {t.tasks.formDescription}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Template Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-teal-500" /> {t.tasks.selectTemplate}
                                        </label>
                                        <div className="relative group">
                                            <select value={formData.templateId} onChange={(e) => {
                                                const tid = Number(e.target.value);
                                                setFormData({ ...formData, templateId: tid, machineId: null, productId: null });
                                            }}
                                                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 appearance-none font-semibold transition-all group-hover:border-teal-500/50">
                                                <option value={0} disabled>{t.tasks.selectTemplatePlaceholder}</option>
                                                {Object.entries(groupedTemplates).map(([contextType, tmps]) => {
                                                    const labelKey = contextType === 'MACHINE' ? 'machineTemplates' :
                                                        contextType === 'PRODUCT' ? 'productTemplates' :
                                                            contextType === 'PROCESS' ? 'processTemplates' : 'generalTemplates';
                                                    const groupLabel = String((t.qcTemplates as any)[labelKey] || contextType);
                                                    return (
                                                        <optgroup key={contextType} label={groupLabel}>
                                                            {tmps.map(tmp => (
                                                                <option key={tmp.id} value={tmp.id}>{tmp.name} ({tmp.code})</option>
                                                            ))}
                                                        </optgroup>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Assignment Type */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                            <Calendar size={14} className="text-teal-500" /> {t.tasks.assignmentType}
                                        </label>
                                        <div className="flex bg-[var(--color-bg)] p-1.5 rounded-xl border border-[var(--color-border)] h-[52px]">
                                            <button type="button" onClick={() => setFormData({ ...formData, type: 'RECURRING' })}
                                                className={`flex-1 rounded-lg text-xs font-black transition-all uppercase tracking-wider ${formData.type === 'RECURRING' ? 'bg-teal-500 text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}>
                                                {t.tasks.recurring}
                                            </button>
                                            <button type="button" onClick={() => setFormData({ ...formData, type: 'ONCE' })}
                                                className={`flex-1 rounded-lg text-xs font-black transition-all uppercase tracking-wider ${formData.type === 'ONCE' ? 'bg-teal-500 text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}>
                                                {t.tasks.once}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Context Selector */}
                                {formData.templateId > 0 && selectedTemplate?.contextType === 'MACHINE' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                            <Cpu size={14} className="text-teal-500" /> {t.qcTemplates.selectMachine}
                                        </label>
                                        <select value={formData.machineId ? String(formData.machineId) : ''} onChange={(e) => setFormData({ ...formData, machineId: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 appearance-none font-semibold transition-all">
                                            <option value="">{t.tasks.selectMachinePlaceholder}</option>
                                            {Object.entries(groupedMachines).map(([loc, ms]) => (
                                                <optgroup key={loc} label={loc}>
                                                    {ms.map(m => (
                                                        <option key={m.id} value={String(m.id)}>{m.name} ({m.code})</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {formData.templateId > 0 && selectedTemplate?.contextType === 'PRODUCT' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                            <Package size={14} className="text-teal-500" /> {t.qcTemplates.selectProduct}
                                        </label>
                                        <select value={formData.productId ? String(formData.productId) : ''} onChange={(e) => setFormData({ ...formData, productId: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 appearance-none font-semibold transition-all">
                                            <option value="">{t.tasks.selectProductPlaceholder}</option>
                                            {products.map(p => <option key={p.id} value={String(p.id)}>{p.name} ({p.code})</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* User Assignment */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <User size={14} className="text-teal-500" /> {t.tasks.assignToUsers}
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto p-1 custom-scrollbar">
                                        {users.filter(u => u.role.includes('OPERATOR')).map(user => (
                                            <label key={user.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all ${formData.userIds.includes(user.id) ? 'border-teal-500 bg-teal-500/5' : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)]'}`}>
                                                <input type="checkbox" checked={formData.userIds.includes(user.id)} onChange={() => toggleUser(user.id)} className="sr-only" />
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shrink-0 uppercase">
                                                    {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <div className={`text-sm font-bold truncate ${formData.userIds.includes(user.id) ? 'text-teal-600' : 'text-[var(--color-text)]'}`}>{user.fullName}</div>
                                                    <div className="text-[10px] text-[var(--color-text-secondary)]">@{user.username}</div>
                                                </div>
                                                {formData.userIds.includes(user.id) && <CheckCircle size={16} className="text-teal-500" />}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Schedule Builder */}
                                <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                            <Clock size={14} className="text-teal-500" /> {t.tasks.schedules}
                                        </label>
                                        <button type="button" onClick={handleAddSchedule} className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 rounded-lg text-xs font-black transition-all">
                                            <Plus size={14} /> {t.tasks.addSchedule.toUpperCase()}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.schedules.map((schedule, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl relative group/row animate-in fade-in slide-in-from-left-2 duration-200">
                                                {formData.type === 'RECURRING' ? (
                                                    <div className="flex-[1.5] w-full">
                                                        <label className="block text-[10px] uppercase font-black text-[var(--color-text-secondary)] mb-1.5">{t.tasks.dayOfWeek}</label>
                                                        <select value={schedule.dayOfWeek} onChange={(e) => updateSchedule(idx, 'dayOfWeek', Number(e.target.value))}
                                                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all h-[44px]">
                                                            {[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{(t.tasks.days as any)[d]}</option>)}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="flex-[1.5] w-full">
                                                        <label className="block text-[10px] uppercase font-black text-[var(--color-text-secondary)] mb-1.5">{t.tasks.specificDate}</label>
                                                        <input type="date" value={schedule.specificDate} onChange={(e) => updateSchedule(idx, 'specificDate', e.target.value)}
                                                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all h-[44px]" />
                                                    </div>
                                                )}
                                                <div className="flex-1 w-full">
                                                    <label className="block text-[10px] uppercase font-black text-[var(--color-text-secondary)] mb-1.5">{t.tasks.startTime}</label>
                                                    <input type="time" value={schedule.startTime} onChange={(e) => updateSchedule(idx, 'startTime', e.target.value)}
                                                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all h-[44px]" />
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <label className="block text-[10px] uppercase font-black text-[var(--color-text-secondary)] mb-1.5">{t.tasks.endTime}</label>
                                                    <input type="time" value={schedule.endTime} onChange={(e) => updateSchedule(idx, 'endTime', e.target.value)}
                                                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all h-[44px]" />
                                                </div>
                                                <button type="button" onClick={() => handleRemoveSchedule(idx)} className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all sm:mb-0.5">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-[var(--color-border)]">
                                <button type="button" onClick={() => setShowCancelConfirm(true)}
                                    className="px-8 py-4 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500/5 transition-all font-black text-sm flex-1 md:flex-none">
                                    {t.common.cancel.toUpperCase()}
                                </button>
                                <button type="submit" disabled={saving}
                                    className="px-12 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl hover:shadow-xl hover:shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-50 font-black text-sm flex-1 md:flex-none">
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t.common.loading.toUpperCase()}
                                        </div>
                                    ) : t.tasks.confirmAssignment.toUpperCase()}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Premium Job Ticket Preview */}
                    <div className="lg:col-span-5 sticky top-24">
                        <div className="relative group">
                            {/* Decorative Glow */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
                                {/* Ticket Header */}
                                <div className="bg-gradient-to-br from-[#1a1c1e] to-[#2d3135] p-8 text-white relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <ShieldCheck size={120} />
                                    </div>
                                    <div className="relative z-10 flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                            <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                                                {formData.type === 'RECURRING' ? 'RECURRING TASK' : 'ONE-TIME TASK'}
                                            </div>
                                            <div className="flex -space-x-3">
                                                {selectedUsers.map(u => (
                                                    <div key={u.id} className="w-9 h-9 rounded-full bg-teal-500 border-2 border-[#1a1c1e] flex items-center justify-center text-[10px] font-black shadow-lg" title={u.fullName}>
                                                        {u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                ))}
                                                {selectedUsers.length === 0 && (
                                                    <div className="w-9 h-9 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                                                        <User size={14} className="text-white/30" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-xl">
                                                <FileText size={28} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-2xl font-black text-white tracking-tight leading-none">
                                                    {selectedTemplate?.name || 'Untitled Job'}
                                                </h4>
                                                <div className="text-teal-400 font-mono text-[10px] font-bold flex items-center gap-1.5 bg-teal-500/10 w-fit px-2 py-0.5 rounded-md border border-teal-500/20">
                                                    <Hash size={10} /> {selectedTemplate?.code || 'T-XXXX'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Details */}
                                <div className="p-8 space-y-10">
                                    {/* Info Grid - Context & Security */}
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Target Context</span>
                                            <div className="flex items-center gap-3">
                                                {selectedTemplate?.contextType === 'MACHINE' ? (
                                                    <>
                                                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
                                                            <Cpu size={20} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[var(--color-text)] truncate max-w-[100px]">
                                                                {selectedMachine?.name || 'Pending...'}
                                                            </span>
                                                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{selectedMachine?.code || 'M-XXXX'}</span>
                                                        </div>
                                                    </>
                                                ) : selectedTemplate?.contextType === 'PRODUCT' ? (
                                                    <>
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                                            <Package size={20} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[var(--color-text)] truncate max-w-[100px]">
                                                                {selectedProduct?.name || 'Pending...'}
                                                            </span>
                                                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{selectedProduct?.code || 'P-XXXX'}</span>
                                                        </div>
                                                    </>
                                                ) : selectedTemplate?.contextType === 'PROCESS' ? (
                                                    <>
                                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                                                            <Settings size={20} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[var(--color-text)]">Process</span>
                                                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">SPECIFIC</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-500">
                                                            <ClipboardCheck size={20} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[var(--color-text)]">General Task</span>
                                                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">GLOBAL-CTX</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 text-right flex flex-col items-end">
                                            <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Security Layer</span>
                                            {selectedTemplate?.requiresApproval ? (
                                                <div className="flex items-center gap-2 text-blue-500 bg-blue-500/5 px-3 py-2 rounded-xl border border-blue-500/10">
                                                    <ShieldCheck size={14} />
                                                    <span className="text-[10px] font-black uppercase text-blue-600">{t.tasks.verified}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-400 bg-slate-500/5 px-3 py-2 rounded-xl border border-slate-500/10">
                                                    <ShieldAlert size={14} />
                                                    <span className="text-[10px] font-black uppercase">{t.tasks.standard}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline - Simplified list */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Execution Timeline</span>
                                            <span className="text-[10px] font-black text-teal-600 flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-teal-500" />
                                                {formData.schedules.length} WINDOWS
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.schedules.length === 0 ? (
                                                <div className="py-8 rounded-2xl bg-white/[0.02] border border-dashed border-[var(--color-border)] text-center">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Waiting for schedule parameters</span>
                                                </div>
                                            ) : (
                                                formData.schedules.slice(0, 3).map((s, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm hover:border-teal-500/30 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-500/5 flex items-center justify-center text-slate-400 border border-[var(--color-border)] group-hover:bg-teal-500/5 group-hover:text-teal-500 group-hover:border-teal-500/20 transition-colors">
                                                                <Clock size={18} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-[var(--color-text)]">
                                                                    {formData.type === 'RECURRING' ? (t.tasks.days as any)[s.dayOfWeek || 1] : s.specificDate}
                                                                </span>
                                                                <span className="text-xs text-[var(--color-text-secondary)] font-bold">{s.startTime} — {s.endTime}</span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                                                    </div>
                                                ))
                                            )}
                                            {formData.schedules.length > 3 && (
                                                <div className="text-center text-[10px] font-black text-teal-600/50 uppercase pt-2 tracking-widest">
                                                    + {formData.schedules.length - 3} additional windows hidden
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Tear-off */}
                            <div className="mt-auto border-t-[3px] border-dashed border-[var(--color-border)] p-8 flex items-center justify-between bg-slate-50/50 dark:bg-black/10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-1">Assignment Readiness</span>
                                    <div className="flex items-center gap-2 text-teal-600 font-black">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                        <span className="text-[11px] uppercase">{t.tasks.allocationPending}</span>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-slate-800 text-white rounded-lg text-[10px] font-mono font-black tracking-widest border border-white/5 shadow-xl">
                                    QC-READY
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation */}
            <ConfirmModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={processSubmit}
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
                    setShowForm(false);
                    if (blocker.state === 'blocked') blocker.proceed();
                }}
                title={t.common.cancelConfirm}
                message={t.common.cancelMessage}
                simple={true}
                variant="danger"
                confirmLabel={t.common.giveUp}
                cancelLabel={t.common.back}
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title={t.common.deleteConfirm}
                message={t.common.deleteMessage}
                loading={deleting}
            />

            <Toast
                isOpen={toast.show}
                onClose={() => setToast({ ...toast, show: false })}
                message={toast.message}
                type={toast.type}
                duration={3000}
            />
        </div>
    );
}
