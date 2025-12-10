// lib/currencies.ts

// 👉 ISO кодове на валутите, които поддържаме.
// Можеш да добавяш още по всяко време.
export type CurrencyCode =
  | 'EUR'
  | 'BGN'
  | 'USD'
  | 'GBP'
  | 'CHF'
  | 'RON'
  | 'TRY'
  | 'PLN'
  | 'CZK'
  | 'HUF'
  | 'RSD'
  | 'HRK'
  | 'MKD'
  | 'DKK'
  | 'NOK'
  | 'SEK';

// 1 единица от тази валута = rateToEur евро
export type CurrencyMeta = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  countries: string[];
  rateToEur: number;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Евро',
    countries: ['Еврозона'],
    rateToEur: 1,
  },
  BGN: {
    code: 'BGN',
    symbol: 'лв',
    name: 'Български лев',
    countries: ['България'],
    // 1 BGN = 1 / 1.95583 EUR
    rateToEur: 1 / 1.95583,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Щатски долар',
    countries: ['САЩ'],
    rateToEur: 0.92, // примерна стойност – може да я коригираш
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'Британска лира',
    countries: ['Великобритания'],
    rateToEur: 1.16,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Швейцарски франк',
    countries: ['Швейцария'],
    rateToEur: 1.03,
  },
  RON: {
    code: 'RON',
    symbol: 'lei',
    name: 'Румънски леи',
    countries: ['Румъния'],
    rateToEur: 0.20,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Турска лира',
    countries: ['Турция'],
    rateToEur: 0.03,
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł',
    name: 'Полска злота',
    countries: ['Полша'],
    rateToEur: 0.23,
  },
  CZK: {
    code: 'CZK',
    symbol: 'Kč',
    name: 'Чешка крона',
    countries: ['Чехия'],
    rateToEur: 0.04,
  },
  HUF: {
    code: 'HUF',
    symbol: 'Ft',
    name: 'Унгарски форинт',
    countries: ['Унгария'],
    rateToEur: 0.0026,
  },
  RSD: {
    code: 'RSD',
    symbol: 'дин',
    name: 'Сръбски динар',
    countries: ['Сърбия'],
    rateToEur: 0.0085,
  },
  HRK: {
    code: 'HRK',
    symbol: 'kn',
    name: 'Хърватска куна (историческа)',
    countries: ['Хърватия'],
    rateToEur: 0.13,
  },
  MKD: {
    code: 'MKD',
    symbol: 'ден',
    name: 'Македонски денар',
    countries: ['Северна Македония'],
    rateToEur: 0.016,
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Датска крона',
    countries: ['Дания'],
    rateToEur: 0.13,
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Норвежка крона',
    countries: ['Норвегия'],
    rateToEur: 0.088,
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Шведска крона',
    countries: ['Швеция'],
    rateToEur: 0.089,
  },
};

// 👉 помощни функции

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES[code]?.symbol ?? code;
}

export function convertToEur(amount: number, code: CurrencyCode): number {
  const meta = CURRENCIES[code];
  if (!meta) return amount;
  return amount * meta.rateToEur;
}

export function convert(amount: number, from: CurrencyCode, to: CurrencyCode) {
  if (from === to) return amount;
  // от "from" към EUR
  const inEur = convertToEur(amount, from);
  if (to === 'EUR') return inEur;
  const meta = CURRENCIES[to];
  if (!meta || meta.rateToEur === 0) return inEur;
  // от EUR към "to"
  return inEur / meta.rateToEur;
}
