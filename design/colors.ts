export const colors = {
  light: {
    paper: '#F5EFE4',
    paperDim: '#EDE5D3',
    paperLight: '#FBF7EE',
    ink: '#1A1714',
    inkSoft: '#5C534A',
    rule: '#D9CFB8',
    accent: '#1B2845',
    crisis: '#8B3A2F',
  },
  dark: {
    paper: '#1A1714',
    paperDim: '#221E1A',
    paperLight: '#F5EFE4',
    ink: '#F5EFE4',
    inkSoft: '#D9CFB8',
    rule: '#3A332B',
    accent: '#9BB0D9',
    crisis: '#C67364',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;
