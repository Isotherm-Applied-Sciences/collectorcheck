function getAmount(receipt) {
  const amount = Number(String(receipt.amount ?? '').replace(/[$,]/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

export function getEmotionalMoment(receipt) {
  if (!receipt) return null;

  const vendor = String(receipt.vendor ?? '').toLowerCase();
  if (vendor.includes('mcdonald')) {
    return {
      id: `mcdonalds-history-${receipt.id}`,
      title: "A Little McDonald's History",
      message: "Fun fact: McDonald's stopped updating its “Billions Served” signs after 2013. The first million-served milestone was noted in 1963, and the sign reached 99 billion in 1994.",
      tone: 'nostalgic'
    };
  }

  const amount = getAmount(receipt);
  if (amount !== null && amount > 200) {
    return {
      id: `large-purchase-${receipt.id}`,
      title: 'Nice Purchase',
      message: 'Want to add a tag to keep this receipt organized?',
      tone: 'supportive'
    };
  }

  if (amount !== null && amount > 0 && amount < 5) {
    return {
      id: `small-treat-${receipt.id}`,
      title: 'Small Treat',
      message: 'Sometimes the tiny purchases are the best ones.',
      tone: 'warm'
    };
  }

  return null;
}