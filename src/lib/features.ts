/** Enable only after membership migration, rules/indexes and the trusted API are ready. */
export function invitationsEnabled(config: { enabled?: string; emulator?: string; production: boolean }): boolean {
  return config.enabled === 'true' || (!config.production && config.emulator === 'true');
}
export const TRIP_INVITATIONS_ENABLED = invitationsEnabled({
  enabled: process.env.NEXT_PUBLIC_TRIP_INVITATIONS_ENABLED,
  emulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
  production: process.env.NODE_ENV === 'production',
});
export const INVITATIONS_SETUP_MESSAGE = 'Поканите по username ще бъдат достъпни след настройване на новата Firebase среда. Съществуващите пътувания остават достъпни.';
