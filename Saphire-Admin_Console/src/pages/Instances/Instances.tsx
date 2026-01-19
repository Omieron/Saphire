import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, MapPin, Package } from 'lucide-react';
import { instanceApi } from '../../api/instance.api';
import type { ProductInstance, ProductInstanceRequest } from '../../api/instance.api';
import { productApi } from '../../api/product.api';
import type { Product } from '../../api/product.api';
import { routeApi } from '../../api/route.api';
import type { ProductRoute } from '../../api/route.api';
import { locationApi } from '../../api/location.api';
import type { Location } from '../../api/location.api';
import { useLanguage } from '../../contexts/LanguageContext';

const statusColors: Record<string, { bg: string; text: string }> = {
    CREATED: { bg: 'bg-slate-500/10', text: 'text-slate-500' },
    IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    PAUSED: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    COMPLETED: { bg: 'bg-green-500/10', text: 'text-green-500' },
    CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-500' },
};

const priorityMap: Record<number, string> = { 0: 'NORMAL', 1: 'MEDIUM', 2: 'HIGH' };

export default function Instances() {
    const { t } = useLanguage();
    const [instances, setInstances] = useState<ProductInstance[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [routes, setRoutes] = useState<ProductRoute[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<ProductInstanceRequest>({ productId: 0, routeId: 0, locationId: 0, serialNumber: '', priority: 0 });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [instRes, prodRes, routeRes, locRes] = await Promise.all([
                instanceApi.getAll(), productApi.getAll(), routeApi.getAll(), locationApi.getAll()
            ]);
            setInstances(instRes.data.data || []);
            setProducts(prodRes.data.data || []);
            setRoutes(routeRes.data.data || []);
            setLocations(locRes.data.data || []);
        } catch (error) { console.error('Failed to fetch:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = () => {
        setFormData({ productId: products[0]?.id || 0, routeId: routes[0]?.id || 0, locationId: locations[0]?.id || 0, serialNumber: '', priority: 0 });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t.common.confirm)) return;
        try { await instanceApi.delete(id); fetchData(); } catch (error) { console.error('Failed to delete:', error); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try { await instanceApi.create(formData); setShowModal(false); fetchData(); }
        catch (error) { console.error('Failed to save:', error); }
        finally { setSaving(false); }
    };

    const filtered = instances.filter((inst) => {
        const matchesSearch = inst.serialNumber.toLowerCase().includes(search.toLowerCase()) || (inst.productName || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === '' || inst.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 0: return t.instances.priorityNormal;
            case 1: return t.instances.priorityMedium;
            case 2: return t.instances.priorityHigh;
            default: return priorityMap[priority] || 'Normal';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                        <input type="text" placeholder={t.instances.searchInstances} value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">{t.instances.allStatuses}</option>
                        {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                    <Plus size={18} />{t.instances.newInstance}
                </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[var(--color-bg)]">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.instances.serialNumber}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.routes.product}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.instances.route}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.machines.location}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.instances.priority}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {loading ? (
                            <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.instances.noInstances}</td></tr>
                        ) : (
                            filtered.map((inst) => {
                                const statusStyle = statusColors[inst.status] || statusColors.CREATED;
                                return (
                                    <tr key={inst.id} className="hover:bg-[var(--color-surface-hover)]">
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{inst.id}</td>
                                        <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-[var(--color-bg)] rounded font-mono text-xs">{inst.serialNumber}</span></td>
                                        <td className="px-6 py-4 text-sm"><span className="inline-flex items-center gap-1 text-[var(--color-text)]"><Package size={14} className="text-[var(--color-text-secondary)]" />{inst.productName}</span></td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{inst.routeName}</td>
                                        <td className="px-6 py-4 text-sm"><span className="inline-flex items-center gap-1 text-[var(--color-text-secondary)]"><MapPin size={14} />{inst.locationName}</span></td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${inst.priority === 2 ? 'bg-red-500/10 text-red-500' : inst.priority === 1 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                {getPriorityLabel(inst.priority)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 ${statusStyle.bg} ${statusStyle.text} rounded-full text-xs font-medium`}>{inst.status}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(inst.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t.instances.newInstance}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.routes.product}</label>
                                <select value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                                    <option value="">{t.routes.product}</option>
                                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.instances.route}</label>
                                <select value={formData.routeId} onChange={(e) => setFormData({ ...formData, routeId: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                                    <option value="">{t.instances.route}</option>
                                    {routes.filter(r => r.productId === formData.productId || !formData.productId).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.machines.location}</label>
                                <select value={formData.locationId} onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                                    <option value="">{t.machines.location}</option>
                                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.instances.serialNumber}</label>
                                <input type="text" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" placeholder={t.instances.autoGenerated} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.instances.priority}</label>
                                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                                    <option value={0}>{t.instances.priorityNormal}</option>
                                    <option value={1}>{t.instances.priorityMedium}</option>
                                    <option value={2}>{t.instances.priorityHigh}</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">{t.common.cancel}</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50">{saving ? t.common.loading : t.common.save}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
