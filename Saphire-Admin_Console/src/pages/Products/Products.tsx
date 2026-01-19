import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { productApi } from '../../api/product.api';
import type { Product, ProductRequest } from '../../api/product.api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Products() {
    const { t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductRequest>({ name: '', code: '', description: '', active: true });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try { const response = await productApi.getAll(); setProducts(response.data.data || []); }
        catch (error) { console.error('Failed to fetch products:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = () => { setEditItem(null); setFormData({ name: '', code: '', description: '', active: true }); setShowModal(true); };

    const handleEdit = (item: Product) => {
        setEditItem(item);
        setFormData({ name: item.name, code: item.code, description: item.description || '', active: item.active });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t.common.confirm)) return;
        try { await productApi.delete(id); fetchData(); } catch (error) { console.error('Failed to delete:', error); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) { await productApi.update(editItem.id, formData); }
            else { await productApi.create(formData); }
            setShowModal(false);
            fetchData();
        } catch (error) { console.error('Failed to save:', error); }
        finally { setSaving(false); }
    };

    const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                    <input type="text" placeholder={t.products.searchProducts} value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                    <Plus size={18} />{t.products.addProduct}
                </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[var(--color-bg)]">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.name}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.code}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.description}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.products.noProducts}</td></tr>
                        ) : (
                            filtered.map((product) => (
                                <tr key={product.id} className="hover:bg-[var(--color-surface-hover)]">
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{product.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">{product.name}</td>
                                    <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-[var(--color-bg)] rounded font-mono text-xs">{product.code}</span></td>
                                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] max-w-xs truncate">{product.description || '-'}</td>
                                    <td className="px-6 py-4">
                                        {product.active ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium"><CheckCircle size={12} /> {t.common.active}</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"><XCircle size={12} /> {t.common.inactive}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(product)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">{editItem ? t.products.editProduct : t.products.addProduct}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.common.name}</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.common.code}</label>
                                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.common.description}</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" rows={3} />
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
