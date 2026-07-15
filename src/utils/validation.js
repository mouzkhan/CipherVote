export function validateVoterRegistration(values) {
  const errors = [];
  const data = values || {};

  if (!data.fullName || !String(data.fullName).trim()) {
    errors.push('Full name is required.');
  }

  if (!data.nationalId || !String(data.nationalId).trim()) {
    errors.push('National ID / CNIC is required.');
  } else {
    const normalized = String(data.nationalId).trim();
    if (!/^[A-Za-z0-9-]{4,20}$/.test(normalized)) {
      errors.push('National ID / CNIC format is invalid.');
    }
  }

  if (!data.email || !String(data.email).trim()) {
    errors.push('Email address is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
    errors.push('Enter a valid email address.');
  }

  if (!data.phone || !String(data.phone).trim()) {
    errors.push('Mobile number is required.');
  } else if (!/^\+?[0-9\s()-]{7,15}$/.test(String(data.phone).trim())) {
    errors.push('Enter a valid phone number.');
  }

  if (data.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.dateOfBirth))) {
    errors.push('Date of birth must be in YYYY-MM-DD format.');
  }

  return { isValid: errors.length === 0, errors };
}
