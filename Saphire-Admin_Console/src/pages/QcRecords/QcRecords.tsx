import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, FileCheck, FileSearch, RotateCcw, ChevronDown, FileDown } from 'lucide-react';
import { qcRecordApi } from '../../api/qcRecord.api';
import type { QcFormRecord } from '../../api/qcRecord.api';
import { useLanguage } from '../../contexts/LanguageContext';
import { exportSingleQcRecordToPdf, exportMatrixQcRecordsToPdf } from '../../utils/export.utils';

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
    WARNING: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    NA: { bg: 'bg-slate-500/10', text: 'text-slate-500' },
};

export default function QcRecords() {
    const { t, language } = useLanguage();
    const [records, setRecords] = useState<QcFormRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<QcFormRecord | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [batchLoading, setBatchLoading] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportRange, setExportRange] = useState({ start: '', end: '' });
    const [exportTemplate, setExportTemplate] = useState('');

    // Filter states
    const [filterTemplate, setFilterTemplate] = useState('');
    const [filterMachine, setFilterMachine] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Derived unique values for filters
    const [uniqueTemplates, setUniqueTemplates] = useState<string[]>([]);
    const [uniqueMachines, setUniqueMachines] = useState<string[]>([]);
    const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'DRAFT': return t.qcRecords.statusDraft;
            case 'IN_PROGRESS': return t.qcRecords.statusInProgress;
            case 'SUBMITTED': return t.qcRecords.statusSubmitted;
            case 'APPROVED': return t.qcRecords.statusApproved;
            case 'REJECTED': return t.qcRecords.statusRejected;
            default: return status;
        }
    };

    const getResultLabel = (result: string | null) => {
        if (!result) return '-';
        switch (result) {
            case 'PASS': return t.qcRecords.resultPass;
            case 'FAIL': return t.qcRecords.resultFail;
            case 'WARNING': return t.qcRecords.resultWarning;
            case 'NA': return t.qcRecords.resultNA;
            default: return result;
        }
    };

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
            const filters = {
                search: debouncedSearch,
                status: filterStatus || undefined,
                templateName: filterTemplate || undefined,
                machineName: filterMachine || undefined,
                userName: filterUser || undefined,
                startDate: filterStartDate || undefined,
                endDate: filterEndDate || undefined
            };
            const response = await qcRecordApi.getAll(filters);
            const allRecords = response.data.data || [];
            setRecords(allRecords);

            if (uniqueTemplates.length === 0 && allRecords.length > 0) {
                setUniqueTemplates(Array.from(new Set(allRecords.map(r => r.templateName))).filter(Boolean).sort());
                setUniqueMachines(Array.from(new Set(allRecords.map(r => r.machineName || r.productInstanceSerial || ''))).filter(Boolean).sort());
                setUniqueUsers(Array.from(new Set(allRecords.map(r => r.filledByName))).filter(Boolean).sort() as string[]);
            }
        }
        catch (error) { console.error('Failed to fetch:', error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [debouncedSearch, filterStatus, filterTemplate, filterMachine, filterUser, filterStartDate, filterEndDate]);

    const openDetailModal = (record: QcFormRecord) => {
        setSelectedRecord(record);
        setShowDetailModal(true);
    };


    const resetFilters = () => {
        setSearch('');
        setFilterStatus('');
        setFilterTemplate('');
        setFilterMachine('');
        setFilterUser('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col xl:flex-row gap-4 items-end bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 w-full">
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

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">{t.common.status}</label>
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-all font-medium h-[40px]"
                            >
                                <option value="">{t.instances.allStatuses}</option>
                                {Object.keys(statusColors).map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
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
                                {uniqueTemplates.map(name => <option key={name as string} value={name as string}>{name}</option>)}
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
                                {uniqueMachines.map(name => <option key={name as string} value={name as string}>{name}</option>)}
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={resetFilters}
                        className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-teal-600 hover:border-teal-500/30 hover:bg-teal-500/5 rounded-lg transition-all h-[40px] flex items-center justify-center min-w-[40px]"
                        title={t.qcRecords.resetFilters}
                    >
                        <RotateCcw size={18} />
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] bg-teal-500/5 px-3 py-2.5 rounded-lg border border-teal-500/10 h-[40px] whitespace-nowrap">
                        <span className="font-bold text-teal-600">{records.filter(r => r.status === 'SUBMITTED').length}</span> {t.qcRecords.pendingApproval}
                    </div>

                    <button
                        onClick={() => {
                            setExportRange({ start: filterStartDate, end: filterEndDate });
                            setExportTemplate(filterTemplate);
                            setShowExportModal(true);
                        }}
                        disabled={batchLoading || records.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all font-bold h-[40px] shadow-sm shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                        title={t.pdfExport.matrixReport}
                    >
                        {batchLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FileDown size={18} />
                        )}
                        <span className="hidden sm:inline">{t.pdfExport.matrixReport}</span>
                    </button>
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
                        ) : records.length === 0 ? (
                            <tr><td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">{t.qcRecords.noRecords}</td></tr>
                        ) : (
                            records.map((record) => {
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
                                            {resultStyle && record.status !== 'SUBMITTED' ? (
                                                <span className={`inline-flex items-center px-2 py-1 ${resultStyle.bg} ${resultStyle.text} rounded text-xs font-medium`}>{getResultLabel(record.overallResult)}</span>
                                            ) : (
                                                <span className="text-[var(--color-text-secondary)] text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 ${statusStyle.bg} ${statusStyle.text} rounded-full text-xs font-medium`}>
                                                <StatusIcon size={12} />{record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">{record.submittedAt ? new Date(record.submittedAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openDetailModal(record)} className="p-2 text-teal-600 hover:bg-teal-500/10 rounded-lg transition-colors ml-1" title={t.common.view}>
                                                <FileSearch size={18} />
                                            </button>
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
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--color-text)] leading-none text-left">{selectedRecord.templateName}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-mono text-left">{selectedRecord.templateCode}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[selectedRecord.status]?.bg} ${statusColors[selectedRecord.status]?.text}`}>
                                    {getStatusLabel(selectedRecord.status)}
                                </span>
                                {selectedRecord.overallResult && selectedRecord.status !== 'SUBMITTED' && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${resultColors[selectedRecord.overallResult]?.bg} ${resultColors[selectedRecord.overallResult]?.text}`}>
                                        {getResultLabel(selectedRecord.overallResult)}
                                    </span>
                                )}
                                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors text-[var(--color-text-secondary)]">
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Workflow Stepper */}
                        <div className="px-6 py-6 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                            <div className="flex items-center justify-between max-w-2xl mx-auto relative text-left">
                                {/* Connecting Lines */}
                                <div className="absolute top-4 left-0 w-full h-0.5 bg-[var(--color-border)] -z-0" />
                                <div
                                    className="absolute top-4 left-0 h-0.5 bg-teal-500 transition-all duration-500 -z-0"
                                    style={{
                                        width: selectedRecord.status === 'APPROVED' || selectedRecord.status === 'REJECTED' ? '100%' :
                                            selectedRecord.status === 'SUBMITTED' ? '66%' :
                                                selectedRecord.status === 'IN_PROGRESS' ? '33%' : '0%'
                                    }}
                                />

                                {[
                                    { key: 'DRAFT', label: t.qcRecords.statusDraft, icon: Clock },
                                    { key: 'IN_PROGRESS', label: t.qcRecords.statusInProgress, icon: Clock },
                                    { key: 'SUBMITTED', label: t.qcRecords.statusSubmitted, icon: FileCheck },
                                    { key: 'FINALIZED', label: selectedRecord.status === 'REJECTED' ? t.qcRecords.statusRejected : t.qcRecords.statusApproved, icon: selectedRecord.status === 'REJECTED' ? XCircle : CheckCircle }
                                ].map((step, idx) => {
                                    const isCompleted = (step.key === 'DRAFT') ||
                                        (step.key === 'IN_PROGRESS' && ['IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(selectedRecord.status)) ||
                                        (step.key === 'SUBMITTED' && ['SUBMITTED', 'APPROVED', 'REJECTED'].includes(selectedRecord.status)) ||
                                        (step.key === 'FINALIZED' && ['APPROVED', 'REJECTED'].includes(selectedRecord.status));
                                    const isActive = (step.key === selectedRecord.status) || (step.key === 'FINALIZED' && ['APPROVED', 'REJECTED'].includes(selectedRecord.status));

                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 relative z-10 px-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-teal-500 border-teal-500 text-white' :
                                                isActive ? 'border-teal-500 text-teal-600 bg-teal-50' :
                                                    'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                                                }`}>
                                                <step.icon size={16} />
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-teal-600' : 'text-[var(--color-text-secondary)]'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
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
                                <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-[var(--color-bg)]/50 text-[var(--color-text-secondary)] font-bold">
                                            <tr>
                                                <th className="px-4 py-3">Parametre</th>
                                                <th className="px-4 py-3">Değer</th>
                                                <th className="px-4 py-3 text-center">Sonuç</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-border)]">
                                            {selectedRecord.values && selectedRecord.values.length > 0 ? (
                                                selectedRecord.values.map((v, idx) => (
                                                    <tr key={idx} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                                                        <td className="px-4 py-3 font-medium text-[var(--color-text)] text-left">
                                                            {v.fieldLabel}
                                                            {v.repeatIndex ? <span className="ml-2 text-[10px] text-[var(--color-text-secondary)] font-normal">(Numune {v.repeatIndex})</span> : ''}
                                                        </td>
                                                        <td className="px-4 py-3 text-left">
                                                            {v.valueBoolean !== null ? (v.valueBoolean ? 'Evet' : 'Hayır') :
                                                                v.valueNumber !== null ? v.valueNumber :
                                                                    v.valueText || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {v.result && (
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${v.result === 'PASS' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                                                                    }`}>
                                                                    {getResultLabel(v.result)}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={3} className="px-4 py-8 text-center text-[var(--color-text-secondary)] italic text-left">Bu kayda ait değer bulunamadı.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notes & Rejection Display (Read Only) */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">Notlar</h4>
                                    <div className="w-full p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] min-h-[100px] text-sm text-[var(--color-text)]">
                                        {selectedRecord.notes || 'Not bulunmuyor.'}
                                    </div>
                                </div>
                                {selectedRecord.status === 'REJECTED' && (
                                    <div className="space-y-2 text-left">
                                        <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">Red Nedeni</h4>
                                        <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 min-h-[100px] text-sm text-red-600 font-medium">
                                            {selectedRecord.rejectionReason || 'Neden belirtilmedi.'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]/50 rounded-b-2xl">
                            <button
                                onClick={async (e) => {
                                    const btn = e.currentTarget;
                                    const originalContent = btn.innerHTML;
                                    try {
                                        btn.disabled = true;
                                        btn.innerHTML = '<div className="w-4 h-4 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin"></div>...';

                                        // Fetch full record to get the logo
                                        const response = await qcRecordApi.getById(selectedRecord.id);
                                        const fullRecord = response.data.data;

                                        console.log('Exporting with logo:', fullRecord.companyLogo ? 'Yes (Length: ' + fullRecord.companyLogo.length + ')' : 'No');
                                        exportSingleQcRecordToPdf(fullRecord, t, language, fullRecord.companyLogo);
                                    } catch (error) {
                                        console.error('Export failed:', error);
                                    } finally {
                                        btn.disabled = false;
                                        btn.innerHTML = originalContent;
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500/10 text-teal-600 rounded-xl text-sm font-bold hover:bg-teal-500/20 active:scale-95 transition-all border border-teal-500/20 disabled:opacity-50"
                            >
                                <FileDown size={18} />
                                PDF {t.common.save}
                            </button>
                            <button onClick={() => setShowDetailModal(false)} className="px-6 py-2 bg-[var(--color-text)] text-[var(--color-surface)] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                                {t.common.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Export Selection Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-teal-500/5">
                            <h3 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                                <FileDown size={20} className="text-teal-500" />
                                {t.pdfExport.matrixReport}
                            </h3>
                            <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors text-[var(--color-text-secondary)]">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                {language === 'tr'
                                    ? 'Lütfen rapor için tarih aralığı seçiniz. Seçilen aralıktaki tüm kayıtlar matris formatında dışa aktarılacaktır.'
                                    : 'Please select a date range for the report. All records within the range will be exported in matrix format.'}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[var(--color-text-secondary)]">Başlangıç</label>
                                    <input
                                        type="date"
                                        value={exportRange.start}
                                        onChange={(e) => setExportRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[var(--color-text-secondary)]">Bitiş</label>
                                    <input
                                        type="date"
                                        value={exportRange.end}
                                        onChange={(e) => setExportRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--color-text-secondary)]">
                                    {language === 'tr' ? 'Şablon Seçimi' : 'Template Selection'}
                                </label>
                                <div className="relative">
                                    <select
                                        value={exportTemplate}
                                        onChange={(e) => setExportTemplate(e.target.value)}
                                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">{language === 'tr' ? 'Tüm Şablonlar' : 'All Templates'}</option>
                                        {uniqueTemplates.map(tName => (
                                            <option key={tName} value={tName}>{tName}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-secondary)]">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-[10px] text-yellow-600/80">
                                <span className="font-bold mr-1">NOT:</span>
                                {language === 'tr'
                                    ? 'Arama ve durum filtreleri mevcut seçimlerinize göre uygulanacaktır.'
                                    : 'Search and status filters will be applied based on your current selections.'}
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-[var(--color-surface-hover)] border-t border-[var(--color-border)] flex gap-3">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] rounded-xl transition-all font-bold text-sm"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                onClick={async () => {
                                    setShowExportModal(false);
                                    setBatchLoading(true);
                                    try {
                                        // Fetch records for the specified range
                                        const filters = {
                                            search: debouncedSearch,
                                            status: filterStatus || undefined,
                                            templateName: exportTemplate || undefined,
                                            machineName: filterMachine || undefined,
                                            userName: filterUser || undefined,
                                            startDate: exportRange.start || undefined,
                                            endDate: exportRange.end || undefined
                                        };
                                        const response = await qcRecordApi.getAll(filters);
                                        const exportRecords = response.data.data || [];

                                        if (exportRecords.length === 0) {
                                            alert(language === 'tr' ? 'Seçilen aralıkta kayıt bulunamadı.' : 'No records found for the selected range.');
                                            return;
                                        }

                                        // Fetch full details for these records
                                        const fullRecordsPromises = exportRecords.map(r => qcRecordApi.getById(r.id));
                                        const responses = await Promise.all(fullRecordsPromises);
                                        const fullRecords = responses.map(res => res.data.data);
                                        exportMatrixQcRecordsToPdf(fullRecords, t, language);
                                    } catch (e) {
                                        console.error('Export failed:', e);
                                    } finally {
                                        setBatchLoading(false);
                                    }
                                }}
                                disabled={batchLoading}
                                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all font-bold text-sm shadow-md shadow-teal-500/20 disabled:opacity-50"
                            >
                                {batchLoading ? t.common.loading : (language === 'tr' ? 'Raporu Al' : 'Get Report')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
