/** Independent read failures must not discard successfully authorized results. */
export async function availableResults<T>(requests: Promise<T[]>[]): Promise<{ values: T[]; errors: unknown[] }> {
  const results = await Promise.allSettled(requests);
  const values: T[] = [], errors: unknown[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') values.push(...result.value);
    else errors.push(result.reason);
  }
  return { values, errors };
}
