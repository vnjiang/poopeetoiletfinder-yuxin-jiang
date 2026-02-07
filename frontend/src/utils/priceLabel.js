// utils/priceLabel.js
export function getFeeLabel(toilet) {
  if (!toilet) return 'N/A';

  const feeType = toilet.type;

  if (feeType === 'paid') {
    return toilet.price ? toilet.price : 'Paid';
  }

  if (feeType === 'free') return 'Free';

  if (feeType === 'free for customer') return 'Free for customer';

  return 'N/A';
}
