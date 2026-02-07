import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportOptions {
    businessName: string;
    nit: string;
    address: string;
    phone: string;
    logoUrl?: string | null;
    startDate?: string;
    endDate?: string;
}

export const exportToPDF = async (transactions: Transaction[], options: ReportOptions) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- HEADER & BRANDING ---
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // Emerald 600
    doc.setFont("helvetica", "bold");
    doc.text(options.businessName || "Mi Negocio", pageWidth - 14, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    if (options.nit) doc.text(`NIT: ${options.nit}`, pageWidth - 14, 26, { align: "right" });
    if (options.address) doc.text(options.address, pageWidth - 14, 31, { align: "right" });

    // Report Info (Top Left)
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39); // Gray 900
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Caja", 14, 25);

    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128); // Gray 500
    doc.text(`Generado: ${format(new Date(), "dd MMM yyyy, HH:mm", { locale: es })}`, 14, 32);

    const rangeText = options.startDate
        ? `Período: ${format(new Date(options.startDate), "dd MMM", { locale: es })} - ${options.endDate ? format(new Date(options.endDate), "dd MMM", { locale: es }) : 'Hoy'}`
        : "Período: Histórico Completo";

    doc.text(rangeText, 14, 38);

    // Line Separator
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.5);
    doc.line(14, 45, pageWidth - 14, 45);

    // --- STATS SUMMARY ---
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const total = totalIncome - totalExpense;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Ingresos: $${totalIncome.toLocaleString()}`, 14, 55);
    doc.text(`Gastos: $${totalExpense.toLocaleString()}`, 80, 55);
    doc.setFont("helvetica", "bold");
    doc.text(`Balance: $${total.toLocaleString()}`, 150, 55);

    // --- TABLE ---
    const tableColumn = ["Fecha", "Descripción", "Método", "Ref/Cliente", "Monto"];
    const tableRows: any[] = [];

    transactions.forEach(ticket => {
        let ticketDate = "-";
        try { ticketDate = format(new Date(ticket.date), "dd/MM/yy HH:mm"); } catch (e) { }

        const amountVal = ticket.amount || 0;
        const amount = ticket.type === 'expense' ? `-$${Math.abs(amountVal).toLocaleString()}` : `$${amountVal.toLocaleString()}`;

        const ticketData = [
            ticketDate,
            ticket.description || "N/A",
            ticket.method || ticket.payment_method || 'Efectivo',
            ticket.customer_name === 'Cliente' ? (ticket.reference_number || '-') : (ticket.customer_name || '-'),
            amount
        ];
        tableRows.push(ticketData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: {
            fillColor: [22, 163, 74],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [240, 253, 244]
        }
    });

    // --- FOOTER ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${totalPages}`,
            pageWidth / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
        );
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74);
        doc.text("Powered by DonTendero", pageWidth - 14, doc.internal.pageSize.height - 10, { align: "right" });
    }

    doc.save(`reporte_caja_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
};

export const exportToExcel = (transactions: Transaction[]) => {
    const headers = ["ID,Fecha,Tipo,Descripcion,Metodo,Cliente,Monto\n"];

    const rows = transactions.map(t => {
        let date = "";
        try { date = `"${format(new Date(t.date), "yyyy-MM-dd HH:mm")}"`; } catch (e) { }

        const desc = `"${(t.description || "").replace(/"/g, '""')}"`;
        const client = `"${(t.customer_name || '').replace(/"/g, '""')}"`;
        const amount = t.amount || 0;
        return `${t.id},${date},${t.type},${desc},${t.method},${client},${amount}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_caja_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToTicket = (transactions: Transaction[], options: ReportOptions) => {
    // 1. Calculate Dynamic Height to cut paper exactly after content
    // Base height for static sections (Header ~45mm, Summary ~30mm, Footer ~25mm, Margins ~10mm)
    let totalHeight = 110;

    // Add height for each transaction (approx 9mm per item: Date/Amount line + Desc line + Spacing)
    totalHeight += (transactions.length * 9);

    // 80mm width, Dynamic Height
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, totalHeight]
    });

    const pageWidth = 80;
    let y = 5; // Start Y position
    const margin = 3;
    const contentWidth = pageWidth - (margin * 2);

    // Helper for centering text
    const centerText = (text: string, yPos: number, size = 10, bold = false) => {
        if (!text) return;
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        try {
            const textWidth = doc.getTextWidth(text);
            const x = (pageWidth - textWidth) / 2;
            doc.text(text, x, yPos);
        } catch (e) {
            console.error("Error writing centered text", e);
        }
    };

    // Helper for rows
    const drawRow = (left: string, right: string, yPos: number, size = 9, bold = false) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.text(left, margin, yPos);
        try {
            const rightWidth = doc.getTextWidth(right);
            doc.text(right, pageWidth - margin - rightWidth, yPos);
        } catch (e) {
            doc.text(right, pageWidth - margin - 20, yPos);
        }
    };

    // --- HEADER ---
    doc.setTextColor(0);
    centerText(options.businessName || "Mi Negocio", y, 12, true);
    y += 5;
    if (options.nit) {
        centerText(`NIT: ${options.nit}`, y, 9);
        y += 4;
    }
    if (options.address) {
        centerText((options.address || "").substring(0, 30), y, 8); // Truncate address
        y += 4;
    }

    y += 2;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    centerText("REPORTE DE CAJA", y, 11, true);
    y += 5;
    centerText(format(new Date(), "dd/MM/yyyy HH:mm", { locale: es }), y, 9);
    y += 5;

    // --- SUMMARY ---
    y += 2;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    const balance = totalIncome - totalExpense;

    centerText("RESUMEN", y, 10, true);
    y += 5;
    drawRow("Ingresos:", `$${totalIncome.toLocaleString()}`, y);
    y += 4;
    drawRow("Egresos:", `-$${totalExpense.toLocaleString()}`, y);
    y += 5;
    drawRow("BALANCE:", `$${balance.toLocaleString()}`, y, 11, true);

    y += 3;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // --- TRANSACTIONS ---
    centerText("DETALLE MOVIMIENTOS", y, 9, true);
    y += 5;

    transactions.forEach(t => {
        // Date
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        let time = "-";
        try { time = format(new Date(t.date), "HH:mm"); } catch (e) { }
        doc.text(time, margin, y);

        // Amount (Right aligned)
        const amountVal = t.amount || 0;
        const amountStr = t.type === 'expense' ? `-${amountVal.toLocaleString()}` : amountVal.toLocaleString();

        doc.setFont("helvetica", "bold");
        try {
            const amountWidth = doc.getTextWidth(amountStr);
            doc.text(amountStr, pageWidth - margin - amountWidth, y);
        } catch (e) {
            doc.text(amountStr, pageWidth - margin - 20, y);
        }

        // Description (New line)
        y += 3.5;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        // Truncate description to fit or use Fallback
        const maxDescWidth = contentWidth;
        let desc = t.description || "Sin descripción"; // SAFE FALLBACK
        try {
            // If too long, truncate
            if (doc.getTextWidth(desc) > maxDescWidth) {
                desc = desc.substring(0, 32) + "...";
            }
        } catch (e) {
            desc = "Desc Error";
        }

        doc.text(desc, margin, y);

        y += 5.5; // Spacing for next item
    });

    // --- FOOTER ---
    y += 5;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    centerText("Generado por", y, 8);
    y += 4;
    centerText("DONTENDERO", y, 10, true);
    y += 5;
    centerText("Software de Gestión", y, 8);
    // Final padding
    y += 10;

    doc.save(`caja_ticket_${format(new Date(), "HHmm")}.pdf`);
};
