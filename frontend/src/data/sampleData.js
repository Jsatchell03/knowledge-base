export const sampleNotes = [
  {
    id: '1',
    title: 'Getting Started',
    content:
      'Welcome to your knowledge base. Use the sidebar to create new notes or upload files. Click on any note to view and edit it.',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Meeting Notes - Project Kickoff',
    content:
      'Attendees: Alice, Bob, Carol\n\nAgenda:\n- Define project scope\n- Assign roles\n- Set timeline\n\nAction items:\n1. Alice to draft requirements doc by Friday\n2. Bob to set up the repo and CI pipeline\n3. Carol to schedule stakeholder interviews',
    createdAt: '2026-03-02T14:30:00.000Z',
    updatedAt: '2026-03-03T09:15:00.000Z',
  },
  {
    id: '3',
    title: 'API Design Guidelines',
    content:
      'REST API conventions:\n- Use plural nouns for resource endpoints (e.g. /users, /notes)\n- Return 201 for successful creation\n- Use PATCH for partial updates, PUT for full replacement\n- Include pagination for list endpoints: ?page=1&limit=20\n- Return consistent error shapes: { error: { code, message } }',
    createdAt: '2026-03-04T08:00:00.000Z',
    updatedAt: '2026-03-04T08:00:00.000Z',
  },
  {
    id: '4',
    title: 'Reading List',
    content:
      '- Designing Data-Intensive Applications by Martin Kleppmann\n- Clean Architecture by Robert C. Martin\n- The Pragmatic Programmer by Hunt & Thomas\n- Refactoring by Martin Fowler',
    createdAt: '2026-03-05T12:00:00.000Z',
    updatedAt: '2026-03-06T16:45:00.000Z',
  },
];

export const sampleFiles = [
  {
    id: '101',
    name: 'project-requirements.pdf',
    size: 245_000,
    type: 'application/pdf',
    createdAt: '2026-03-02T15:00:00.000Z',
  },
  {
    id: '102',
    name: 'architecture-diagram.png',
    size: 512_000,
    type: 'image/png',
    createdAt: '2026-03-03T10:30:00.000Z',
  },
  {
    id: '103',
    name: 'notes-export.csv',
    size: 8_400,
    type: 'text/csv',
    createdAt: '2026-03-05T13:00:00.000Z',
  },
];
