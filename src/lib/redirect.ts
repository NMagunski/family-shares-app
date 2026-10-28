/** Accept only paths on this origin, including browsers that normalize backslashes. */
export function localRedirect(value: unknown, fallback = '/'): string {
  return typeof value === 'string' && /^\/(?!\/)/.test(value) && !/[\\\u0000-\u0020]/.test(value) ? value : fallback;
}
