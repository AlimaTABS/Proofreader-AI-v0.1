export enum SegmentStatus {
  Pending = 'Pending',
  Reviewed = 'Reviewed',
  Approved = 'Approved',
  NeedsWork = 'Needs Work'
}

export enum SegmentCategory {
  Accuracy = 'Accuracy',
  Omission = 'Omission',
  Formatting = 'Formatting',
  Terminology = 'Terminology',
  Style = 'Style',
  None = 'None'
}

export interface Segment {
  id: string;
  sourceText: string;
  targetText: string;
  status: SegmentStatus;
  category: SegmentCategory;
  aiFeedback: string | null;
  wordByWord: string | null;
  isAnalyzing: boolean;
  isTranslating: boolean;
  isAnalyzingWords: boolean;
}

export type TargetLanguage = string;
