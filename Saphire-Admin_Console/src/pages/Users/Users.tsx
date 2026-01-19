import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Shield, Eye, User as UserIcon } from 'lucide-react';
import { userApi } from '../../api/user.api';
import type { UserRequest } from '../../api/user.api';
import type { User } from '../../api/auth.api';
import { useLanguage } from '../../contexts/LanguageContext';

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
    const [filterRole, setFilterRole] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserRequest>({ username: '', password: '', email: '', fullName: '', role: 'OPERATOR', active: true });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try { const response = await userApi.getAll(); setUsers(response.data.data || []); }
        catch (error) { console.error('Failed to fetch users:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = () => { setEditItem(null); setFormData({ username: '', password: '', email: '', fullName: '', role: 'OPERATOR', active: true }); setShowModal(true); };

    const handleEdit = (item: User) => {
        setEditItem(item);
        setFormData({ username: item.username, password: '', email: item.email, fullName: item.fullName, role: item.role, active: item.active });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t.common.confirm)) return;
        try { await userApi.delete(id); fetchData(); } catch (error) { console.error('Failed to delete:', error); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dataToSend = { ...formData };
            if (editItem && !dataToSend.password) { delete dataToSend.password; }
            if (editItem) { await userApi.update(editItem.id, dataToSend); }
            else { await userApi.create(dataToSend); }
            setShowModal(false);
            fetchData();
        } catch (error) { console.error('Failed to save:', error); }
        finally { setSaving(false); }
    };

    const filtered = users.filter((u) => {
        const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = filterRole === '' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                        <input type="text" placeholder={t.users.searchUsers} value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
                    </div>
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">{t.users.allRoles}</option>
                        <option value="ADMIN">{t.users.roleAdmin}</option>
                        <option value="SUPERVISOR">{t.users.roleSupervisor}</option>
                        <option value="OPERATOR">{t.users.roleOperator}</option>
                    </select>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                    <Plus size={18} />{t.users.addUser}
                </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
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
                                            <button onClick={() => handleDelete(user.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"><Trash2 size={16} /></button>
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
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">{editItem ? t.users.editUser : t.users.addUser}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.auth.username}</label>
                                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                    {t.auth.password} {editItem && <span className="text-xs text-[var(--color-text-secondary)]">{t.users.passwordHint}</span>}
                                </label>
                                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required={!editItem} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.users.fullName}</label>
                                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.users.email}</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.users.role}</label>
                                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                                    <option value="ADMIN">{t.users.roleAdmin}</option>
                                    <option value="SUPERVISOR">{t.users.roleSupervisor}</option>
                                    <option value="OPERATOR">{t.users.roleOperator}</option>
                                </select>
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
