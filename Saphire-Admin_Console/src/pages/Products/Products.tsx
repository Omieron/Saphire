import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Package, Barcode, ClipboardList, Hash } from 'lucide-react';
import { productApi } from '../../api/product.api';
import type { Product, ProductRequest } from '../../api/product.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Toast from '../../components/Toast/Toast';
import PageTour from '../../components/PageTour/PageTour';

const PAGE_TOUR_STEPS = [
    { id: 'search', targetSelector: '[data-tour="products-search"]', titleKey: 'search', descKey: 'search', position: 'bottom' as const },
    { id: 'add', targetSelector: '[data-tour="products-add"]', titleKey: 'add', descKey: 'add', position: 'left' as const },
];
export default function Products() {
    const { t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [editItem, setEditItem] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductRequest>({ name: '', code: '', description: '', active: true });
    const [saving, setSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
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
        try { const response = await productApi.getAll(); setProducts(response.data.data || []); }
        catch (error) { console.error('Failed to fetch products:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = () => { setEditItem(null); setFormData({ name: '', code: '', description: '', active: true }); setShowForm(true); };

    const handleEdit = (item: Product) => {
        setEditItem(item);
        setFormData({ name: item.name, code: item.code, description: item.description || '', active: item.active });
        setShowForm(true);
    };

    const handleDeleteClick = (item: Product) => {
        setDeleteTarget(item);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await productApi.delete(deleteTarget.id);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const processSubmit = async () => {
        setShowSaveConfirm(false);
        setSaving(true);
        try {
            if (editItem) { await productApi.update(editItem.id, formData); }
            else { await productApi.create(formData); }
            setShowForm(false);
            setToast({ show: true, message: t.common.success, type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
            setToast({ show: true, message: t.common.error, type: 'error' });
        }
        finally { setSaving(false); }
    };

    const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-4">
            {!showForm ? (
                <>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="relative" data-tour="products-search">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                            <input type="text" placeholder={t.products.searchProducts} value={search} onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 h-[40px]" />
                        </div>
                        <button onClick={handleAdd} data-tour="products-add" className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold h-[40px]">
                            <Plus size={18} />{t.products.addProduct}
                        </button>
                    </div>

                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
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
                                                <button onClick={() => handleDeleteClick(product)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))
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
                                        {editItem ? t.products.editProduct : t.products.addProduct}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {editItem ? 'Mevcut ürün tanımlarını güncelleyin' : 'Sisteme yeni bir ticaret ürünü tanımlayın'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Package size={14} className="text-teal-500" /> {t.common.name}
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
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <ClipboardList size={14} className="text-teal-500" /> {t.common.description}
                                    </label>
                                    <div className="relative group">
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder={t.common.enterDescription}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 transition-all group-hover:border-teal-500/50 min-h-[100px] resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] inline-flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {formData.active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="active" className="text-sm font-bold text-[var(--color-text)] cursor-pointer">{t.common.active}</label>
                                    <p className="text-xs text-[var(--color-text-secondary)]">Ürünün aktif stok ve sipariş durumu</p>
                                </div>
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="toggle ml-4"
                                />
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

                    {/* Right: Premium Product Spec Preview */}
                    <div className="lg:col-span-5 h-full flex flex-col justify-center">
                        <div className="relative group">
                            {/* Decorative Background Elements */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl shadow-black/5 overflow-hidden">
                                {/* Header Mesh */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent -mr-12 -mt-12 rounded-full blur-2xl" />

                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-xl">
                                            <Package size={32} />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${formData.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {formData.active ? 'IN STOCK & ACTIVE' : 'OUT OF CATALOG'}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black text-[var(--color-text)] leading-tight break-words">
                                            {formData.name || 'Product Specification Name'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-teal-500 font-mono text-sm font-bold">
                                            <Barcode size={14} />
                                            {formData.code || 'SKU-000000'}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[var(--color-border)]">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-secondary)] block mb-2">Technical Description</span>
                                        <p className="text-sm font-medium leading-relaxed italic text-[var(--color-text)] line-clamp-4">
                                            {formData.description || 'No detailed technical specifications provided for this product entry.'}
                                        </p>
                                    </div>

                                    <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--color-bg)] flex items-center justify-center text-teal-500 border border-[var(--color-border)]">
                                            <ClipboardList size={16} />
                                        </div>
                                        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium">
                                            "Verified product identity ensures accurate QC templates and manufacturing logs across all industrial stages."
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
                pageName="products"
                steps={PAGE_TOUR_STEPS}
                translations={{
                    search: { title: 'Ürün Ara', desc: 'Ürünleri isim veya kod ile arayabilirsiniz.' },
                    add: { title: 'Yeni Ürün', desc: 'Sisteme yeni ürün eklemek için tıklayın.' },
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
