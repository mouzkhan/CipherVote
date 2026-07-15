/**
 * Navigation helpers for the e-voting platform.
 */

/**
 * Returns the appropriate dashboard route based on user authentication state.
 * @param {Object} params - Navigation parameters
 * @param {Object} params.user - User object from Firebase auth
 * @param {boolean} params.isAdmin - Whether user is an admin
 * @param {boolean} params.hasOrganization - Whether user has an organization
 * @returns {string} The route to navigate to
 */
export function getDashboardRoute({ user, isAdmin, hasOrganization }) {
  if (isAdmin) {
    return '/admin';
  }
  if (hasOrganization) {
    return '/organization-dashboard';
  }
  return '/voter-portal';
}

/**
 * Returns whether a user should be redirected to registration
 * @param {Object} params - Check parameters
 * @param {Object} params.user - User object
 * @param {boolean} params.hasOrganization - Whether user has an organization
 * @param {boolean} params.hasBiometric - Whether user has biometric enrolled
 * @returns {boolean} Whether redirect is needed
 */
export function needsSetupRedirect({ user, hasOrganization, hasBiometric }) {
  return user && (!hasOrganization || !hasBiometric);
}
