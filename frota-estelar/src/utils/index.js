export const createPageUrl = (page, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return query ? `${page}?${query}` : page;
};

export const parsePageUrl = (search) => {
  return Object.fromEntries(new URLSearchParams(search));
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const calculateLevel = (experience) => {
  return Math.floor(Math.sqrt(experience / 100)) + 1;
};

export const calculateExperienceForLevel = (level) => {
  return ((level - 1) ** 2) * 100;
};
