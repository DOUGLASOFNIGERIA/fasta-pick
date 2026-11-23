const formatNaira = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

module.exports = { formatNaira };
