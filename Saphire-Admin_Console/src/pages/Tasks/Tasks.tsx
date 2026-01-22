import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { taskAssignmentApi, type TaskAssignment, type TaskAssignmentType, type TaskSchedule } from '../../api/taskAssignment.api';
import { userApi } from '../../api/user.api';
import { qcTemplateApi, type QcFormTemplate } from '../../api/qcTemplate.api';
import { machineApi, type Machine } from '../../api/machine.api';
import { productApi, type Product } from '../../api/product.api';
import type { User } from '../../api/auth.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Toast from '../../components/Toast/Toast';

export default function Tasks() {
    const { t } = useLanguage();
    const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [templates, setTemplates] = useState<QcFormTemplate[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<TaskAssignment | null>(null);
    const [saving, setSaving] = useState(false);

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

    // Removal of auto-select effect to favor explicit user selection

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

    const handleSubmit = async (e: React.FormEvent) => {
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

    if (!showForm) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                        <input type="text" placeholder={t.tasks.searchTasks} value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
                    </div>
                    <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                        <Plus size={18} />{t.tasks.addTask}
                    </button>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--color-bg)]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">{t.tasks.title}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">{t.qcTemplates.productMachine}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">{t.tasks.assignToUsers}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">{t.tasks.schedules}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">{t.common.status}</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase">{t.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.tasks.noTasks}</td></tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-[var(--color-text)]">{item.templateName}</div>
                                            <div className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase mt-0.5">{item.templateCode}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(item.machineId !== null && item.machineId !== undefined) ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-teal-700">
                                                        {item.machineName || machines.find(m => String(m.id) === String(item.machineId))?.name || `M ID: ${item.machineId}`}
                                                    </span>
                                                    <span className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase">
                                                        {machines.find(m => String(m.id) === String(item.machineId))?.code || ''}
                                                    </span>
                                                </div>
                                            ) : (item.productId !== null && item.productId !== undefined) ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-blue-700">
                                                        {item.productName || products.find(p => String(p.id) === String(item.productId))?.name || `P ID: ${item.productId}`}
                                                    </span>
                                                    <span className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase">
                                                        {products.find(p => String(p.id) === String(item.productId))?.code || ''}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No Context (-)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {item.assignedUsers.slice(0, 2).map(u => (
                                                    <div key={u.id} title={u.fullName} className="inline-flex items-center gap-1.5 px-2 py-1 bg-teal-500/5 border border-teal-500/10 rounded-full">
                                                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                                                            {u.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </div>
                                                        <span className="text-xs font-medium text-teal-700 whitespace-nowrap">{u.fullName.split(' ')[0]}</span>
                                                    </div>
                                                ))}
                                                {item.assignedUsers.length > 2 && (
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                                                        +{item.assignedUsers.length - 2}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.schedules.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-xs">
                                                        <Clock size={10} /> {item.schedules[0].startTime}-{item.schedules[0].endTime}
                                                        {item.schedules.length > 1 && ` (+${item.schedules.length - 1})`}
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${item.type === 'RECURRING' ? 'bg-purple-500/10 text-purple-500' : 'bg-orange-500/10 text-orange-500'} rounded text-xs`}>
                                                    {item.type === 'RECURRING' ? t.tasks.recurring : t.tasks.once}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium"><CheckCircle size={12} /> {t.common.active}</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"><XCircle size={12} /> {t.common.inactive}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                                            <button onClick={() => setDeleteTarget(item)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm}
                    title={t.common.deleteConfirm} message={t.common.deleteMessage} loading={deleting} />

                <Toast isOpen={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.message} type={toast.type} duration={3000} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    {editItem ? t.tasks.editTask : t.tasks.addTask}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Template Selection */}
                        <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
                            <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">{t.tasks.selectTemplate}</div>
                            <select value={formData.templateId} onChange={(e) => {
                                const tid = Number(e.target.value);
                                setFormData({ ...formData, templateId: tid, machineId: null, productId: null });
                            }}
                                className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all">
                                <option value={0} disabled>Şablon seçiniz...</option>
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

                        {/* Assignment Type */}
                        <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
                            <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">{t.tasks.assignmentType}</div>
                            <div className="flex bg-[var(--color-surface)] p-1.5 rounded-xl border border-[var(--color-border)]">
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'RECURRING' })}
                                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${formData.type === 'RECURRING' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}>
                                    {t.tasks.recurring}
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'ONCE' })}
                                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${formData.type === 'ONCE' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}>
                                    {t.tasks.once}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Context Selector */}
                    {formData.templateId > 0 && templates.find(t => String(t.id) === String(formData.templateId))?.contextType === 'MACHINE' && (
                        <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
                            <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">{t.qcTemplates.selectMachine}</div>
                            <select value={formData.machineId ? String(formData.machineId) : ''} onChange={(e) => setFormData({ ...formData, machineId: e.target.value ? Number(e.target.value) : null })}
                                className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all">
                                <option value="">Makine seçiniz...</option>
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

                    {formData.templateId > 0 && templates.find(t => String(t.id) === String(formData.templateId))?.contextType === 'PRODUCT' && (
                        <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
                            <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">{t.qcTemplates.selectProduct}</div>
                            <select value={formData.productId ? String(formData.productId) : ''} onChange={(e) => setFormData({ ...formData, productId: e.target.value ? Number(e.target.value) : null })}
                                className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all">
                                <option value="">Ürün seçiniz...</option>
                                {products.map(p => <option key={p.id} value={String(p.id)}>{p.name} ({p.code})</option>)}
                            </select>
                        </div>
                    )}

                    {/* User Assignment */}
                    <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
                        <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">{t.tasks.assignToUsers}</div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {users.filter(u => u.role.includes('OPERATOR')).length === 0 ? (
                                <div className="col-span-full py-8 text-center text-sm text-[var(--color-text-secondary)] italic">
                                    Role: OPERATOR olan kullanıcı bulunamadı
                                </div>
                            ) : (
                                users.filter(u => u.role.includes('OPERATOR')).map(user => (
                                    <label key={user.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${formData.userIds.some(id => id == user.id) ? 'border-teal-500 bg-teal-500/10' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'}`}>
                                        <input type="checkbox" checked={formData.userIds.some(id => id == user.id)} onChange={() => toggleUser(user.id)} className="sr-only" />
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 uppercase transition-colors group-hover:bg-slate-300">
                                            {user.fullName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <div className={`text-sm font-semibold ${formData.userIds.some(id => id == user.id) ? 'text-teal-600' : 'text-[var(--color-text)]'}`}>{user.fullName}</div>
                                            <div className="text-[11px] text-[var(--color-text-secondary)]">@{user.username}</div>
                                        </div>
                                        {formData.userIds.some(id => id == user.id) && <CheckCircle size={16} className="text-teal-500" />}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Schedule Builder */}
                    <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.tasks.schedules}</div>
                            <button type="button" onClick={handleAddSchedule} className="px-3 py-1.5 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
                                <Plus size={14} /> {t.tasks.addSchedule}
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.schedules.length === 0 && (
                                <div className="text-center py-6 text-sm text-slate-400 italic">Henüz bir zaman aralığı eklenmedi.</div>
                            )}
                            {formData.schedules.map((schedule, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl relative group">
                                    {formData.type === 'RECURRING' ? (
                                        <div className="flex-[1.5] w-full min-w-[150px]">
                                            <label className="block text-[10px] uppercase font-bold text-[var(--color-text-secondary)] mb-1.5">{t.tasks.dayOfWeek}</label>
                                            <select value={schedule.dayOfWeek} onChange={(e) => updateSchedule(idx, 'dayOfWeek', Number(e.target.value))}
                                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--color-text)] transition-all focus:ring-2 focus:ring-teal-500/20 h-[40px]">
                                                {[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d} className="bg-[var(--color-surface)] text-[var(--color-text)]">{(t.tasks.days as any)[d]}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex-[1.5] w-full min-w-[150px]">
                                            <label className="block text-[10px] uppercase font-bold text-[var(--color-text-secondary)] mb-1.5">{t.tasks.specificDate}</label>
                                            <input type="date" value={schedule.specificDate} onChange={(e) => updateSchedule(idx, 'specificDate', e.target.value)}
                                                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--color-text)] transition-all focus:ring-2 focus:ring-teal-500/20 h-[40px]" />
                                        </div>
                                    )}
                                    <div className="flex-1 w-full min-w-[100px]">
                                        <label className="block text-[10px] uppercase font-bold text-[var(--color-text-secondary)] mb-1.5">{t.tasks.startTime}</label>
                                        <input type="time" value={schedule.startTime} onChange={(e) => updateSchedule(idx, 'startTime', e.target.value)}
                                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--color-text)] transition-all focus:ring-2 focus:ring-teal-500/20 h-[40px]" />
                                    </div>
                                    <div className="flex-1 w-full min-w-[100px]">
                                        <label className="block text-[10px] uppercase font-bold text-[var(--color-text-secondary)] mb-1.5">{t.tasks.endTime}</label>
                                        <input type="time" value={schedule.endTime} onChange={(e) => updateSchedule(idx, 'endTime', e.target.value)}
                                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--color-text)] transition-all focus:ring-2 focus:ring-teal-500/20 h-[40px]" />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveSchedule(idx)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-end pb-12">
                    <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] transition-colors font-bold uppercase tracking-wider text-xs">
                        {t.common.cancel}
                    </button>
                    <button type="submit" disabled={saving} className="px-12 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-bold uppercase tracking-wider text-xs shadow-xl shadow-teal-500/20 disabled:opacity-50">
                        {saving ? t.common.loading : t.common.save}
                    </button>
                </div>
            </form>
            <Toast isOpen={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.message} type={toast.type} duration={3000} />
        </div>
    );
}
