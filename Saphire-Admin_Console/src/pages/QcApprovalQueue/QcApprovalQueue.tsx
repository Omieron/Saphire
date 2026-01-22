import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, FileCheck, FileSearch, ThumbsUp, ThumbsDown, RotateCcw, ChevronDown } from 'lucide-react';
import { qcRecordApi } from '../../api/qcRecord.api';
import type { QcFormRecord } from '../../api/qcRecord.api';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import StatusModal from '../../components/StatusModal/StatusModal';
import type { StatusModalType } from '../../components/StatusModal/StatusModal';
import { useNotifications } from '../../contexts/NotificationContext';

// resultColors removed as it is not used in the approval queue to prevent pre-judging records

export default function QcApprovalQueue() {
    const { t, language } = useLanguage();
    const { addAlert, removeAlert } = useNotifications();
    const [records, setRecords] = useState<QcFormRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<QcFormRecord | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    // New modal states
    const [approveId, setApproveId] = useState<number | null>(null);
    const [statusModal, setStatusModal] = useState({ isOpen: false, title: '', message: '', type: 'success' as StatusModalType });
    const [manualResult, setManualResult] = useState<'PASS' | 'FAIL' | 'PARTIAL'>('PASS');

    // Filter states
    const [filterTemplate, setFilterTemplate] = useState('');
    const [filterMachine, setFilterMachine] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Derived unique values for filters
    const uniqueTemplates = Array.from(new Set(records.map(r => r.templateName))).filter(Boolean).sort();
    const uniqueMachines = Array.from(new Set(records.map(r => r.machineName || r.productInstanceSerial || ''))).filter(Boolean).sort();
    const uniqueUsers = Array.from(new Set(records.map(r => r.filledByName))).filter(Boolean).sort();

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return t.qcRecords.statusSubmitted;
            case 'APPROVED': return t.qcRecords.statusApproved;
            case 'REJECTED': return t.qcRecords.statusRejected;
            default: return status;
        }
    };

    const fetchData = async () => {
        try {
            const response = await qcRecordApi.getAll();
            // Only show SUBMITTED records in the approval queue
            const allRecords = response.data.data || [];
            const pending = allRecords.filter(r => r.status === 'SUBMITTED');
            setRecords(pending);

            if (pending.length > 0) {
                addAlert({
                    id: 'pending-qc',
                    message: `${pending.length} ${t.qcRecords.pendingApproval}`,
                    type: 'info',
                    targetUrl: '/qc-approval'
                });
            } else {
                removeAlert('pending-qc');
            }
        }
        catch (error) { console.error('Failed to fetch:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        // Clear the alert when visiting the page
        removeAlert('pending-qc');
    }, []);

    const handleApprove = async () => {
        if (!approveId) return;
        setProcessing(true);
        try {
            await qcRecordApi.approve(approveId, manualResult);
            setApproveId(null);
            setStatusModal({
                isOpen: true,
                title: t.common.success || 'Başarılı',
                message: t.qcRecords.approvedSuccess || 'Kayıt başarıyla onaylandı.',
                type: 'success'
            });
            fetchData();
        } catch (error) {
            console.error('Failed to approve:', error);
            setStatusModal({
                isOpen: true,
                title: t.common.error || 'Hata',
                message: 'Onaylama işlemi sırasında bir hata oluştu.',
                type: 'error'
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRecord || !rejectReason) return;
        setProcessing(true);
        try {
            await qcRecordApi.reject(selectedRecord.id, rejectReason, manualResult);
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedRecord(null);
            setStatusModal({
                isOpen: true,
                title: t.common.success || 'Başarılı',
                message: t.qcRecords.rejectedSuccess || 'Kayıt reddedildi.',
                type: 'success'
            });
            fetchData();
        } catch (error) {
            console.error('Failed to reject:', error);
            setStatusModal({
                isOpen: true,
                title: t.common.error || 'Hata',
                message: 'Reddetme işlemi sırasında bir hata oluştu.',
                type: 'error'
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedRecord) return;
        setSavingNotes(true);
        try {
            await qcRecordApi.updateNotes(selectedRecord.id, notes);
            const updatedRecords = records.map(r => r.id === selectedRecord.id ? { ...r, notes } : r);
            setRecords(updatedRecords);
            setSelectedRecord({ ...selectedRecord, notes });
        } catch (error) {
            console.error('Failed to save notes:', error);
            alert('Not kaydedilemedi!');
        } finally {
            setSavingNotes(false);
        }
    };

    const openRejectModal = (record: QcFormRecord) => {
        setSelectedRecord(record);
        setRejectReason('');
        setManualResult((record.overallResult as any) || 'FAIL');
        setShowRejectModal(true);
    };

    const openDetailModal = (record: QcFormRecord) => {
        setSelectedRecord(record);
        setNotes(record.notes || '');
        setManualResult((record.overallResult as any) || 'PASS');
        setShowDetailModal(true);
    };

    const filtered = records.filter((r) => {
        const searchLower = search.toLowerCase();
        const matchesSearch = (
            (r.templateName || '').toLowerCase().includes(searchLower) ||
            (r.templateCode || '').toLowerCase().includes(searchLower) ||
            (r.machineName || '').toLowerCase().includes(searchLower) ||
            (r.productInstanceSerial || '').toLowerCase().includes(searchLower) ||
            (r.filledByName || '').toLowerCase().includes(searchLower) ||
            r.id.toString().includes(searchLower)
        );

        const matchesTemplate = filterTemplate === '' || r.templateName === filterTemplate;
        const matchesMachine = filterMachine === '' || (r.machineName || r.productInstanceSerial || '') === filterMachine;
        const matchesUser = filterUser === '' || r.filledByName === filterUser;

        const recordDate = r.submittedAt ? new Date(r.submittedAt).toISOString().split('T')[0] : '';
        const matchesStart = !filterStartDate || recordDate >= filterStartDate;
        const matchesEnd = !filterEndDate || recordDate <= filterEndDate;

        return matchesSearch && matchesTemplate && matchesMachine && matchesUser && matchesStart && matchesEnd;
    });

    const resetFilters = () => {
        setSearch('');
        setFilterTemplate('');
        setFilterMachine('');
        setFilterUser('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col xl:flex-row gap-4 items-end bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
                    {/* Search */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">{t.common.search}</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                            <input
                                type="text"
                                placeholder={t.qcRecords.searchRecords}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium h-[40px]"
                            />
                        </div>
                    </div>

                    {/* Template Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">{t.qcRecords.template}</label>
                        <div className="relative">
                            <select
                                value={filterTemplate}
                                onChange={(e) => setFilterTemplate(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-all font-medium h-[40px]"
                            >
                                <option value="">{t.qcRecords.allTemplates}</option>
                                {uniqueTemplates.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
                        </div>
                    </div>

                    {/* Machine Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">{t.qcRecords.machineInstance}</label>
                        <div className="relative">
                            <select
                                value={filterMachine}
                                onChange={(e) => setFilterMachine(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-all font-medium h-[40px]"
                            >
                                <option value="">{t.qcRecords.allMachines}</option>
                                {uniqueMachines.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
                        </div>
                    </div>

                    {/* User Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">{t.qcRecords.filledBy}</label>
                        <div className="relative">
                            <select
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-all font-medium h-[40px]"
                            >
                                <option value="">{t.qcRecords.allUsers}</option>
                                {uniqueUsers.map(name => <option key={name as string} value={name as string}>{name}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
                        </div>
                    </div>

                    {/* Start/End Date Group */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">{t.qcRecords.startDate}</label>
                            <input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium h-[40px]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">{t.qcRecords.endDate}</label>
                            <input
                                type="date"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium h-[40px]"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={resetFilters}
                    className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-teal-600 hover:border-teal-500/30 hover:bg-teal-500/5 rounded-lg transition-all h-[40px] flex items-center justify-center min-w-[40px]"
                    title={t.qcRecords.resetFilters}
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-[var(--color-bg)]">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.template}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.machineInstance}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.filledBy}</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.qcRecords.submitted}</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.common.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.common.loading}</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.qcRecords.noRecords}</td></tr>
                        ) : (
                            filtered.map((record) => {
                                return (
                                    <tr key={record.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">#{record.id}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div>
                                                <span className="font-medium text-[var(--color-text)]">{record.templateName}</span>
                                                <span className="ml-2 px-2 py-0.5 bg-[var(--color-bg)] rounded font-mono text-xs text-[var(--color-text-secondary)]">{record.templateCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] font-medium">{record.machineName || record.productInstanceSerial || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text)]">{record.filledByName || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] font-medium">
                                            {record.submittedAt ? new Date(record.submittedAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openDetailModal(record)} className="p-2 text-teal-600 hover:bg-teal-500/10 rounded-lg transition-all" title={t.common.view}>
                                                    <FileSearch size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showDetailModal && selectedRecord && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]/50 rounded-t-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-teal-500/10 text-teal-600 rounded-xl">
                                    <FileCheck size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-[var(--color-text)] leading-none">{selectedRecord.templateName}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-mono">{selectedRecord.templateCode}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20`}>
                                    {getStatusLabel(selectedRecord.status)}
                                </span>
                                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors text-[var(--color-text-secondary)]">
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Simplified Stepper for Approval Queue */}
                        <div className="px-6 py-4 bg-[var(--color-bg)]/30 border-b border-[var(--color-border)]">
                            <div className="flex items-center justify-between max-w-md mx-auto relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--color-border)] -translate-y-1/2 -z-0" />
                                <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-teal-500 -translate-y-1/2 transition-all duration-500 -z-0" />

                                {[
                                    { key: 'SUBMITTED', label: t.qcRecords.statusSubmitted, icon: FileCheck, active: true, completed: true },
                                    { key: 'FINALIZED', label: 'ONAY / RED', icon: CheckCircle, active: false, completed: false }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 relative z-10 bg-[var(--color-surface)] px-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step.completed ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20' :
                                            step.active ? 'border-teal-500 text-teal-600 bg-teal-50' :
                                                'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                                            }`}>
                                            <step.icon size={20} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${step.active || step.completed ? 'text-teal-600' : 'text-[var(--color-text-secondary)]'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-left">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-1">Kayıt ID</p>
                                    <p className="text-sm font-semibold text-[var(--color-text)]">#{selectedRecord.id}</p>
                                </div>
                                <div className="p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-1">Dolduran</p>
                                    <p className="text-sm font-semibold text-[var(--color-text)]">{selectedRecord.filledByName || '-'}</p>
                                </div>
                                <div className="p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-1">Tarih</p>
                                    <p className="text-sm font-semibold text-[var(--color-text)]">
                                        {selectedRecord.submittedAt ? new Date(selectedRecord.submittedAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </p>
                                </div>
                                <div className="p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-secondary)] uppercase font-bold mb-1">İlgili Varlık</p>
                                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">{selectedRecord.machineName || selectedRecord.productInstanceSerial || '-'}</p>
                                </div>
                            </div>

                            {/* Values Table */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                    <Search size={16} /> Kayıt Verileri
                                </h4>
                                <div className="border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] font-bold">
                                            <tr>
                                                <th className="px-4 py-3">Parametre</th>
                                                <th className="px-4 py-3">Değer</th>
                                                <th className="px-4 py-3 text-center">Sonuç</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                                            {selectedRecord.values && selectedRecord.values.length > 0 ? (
                                                selectedRecord.values.map((v, idx) => (
                                                    <tr key={idx} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                                                        <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                                                            {v.fieldLabel}
                                                            {v.repeatIndex ? <span className="ml-2 text-[10px] text-[var(--color-text-secondary)] font-normal">(Numune {v.repeatIndex})</span> : ''}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {v.valueBoolean !== null ? (v.valueBoolean ? 'Evet' : 'Hayır') :
                                                                v.valueNumber !== null ? v.valueNumber :
                                                                    v.valueText || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {v.result && (
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${v.result === 'PASS' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                                                                    }`}>
                                                                    {v.result}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={3} className="px-4 py-8 text-center text-[var(--color-text-secondary)] italic">Bu kayda ait değer bulunamadı.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">Notlar</h4>
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={savingNotes || notes === selectedRecord.notes}
                                        className="text-xs font-bold text-teal-600 hover:text-teal-700 disabled:opacity-0 transition-all uppercase"
                                    >
                                        {savingNotes ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Not girin..."
                                    className="w-full p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] min-h-[100px] text-sm text-[var(--color-text)] focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]/50 rounded-b-2xl">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setShowDetailModal(false); setManualResult('PASS'); setApproveId(selectedRecord.id); }}
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                                >
                                    <ThumbsUp size={18} /> {t.qcRecords.approve}
                                </button>
                                <button
                                    onClick={() => { setShowDetailModal(false); openRejectModal(selectedRecord); }}
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                                >
                                    <ThumbsDown size={18} /> {t.qcRecords.reject}
                                </button>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="px-6 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-bold hover:bg-[var(--color-border)] transition-all">
                                {t.common.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            <ConfirmModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={handleReject}
                title={language === 'tr' ? 'Reddetmek istediğinize emin misiniz?' : 'Are you sure you want to reject?'}
                message={t.qcRecords.provideReason || 'Lütfen reddetme nedenini belirtin:'}
                simple={true}
                confirmLabel={t.common.yes}
                cancelLabel={t.common.giveUp}
                variant="danger"
                loading={processing}
            >
                <div className="space-y-6">
                    {/* Manual Result Selection */}
                    <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)]">
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">Nihai Sonuç Kararı</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['FAIL', 'PARTIAL'] as const).map((res) => (
                                <button
                                    key={res}
                                    onClick={() => setManualResult(res)}
                                    className={`py-2 text-[10px] font-bold rounded-lg border transition-all uppercase ${manualResult === res
                                        ? (res === 'FAIL' ? 'bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/20' :
                                            'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-500/20')
                                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
                                        }`}
                                >
                                    {res === 'FAIL' ? 'KALDI' : 'KISMİ'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wider">{t.qcRecords.rejectionReason}</label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-[var(--color-text)] text-sm"
                            rows={3}
                            placeholder={t.qcRecords.provideReason}
                            required
                            autoFocus
                        />
                    </div>
                </div>
            </ConfirmModal>

            {/* Approve Confirmation Modal */}
            <ConfirmModal
                isOpen={!!approveId}
                onClose={() => setApproveId(null)}
                onConfirm={handleApprove}
                title={t.qcRecords.approve || 'Onayla'}
                message={language === 'tr' ? 'Onaylamak istediğinize emin misiniz?' : 'Are you sure you want to approve?'}
                simple={true}
                confirmLabel={t.common.yes}
                cancelLabel={t.common.giveUp}
                variant="primary"
                loading={processing}
            >
                <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)]">
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">Nihai Sonuç Kararı</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['PASS', 'PARTIAL'] as const).map((res) => (
                            <button
                                key={res}
                                onClick={() => setManualResult(res)}
                                className={`py-2 text-[10px] font-bold rounded-lg border transition-all uppercase ${manualResult === res
                                    ? (res === 'PASS' ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/20' :
                                        'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-500/20')
                                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
                                    }`}
                            >
                                {res === 'PASS' ? 'GEÇTİ' : 'KISMİ'}
                            </button>
                        ))}
                    </div>
                </div>
            </ConfirmModal>

            {/* Status Feedback Modal */}
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                title={statusModal.title}
                message={statusModal.message}
                type={statusModal.type}
            />
        </div>
    );
}
