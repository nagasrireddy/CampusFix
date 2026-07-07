// ---------------------------------------------------------
// utils/storage.js
// CRITICAL SECURITY MODULE
// ---------------------------------------------------------
// All browser storage in CampusFix goes through this module.
// Direct calls to localStorage/sessionStorage elsewhere in the
// codebase are forbidden by convention - everything funnels
// through here so session data stays namespaced and cannot
// leak between roles or between two different accounts that
// have logged into the same browser at different times.
//
// Strategy:
//   1. Every stored key is prefixed with a fixed app namespace
//      ("campusfix") AND the role of the account that owns it,
//      e.g. "campusfix:student:auth", "campusfix:admin:auth".
//   2. On every successful login, we PURGE any session keys
//      belonging to roles OTHER than the one logging in. This
//      prevents a scenario where, say, a shared/public campus
//      lab computer retains a stale admin token in storage
//      while a student is now using the browser - eliminating
//      the primary privilege-escalation/data-leakage vector.
//   3. On logout, we purge only the active role's namespace,
//      never touching unrelated app data.
// ---------------------------------------------------------

const APP_NAMESPACE = 'campusfix';
const ROLES = ['student', 'admin', 'technician'];

const buildKey = (role, key) => `${APP_NAMESPACE}:${role}:${key}`;

/**
 * Removes every stored key belonging to a given role namespace.
 */
const purgeRole = (role) => {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`${APP_NAMESPACE}:${role}:`))
    .forEach((k) => localStorage.removeItem(k));
};

/**
 * Removes stored data for every role EXCEPT the one supplied.
 * Called immediately after a successful login to guarantee no
 * cross-role residue remains in the browser.
 */
const purgeOtherRoles = (activeRole) => {
  ROLES.filter((r) => r !== activeRole).forEach(purgeRole);
};

/**
 * Persists the authenticated session (JWT + user profile) under
 * the role-specific namespace, after clearing any other role's
 * leftover session data.
 */
const setSession = (token, user) => {
  purgeOtherRoles(user.role);
  localStorage.setItem(buildKey(user.role, 'token'), token);
  localStorage.setItem(buildKey(user.role, 'user'), JSON.stringify(user));
  // A single small pointer key (no sensitive data) tells the app
  // which role namespace is currently "active" on app reload.
  localStorage.setItem(`${APP_NAMESPACE}:activeRole`, user.role);
};

/**
 * Reads back the currently active session, if any. Returns null
 * if no valid session pointer/token pair exists.
 */
const getSession = () => {
  const activeRole = localStorage.getItem(`${APP_NAMESPACE}:activeRole`);
  if (!activeRole || !ROLES.includes(activeRole)) return null;

  const token = localStorage.getItem(buildKey(activeRole, 'token'));
  const rawUser = localStorage.getItem(buildKey(activeRole, 'user'));

  if (!token || !rawUser) return null;

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return null;
  }
};

/**
 * Clears the active role's session entirely (used on logout).
 */
const clearSession = () => {
  const activeRole = localStorage.getItem(`${APP_NAMESPACE}:activeRole`);
  if (activeRole) purgeRole(activeRole);
  localStorage.removeItem(`${APP_NAMESPACE}:activeRole`);
};

export { setSession, getSession, clearSession };
