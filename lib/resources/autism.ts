import type { PathResources } from './types';

export const autismResources: PathResources = {
  pathId: 'autism',
  books: [
    { type: 'book', title: 'Unmasking Autism', author: 'Devon Price' },
    { type: 'book', title: 'Divergent Mind', author: 'Jenara Nerenberg' },
    { type: 'book', title: 'I Think I Might Be Autistic', author: 'Cynthia Kim' },
  ],
  communities: [
    {
      type: 'community',
      title: 'r/AutismInWomen',
      note: 'reflective Reddit community, broadly inclusive of all gender identifications',
      url: 'https://www.reddit.com/r/AutismInWomen/',
    },
    {
      type: 'community',
      title: 'Asperger/Autism Network (AANE)',
      note: 'peer forums and provider directory',
      url: 'https://www.aane.org/',
    },
    {
      type: 'community',
      title: 'Autistic Self Advocacy Network',
      note: 'autistic-led, advocacy and resources',
      url: 'https://autisticadvocacy.org/',
    },
  ],
  clinicalGuidance:
    'Look specifically for providers who specialize in adult autism assessment. Many clinicians trained in older frameworks still miss adult presentations, particularly in people who have masked well. The AANE directory above is a reasonable starting point, and word-of-mouth from late-identified adults in your area often surfaces the right names.',
};
