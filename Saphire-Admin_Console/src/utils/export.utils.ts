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
        doc.addImage(logoBase64, 'PNG', 14, 10, 35, 20);
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
    doc.text(t.pdfExport.listTitle, 55, 19);

    doc.setFontSize(10);
    doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2]);
    doc.text(`${t.pdfExport.createdDate}: ${timestamp}`, 55, 27);

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

export const exportSingleQcRecordToPdf = (record: QcFormRecord, t: Translations, lang: Language, logoBase64?: string) => {
    const doc = new jsPDF();
    registerRobotoFont(doc);

    const locale = getLocale(lang);
    const timestamp = new Date().toLocaleString(locale);

    // Header with Logo (Top Left)
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 10, 35, 20);
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
    doc.text(record.templateName, 55, 19);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t.pdfExport.reportDate}: ${timestamp}`, 55, 26);
    doc.text(`${t.pdfExport.recordId}: #${record.id} | ${t.pdfExport.templateCode}: ${record.templateCode}`, 55, 31);

    // Summary Info Table
    autoTable(doc, {
        startY: 38,
        head: [[t.pdfExport.summaryInfo, t.pdfExport.value]],
        body: [
            [t.qcRecords.filledBy, record.filledByName || '-'],
            [t.pdfExport.machineAsset, record.machineName || record.productInstanceSerial || '-'],
            [t.common.status, (t.qcRecords as any)[`status${record.status}`] || record.status],
            [t.qcRecords.result, record.overallResult || '-'],
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
        v.result || '-'
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
            0: { cellWidth: 91 },
            1: { cellWidth: 91 }
        } : {
            0: { cellWidth: 91 }
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

    const fileName = `${t.qcRecords.title}_#${record.id}_${record.templateCode}`.replace(/\s+/g, '_');
    doc.save(`${fileName}.pdf`);
};
