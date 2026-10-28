export function formatPrice(price: number, listingType?: string): string {
  if (isNaN(price)) return '₹0';
  
  // Format with Indian Rupee numbering format (lakhs, crores or standard)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(price);

  if (listingType === 'rent') {
    return `₹${formatted} / month`;
  }
  return `₹${formatted}`;
}

export function formatArea(sqft: number): string {
  if (isNaN(sqft)) return '0 sq ft';
  return `${new Intl.NumberFormat('en-IN').format(sqft)} sq ft`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
