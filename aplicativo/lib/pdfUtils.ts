import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './utils';
// import { User } from '@supabase/supabase-js'; // Removed unused import

interface CashCloseData {
    organizationName: string;
    userName: string;
    date: string;
    systemTotals: {
        total: number;
        cash: number;
        card: number;
        transfer: number;
        credit: number;
        other: number;
    };
    countedCash: number;
    difference: number;
    observations: string;
    denominations: Record<number, number>;
}

export const generateCashClosePDF = (data: CashCloseData) => {
    const doc = new jsPDF();

    // -- Header --
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(data.organizationName || "Mi Tienda", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte de Cierre de Caja", 105, 28, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date(data.date).toLocaleString('es-CO')}`, 105, 35, { align: "center" });
    doc.text(`Responsable: ${data.userName}`, 105, 40, { align: "center" });

    // -- Summary Table --
    autoTable(doc, {
        startY: 50,
        head: [['Concepto', 'Valor']],
        body: [
            ['Ventas Totales (Sistema)', formatCurrency(data.systemTotals.total)],
            ['Total Efectivo en Caja (Contado)', formatCurrency(data.countedCash)],
            ['Diferencia', formatCurrency(data.difference)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [20, 20, 20] }, // Dark/Black header
        styles: { fontSize: 10, cellPadding: 5 },
    });

    // -- Payment Methods Breakdown --
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 50;

    doc.text("Desglose por Métodos de Pago (Sistema)", 14, finalY + 10);

    autoTable(doc, {
        startY: finalY + 15,
        head: [['Método', 'Valor']],
        body: [
            ['Efectivo', formatCurrency(data.systemTotals.cash)],
            ['Tarjeta / Datáfono', formatCurrency(data.systemTotals.card)],
            ['Transferencia / QR', formatCurrency(data.systemTotals.transfer)],
            ['Fiado / Crédito', formatCurrency(data.systemTotals.credit)],
            ['Otros', formatCurrency(data.systemTotals.other)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40] },
    });

    // -- Cash Denominations --
    // @ts-ignore
    const finalY2 = doc.lastAutoTable.finalY || 100;

    // Convert denominations object to sorted array
    const denoms = Object.entries(data.denominations)
        .map(([val, count]) => ({ value: parseInt(val), count }))
        .sort((a, b) => b.value - a.value)
        .filter(d => d.count > 0);

    if (denoms.length > 0) {
        doc.text("Detalle del Arqueo de Efectivo", 14, finalY2 + 10);

        autoTable(doc, {
            startY: finalY2 + 15,
            head: [['Denominación', 'Cantidad', 'Subtotal']],
            body: denoms.map(d => [
                formatCurrency(d.value),
                d.count,
                formatCurrency(d.value * d.count)
            ]),
            theme: 'plain',
            styles: { fontSize: 9 },
        });
    }

    // -- Observations --
    if (data.observations) {
        // @ts-ignore
        const finalY3 = doc.lastAutoTable.finalY || 150;
        doc.text("Observaciones:", 14, finalY3 + 10);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text(data.observations, 14, finalY3 + 16, { maxWidth: 180 });
    }

    // Save
    doc.save(`Cierre_Caja_${new Date(data.date).toISOString().split('T')[0]}.pdf`);
};
