export type SortDirection = 'asc' | 'desc' | '';

export interface SortConfig {
  column: string;
  direction: SortDirection;
}

/**
 * Generic sort helper for any array of objects.
 * Pass an empty direction to return the original order.
 */
export function sortArray<T>(data: T[], column: keyof T | string, direction: SortDirection): T[] {
  if (!direction || !column) return data;

  return [...data].sort((a: any, b: any) => {
    const aVal = getNestedValue(a, column as string);
    const bVal = getNestedValue(b, column as string);

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    let cmp = 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
    }

    return direction === 'asc' ? cmp : -cmp;
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * Toggle sort direction cycle: '' → 'asc' → 'desc' → 'asc'
 */
export function toggleSort(current: SortConfig, column: string): SortConfig {
  if (current.column !== column) {
    return { column, direction: 'asc' };
  }
  const next: SortDirection = current.direction === 'asc' ? 'desc' : 'asc';
  return { column, direction: next };
}

/**
 * Return the sort icon class based on current sort state.
 */
export function sortIcon(config: SortConfig, column: string): string {
  if (config.column !== column || !config.direction) return 'bi-arrow-down-up text-muted opacity-50';
  return config.direction === 'asc' ? 'bi-arrow-up text-primary' : 'bi-arrow-down text-primary';
}
