import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, FileCheck, Eye, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { qcRecordApi } from '../../api/qcRecord.api';
import type { QcFormRecord } from '../../api/qcRecord.api';
import { useLanguage } from '../../contexts/LanguageContext';

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    DRAFT: { bg: 'bg-slate-500/10', text: 'text-slate-500', icon: Clock },
    IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Clock },
    SUBMITTED: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: FileCheck },
    APPROVED: { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle },
    REJECTED: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
};

const resultColors: Record<string, { bg: string; text: string }> = {
    PASS: { bg: 'bg-green-500/10', text: 'text-green-500' },
    FAIL: { bg: 'bg-red-500/10', text: 'text-red-500' },
    CONDITIONAL: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
};

export default function QcRecords() {
    const { t } = useLanguage();
    const [records, setRecords] = useState<QcFormRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<QcFormRecord | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchData = async () => {
        try { const response = await qcRecordApi.getAll(); setRecords(response.data.data || []); }
        catch (error) { console.error('Failed to fetch:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id: number) => {
        if (!confirm(t.common.confirm)) return;
        setProcessing(true);
        try { await qcRecordApi.approve(id); fetchData(); }
        catch (error) { console.error('Failed to approve:', error); }
        finally { setProcessing(false); }
    };

    const handleReject = async () => {
        if (!selectedRecord || !rejectReason) return;
        setProcessing(true);
        try {
            await qcRecordApi.reject(selectedRecord.id, rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedRecord(null);
            fetchData();
        } catch (error) { console.error('Failed to reject:', error); }
        finally { setProcessing(false); }
    };

    const openRejectModal = (record: QcFormRecord) => {
        setSelectedRecord(record);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const filtered = records.filter((r) => {
        const matchesSearch = r.templateName.toLowerCase().includes(search.toLowerCase()) || r.templateCode.toLowerCase().includes(search.toLowerCase()) || (r.productInstanceSerial || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === '' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                        <input type="text" placeholder={t.qcRecords.searchRecords} value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64" />
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">{t.instances.allStatuses}</option>
                        {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <AlertCircle size={16} />
                    {records.filter(r => r.status === 'SUBMITTED').length} {t.qcRecords.pendingApproval}
                </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[var(--color-bg)]">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.template}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.machineInstance}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.filledBy}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.result}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.status}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.submitted}</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {loading ? (
                            <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.qcRecords.noRecords}</td></tr>
                        ) : (
                            filtered.map((record) => {
                                const statusStyle = statusColors[record.status] || statusColors.DRAFT;
                                const StatusIcon = statusStyle.icon;
                                const resultStyle = record.overallResult ? (resultColors[record.overallResult] || resultColors.PASS) : null;
                                return (
                                    <tr key={record.id} className="hover:bg-[var(--color-surface-hover)]">
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{record.id}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div>
                                                <span className="font-medium text-[var(--color-text)]">{record.templateName}</span>
                                                <span className="ml-2 px-2 py-0.5 bg-[var(--color-bg)] rounded font-mono text-xs">{record.templateCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{record.machineName || record.productInstanceSerial || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text)]">{record.filledByName || '-'}</td>
                                        <td className="px-6 py-4">
                                            {resultStyle ? (
                                                <span className={`inline-flex items-center px-2 py-1 ${resultStyle.bg} ${resultStyle.text} rounded text-xs font-medium`}>{record.overallResult}</span>
                                            ) : (
                                                <span className="text-[var(--color-text-secondary)] text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 ${statusStyle.bg} ${statusStyle.text} rounded-full text-xs font-medium`}>
                                                <StatusIcon size={12} />{record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            {record.status === 'SUBMITTED' && (
                                                <>
                                                    <button onClick={() => handleApprove(record.id)} disabled={processing} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title={t.qcRecords.approve}><ThumbsUp size={16} /></button>
                                                    <button onClick={() => openRejectModal(record)} disabled={processing} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1" title={t.qcRecords.reject}><ThumbsDown size={16} /></button>
                                                </>
                                            )}
                                            <button onClick={() => setSelectedRecord(record)} className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors ml-1" title={t.common.edit}><Eye size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t.qcRecords.rejectRecord}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{t.qcRecords.rejectionReason} <span className="text-red-500">*</span></label>
                                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" rows={4} placeholder={t.qcRecords.provideReason} required />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">{t.common.cancel}</button>
                                <button onClick={handleReject} disabled={!rejectReason || processing} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">{processing ? t.common.loading : t.qcRecords.reject}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
