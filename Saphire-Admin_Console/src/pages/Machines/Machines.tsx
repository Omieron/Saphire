import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, MapPin, Wrench, Activity, Cpu, Hash } from 'lucide-react';
import { machineApi } from '../../api/machine.api';
import type { Machine, MachineRequest } from '../../api/machine.api';
import { locationApi } from '../../api/location.api';
import type { Location } from '../../api/location.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Toast from '../../components/Toast/Toast';
import PageTour from '../../components/PageTour/PageTour';

const PAGE_TOUR_STEPS = [
    { id: 'search', targetSelector: '[data-tour="machines-search"]', titleKey: 'search', descKey: 'search', position: 'bottom' as const },
    { id: 'add', targetSelector: '[data-tour="machines-add"]', titleKey: 'add', descKey: 'add', position: 'left' as const },
];
const statusColors: Record<string, { bg: string; text: string; gradient: string }> = {
    IDLE: { bg: 'bg-slate-500/10', text: 'text-slate-500', gradient: 'from-slate-500 to-slate-600' },
    RUNNING: { bg: 'bg-green-500/10', text: 'text-green-500', gradient: 'from-green-500 to-emerald-600' },
    SETUP: { bg: 'bg-blue-500/10', text: 'text-blue-500', gradient: 'from-blue-500 to-indigo-600' },
    MAINTENANCE: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', gradient: 'from-yellow-500 to-orange-600' },
    BREAKDOWN: { bg: 'bg-red-500/10', text: 'text-red-500', gradient: 'from-red-500 to-rose-600' },
    OFFLINE: { bg: 'bg-gray-500/10', text: 'text-gray-500', gradient: 'from-gray-500 to-gray-600' },
};

export default function Machines() {
    const { t } = useLanguage();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterLocation, setFilterLocation] = useState<number | ''>('');
    const [showForm, setShowForm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [editItem, setEditItem] = useState<Machine | null>(null);
    const [formData, setFormData] = useState<MachineRequest>({ locationId: 0, code: '', name: '', type: '', active: true, maintenanceMode: false });
    const [saving, setSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        showForm && currentLocation.pathname !== nextLocation.pathname
    );

    const fetchData = async () => {
        try {
            const [machRes, locRes] = await Promise.all([machineApi.getAll(), locationApi.getAll()]);
            setMachines(machRes.data.data || []);
            setLocations(locRes.data.data || []);
        } catch (error) { console.error('Failed to fetch:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = () => {
        setEditItem(null);
        setFormData({ locationId: 0, code: '', name: '', type: '', active: true, maintenanceMode: false });
        setShowForm(true);
    };

    const handleEdit = (item: Machine) => {
        setEditItem(item);
        setFormData({ locationId: item.locationId, code: item.code, name: item.name, type: item.type || '', active: item.active, maintenanceMode: item.maintenanceMode });
        setShowForm(true);
    };

    const handleDeleteClick = (item: Machine) => {
        setDeleteTarget(item);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await machineApi.delete(deleteTarget.id);
            setDeleteTarget(null);
            setToast({ show: true, message: t.common.recordDeleted, type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
            setToast({ show: true, message: 'Silme işlemi başarısız oldu!', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleMaintenance = async (machine: Machine) => {
        try { await machineApi.setMaintenanceMode(machine.id, !machine.maintenanceMode); fetchData(); }
        catch (error) { console.error('Failed to toggle maintenance:', error); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.locationId === 0) {
            setToast({ show: true, message: t.common.selectLocation, type: 'error' });
            return;
        }
        setShowSaveConfirm(true);
    };

    const processSubmit = async () => {
        setShowSaveConfirm(false);
        setSaving(true);
        try {
            if (editItem) { await machineApi.update(editItem.id, formData); }
            else { await machineApi.create(formData); }
            setShowForm(false);
            setToast({ show: true, message: t.common.success, type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
            setToast({ show: true, message: t.common.error, type: 'error' });
        }
        finally { setSaving(false); }
    };

    const filtered = machines.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
        const matchesLocation = filterLocation === '' || m.locationId === filterLocation;
        return matchesSearch && matchesLocation;
    });

    return (
        <div className="space-y-4">
            {!showForm ? (
                <>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="relative" data-tour="machines-search">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                                <input type="text" placeholder={t.machines.searchMachines} value={search} onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 h-[40px]" />
                            </div>
                            <div className="relative">
                                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="pl-4 pr-10 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 h-[40px] appearance-none">
                                    <option value="">{t.machines.allLocations}</option>
                                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleAdd} data-tour="machines-add" className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold h-[40px]">
                            <Plus size={18} />{t.machines.addMachine}
                        </button>
                    </div>

                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.name}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.code}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.machines.location}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.machines.type}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.active}</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {loading ? (
                                    <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.machines.noMachines}</td></tr>
                                ) : (
                                    filtered.map((machine) => {
                                        const currentStatus = machine.status?.currentStatus || 'OFFLINE';
                                        const statusStyle = statusColors[currentStatus] || statusColors.OFFLINE;
                                        return (
                                            <tr key={machine.id} className="hover:bg-[var(--color-surface-hover)]">
                                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{machine.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                                                    <div className="flex items-center gap-2">
                                                        {machine.name}
                                                        {machine.maintenanceMode && (
                                                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-xs"><Wrench size={10} className="inline mr-1" />{t.machines.maintenance}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-[var(--color-bg)] rounded font-mono text-xs">{machine.code}</span></td>
                                                <td className="px-6 py-4 text-sm"><span className="inline-flex items-center gap-1 text-[var(--color-text-secondary)]"><MapPin size={14} />{machine.locationName}</span></td>
                                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{machine.type || '-'}</td>
                                                <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2 py-1 ${statusStyle.bg} ${statusStyle.text} rounded-full text-xs font-medium`}><Activity size={12} />{currentStatus}</span></td>
                                                <td className="px-6 py-4">
                                                    {machine.active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium"><CheckCircle size={12} /> {t.common.active}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"><XCircle size={12} /> {t.common.inactive}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleToggleMaintenance(machine)} className={`p-2 rounded-lg transition-colors ${machine.maintenanceMode ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-[var(--color-text-secondary)] hover:text-yellow-500 hover:bg-yellow-500/10'}`} title={t.machines.maintenanceMode}><Wrench size={16} /></button>
                                                    <button onClick={() => handleEdit(machine)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                                                    <button onClick={() => handleDeleteClick(machine)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 items-start">
                    {/* Left: Form Inputs */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 p-6 rounded-2xl border border-teal-500/20 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                    {editItem ? <Pencil size={24} className="text-white" /> : <Plus size={24} className="text-white" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
                                        {editItem ? t.machines.editMachine : t.machines.addMachine}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {editItem ? 'Mevcut makine teknik detaylarını güncelleyin' : 'Sisteme yeni bir endüstriyel makine tanımlayın'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <MapPin size={14} className="text-teal-500" /> {t.machines.location}
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={formData.locationId}
                                            onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 appearance-none font-medium transition-all group-hover:border-teal-500/50"
                                            required
                                        >
                                            <option value={0} disabled>{t.common.selectLocation}</option>
                                            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Cpu size={14} className="text-teal-500" /> {t.common.name}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder={t.common.enterName}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-medium transition-all group-hover:border-teal-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Hash size={14} className="text-teal-500" /> {t.common.code}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder={t.common.enterCode}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-mono transition-all group-hover:border-teal-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Wrench size={14} className="text-teal-500" /> {t.machines.type}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            placeholder="CNC, Lathe, Drill..."
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 transition-all group-hover:border-teal-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {formData.active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <label htmlFor="active" className="text-sm font-bold text-[var(--color-text)] cursor-pointer">{t.common.active}</label>
                                        <p className="text-[10px] text-[var(--color-text-secondary)]">Genel operasyonel durum</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="toggle"
                                    />
                                </div>
                                <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.maintenanceMode ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                        <Wrench size={20} />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <label htmlFor="maintenance" className="text-sm font-bold text-[var(--color-text)] cursor-pointer">{t.machines.maintenanceMode}</label>
                                        <p className="text-[10px] text-[var(--color-text-secondary)]">Bakım modu kilit durumu</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="maintenance"
                                        checked={formData.maintenanceMode}
                                        onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                                        className="toggle"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-[var(--color-border)]">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="px-6 py-3 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/5 transition-all font-semibold flex-1 md:flex-none"
                                >
                                    {t.common.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-50 font-bold flex-1 md:flex-none"
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t.common.loading}
                                        </div>
                                    ) : t.common.save}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Premium Machine Dashboard Preview */}
                    <div className="lg:col-span-5 sticky top-24">
                        <div className="relative group">
                            {/* Decorative Background Elements */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl shadow-black/5 overflow-hidden">
                                {/* Header Mesh */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent -mr-12 -mt-12 rounded-full blur-2xl" />

                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl transition-all ${editItem ? statusColors[editItem.status?.currentStatus || 'OFFLINE']?.gradient : 'from-teal-500 to-emerald-600'}`}>
                                            <Cpu size={32} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${formData.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                {formData.active ? 'ACTIVE' : 'DISABLED'}
                                            </div>
                                            {formData.maintenanceMode && (
                                                <div className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 animate-pulse">
                                                    MAINTENANCE MODE
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black text-[var(--color-text)] leading-tight break-words">
                                            {formData.name || 'Machine Identifier'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-teal-500 font-mono text-sm font-bold">
                                            <Hash size={14} />
                                            {formData.code || 'SERIAL-NUMBER'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-secondary)]">Location</span>
                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                                <MapPin size={12} className="text-teal-500" />
                                                <span className="truncate">{locations.find(l => l.id === formData.locationId)?.name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 text-right">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-secondary)]">Asset Type</span>
                                            <div className="flex items-center justify-end gap-2 text-xs font-semibold">
                                                <Wrench size={12} className="text-teal-500" />
                                                <span className="truncate">{formData.type || 'Standard Asset'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] relative overflow-hidden group/item">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <Activity size={40} />
                                        </div>
                                        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium relative z-10">
                                            "Asset telemetry and operational data are verified through this identity layer. Maintenance modes prevent accidental job assignments."
                                        </p>
                                    </div>
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

            {/* Page Tour */}
            <PageTour
                pageName="machines"
                steps={PAGE_TOUR_STEPS}
                translations={{
                    search: { title: 'Makine Ara', desc: 'Makineleri isim veya kod ile arayabilirsiniz.' },
                    add: { title: 'Yeni Makine', desc: 'Sisteme yeni makine eklemek için tıklayın.' },
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title={t.common.deleteConfirm}
                message={t.common.deleteMessage}
                loading={deleting}
            />

            {/* Success/Error Toast */}
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
