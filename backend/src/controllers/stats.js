import { listReceipts } from '../utils/db.js';

export async function getStats(request, response, next) {
  try {
    const receipts = await listReceipts();
    const amounts = receipts
      .map((receipt) => Number(receipt.amount))
      .filter(Number.isFinite);
    const dates = receipts
      .map((receipt) => receipt.date)
      .filter((date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date))
      .sort();
    const monthly = Object.create(null);
    const categories = Object.create(null);
    receipts.forEach((receipt) => {
      const amount = Number.isFinite(Number(receipt.amount)) ? Number(receipt.amount) : 0;
      if (typeof receipt.date === 'string' && /^\d{4}-\d{2}/.test(receipt.date)) {
        const month = receipt.date.slice(0, 7);
        monthly[month] = (monthly[month] || 0) + amount;
      }
      for (const tag of new Set(receipt.tags ?? [])) {
        categories[tag] = (categories[tag] || 0) + amount;
      }
    });

    return response.json({
      totalReceipts: receipts.length,
      totalAmount: amounts.reduce((sum, amount) => sum + amount, 0),
      averageAmount: amounts.length
        ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
        : 0,
      earliestDate: dates[0] ?? null,
      latestDate: dates.at(-1) ?? null,
      monthly,
      monthlyTotals: monthly,
      categoryTotals: categories
    });
  } catch (error) {
    return next(error);
  }
}