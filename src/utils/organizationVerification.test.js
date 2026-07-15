import { getOrganizationErrorMessage, getRequiredDocuments, getVerificationProgress, getVerificationUiState } from './organizationVerification';

describe('organization verification helpers', () => {
  it('returns country-specific registration requirements for Pakistan', () => {
    const docs = getRequiredDocuments('Pakistan', 'corporate');
    expect(docs.some((doc) => doc.key === 'legalRegistration')).toBe(true);
    expect(docs.some((doc) => doc.key === 'tradeLicense')).toBe(true);
  });

  it('does not require LLC for countries without that structure', () => {
    const docs = getRequiredDocuments('United Kingdom', 'corporate');
    expect(docs.some((doc) => doc.key === 'llcCertificate')).toBe(false);
    expect(docs.some((doc) => doc.key === 'legalRegistration')).toBe(true);
  });

  it('builds a pending verification progress summary', () => {
    const progress = getVerificationProgress({
      name: 'Demo Org',
      country: 'Pakistan',
      ownerName: 'Ali Khan',
      ownerEmail: 'ali@example.com',
      governmentId: '123',
      faceVerified: false,
      documents: ['legalRegistration']
    });

    expect(progress.status).toBe('pending');
    expect(progress.completedSteps).toBe(2);
    expect(progress.totalSteps).toBe(3);
  });

  it('maps backend verification states to UI state', () => {
    expect(getVerificationUiState('verified').label).toBe('Verified');
    expect(getVerificationUiState('pending').label).toBe('Pending verification');
    expect(getVerificationUiState('draft').label).toBe('Draft');
  });

  it('maps duplicate organization errors to a clear message', () => {
    expect(getOrganizationErrorMessage({ message: 'An organization with this name already exists' })).toBe('An organization with this name already exists.');
  });
});
