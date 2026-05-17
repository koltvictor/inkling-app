/**
 * Resources for users whose presenting pattern is outside what Inkling screens for.
 *
 * Each category covers what it includes, the kind of clinician most likely
 * to help, and a small set of trusted organizations. Tone is warm and
 * redirective rather than dismissive — the user came looking for help, and
 * we want them to leave with somewhere better to go, not just a refusal.
 *
 * Notes on specific categories:
 * - personality-patterns: many users with these traits experience the
 *   labels as stigmatizing. Page copy avoids the formal terms unless the
 *   user themselves used them in their intake.
 * - eating-patterns: NEDA (the older "go-to" eating disorders helpline) is
 *   permanently shut down. National Alliance for Eating Disorders is the
 *   current correct referral.
 */

export type Organization = {
  name: string;
  url?: string;
  description: string;
};

export type DifferentCareCategory = {
  id: string;
  displayLabel: string;            // short name, used inline in framing copy
  whatThisCovers: string;          // one paragraph framing the category's territory
  clinicianType: string;           // one paragraph on the right kind of professional
  organizations: Organization[];   // 2-3 trusted resources
  crisisLine?: { name: string; number: string };
};

export const DIFFERENT_CARE: Record<string, DifferentCareCategory> = {
  'psychotic-spectrum': {
    id: 'psychotic-spectrum',
    displayLabel: 'psychotic-spectrum experiences',
    whatThisCovers:
      'Hearing or seeing things others do not, experiences of being watched or followed without an external basis, or thought patterns that feel disorganized or hard to follow. These experiences are more common than most people realize, and they often respond well to specialist treatment. Earlier engagement tends to help.',
    clinicianType:
      'A psychiatrist with experience in psychotic-spectrum conditions. If you have a primary care physician, they can usually provide a referral and connect you to evaluation more quickly than navigating it alone.',
    organizations: [
      {
        name: 'NAMI (National Alliance on Mental Illness)',
        url: 'https://www.nami.org',
        description:
          'National mental health organization with information, support groups, family resources, and a helpline at 1-800-950-6264.',
      },
      {
        name: 'Schizophrenia & Psychosis Action Alliance',
        url: 'https://sczaction.org',
        description:
          'Education, advocacy, and resources specifically for people affected by psychotic-spectrum conditions and their loved ones.',
      },
    ],
  },

  'bipolar-spectrum': {
    id: 'bipolar-spectrum',
    displayLabel: 'bipolar-spectrum patterns',
    whatThisCovers:
      'Patterns of mood that cycle between elevated, energized, or expansive states and low or depressed ones. These patterns can look like depression alone if the elevated states are subtle, which is part of why they are best evaluated by a clinician who can take a full history.',
    clinicianType:
      'A psychiatrist. Bipolar conditions usually involve medication considerations that benefit from psychiatric evaluation rather than therapy alone.',
    organizations: [
      {
        name: 'DBSA (Depression and Bipolar Support Alliance)',
        url: 'https://www.dbsalliance.org',
        description:
          'Peer-led support groups (online and in-person), educational materials, and wellness tools shaped by people who live with these conditions.',
      },
      {
        name: 'NAMI (National Alliance on Mental Illness)',
        url: 'https://www.nami.org',
        description:
          'Information, support groups, and a helpline at 1-800-950-6264.',
      },
    ],
  },

  'eating-patterns': {
    id: 'eating-patterns',
    displayLabel: 'patterns around food and your body',
    whatThisCovers:
      'Restriction, binge-eating, purging, compulsive exercise, or thinking about food and your body in ways that feel preoccupying or difficult to step back from. These patterns are not about willpower, and they benefit from specialized care from clinicians trained in this work specifically.',
    clinicianType:
      'A therapist with eating disorder training — typically someone trained in CBT-E (Enhanced Cognitive Behavioral Therapy) or FBT (Family-Based Treatment), often working alongside a registered dietitian. A psychiatrist may also be appropriate depending on what is happening.',
    organizations: [
      {
        name: 'National Alliance for Eating Disorders',
        url: 'https://www.allianceforeatingdisorders.com',
        description:
          'Helpline at 1-866-662-1235, free clinician referrals across the US, and online support groups.',
      },
      {
        name: 'Project HEAL',
        url: 'https://www.theprojectheal.org',
        description:
          'Helps people access eating disorder treatment when cost or insurance has been a barrier.',
      },
      {
        name: 'F.E.A.S.T.',
        url: 'https://www.feast-ed.org',
        description:
          'Support and resources for family members and loved ones, and for those affected by eating disorders themselves.',
      },
    ],
  },

  'ocd': {
    id: 'ocd',
    displayLabel: 'OCD and intrusive-thought patterns with compulsions',
    whatThisCovers:
      'Intrusive thoughts or images that feel deeply unwanted, paired with mental or physical rituals you feel pulled to perform in response — checking, counting, washing, mentally reviewing, seeking reassurance. OCD is often mistaken for generalized anxiety, but it responds best to a specific treatment that general anxiety therapy does not always include.',
    clinicianType:
      'A therapist trained in ERP (Exposure and Response Prevention). This is the evidence-based treatment for OCD, and it requires specific training. General anxiety therapists may not have it.',
    organizations: [
      {
        name: 'International OCD Foundation',
        url: 'https://iocdf.org',
        description:
          'Searchable directory of ERP-trained therapists, free educational resources, online support groups, and conferences.',
      },
    ],
  },

  'substance-use': {
    id: 'substance-use',
    displayLabel: 'substance use',
    whatThisCovers:
      'Patterns of using substances — alcohol, prescription medications, or other drugs — that have become hard to step back from, or that are affecting your work, your relationships, or how you feel about yourself. There is no single right path here. Different people find different approaches work.',
    clinicianType:
      'An addiction medicine specialist, or a licensed addiction counselor (LADC or CADC depending on your state). Many primary care providers can also help with initial steps, especially around alcohol.',
    organizations: [
      {
        name: 'SAMHSA National Helpline',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
        description:
          'Free, confidential, 24/7. Treatment referrals and information. Call 1-800-662-4357.',
      },
      {
        name: 'SMART Recovery',
        url: 'https://www.smartrecovery.org',
        description:
          'Self-empowerment-based recovery program built around cognitive-behavioral tools. Free online and in-person meetings.',
      },
      {
        name: 'AA / NA',
        url: 'https://www.aa.org',
        description:
          'Twelve-step programs with the broadest geographic coverage of any recovery support. Meetings are free, and most communities have them.',
      },
    ],
  },

  'dissociation': {
    id: 'dissociation',
    displayLabel: 'dissociation and experiences of being disconnected from yourself',
    whatThisCovers:
      'Experiences of feeling disconnected from yourself or from the world, time loss, finding evidence of things you do not remember doing, or feeling like more than one part of yourself. These experiences are often rooted in earlier trauma and benefit from clinicians trained in this work specifically — not all trauma therapists are.',
    clinicianType:
      'A trauma specialist with dissociation training. The phrasing to look for is a clinician familiar with "structural dissociation," or one trained in sensorimotor psychotherapy, Internal Family Systems, or EMDR adapted for dissociative presentations.',
    organizations: [
      {
        name: 'ISST-D (International Society for the Study of Trauma and Dissociation)',
        url: 'https://www.isst-d.org',
        description:
          'Find-a-therapist directory of clinicians trained in trauma-and-dissociation work, public-facing education, and an online learning library.',
      },
    ],
  },

  'personality-patterns': {
    id: 'personality-patterns',
    displayLabel: 'long-standing patterns in relationships and self-perception',
    whatThisCovers:
      'Patterns in how you relate to other people — and to yourself — that have felt persistent and have caused difficulty. These patterns are often misunderstood and over-pathologized. They are real, they have evidence-based treatments, and what they respond to is specific training rather than general therapy.',
    clinicianType:
      'A therapist trained in DBT (dialectical behavior therapy), schema therapy, mentalization-based therapy, or transference-focused psychotherapy. The training matters more than the modality name — what you want is someone who has spent real time studying these patterns rather than treating them as ordinary anxiety or depression.',
    organizations: [
      {
        name: 'NAMI (National Alliance on Mental Illness)',
        url: 'https://www.nami.org',
        description:
          'General mental health support, education, and a helpline at 1-800-950-6264.',
      },
      {
        name: 'NEABPD (National Education Alliance for Borderline Personality Disorder)',
        url: 'https://www.borderlinepersonalitydisorder.org',
        description:
          'If the pattern you recognize lines up with what is sometimes called borderline. Their Family Connections program is a free resource for loved ones, and their site has clinician-finder support.',
      },
    ],
  },
};

export function getDifferentCareCategory(id: string): DifferentCareCategory | undefined {
  return DIFFERENT_CARE[id];
}

export function getAllDifferentCareCategories(): DifferentCareCategory[] {
  return Object.values(DIFFERENT_CARE);
}
