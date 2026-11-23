export const formatNaira = (amount) => {
  const value = Number(amount || 0);
  return `₦${value.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatCompactNaira = (amount) => {
  const value = Number(amount || 0);
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return formatNaira(value);
};
