import { buildElectionPayload } from './electionWizard';

describe('election wizard payload builder', () => {
  it('builds a publishable election payload from the wizard form', () => {
    const payload = buildElectionPayload({
      name: 'Student Council',
      description: 'Vote for new representatives',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      visibility: 'private',
    });

    expect(payload.title).toBe('Student Council');
    expect(payload.description).toBe('Vote for new representatives');
    expect(payload.status).toBe('active');
    expect(payload.candidates).toEqual([]);
    expect(payload.totalVotes).toBe(0);
  });
});
