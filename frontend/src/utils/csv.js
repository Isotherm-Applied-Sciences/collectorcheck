export function createCSVBlob(rows) {
  const escape = (value) => {
    if (value === null || value === undefined) return '';
    const text = String(value);
    if (/[",\r\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csvContent = rows
    .map((row) => row.map(escape).join(','))
    .join('\r\n');
  return new Blob(['\uFEFF', csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
}

export function downloadCSV(filename, rows) {
  const blob = createCSVBlob(rows);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}