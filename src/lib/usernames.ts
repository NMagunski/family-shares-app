/** ASCII only, case insensitive; stable Firestore document key. */
export function normalizeUsername(value: string): string {
  const username = value.trim().replace(/^@/, '').toLowerCase();
  if (!/^[a-z][a-z0-9_]{2,23}$/.test(username)) throw new Error('Username: 3–24 латински букви, цифри или _, започва с буква.');
  return username;
}
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';
