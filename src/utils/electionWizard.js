export function buildElectionPayload(form) {
  // Use provided candidates or add sample candidates for demo
  const candidates = form.candidates && form.candidates.length > 0 ? form.candidates : [
    { id: 'c1', name: 'Alice Johnson', party: 'Progressive Party', votes: 0 },
    { id: 'c2', name: 'Bob Smith', party: 'Independent', votes: 0 },
    { id: 'c3', name: 'Charlie Davis', party: 'Unity Coalition', votes: 0 },
  ];

  return {
    title: form.name || 'Untitled Election',
    description: form.description || '',
    status: 'active',
    candidates,
    totalVotes: 0,
    createdAt: Date.now(),
    meta: {
      startDate: form.startDate || '',
      endDate: form.endDate || '',
      visibility: form.visibility || 'private',
    },
  };
}
