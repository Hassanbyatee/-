/**
 * Security Rules Specification Verification Suite (Dirty Dozen)
 * Run with Firebase Emulator Suite (`@firebase/rules-unit-testing`) when testing locally.
 */
export const DIRTY_DOZEN_SECURITY_CASES = [
  { id: 1, name: 'Role escalation to admin on user create', path: '/users/attacker', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Shadow field injection on user update', path: '/users/u1', operation: 'update', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Unapproved driver publishing trip', path: '/trips/t1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Negative availableSeats on trip', path: '/trips/t1', operation: 'update', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Self-crediting loyalty wallet balance', path: '/points_wallets/u1', operation: 'update', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Duplicate review creation', path: '/reviews/booking_dup', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Reviewing uncompleted booking', path: '/reviews/booking_pending', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Self-referral creation', path: '/referrals/u1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Cross-user private PII read', path: '/users/victim/private/info', operation: 'get', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Blanket unauthenticated/unscoped bookings list', path: '/bookings', operation: 'list', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Driver altering price after confirmed bookings', path: '/trips/t_booked', operation: 'update', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Resource poisoning via oversized ID or notes', path: '/trips/' + 'x'.repeat(200), operation: 'create', expected: 'PERMISSION_DENIED' },
] as const;
