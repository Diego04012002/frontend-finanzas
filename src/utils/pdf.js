import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPDF({ filename, title, summary, rows, lang = "es", currency = "EUR" }) {
  const doc = new jsPDF();
  const T = lang === "en"
    ? { date: "Date", category: "Category", desc: "Description", amount: "Amount", balance: "Balance", income: "Income", expense: "Expenses", net: "Balance", generated: "Generated on" }
    : { date: "Fecha", category: "Categoría", desc: "Descripción", amount: "Importe", balance: "Saldo", income: "Ingresos", expense: "Gastos", net: "Balance", generated: "Generado el" };

  // Header
  doc.setFillColor(255, 167, 64);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`${T.generated}: ${new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-ES")}`, 14, 36);

  // Summary boxes
  const startY = 44;
  const boxW = 60;
  const boxes = [
    { label: T.income, value: summary.ingresos, color: [29, 158, 117] },
    { label: T.expense, value: summary.gastos, color: [226, 75, 74] },
    { label: T.net, value: summary.balance, color: summary.balance >= 0 ? [24, 95, 165] : [226, 75, 74] },
  ];
  boxes.forEach((b, i) => {
    const x = 14 + i * (boxW + 4);
    doc.setFillColor(...b.color);
    doc.roundedRect(x, startY, boxW, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(b.label, x + 4, startY + 8);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`${b.value.toFixed(2)} ${currency}`, x + 4, startY + 17);
    doc.setFont("helvetica", "normal");
  });

  // Table
  autoTable(doc, {
    startY: startY + 30,
    head: [[T.date, T.category, T.desc, T.amount, T.balance]],
    body: rows.map(r => [
      new Date(r.fecha).toLocaleDateString(lang === "en" ? "en-US" : "es-ES"),
      r.categoria,
      r.descripcion.substring(0, 40),
      `${r.importe.toFixed(2)} ${currency}`,
      `${r.saldo.toFixed(2)} ${currency}`,
    ]),
    headStyles: { fillColor: [40, 40, 50], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const v = parseFloat(data.cell.raw);
        if (v >= 0) data.cell.styles.textColor = [29, 158, 117];
        else data.cell.styles.textColor = [226, 75, 74];
      }
    },
  });

  doc.save(filename);
}
