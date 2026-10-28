import type { TripExpense } from '@/types/trip';
export type AllocationMode = 'all' | 'selected' | 'single';
type Allocation = Pick<TripExpense, 'involvedFamilyIds' | 'allocationMode'>;

export function allocationModeForExpense(expense: Allocation): AllocationMode {
  // An explicit old array is a historical selection, even if it matches today's families.
  return expense.allocationMode ?? (expense.involvedFamilyIds?.length === 1 ? 'single' : expense.involvedFamilyIds?.length ? 'selected' : 'all');
}

/** Only the explicit 'all' choice expands to today's families. Never add the payer. */
export function allocationForSave(mode: AllocationMode, selected: string[], allIds: string[], original?: Allocation, changed = true): Allocation {
  if (original && !changed) return { involvedFamilyIds: [...(original.involvedFamilyIds ?? [])], ...(original.allocationMode ? { allocationMode: original.allocationMode } : {}) };
  const ids = [...new Set(mode === 'all' ? allIds : selected)];
  if (!ids.length) throw new Error('Избери поне едно семейство, за което е разходът.');
  if (mode === 'single' && ids.length !== 1) throw new Error('Избери точно едно семейство.');
  if (mode === 'all' && allIds.some(id => !ids.includes(id))) throw new Error('Семействата са променени. Избери отново „За всички“.');
  if (ids.some(id => !allIds.includes(id))) throw new Error('Избрано е недостъпно семейство.');
  return { involvedFamilyIds: ids, allocationMode: mode };
}

/** Server validation keeps the old empty-array convention only for unchanged legacy edits. */
export function validateAllocation(input: Record<string, unknown>, allIds: string[], original?: Allocation): Allocation {
  if (!Array.isArray(input.involvedFamilyIds) || input.involvedFamilyIds.some(id => typeof id !== 'string')) throw new Error('Невалидни семейства.');
  const ids = [...new Set(input.involvedFamilyIds)] as string[];
  const mode = input.allocationMode;
  if (mode !== undefined && mode !== 'all' && mode !== 'selected' && mode !== 'single') throw new Error('Невалидно разпределяне.');
  const unchanged = original && mode === original.allocationMode && JSON.stringify(input.involvedFamilyIds) === JSON.stringify(original.involvedFamilyIds ?? []);
  if (unchanged) return { involvedFamilyIds: [...input.involvedFamilyIds], ...(mode ? { allocationMode: mode } : {}) };
  // Persist a snapshot of IDs, including 'all', so later family additions don't change it.
  if (!ids.length) throw new Error('Избери поне едно семейство, за което е разходът.');
  if (mode === 'single' && ids.length !== 1) throw new Error('Избери точно едно семейство.');
  if (mode === 'all' && allIds.some(id => !ids.includes(id))) throw new Error('Семействата са променени. Избери отново „За всички“.');
  if (ids.some(id => !allIds.includes(id))) throw new Error('Избрано е недостъпно семейство.');
  return { involvedFamilyIds: ids, ...(mode ? { allocationMode: mode } : {}) };
}
