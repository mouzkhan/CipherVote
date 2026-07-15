export function getRequiredDocuments(country, organizationType) {
  const baseDocs = [
    {
      key: 'legalRegistration',
      label: 'Legal registration document',
      help: 'Upload the official business registration document for your country.',
      required: true,
    },
    {
      key: 'certificateOfIncorporation',
      label: 'Certificate of incorporation',
      help: 'Required if your jurisdiction issues one.',
      required: false,
    },
  ];

  const countryRules = {
    Pakistan: [
      { key: 'tradeLicense', label: 'Trade license', help: 'Required for most registered businesses.', required: true },
      { key: 'secpRegistration', label: 'SECP registration', help: 'Preferred evidence of legal registration in Pakistan.', required: true },
    ],
    'United Kingdom': [
      { key: 'companiesHouse', label: 'Companies House registration', help: 'Accepted as proof of legal registration.', required: true },
    ],
    India: [
      { key: 'mcaRegistration', label: 'MCA registration', help: 'Acceptable proof of legal registration in India.', required: true },
    ],
    UAE: [
      { key: 'tradeLicense', label: 'Trade license', help: 'Required for UAE-based entities.', required: true },
    ],
  };

  const typeRules = organizationType === 'corporate'
    ? [{ key: 'articlesOfOrganization', label: 'Articles of organization', help: 'Optional but recommended for corporate entities.', required: false }]
    : [];

  return [...baseDocs, ...(countryRules[country] || []), ...typeRules];
}

export function getVerificationProgress(data) {
  const steps = [
    {
      key: 'organization',
      label: 'Organization details',
      completed: Boolean(data?.name && data?.country && data?.registrationNumber),
    },
    {
      key: 'owner',
      label: 'Owner verification',
      completed: Boolean(data?.ownerName && data?.ownerEmail && data?.governmentId),
    },
    {
      key: 'documents',
      label: 'Business documents',
      completed: Array.isArray(data?.documents) && data.documents.length > 0,
    },
  ];

  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const percent = Math.round((completedSteps / totalSteps) * 100);
  const status = completedSteps === totalSteps ? 'verified' : completedSteps > 0 ? 'pending' : 'draft';

  return { steps, completedSteps, totalSteps, percent, status };
}

export function getOrganizationErrorMessage(error) {
  const rawMessage = error?.message || error?.error || '';
  const message = String(rawMessage).trim();
  const normalized = message.toLowerCase();

  if (!message) {
    return 'Unable to create organization right now.';
  }

  if (normalized.includes('already exists') || normalized.includes('duplicate')) {
    return 'An organization with this name already exists.';
  }

  return message;
}

export function getVerificationUiState(backendStatus) {
  switch (backendStatus) {
    case 'verified':
      return {
        label: 'Verified',
        badgeClass: 'badge-green',
        description: 'This organization has been approved by the verification team.',
        percent: 100,
      };
    case 'pending':
      return {
        label: 'Pending verification',
        badgeClass: 'badge-yellow',
        description: 'The submission is waiting for admin review.',
        percent: 60,
      };
    case 'active':
      return {
        label: 'Active',
        badgeClass: 'badge-green',
        description: 'The organization is active and can use verified features.',
        percent: 100,
      };
    case 'suspended':
      return {
        label: 'Suspended',
        badgeClass: 'badge-red',
        description: 'This organization has been suspended.',
        percent: 30,
      };
    default:
      return {
        label: 'Draft',
        badgeClass: 'badge-blue',
        description: 'Complete the form and submit for verification.',
        percent: 0,
      };
  }
}
