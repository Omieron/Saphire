import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, MapPin, Wrench, Activity } from 'lucide-react';
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
const statusColors: Record<string, { bg: string; text: string }> = {
    IDLE: { bg: 'bg-slate-500/10', text: 'text-slate-500' },
    RUNNING: { bg: 'bg-green-500/10', text: 'text-green-500' },
    SETUP: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    MAINTENANCE: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    BREAKDOWN: { bg: 'bg-red-500/10', text: 'text-red-500' },
    OFFLINE: { bg: 'bg-gray-500/10', text: 'text-gray-500' },
};

export default function Machines() {
    const { t } = useLanguage();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterLocation, setFilterLocation] = useState<number | ''>('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Machine | null>(null);
    const [formData, setFormData] = useState<MachineRequest>({ locationId: 0, code: '', name: '', type: '', active: true, maintenanceMode: false });
    const [saving, setSaving] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

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
        setFormData({ locationId: locations[0]?.id || 0, code: '', name: '', type: '', active: true, maintenanceMode: false });
        setShowModal(true);
    };

    const handleEdit = (item: Machine) => {
        setEditItem(item);
        setFormData({ locationId: item.locationId, code: item.code, name: item.name, type: item.type || '', active: item.active, maintenanceMode: item.maintenanceMode });
        setShowModal(true);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) { await machineApi.update(editItem.id, formData); }
            else { await machineApi.create(formData); }
            setShowModal(false);
            fetchData();
        } catch (error) { console.error('Failed to save:', error); }
        finally { setSaving(false); }
    };

    const filtered = machines.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
        const matchesLocation = filterLocation === '' || m.locationId === filterLocation;
        return matchesSearch && matchesLocation;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative" data-tour="machines-search">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                        <input type="text" placeholder={t.machines.searchMachines} value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
                    </div>
                    <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value === '' ? '' : Number(e.target.value))}
                        className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">{t.machines.allLocations}</option>
                        {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
                <button onClick={handleAdd} data-tour="machines-add" className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                    <Plus size={18} />{t.machines.addMachine}
                </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
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

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">{editItem ? t.machines.editMachine : t.machines.addMachine}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.machines.location}</label>
                                <select value={formData.locationId} onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                                    <option value="">{t.common.selectLocation}</option>
                                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.common.name}</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t.common.enterName}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.common.code}</label>
                                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder={t.common.enterCode}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.machines.type}</label>
                                <input type="text" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="CNC, Lathe, Drill..." />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500" />
                                    <label htmlFor="active" className="text-sm text-[var(--color-text)]">{t.common.active}</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="maintenance" checked={formData.maintenanceMode} onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })} className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500" />
                                    <label htmlFor="maintenance" className="text-sm text-[var(--color-text)]">{t.machines.maintenanceMode}</label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">{t.common.cancel}</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50">{saving ? t.common.loading : t.common.save}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
