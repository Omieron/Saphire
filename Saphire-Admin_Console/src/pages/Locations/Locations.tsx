import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Building2, MapPin, Hash } from 'lucide-react';
import { locationApi } from '../../api/location.api';
import type { Location, LocationRequest } from '../../api/location.api';
import { companyApi } from '../../api/company.api';
import type { Company } from '../../api/company.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Toast from '../../components/Toast/Toast';
import PageTour from '../../components/PageTour/PageTour';

const PAGE_TOUR_STEPS = [
    { id: 'search', targetSelector: '[data-tour="locations-search"]', titleKey: 'search', descKey: 'search', position: 'bottom' as const },
    { id: 'filter', targetSelector: '[data-tour="locations-filter"]', titleKey: 'filter', descKey: 'filter', position: 'bottom' as const },
    { id: 'add', targetSelector: '[data-tour="locations-add"]', titleKey: 'add', descKey: 'add', position: 'left' as const },
];
export default function Locations() {
    const { t } = useLanguage();
    const [locations, setLocations] = useState<Location[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [filterCompany, setFilterCompany] = useState<number | ''>('');
    const [showForm, setShowForm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [editItem, setEditItem] = useState<Location | null>(null);
    const [formData, setFormData] = useState<LocationRequest>({ companyId: 0, name: '', code: '', address: '', active: true });
    const [saving, setSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
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

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [locRes, compRes] = await Promise.all([
                locationApi.getAll(debouncedSearch),
                companyApi.getAll()
            ]);
            setLocations(locRes.data.data || []);
            setCompanies(compRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [debouncedSearch]);

    const handleAdd = () => {
        setEditItem(null);
        setFormData({ companyId: 0, name: '', code: '', address: '', active: true });
        setShowForm(true);
    };

    const handleEdit = (item: Location) => {
        setEditItem(item);
        setFormData({ companyId: item.companyId, name: item.name, code: item.code, address: item.address || '', active: item.active });
        setShowForm(true);
    };

    const handleDeleteClick = (item: Location) => {
        setDeleteTarget(item);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await locationApi.delete(deleteTarget.id);
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
        if (formData.companyId === 0) {
            setToast({ show: true, message: t.common.selectCompany, type: 'error' });
            return;
        }
        setShowSaveConfirm(true);
    };

    const processSubmit = async () => {
        setShowSaveConfirm(false);
        setSaving(true);
        try {
            if (editItem) { await locationApi.update(editItem.id, formData); }
            else { await locationApi.create(formData); }
            setShowForm(false);
            setToast({ show: true, message: t.common.success, type: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to save:', error);
            setToast({ show: true, message: t.common.error, type: 'error' });
        }
        finally { setSaving(false); }
    };

    const filtered = locations.filter((loc) => {
        const matchesCompany = filterCompany === '' || loc.companyId === filterCompany;
        const matchesActive = showInactive || loc.active;
        return matchesCompany && matchesActive;
    });

    return (
        <div className="space-y-4">
            {!showForm ? (
                <>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="relative" data-tour="locations-search">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                                <input type="text" placeholder={t.locations.searchLocations} value={search} onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 h-[40px]" />
                            </div>
                            <div className="relative">
                                <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value === '' ? '' : Number(e.target.value))}
                                    data-tour="locations-filter"
                                    className="pl-4 pr-10 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 h-[40px] appearance-none">
                                    <option value="">{t.locations.allCompanies}</option>
                                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={() => setShowInactive(!showInactive)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all h-[40px] text-xs font-medium ${showInactive
                                    ? 'bg-teal-500/10 border-teal-500 text-teal-600 shadow-sm'
                                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-teal-500/50'
                                    }`}
                            >
                                {showInactive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {showInactive ? t.common.active + ' + ' + t.common.inactive : t.common.active}
                            </button>
                        </div>
                        <button onClick={handleAdd} data-tour="locations-add" className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold h-[40px]">
                            <Plus size={18} />{t.locations.addLocation}
                        </button>
                    </div>

                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.name}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.code}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.locations.company}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.locations.address}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.locations.noLocations}</td></tr>
                                ) : (
                                    filtered.map((loc) => (
                                        <tr key={loc.id} className="hover:bg-[var(--color-surface-hover)]">
                                            <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{loc.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">{loc.name}</td>
                                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-[var(--color-bg)] rounded font-mono text-xs">{loc.code}</span></td>
                                            <td className="px-6 py-4 text-sm"><span className="inline-flex items-center gap-1 text-[var(--color-text-secondary)]"><Building2 size={14} />{loc.companyName}</span></td>
                                            <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] max-w-xs truncate">{loc.address || '-'}</td>
                                            <td className="px-6 py-4">
                                                {loc.active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium"><CheckCircle size={12} /> {t.common.active}</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"><XCircle size={12} /> {t.common.inactive}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleEdit(loc)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                                                <button onClick={() => handleDeleteClick(loc)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
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
                                        {editItem ? t.locations.editLocation : t.locations.addLocation}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {editItem ? 'Mevcut lokasyon bilgilerini güncelleyin' : 'Sisteme yeni bir operasyonel lokasyon tanımlayın'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Building2 size={14} className="text-teal-500" /> {t.locations.company}
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={formData.companyId}
                                            onChange={(e) => setFormData({ ...formData, companyId: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 appearance-none font-medium transition-all group-hover:border-teal-500/50"
                                            required
                                        >
                                            <option value={0} disabled>{t.common.selectCompany}</option>
                                            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
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
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <MapPin size={14} className="text-teal-500" /> {t.locations.address}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder={t.common.enterAddress}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 transition-all group-hover:border-teal-500/50"
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
                                    <p className="text-xs text-[var(--color-text-secondary)]">Lokasyonun operasyonel durumu</p>
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

                    {/* Right: Premium Facility Preview */}
                    <div className="lg:col-span-5 sticky top-24">
                        <div className="relative group">
                            {/* Decorative Background Elements */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl shadow-black/5 overflow-hidden">
                                {/* Header Mesh */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent -mr-12 -mt-12 rounded-full blur-2xl" />

                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-xl">
                                            <MapPin size={32} />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${formData.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {formData.active ? 'OPERATIONAL FACILITY' : 'INACTIVE FACILITY'}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-2xl font-black text-[var(--color-text)] leading-tight break-words">
                                            {formData.name || 'Location Name'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-teal-500 font-mono text-sm font-bold">
                                            <Hash size={14} />
                                            {formData.code || 'CODE'}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
                                        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                            <Building2 size={16} className="text-teal-500" />
                                            <span className="text-xs font-semibold">
                                                {companies.find(c => c.id === formData.companyId)?.name || 'Select Company'}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-3 text-[var(--color-text-secondary)]">
                                            <MapPin size={16} className="text-teal-500 flex-shrink-0" />
                                            <span className="text-xs font-medium leading-relaxed italic">
                                                {formData.address || 'Address not specified'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                                        <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium">
                                            "This location will be used to cluster machines and track inventory flow within the selected company branch."
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
                pageName="locations"
                steps={PAGE_TOUR_STEPS}
                translations={{
                    search: { title: 'Lokasyon Ara', desc: 'Lokasyonları isim veya kod ile arayabilirsiniz.' },
                    filter: { title: 'Şirkete Göre Filtrele', desc: 'Lokasyonları şirkete göre filtreleyebilirsiniz.' },
                    add: { title: 'Yeni Lokasyon', desc: 'Sisteme yeni lokasyon eklemek için tıklayın.' },
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
