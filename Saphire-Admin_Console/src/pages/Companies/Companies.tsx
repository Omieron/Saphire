import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Building2, Hash, ShieldCheck, Activity } from 'lucide-react';
import { companyApi } from '../../api/company.api';
import type { Company, CompanyRequest } from '../../api/company.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Toast from '../../components/Toast/Toast';
import PageTour from '../../components/PageTour/PageTour';

// Page tour steps
const PAGE_TOUR_STEPS = [
    { id: 'search', targetSelector: '[data-tour="companies-search"]', titleKey: 'search', descKey: 'search', position: 'bottom' as const },
    { id: 'add', targetSelector: '[data-tour="companies-add"]', titleKey: 'add', descKey: 'add', position: 'bottom' as const },
    { id: 'table', targetSelector: '[data-tour="companies-table"]', titleKey: 'table', descKey: 'table', position: 'top' as const },
];
export default function Companies() {
    const { t } = useLanguage();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [editItem, setEditItem] = useState<Company | null>(null);
    const [formData, setFormData] = useState<CompanyRequest>({ name: '', code: '', active: true });
    const [saving, setSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
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
            const response = await companyApi.getAll();
            setCompanies(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditItem(null);
        setFormData({ name: '', code: '', active: true });
        setShowForm(true);
    };

    const handleEdit = (item: Company) => {
        setEditItem(item);
        setFormData({ name: item.name, code: item.code, active: item.active });
        setShowForm(true);
    };

    const handleDeleteClick = (item: Company) => {
        setDeleteTarget(item);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await companyApi.delete(deleteTarget.id);
            setDeleteTarget(null);
            setToast({ show: true, message: t.common.recordDeleted, type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
            setToast({ show: true, message: 'Failed to delete', type: 'error' });
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
            if (editItem) {
                await companyApi.update(editItem.id, formData);
            } else {
                await companyApi.create(formData);
            }
            setShowForm(false);
            setToast({ show: true, message: t.common.success, type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
            setToast({ show: true, message: t.common.error, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const filtered = companies.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {!showForm ? (
                <>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="relative" data-tour="companies-search">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                            <input
                                type="text"
                                placeholder={t.companies.searchCompanies}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 h-[40px]"
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            data-tour="companies-add"
                            className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold h-[40px]"
                        >
                            <Plus size={18} />
                            {t.companies.addCompany}
                        </button>
                    </div>

                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden" data-tour="companies-table">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.name}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.code}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.companies.noCompanies}</td>
                                    </tr>
                                ) : (
                                    filtered.map((company) => (
                                        <tr key={company.id} className="hover:bg-[var(--color-surface-hover)]">
                                            <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{company.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">{company.name}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-2 py-1 bg-[var(--color-bg)] rounded font-mono text-xs">{company.code}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {company.active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                                                        <CheckCircle size={12} /> {t.common.active}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                                                        <XCircle size={12} /> {t.common.inactive}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleEdit(company)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(company)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1">
                                                    <Trash2 size={16} />
                                                </button>
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
                                    <Plus size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
                                        {editItem ? t.companies.editCompany : t.companies.addCompany}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {editItem ? 'Kurumsal kimlik bilgilerini güncelleyin' : 'Sisteme yeni bir kurumsal kimlik tanımlayın'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Building2 size={14} className="text-teal-500" /> {t.common.name}
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
                            </div>

                            <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] inline-flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {formData.active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="active" className="text-sm font-bold text-[var(--color-text)] cursor-pointer">{t.common.active}</label>
                                    <p className="text-xs text-[var(--color-text-secondary)]">Şirket durumu aktif/pasif ayarı</p>
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

                    {/* Right: Premium Identity Preview */}
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
                                            <Building2 size={32} />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${formData.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {formData.active ? 'ACTIVE ENTITY' : 'INACTIVE ENTITY'}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black text-[var(--color-text)] leading-tight break-words">
                                            {formData.name || 'Company Name'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-teal-500 font-mono text-sm font-bold">
                                            <Hash size={14} />
                                            {formData.code || 'CODE'}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[var(--color-border)] grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-bold">Security Level</p>
                                            <div className="flex items-center gap-2 text-[var(--color-text)]">
                                                <ShieldCheck size={16} className="text-teal-500" />
                                                <span className="text-xs font-semibold">Standard</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-bold">System Status</p>
                                            <div className="flex items-center gap-2 text-[var(--color-text)]">
                                                <Activity size={16} className="text-teal-500" />
                                                <span className="text-xs font-semibold">Verified</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                                        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed italic">
                                            "This preview demonstrates how the company profile will appear in the system dashboard and reports."
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

            {/* Page Tour */}
            <PageTour
                pageName="companies"
                steps={PAGE_TOUR_STEPS}
                translations={{
                    search: { title: 'Şirket Ara', desc: 'Şirketleri isim veya kod ile arayabilirsiniz.' },
                    add: { title: 'Yeni Şirket', desc: 'Bu butonla sisteme yeni şirket ekleyebilirsiniz.' },
                    table: { title: 'Şirket Listesi', desc: 'Kayıtlı şirketleri görüntüleyin, düzenleyin veya silin.' },
                }}
            />
        </div>
    );
}
