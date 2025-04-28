export const formatNumber = (value: number | string, locale = 'en-US'): string => {
  const numberValue = typeof value === 'string' ? parseInt(value) : value;
  return new Intl.NumberFormat(locale).format(numberValue);
};

export const formatCurrency = (value: number | string, currency = 'CHZ', locale = 'en-US'): string => {
  const numberValue = typeof value === 'string' ? parseInt(value) : value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD', // Using USD since CHZ is not a standard currency code
    currencyDisplay: 'code'
  })
    .format(numberValue)
    .replace('USD', currency);
};
