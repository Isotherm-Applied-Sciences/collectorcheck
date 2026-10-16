export function getDittoHelpForPage(page) {
  switch (page) {
    case 'upload':
      return {
        title: 'Uploading Receipts',
        message: 'You can upload images or PDFs. Drag-and-drop works too. Want me to walk you through bulk uploads?'
      };
    case 'list':
      return {
        title: 'Receipt List',
        message: 'You can sort, search, filter by tags, and create Saved Views. Want help organizing?'
      };
    case 'detail':
      return {
        title: 'Receipt Details',
        message: 'You can edit fields, add tags, and download the receipt. Want help tagging or organizing?'
      };
    case 'tags':
      return {
        title: 'Tags',
        message: 'Tags help you group receipts. Want help creating or managing tags?'
      };
    case 'views':
      return {
        title: 'Saved Views',
        message: 'Saved Views let you store search/sort/filter presets. Want help creating one?'
      };
    case 'stats':
      return {
        title: 'Stats',
        message: 'This page shows totals, averages, and breakdowns. Want help understanding your spending?'
      };
    case 'timeline':
      return {
        title: 'Timeline',
        message: 'The timeline shows receipts by date. Want help navigating or filtering?'
      };
    case 'vendors':
      return {
        title: 'Vendors',
        message: 'This page groups receipts by vendor. Want help analyzing vendor spending?'
      };
    default:
      return {
        title: 'CollectorCheck',
        message: 'How can I help?'
      };
  }
}