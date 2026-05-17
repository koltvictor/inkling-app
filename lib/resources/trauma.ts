import type { PathResources } from './types';

export const traumaResources: PathResources = {
  pathId: 'trauma',
  books: [
    { type: 'book', title: 'The Body Keeps the Score', author: 'Bessel van der Kolk' },
    { type: 'book', title: 'Trauma and Recovery', author: 'Judith Herman' },
    { type: 'book', title: 'What My Bones Know', author: 'Stephanie Foo' },
  ],
  communities: [
    {
      type: 'community',
      title: 'National Domestic Violence Hotline',
      note: 'free, confidential support 24/7 for anyone in or affected by abuse — call 1-800-799-7233, text START to 88788, or chat at thehotline.org',
      url: 'https://www.thehotline.org/',
    },
    {
      type: 'community',
      title: 'RAINN (Rape, Abuse & Incest National Network)',
      note: '24/7 hotline and online chat for survivors of sexual violence — 1-800-656-HOPE',
      url: 'https://www.rainn.org/',
    },
    {
      type: 'community',
      title: 'ISTSS Clinician Directory',
      note: 'International Society for Traumatic Stress Studies — search for trauma-specialized clinicians',
      url: 'https://istss.org/find-a-clinician/',
    },
  ],
  clinicalGuidance:
    'Trauma-focused therapy modalities have strong evidence bases for the patterns the PCL-5 measures: EMDR (Eye Movement Desensitization and Reprocessing), trauma-focused cognitive behavioral therapy (TF-CBT), somatic experiencing, and internal family systems (IFS) all have substantial track records. The right modality depends on the texture of what you are working through — single-event trauma often responds well to EMDR, while complex or developmental trauma often benefits from somatic and IFS approaches that work with the long-term shape of the nervous system. A clinician trained specifically in trauma therapy matters — general talk therapy without trauma specialization can sometimes inadvertently retraumatize. Look for credentials like EMDR Institute certification, Somatic Experiencing Practitioner (SEP), or IFS Institute training. Medication can be a useful adjunct, particularly for sleep disruption and severe arousal symptoms, and is best discussed with a psychiatrist familiar with PTSD. If you are currently in an unsafe situation rather than processing past events, the National Domestic Violence Hotline (1-800-799-7233 or text START to 88788) is staffed by people trained to help you think through safety, regardless of whether physical violence is involved.',
};
