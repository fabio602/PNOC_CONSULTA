
export const formatDateBRL = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatCurrencyBRL = (value: number): string => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatApiDate = (date: string): string => {
  // Converte YYYY-MM-DD para YYYYMMDD para a API do PNCP
  return date.replace(/-/g, '');
};

export const cleanCnpj = (cnpj: string): string => {
  return cnpj.replace(/\D/g, '');
};
