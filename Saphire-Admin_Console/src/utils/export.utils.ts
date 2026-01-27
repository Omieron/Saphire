import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { QcFormRecord } from '../api/qcRecord.api';
import { ROBOTO_REGULAR_BASE64 } from './pdfFont';
import type { Translations, Language } from '../i18n/translations';

const registerRobotoFont = (doc: jsPDF) => {
    doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR_BASE64);
    // Register as normal, bold, and italic to prevent fallback to Helvetica
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'italic');
    doc.setFont('Roboto');
};

const getLocale = (lang: Language) => lang === 'tr' ? 'tr-TR' : 'en-US';

const translateResult = (result: string | null, t: Translations) => {
    if (!result) return '-';
    switch (result) {
        case 'PASS': return t.qcRecords.resultPass;
        case 'FAIL': return t.qcRecords.resultFail;
        case 'WARNING': return t.qcRecords.resultWarning;
        case 'NA': return t.qcRecords.resultNA;
        default: return result;
    }
};

const translateStatus = (status: string, t: Translations) => {
    switch (status) {
        case 'DRAFT': return t.qcRecords.statusDraft;
        case 'IN_PROGRESS': return t.qcRecords.statusInProgress;
        case 'SUBMITTED': return t.qcRecords.statusSubmitted;
        case 'APPROVED': return t.qcRecords.statusApproved;
        case 'REJECTED': return t.qcRecords.statusRejected;
        default: return status;
    }
};

// Professional Palette
const COLORS: Record<string, [number, number, number]> = {
    PRIMARY: [30, 41, 59],   // Slate-900
    SECONDARY: [71, 85, 105], // Slate-600
    MUTED: [148, 163, 184],   // Slate-400
    BORDER: [226, 232, 240],   // Slate-200
    REJECT: [153, 27, 27],     // Red-800
    REJECT_BG: [254, 242, 242] // Red-50
};

export const exportQcRecordsToPdf = (records: QcFormRecord[], t: Translations, lang: Language, logoBase64?: string) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    registerRobotoFont(doc);

    const locale = getLocale(lang);
    const timestamp = new Date().toLocaleString(locale);

    // Header with Logo (Top Left)
    if (logoBase64) {
        try {
            // Draw a subtle vertical separator line
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.line(51, 10, 51, 30);

            doc.addImage(logoBase64, 'AUTO', 14, 10, 35, 20);
        } catch (e) {
            console.error('List PDF Logo error:', e);
            doc.setDrawColor(COLORS.BORDER[0], COLORS.BORDER[1], COLORS.BORDER[2]);
            doc.rect(14, 10, 35, 20);
            doc.setFontSize(7);
            doc.text("IMG ERR", 31.5, 21, { align: 'center' });
        }
    } else {
        doc.setDrawColor(COLORS.BORDER[0], COLORS.BORDER[1], COLORS.BORDER[2]);
        doc.setLineDashPattern([1.5], 0);
        doc.rect(14, 10, 35, 20);
        doc.setFontSize(7);
        doc.setTextColor(COLORS.MUTED[0], COLORS.MUTED[1], COLORS.MUTED[2]);
        doc.text("LOGO", 31.5, 21, { align: 'center' });
        doc.setLineDashPattern([], 0);
    }

    doc.setFontSize(18);
    doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
    doc.text(t.pdfExport.listTitle, 55, 18.5);

    doc.setFontSize(10);
    doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2]);
    doc.text(`${t.pdfExport.createdDate}: ${timestamp}`, 55, 26.5);

    const tableData = records.map(record => [
        `#${record.id}`,
        record.templateName,
        record.machineName || record.productInstanceSerial || '-',
        record.filledByName || '-',
        record.overallResult || '-',
        (t.qcRecords as any)[`status${record.status}`] || record.status,
        record.submittedAt ? new Date(record.submittedAt).toLocaleString(locale) : '-'
    ]);

    autoTable(doc, {
        startY: 35,
        head: [[
            t.common.code,
            t.qcRecords.template,
            t.pdfExport.machineAsset,
            t.qcRecords.filledBy,
            t.qcRecords.result,
            t.common.status,
            t.common.date
        ]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.PRIMARY, font: 'Roboto', fontStyle: 'bold', halign: 'center', cellPadding: 2, textColor: [255, 255, 255] },
        bodyStyles: { font: 'Roboto', fontStyle: 'normal' },
        styles: { fontSize: 8, font: 'Roboto', cellPadding: 2, textColor: [40, 40, 40] },
        columnStyles: {
            0: { cellWidth: 15 },
            5: { cellWidth: 25 }
        }
    });

    const fileNameDate = new Date().toISOString().split('T')[0];
    doc.save(`${t.pdfExport.listTitle.replace(/\s+/g, '_')}_${fileNameDate}.pdf`);
};

const drawSingleRecordOnDoc = (doc: jsPDF, record: QcFormRecord, t: Translations, lang: Language, logoBase64?: string) => {
    const locale = getLocale(lang);
    const timestamp = new Date().toLocaleString(locale);

    // Header with Logo (Top Left)
    if (logoBase64) {
        try {
            // Draw a subtle vertical separator line
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.line(51, 10, 51, 30);

            doc.addImage(logoBase64, 'AUTO', 14, 10, 35, 20);
        } catch (e) {
            console.error('Single PDF Logo error:', e);
            doc.setDrawColor(220);
            doc.rect(14, 10, 35, 20);
            doc.setFontSize(8);
            doc.text("IMG ERR", 31.5, 21.5, { align: 'center' });
        }
    } else {
        // Placeholder rectangle
        doc.setDrawColor(220);
        doc.setLineDashPattern([1.5], 0);
        doc.rect(14, 10, 35, 20);
        doc.setFontSize(8);
        doc.setTextColor(200);
        doc.text("COMPANY LOGO", 31.5, 21.5, { align: 'center' });
        doc.setLineDashPattern([], 0); // reset dash
    }

    // Header Content
    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136); // Teal-600
    doc.text(record.templateName, 55, 17.5);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t.pdfExport.reportDate}: ${timestamp}`, 55, 24.5);
    doc.text(`${t.pdfExport.recordId}: #${record.id} | ${t.pdfExport.templateCode}: ${record.templateCode}`, 55, 30);

    // Summary Info Table
    autoTable(doc, {
        startY: 38,
        head: [[t.pdfExport.summaryInfo, t.pdfExport.value]],
        body: [
            [t.qcRecords.filledBy, record.filledByName || '-'],
            [t.pdfExport.machineAsset, record.machineName || record.productInstanceSerial || '-'],
            [t.common.status, (t.qcRecords as any)[`status${record.status}`] || record.status],
            [t.qcRecords.result, translateResult(record.overallResult, t)],
            [t.common.date, record.submittedAt ? new Date(record.submittedAt).toLocaleString(locale) : '-'],
            [t.pdfExport.approver, record.approvedByName || '-']
        ],
        theme: 'grid',
        headStyles: { fillColor: COLORS.PRIMARY, font: 'Roboto', fontStyle: 'bold', halign: 'center', cellPadding: 2, textColor: [255, 255, 255] },
        bodyStyles: { font: 'Roboto', fontStyle: 'normal' },
        styles: { fontSize: 10, font: 'Roboto', cellPadding: 2, textColor: [40, 40, 40] },
        columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
        }
    });

    // Values Table
    doc.setFontSize(14);
    doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
    doc.text(t.pdfExport.recordData, 14, (doc as any).lastAutoTable.finalY + 15);

    const valueData = (record.values || []).map(v => [
        v.fieldLabel + (v.repeatIndex ? ` (${t.pdfExport.sample} ${v.repeatIndex})` : ''),
        v.valueBoolean !== null ? (v.valueBoolean ? t.common.yes : (lang === 'tr' ? 'Hayır' : 'No')) :
            v.valueNumber !== null ? v.valueNumber :
                v.valueText || '-',
        translateResult(v.result, t)
    ]);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [[t.pdfExport.parameter, t.pdfExport.value, t.pdfExport.result]],
        body: valueData,
        theme: 'striped',
        headStyles: { fillColor: COLORS.SECONDARY, font: 'Roboto', fontStyle: 'bold', halign: 'center', cellPadding: 2, textColor: [255, 255, 255] },
        bodyStyles: { font: 'Roboto', fontStyle: 'normal' },
        styles: { fontSize: 9, font: 'Roboto', cellPadding: 2, textColor: [40, 40, 40] },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 30, halign: 'center' }
        }
    });

    // Notes & Rejection Reason
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const hasRejection = !!record.rejectionReason;

    autoTable(doc, {
        startY: finalY,
        head: [hasRejection ? [t.pdfExport.notes, t.pdfExport.rejectionReason] : [t.pdfExport.notes]],
        body: [hasRejection ? [record.notes || '', record.rejectionReason] : [record.notes || '']],
        theme: 'grid',
        headStyles: { font: 'Roboto', fontStyle: 'bold', textColor: [255, 255, 255], halign: 'center', cellPadding: 2 },
        bodyStyles: { minCellHeight: 20, valign: 'top', font: 'Roboto', fontStyle: 'normal' },
        styles: { fontSize: 9, font: 'Roboto', cellPadding: 2 },
        columnStyles: hasRejection ? {
            0: { cellWidth: 90 },
            1: { cellWidth: 90 }
        } : {
            0: { cellWidth: 90 }
        },
        didParseCell: (data) => {
            if (data.section === 'head') {
                if (data.column.index === 0) data.cell.styles.fillColor = COLORS.SECONDARY;
                if (data.column.index === 1) data.cell.styles.fillColor = COLORS.REJECT;
            }
            if (data.section === 'body') {
                if (data.column.index === 1) {
                    data.cell.styles.fillColor = COLORS.REJECT_BG;
                    data.cell.styles.textColor = COLORS.REJECT;
                } else {
                    data.cell.styles.textColor = [40, 40, 40];
                }
            }
        }
    });

    // Signatures (Bottom)
    const currentY = (doc as any).lastAutoTable.finalY + 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Ensure we don't draw off the page
    const signatureY = Math.max(currentY, pageHeight - 35);

    doc.setFontSize(10);
    doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
    doc.setFont('Roboto', 'bold');

    // Prepared By (Dolduran)
    doc.text(t.qcRecords.filledBy, 14, signatureY);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2]);
    doc.text(record.filledByName || '-', 14, signatureY + 7);

    // Approved By (Onaylayan)
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
    doc.text(t.pdfExport.approver, pageWidth / 2, signatureY);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2]);
    doc.text(record.approvedByName || '-', pageWidth / 2, signatureY + 7);
};

export const exportSingleQcRecordToPdf = (record: QcFormRecord, t: Translations, lang: Language, logoBase64?: string) => {
    const doc = new jsPDF();
    registerRobotoFont(doc);
    drawSingleRecordOnDoc(doc, record, t, lang, logoBase64);
    const fileName = `${t.qcRecords.title}_#${record.id}_${record.templateCode}`.replace(/\s+/g, '_');
    doc.save(`${fileName}.pdf`);
};

export const exportDetailedBatchQcRecordsToPdf = (records: QcFormRecord[], t: Translations, lang: Language) => {
    if (records.length === 0) return;
    const doc = new jsPDF();
    registerRobotoFont(doc);

    records.forEach((record, index) => {
        if (index > 0) doc.addPage();
        drawSingleRecordOnDoc(doc, record, t, lang, record.companyLogo);
    });

    const fileNameDate = new Date().toISOString().split('T')[0];
    const fileName = `${t.pdfExport.listTitle.replace(/\s+/g, '_')}_Detaylı_${fileNameDate}.pdf`;
    doc.save(fileName);
};

export const exportMatrixQcRecordsToPdf = (records: QcFormRecord[], t: Translations, lang: Language) => {
    if (records.length === 0) return;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for matrix
    registerRobotoFont(doc);

    const locale = getLocale(lang);
    const timestamp = new Date().toLocaleString(locale);

    // Group records by template
    const groups: Record<number, QcFormRecord[]> = {};
    records.forEach(r => {
        if (!groups[r.templateId]) groups[r.templateId] = [];
        groups[r.templateId].push(r);
    });

    Object.values(groups).forEach((groupRecords, groupIndex) => {
        if (groupIndex > 0) doc.addPage();

        const first = groupRecords[0];
        const logoBase64 = first.companyLogo;

        // Header with Logo (Top Left)
        if (logoBase64) {
            try {
                // Draw a subtle vertical separator line
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.2);
                doc.line(51, 10, 51, 30);
                doc.addImage(logoBase64, 'AUTO', 14, 10, 35, 20);
            } catch (e) {
                console.error('Matrix PDF Logo error:', e);
                doc.setDrawColor(COLORS.BORDER[0], COLORS.BORDER[1], COLORS.BORDER[2]);
                doc.rect(14, 10, 35, 20);
                doc.setFontSize(7);
                doc.text("IMG ERR", 31.5, 21, { align: 'center' });
            }
        } else {
            doc.setDrawColor(COLORS.BORDER[0], COLORS.BORDER[1], COLORS.BORDER[2]);
            doc.setLineDashPattern([1.5], 0);
            doc.rect(14, 10, 35, 20);
            doc.setFontSize(7);
            doc.setTextColor(COLORS.MUTED[0], COLORS.MUTED[1], COLORS.MUTED[2]);
            doc.text("LOGO", 31.5, 21, { align: 'center' });
            doc.setLineDashPattern([], 0);
        }

        // Header Content
        doc.setFontSize(18);
        doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
        doc.text(`${first.templateName} - ${t.pdfExport.matrixReport || 'Matris Rapor'}`, 55, 18.5);

        doc.setFontSize(10);
        doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2]);
        doc.text(`${t.pdfExport.reportDate}: ${timestamp}`, 55, 26.5);

        // Collect unique headers from values
        const headerMap = new Map<string, string>(); // key -> label
        groupRecords.forEach(r => {
            (r.values || []).forEach(v => {
                const key = `${v.fieldId}_${v.repeatIndex || 0}`;
                const label = v.fieldLabel + (v.repeatIndex ? ` (${t.pdfExport.sample} ${v.repeatIndex})` : '');
                headerMap.set(key, label);
            });
        });

        const headerKeys = Array.from(headerMap.keys());
        const headers = [lang === 'tr' ? 'Saat' : t.common.date, ...Array.from(headerMap.values()), t.qcRecords.result];

        // Prepare data rows
        const body = groupRecords.sort((a, b) => (a.submittedAt || '').localeCompare(b.submittedAt || '')).map(r => {
            const row: any[] = [
                r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '-'
            ];

            headerKeys.forEach(key => {
                const [fieldId, repeatIndex] = key.split('_').map(Number);
                const val = (r.values || []).find(v => v.fieldId === fieldId && (v.repeatIndex || 0) === repeatIndex);
                if (val) {
                    const displayVal = val.valueBoolean !== null ? (val.valueBoolean ? t.common.yes : (lang === 'tr' ? 'Hayır' : 'No')) :
                        val.valueNumber !== null ? val.valueNumber :
                            val.valueText || '-';
                    row.push(displayVal);
                } else {
                    row.push('-');
                }
            });

            // If not approved, show the status label in the result column
            const resultDisplay = r.status === 'APPROVED'
                ? translateResult(r.overallResult, t)
                : translateStatus(r.status, t);

            row.push(resultDisplay);
            return row;
        });

        autoTable(doc, {
            startY: 35,
            head: [headers],
            body: body,
            theme: 'grid',
            headStyles: {
                fillColor: COLORS.PRIMARY,
                font: 'Roboto',
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                fontSize: 7,
                textColor: [255, 255, 255]
            },
            bodyStyles: {
                font: 'Roboto',
                fontSize: 7,
                halign: 'center',
                valign: 'middle'
            },
            styles: { cellPadding: 2, textColor: [40, 40, 40] },
        });

        // Signatures (Bottom)
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        const pageWidth = doc.internal.pageSize.getWidth();

        // Collect unique names for the footer
        const filledByNames = Array.from(new Set(groupRecords.map(r => r.filledByName))).filter(Boolean).join(', ');
        const approvedByNames = Array.from(new Set(groupRecords.map(r => r.approvedByName))).filter(Boolean).join(', ');

        doc.setFontSize(9);
        doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
        doc.setFont('Roboto', 'bold');

        // Drawn as two columns at bottom
        const signatureY = Math.max(finalY, doc.internal.pageSize.getHeight() - 30);

        // Preprared By (Dolduran)
        doc.text(t.qcRecords.filledBy, 14, signatureY);
        doc.setFont('Roboto', 'normal');
        doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2]);
        doc.text(filledByNames || '-', 14, signatureY + 6);

        // Approved By (Onaylayan)
        doc.setFont('Roboto', 'bold');
        doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2]);
        doc.text(t.pdfExport.approver, pageWidth / 2, signatureY);
        doc.setFont('Roboto', 'normal');
        doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2]);
        doc.text(approvedByNames || '-', pageWidth / 2, signatureY + 6);
    });

    const fileNameDate = new Date().toISOString().split('T')[0];
    const fileName = `${t.pdfExport.listTitle.replace(/\s+/g, '_')}_Matrix_${fileNameDate}.pdf`;
    doc.save(fileName);
};
