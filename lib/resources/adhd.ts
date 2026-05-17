import type { PathResources } from './types';

export const adhdResources: PathResources = {
  pathId: 'adhd',
  books: [
    { type: 'book', title: 'Driven to Distraction', author: 'Edward Hallowell and John Ratey' },
    { type: 'book', title: 'Taking Charge of Adult ADHD', author: 'Russell Barkley' },
    { type: 'book', title: 'Women with Attention Deficit Disorder', author: 'Sari Solden' },
  ],
  communities: [
    {
      type: 'community',
      title: 'CHADD (Children and Adults with ADHD)',
      note: 'national nonprofit; adult-focused provider directory and support groups',
      url: 'https://chadd.org/',
    },
    {
      type: 'community',
      title: 'ADDA (Attention Deficit Disorder Association)',
      note: 'adult-only organization, virtual peer support groups for late-identified adults',
      url: 'https://add.org/',
    },
  ],
  clinicalGuidance:
    'Adult ADHD assessment is best done by a clinician — psychologist, psychiatrist, or specialist physician — who works specifically with adult presentations rather than primarily with children. Diagnosis involves clinical interview about developmental history, current functioning across multiple settings, and ruling out overlapping presentations like anxiety, depression, sleep disorders, and thyroid issues that can produce similar symptoms. Treatment most often involves a combination of medication (stimulants and non-stimulants both have strong evidence bases) and behavioral support; either component can be useful on its own. For late-identified adults — particularly women, whose presentations were historically missed because diagnostic frameworks were built around the school-age boy stereotype — finding a clinician who understands how ADHD presents outside that frame is the harder and more important task.',
};
