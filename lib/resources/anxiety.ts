import type { PathResources } from './types';

export const anxietyResources: PathResources = {
  pathId: 'anxiety',
  books: [
    { type: 'book', title: 'Rewire Your Anxious Brain', author: 'Catherine Pittman' },
    { type: 'book', title: 'The Anxiety and Phobia Workbook', author: 'Edmund Bourne' },
    { type: 'book', title: 'Self-Compassion', author: 'Kristin Neff' },
  ],
  communities: [
    {
      type: 'community',
      title: 'Anxiety and Depression Association of America',
      note: 'national nonprofit with a therapist directory and self-help resources',
      url: 'https://adaa.org/',
    },
    {
      type: 'community',
      title: 'NAMI (National Alliance on Mental Illness)',
      note: 'support groups, helpline, education',
      url: 'https://www.nami.org/',
    },
  ],
  clinicalGuidance:
    'Cognitive-behavioral therapy and acceptance-and-commitment therapy both have strong evidence bases for anxiety. Look for a therapist trained specifically in CBT or ACT rather than general talk therapy. If anxiety is intense enough to interfere with daily functioning, a psychiatric evaluation can also help — medication is one option among many and worth discussing rather than dismissing.',
};
