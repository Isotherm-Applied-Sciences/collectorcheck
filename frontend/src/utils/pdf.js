export async function createReceiptPDFBlob(receipt) {
  const { jsPDF } = await import('jspdf');
  const document = new jsPDF();
  const margin = 14;
  const lineWidth = 180;
  let y = 20;

  document.setFontSize(18);
  document.text(`Receipt ${receipt.id}`, margin, y);
  y += 12;
  document.setFontSize(11);

  const addText = (label, value) => {
    const lines = document.splitTextToSize(`${label}: ${value}`, lineWidth);
    for (const line of lines) {
      if (y > 280) {
        document.addPage();
        y = 20;
      }
      document.text(line, margin, y);
      y += 6;
    }
    y += 2;
  };

  addText('Vendor', receipt.vendor || '(none)');
  addText('Date', receipt.date || '(none)');
  addText('Amount', receipt.amount ?? '(none)');
  addText('Filename', receipt.filename || '(none)');

  if (receipt.raw_metadata) {
    const metadata = typeof receipt.raw_metadata === 'string'
      ? receipt.raw_metadata
      : JSON.stringify(receipt.raw_metadata, null, 2);
    addText('Raw metadata', metadata);
  }

  return document.output('blob');
}