import type { PathResources } from './types';

export const depressionResources: PathResources = {
  pathId: 'depression',
  books: [
    { type: 'book', title: 'The Noonday Demon', author: 'Andrew Solomon' },
    { type: 'book', title: 'Lost Connections', author: 'Johann Hari' },
    { type: 'book', title: 'An Unquiet Mind', author: 'Kay Redfield Jamison' },
  ],
  communities: [
    {
      type: 'community',
      title: 'Depression and Bipolar Support Alliance',
      note: 'peer support groups, online and in person',
      url: 'https://www.dbsalliance.org/',
    },
    {
      type: 'community',
      title: 'NAMI (National Alliance on Mental Illness)',
      note: 'support groups, helpline, education',
      url: 'https://www.nami.org/',
    },
  ],
  clinicalGuidance:
    'Depression is treatable, and the right starting point is usually a full clinical evaluation — physical health, sleep, medications, and mental health considered together. A primary care doctor can begin this, but a psychiatrist or psychiatric nurse practitioner can offer more specialized assessment. Therapy approaches with strong evidence include cognitive-behavioral therapy, behavioral activation, and interpersonal therapy. If the depression is severe or persistent, medication is a legitimate option worth discussing — not a failure, not a last resort.',
};
