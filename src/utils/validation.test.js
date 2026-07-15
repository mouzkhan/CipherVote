import { validateVoterRegistration } from './validation';

describe('validateVoterRegistration', () => {
  it('accepts a well-formed registration', () => {
    const result = validateVoterRegistration({
      fullName: 'Amina Khan',
      nationalId: '4230112345678',
      email: 'amina@example.com',
      phone: '+923001234567',
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects invalid email and phone formatting', () => {
    const result = validateVoterRegistration({
      fullName: 'Amina Khan',
      nationalId: '4230112345678',
      email: 'bad-email',
      phone: 'abc',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['Enter a valid email address.', 'Enter a valid phone number.']));
  });
});
