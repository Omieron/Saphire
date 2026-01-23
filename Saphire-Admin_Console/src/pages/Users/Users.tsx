import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Shield, Eye, User as UserIcon, Mail, Key } from 'lucide-react';
import { userApi } from '../../api/user.api';
import type { UserRequest } from '../../api/user.api';
import type { User } from '../../api/auth.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Toast from '../../components/Toast/Toast';
import PageTour from '../../components/PageTour/PageTour';

const PAGE_TOUR_STEPS = [
    { id: 'search', targetSelector: '[data-tour="users-search"]', titleKey: 'search', descKey: 'search', position: 'bottom' as const },
    { id: 'filter', targetSelector: '[data-tour="users-filter"]', titleKey: 'filter', descKey: 'filter', position: 'bottom' as const },
    { id: 'add', targetSelector: '[data-tour="users-add"]', titleKey: 'add', descKey: 'add', position: 'left' as const },
];
const roleColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    ADMIN: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: Shield },
    SUPERVISOR: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Eye },
    OPERATOR: { bg: 'bg-green-500/10', text: 'text-green-500', icon: UserIcon },
};

export default function Users() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [filterRole, setFilterRole] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [editItem, setEditItem] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserRequest>({ username: '', password: '', email: '', fullName: '', role: 'OPERATOR', active: true });
    const [saving, setSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
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
            const response = await userApi.getAll(debouncedSearch);
            setUsers(response.data.data || []);
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            const errMsg = error.response?.data?.message || error.message;
            setToast({ show: true, message: `Hata: ${errMsg}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [debouncedSearch]);

    const handleAdd = () => { setEditItem(null); setFormData({ username: '', password: '', email: '', fullName: '', role: 'OPERATOR', active: true }); setShowForm(true); };

    const handleEdit = (item: User) => {
        setEditItem(item);
        setFormData({ username: item.username, password: '', email: item.email, fullName: item.fullName, role: item.role, active: item.active });
        setShowForm(true);
    };

    const handleDeleteClick = (item: User) => {
        setDeleteTarget(item);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await userApi.delete(deleteTarget.id);
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
            const dataToSend: any = { ...formData };
            if (editItem && !dataToSend.password) { delete dataToSend.password; }
            if (editItem) { await userApi.update(editItem.id, dataToSend); }
            else { await userApi.create(dataToSend); }
            setShowForm(false);
            setToast({ show: true, message: t.common.success, type: 'success' });
            fetchData();
        } catch (error: any) {
            console.error('Failed to save:', error);
            let errMsg = 'Kaydetme işlemi başarısız oldu!';
            if (error.response?.data) {
                const apiRes = error.response.data;
                errMsg = apiRes.message || errMsg;
                if (apiRes.data && typeof apiRes.data === 'object') {
                    const validationErrors = Object.entries(apiRes.data)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join(', ');
                    if (validationErrors) errMsg += ` (${validationErrors})`;
                }
            }
            setToast({ show: true, message: `Hata: ${errMsg}`, type: 'error' });
        }
        finally { setSaving(false); }
    };

    const filtered = users.filter((u) => {
        const matchesRole = filterRole === '' || u.role === filterRole;
        return matchesRole;
    });

    return (
        <div className="space-y-4">
            {!showForm ? (
                <>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="relative" data-tour="users-search">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                                <input type="text" placeholder={t.users.searchUsers} value={search} onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 h-[40px]" />
                            </div>
                            <div className="relative">
                                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                                    data-tour="users-filter"
                                    className="pl-4 pr-10 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 h-[40px] appearance-none">
                                    <option value="">{t.users.allRoles}</option>
                                    <option value="ADMIN">{t.users.roleAdmin}</option>
                                    <option value="SUPERVISOR">{t.users.roleSupervisor}</option>
                                    <option value="OPERATOR">{t.users.roleOperator}</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={handleAdd} data-tour="users-add" className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold h-[40px]">
                            <Plus size={18} />{t.users.addUser}
                        </button>
                    </div>

                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.auth.username}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.users.fullName}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.users.email}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.users.role}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.users.noUsers}</td></tr>
                                ) : (
                                    filtered.map((user) => {
                                        const roleStyle = roleColors[user.role] || roleColors.OPERATOR;
                                        const RoleIcon = roleStyle.icon;
                                        return (
                                            <tr key={user.id} className="hover:bg-[var(--color-surface-hover)]">
                                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{user.id}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]"><span className="px-2 py-1 bg-[var(--color-bg)] rounded font-mono text-xs">{user.username}</span></td>
                                                <td className="px-6 py-4 text-sm text-[var(--color-text)]">{user.fullName}</td>
                                                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{user.email}</td>
                                                <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2 py-1 ${roleStyle.bg} ${roleStyle.text} rounded-full text-xs font-medium`}><RoleIcon size={12} />{user.role === 'ADMIN' ? t.users.roleAdmin : user.role === 'SUPERVISOR' ? t.users.roleSupervisor : t.users.roleOperator}</span></td>
                                                <td className="px-6 py-4">
                                                    {user.active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium"><CheckCircle size={12} /> {t.common.active}</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"><XCircle size={12} /> {t.common.inactive}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleEdit(user)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                                                    <button onClick={() => handleDeleteClick(user)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
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
                                        {editItem ? t.users.editUser : t.users.addUser}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {editItem ? 'Mevcut kullanıcı profilini güncelleyin' : 'Sisteme yeni bir kullanıcı profili tanımlayın'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <UserIcon size={14} className="text-teal-500" /> {t.auth.username}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder={t.auth.enterUsername}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-mono transition-all group-hover:border-teal-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Key size={14} className="text-teal-500" /> {t.auth.password}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={editItem ? t.users.passwordHint : t.auth.enterPassword}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 transition-all group-hover:border-teal-500/50"
                                            required={!editItem}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <UserIcon size={14} className="text-teal-500" /> {t.users.fullName}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder={t.common.enterName}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 font-medium transition-all group-hover:border-teal-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Mail size={14} className="text-teal-500" /> {t.users.email}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder={t.common.enterEmail}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 transition-all group-hover:border-teal-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                                        <Shield size={14} className="text-teal-500" /> {t.users.role}
                                    </label>
                                    <div className="relative group">
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-teal-500 appearance-none font-medium transition-all group-hover:border-teal-500/50"
                                            required
                                        >
                                            <option value="ADMIN">{t.users.roleAdmin}</option>
                                            <option value="SUPERVISOR">{t.users.roleSupervisor}</option>
                                            <option value="OPERATOR">{t.users.roleOperator}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-end pb-1">
                                    <div className="p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] inline-flex items-center gap-4 w-full">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {formData.active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <label htmlFor="active" className="text-sm font-bold text-[var(--color-text)] cursor-pointer">{t.common.active}</label>
                                            <p className="text-[10px] text-[var(--color-text-secondary)]">Giriş yetkisi durumu</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            id="active"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            className="toggle"
                                        />
                                    </div>
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

                    {/* Right: Premium Profile Preview */}
                    <div className="lg:col-span-5 sticky top-24">
                        <div className="relative group">
                            {/* Decorative Background Elements */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-10 shadow-2xl shadow-black/5 overflow-hidden text-center">
                                {/* Header Mesh */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent -mr-12 -mt-12 rounded-full blur-2xl" />

                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl text-3xl font-black ${formData.role === 'ADMIN' ? 'from-purple-500 to-indigo-600 shadow-purple-500/20' : formData.role === 'SUPERVISOR' ? 'from-blue-500 to-cyan-600 shadow-blue-500/20' : 'from-teal-500 to-emerald-600 shadow-teal-500/20'}`}>
                                            {formData.fullName ? formData.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black text-[var(--color-text)] leading-tight tracking-tight">
                                                {formData.fullName || 'User Full Name'}
                                            </h4>
                                            <p className="text-sm font-medium text-[var(--color-text-secondary)]">@{formData.username || 'username'}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 ${roleColors[formData.role]?.bg || 'bg-teal-500/10'} ${roleColors[formData.role]?.text || 'text-teal-500'} border border-current/20`}>
                                            {formData.role === 'ADMIN' ? <Shield size={14} /> : formData.role === 'SUPERVISOR' ? <Eye size={14} /> : <UserIcon size={14} />}
                                            {formData.role || 'ROLE'}
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 ${formData.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${formData.active ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {formData.active ? 'ACTIVE' : 'INACTIVE'}
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-[var(--color-border)] space-y-4">
                                        <div className="flex items-center gap-4 text-left p-3 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center text-teal-500 shadow-sm">
                                                <Mail size={18} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-[var(--color-text-secondary)]">Email Address</span>
                                                <span className="text-sm font-semibold truncate">{formData.email || 'not specified'}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)]">
                                            <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed italic">
                                                "Saphire OS User Profile - Verified on Identity Layer"
                                            </p>
                                        </div>
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
                pageName="users"
                steps={PAGE_TOUR_STEPS}
                translations={{
                    search: { title: 'Kullanıcı Ara', desc: 'Kullanıcıları isim veya e-posta ile arayabilirsiniz.' },
                    filter: { title: 'Role Göre Filtrele', desc: 'Kullanıcıları rolüne göre filtreleyebilirsiniz.' },
                    add: { title: 'Yeni Kullanıcı', desc: 'Sisteme yeni kullanıcı eklemek için tıklayın.' },
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
