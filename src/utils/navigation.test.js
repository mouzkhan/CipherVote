import { getDashboardRoute } from './navigation';

describe('getDashboardRoute', () => {
  it('routes regular users to the platform dashboard', () => {
    expect(getDashboardRoute({ user: { uid: 'u1' }, isAdmin: false, hasOrganization: false })).toBe('/platform-dashboard');
  });

  it('routes organization admins to the organization workspace', () => {
    expect(getDashboardRoute({ user: { uid: 'u2' }, isAdmin: true, hasOrganization: true })).toBe('/organization-dashboard');
  });
});
