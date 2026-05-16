export type Resource = {
  type: 'book' | 'community';
  title: string;
  author?: string;
  url?: string;
  note?: string;
};

export type PathResources = {
  pathId: string;
  books: Resource[];
  communities: Resource[];
  clinicalGuidance: string;
};
