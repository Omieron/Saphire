import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
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
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Company | null>(null);
    const [formData, setFormData] = useState<CompanyRequest>({ name: '', code: '', active: true });
    const [saving, setSaving] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success',
    });

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
        setShowModal(true);
    };

    const handleEdit = (item: Company) => {
        setEditItem(item);
        setFormData({ name: item.name, code: item.code, active: item.active });
        setShowModal(true);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) {
                await companyApi.update(editItem.id, formData);
            } else {
                await companyApi.create(formData);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
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
            <div className="flex items-center justify-between">
                <div className="relative" data-tour="companies-search">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                    <input
                        type="text"
                        placeholder={t.companies.searchCompanies}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    data-tour="companies-add"
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                    <Plus size={18} />
                    {t.companies.addCompany}
                </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden" data-tour="companies-table">
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

            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                                {editItem ? t.companies.editCompany : t.companies.addCompany}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.common.name}</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder={t.common.enterName}
                                        className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.common.code}</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder={t.common.enterCode}
                                        className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                                    />
                                    <label htmlFor="active" className="text-sm text-[var(--color-text)]">{t.common.active}</label>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                                    >
                                        {t.common.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? t.common.loading : t.common.save}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

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
        </div >
    );
}
