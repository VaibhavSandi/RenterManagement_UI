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
