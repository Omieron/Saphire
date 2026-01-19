import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { routeApi } from '../../api/route.api';
import type { ProductRoute, ProductRouteRequest } from '../../api/route.api';
import { productApi } from '../../api/product.api';
import type { Product } from '../../api/product.api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Routes() {
    const { t } = useLanguage();
    const [routes, setRoutes] = useState<ProductRoute[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterProduct, setFilterProduct] = useState<number | ''>('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<ProductRoute | null>(null);
    const [formData, setFormData] = useState<ProductRouteRequest>({ productId: 0, name: '', version: 1, active: true });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [routeRes, prodRes] = await Promise.all([routeApi.getAll(), productApi.getAll()]);
            setRoutes(routeRes.data.data || []);
            setProducts(prodRes.data.data || []);
        } catch (error) { console.error('Failed to fetch:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = () => {
        setEditItem(null);
        setFormData({ productId: products[0]?.id || 0, name: '', version: 1, active: true });
        setShowModal(true);
    };

    const handleEdit = (item: ProductRoute) => {
        setEditItem(item);
        setFormData({ productId: item.productId, name: item.name, version: item.version, active: item.active });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t.common.confirm)) return;
        try { await routeApi.delete(id); fetchData(); } catch (error) { console.error('Failed to delete:', error); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) { await routeApi.update(editItem.id, formData); }
            else { await routeApi.create(formData); }
            setShowModal(false);
            fetchData();
        } catch (error) { console.error('Failed to save:', error); }
        finally { setSaving(false); }
    };

    const filtered = routes.filter((r) => {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.productName.toLowerCase().includes(search.toLowerCase());
        const matchesProduct = filterProduct === '' || r.productId === filterProduct;
        return matchesSearch && matchesProduct;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                        <input type="text" placeholder={t.routes.searchRoutes} value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
                    </div>
                    <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value === '' ? '' : Number(e.target.value))}
                        className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">{t.routes.allProducts}</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                    <Plus size={18} />{t.routes.addRoute}
                </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[var(--color-bg)]">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-8"></th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.name}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.routes.product}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.routes.version}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.routes.steps}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {loading ? (
                            <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.routes.noRoutes}</td></tr>
                        ) : (
                            filtered.map((route) => (
                                <>
                                    <tr key={route.id} className="hover:bg-[var(--color-surface-hover)]">
                                        <td className="px-6 py-4">
                                            <button onClick={() => setExpandedRow(expandedRow === route.id ? null : route.id)} className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                                                {expandedRow === route.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{route.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">{route.name}</td>
                                        <td className="px-6 py-4 text-sm"><span className="inline-flex items-center gap-1 text-[var(--color-text-secondary)]"><Package size={14} />{route.productName}</span></td>
                                        <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-teal-500/10 text-teal-500 rounded text-xs">v{route.version}</span></td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text)]">{route.steps?.length || 0} {t.routes.steps.toLowerCase()}</td>
                                        <td className="px-6 py-4">
                                            {route.active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium"><CheckCircle size={12} /> {t.common.active}</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"><XCircle size={12} /> {t.common.inactive}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(route)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                                            <button onClick={() => handleDelete(route.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                    {expandedRow === route.id && route.steps && route.steps.length > 0 && (
                                        <tr><td colSpan={8} className="px-12 py-4 bg-[var(--color-bg)]">
                                            <h4 className="font-medium text-sm text-[var(--color-text)] mb-3">{t.routes.routeSteps}</h4>
                                            <div className="grid grid-cols-5 gap-2 text-xs font-medium text-[var(--color-text-secondary)] mb-2 px-3">
                                                <div>{t.routes.stepOrder}</div>
                                                <div>{t.routes.stepName}</div>
                                                <div>{t.routes.stepType}</div>
                                                <div>{t.routes.setupTime}</div>
                                                <div>{t.routes.cycleTime}</div>
                                            </div>
                                            <div className="space-y-2">
                                                {route.steps.map((step) => (
                                                    <div key={step.id} className="grid grid-cols-5 gap-2 text-sm bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                                                        <div className="font-medium text-[var(--color-text)]">#{step.stepOrder}</div>
                                                        <div className="text-[var(--color-text)]">{step.stepName}</div>
                                                        <div><span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-xs">{step.stepType}</span></div>
                                                        <div className="text-[var(--color-text-secondary)]">{step.estimatedSetupMinutes || 0} min</div>
                                                        <div className="text-[var(--color-text-secondary)]">{step.estimatedCycleMinutes || 0} min</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td></tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">{editItem ? t.routes.editRoute : t.routes.addRoute}</h3>
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
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.common.name}</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.routes.version}</label>
                                <input type="number" value={formData.version} onChange={(e) => setFormData({ ...formData, version: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required min={1} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500" />
                                <label htmlFor="active" className="text-sm text-[var(--color-text)]">{t.common.active}</label>
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
