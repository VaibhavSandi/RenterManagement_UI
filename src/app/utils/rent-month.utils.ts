export interface RentMonthOption {
  key: string;   // 'yyyy-MM'
  month: number; // 1-12
  year: number;
  label: string; // 'September 2026'
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function rentMonthKey(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function rentMonthLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Rent months around the anchor (usually the latest due month), newest first. */
export function buildRentMonthOptions(anchorMonth: number, anchorYear: number,
                                      monthsBack = 24, monthsAhead = 2): RentMonthOption[] {
  const options: RentMonthOption[] = [];
  for (let offset = monthsAhead; offset >= -monthsBack; offset--) {
    const d = new Date(anchorYear, anchorMonth - 1 + offset, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    options.push({ key: rentMonthKey(month, year), month, year, label: rentMonthLabel(month, year) });
  }
  return options;
}

export function parseRentMonthKey(key: string): { month: number; year: number } {
  const [year, month] = key.split('-').map(v => parseInt(v, 10));
  return { month, year };
}

const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'Aug' */
export function shortMonthName(month: number): string {
  return SHORT_MONTH_NAMES[month - 1];
}

/** 'Aug 2026' */
export function shortRentMonthLabel(month: number, year: number): string {
  return `${SHORT_MONTH_NAMES[month - 1]} ${year}`;
}

export interface YearGroup<T> {
  year: number;
  months: T[];
}

/** Groups rent months (sorted oldest first) by year, keeping their order. */
export function groupByRentYear<T extends { rentYear: number }>(months: T[]): YearGroup<T>[] {
  const groups: YearGroup<T>[] = [];
  for (const m of months) {
    const last = groups[groups.length - 1];
    if (last && last.year === m.rentYear) {
      last.months.push(m);
    } else {
      groups.push({ year: m.rentYear, months: [m] });
    }
  }
  return groups;
}

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

/** '₹1,25,000' */
export function formatInr(amount: number | null | undefined): string {
  return INR.format(amount ?? 0);
}
