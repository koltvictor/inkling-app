/**
 * Guided soft triage — six button-driven questions for users who don't
 * have words for what's been going on. After Q5, selected answers are
 * synthesized into a natural-language description and handed to the
 * existing /classify endpoint, which returns recommendations, outOfScope,
 * or crisis. Q6 either proceeds to that synthesis or routes the user to
 * the free-text routing screen if they want to say more.
 *
 * The "synthesized" field on each answer is what gets fed to classify.
 * "null" means the answer contributes no signal (the user passed or
 * picked the floor option). If all five signal questions return null,
 * the screen falls back to the free-text routing screen rather than
 * synthesizing an empty string.
 */

export type Answer = {
  buttonLabel: string;
  synthesized: string | null;
  action?: 'route-to-routing';
};

export type Question = {
  id: string;
  questionText: string;
  answers: Answer[];
};

export type Selection = {
  questionId: string;
  synthesized: string | null;
};

export const QUESTIONS: Question[] = [
  {
    id: 'mood',
    questionText: 'How have things been feeling lately?',
    answers: [
      { buttonLabel: 'Mostly okay', synthesized: null },
      { buttonLabel: 'Up and down', synthesized: 'Lately things have felt up and down.' },
      { buttonLabel: 'Heavy — like the color has drained out of things', synthesized: 'Lately things have felt heavy, like the color has drained out of things.' },
      { buttonLabel: "I've been struggling, and it's been a while", synthesized: "I've been struggling for a while now." },
      { buttonLabel: "I'm not sure how to say", synthesized: null },
    ],
  },
  {
    id: 'tension',
    questionText: 'How would you describe the tension you have been carrying — in your body, in your mind?',
    answers: [
      { buttonLabel: 'Not much', synthesized: null },
      { buttonLabel: 'It comes and goes', synthesized: 'There is some tension that comes and goes.' },
      { buttonLabel: 'I feel braced a lot of the time', synthesized: 'I feel braced a lot of the time.' },
      { buttonLabel: "My mind won't quiet, and the tension shows up in my body too", synthesized: "My mind won't quiet, and the tension shows up in my body too." },
      { buttonLabel: "I'm not sure", synthesized: null },
    ],
  },
  {
    id: 'intrusion',
    questionText: 'Is there something — recent or further back — that you keep returning to in your mind?',
    answers: [
      { buttonLabel: 'No, not really', synthesized: null },
      { buttonLabel: 'Sometimes things come up', synthesized: 'Sometimes things come up that I find myself returning to.' },
      { buttonLabel: 'Yes, something specific keeps coming back', synthesized: 'There is something specific that keeps coming back into my mind.' },
      { buttonLabel: 'Yes, and it shows up in my body or my dreams', synthesized: 'Something keeps coming back, and it shows up in my body or my dreams.' },
      { buttonLabel: "I'm not sure", synthesized: null },
    ],
  },
  {
    id: 'focus',
    questionText: 'How does focusing on things you need to do tend to go?',
    answers: [
      { buttonLabel: 'Mostly fine', synthesized: null },
      { buttonLabel: 'It depends on the day', synthesized: 'My focus depends on the day.' },
      { buttonLabel: 'I have a hard time finishing things, even ones I care about', synthesized: 'I have a hard time finishing things, even ones I care about.' },
      { buttonLabel: 'This has been a pattern for as long as I can remember', synthesized: 'I have had trouble finishing things for as long as I can remember — it is a pattern.' },
      { buttonLabel: "I'm not sure", synthesized: null },
    ],
  },
  {
    id: 'social',
    questionText: 'Do social situations or busy environments take more out of you than they seem to take out of others?',
    answers: [
      { buttonLabel: 'No, not really', synthesized: null },
      { buttonLabel: 'Sometimes, depending on the setting', synthesized: 'Sometimes social situations or busy environments take a lot out of me, depending on the setting.' },
      { buttonLabel: 'Often — I need recovery time after', synthesized: 'Social and busy environments take more out of me than they seem to take out of others, and I need recovery time after.' },
      { buttonLabel: 'This has always been true, for as long as I can remember', synthesized: 'Social and busy environments have always taken a lot out of me, for as long as I can remember.' },
      { buttonLabel: "I'm not sure", synthesized: null },
    ],
  },
  {
    id: 'other',
    questionText: 'Anything else going on that has not fit what I have asked?',
    answers: [
      { buttonLabel: 'No, that covered it', synthesized: null },
      { buttonLabel: 'Yes, but it is hard to put into words', synthesized: null, action: 'route-to-routing' },
      { buttonLabel: 'Yes, and I would like to say more', synthesized: null, action: 'route-to-routing' },
    ],
  },
];

export function synthesize(selections: Array<Selection | null>): string {
  return selections
    .filter((s): s is Selection => s !== null && s.synthesized !== null && s.synthesized.trim().length > 0)
    .map((s) => s.synthesized)
    .join(' ');
}
