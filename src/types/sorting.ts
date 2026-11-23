export type AlgorithmId = 'bubble' | 'selection' | 'insertion';

export type DataMode = 'number' | 'alpha';

export type InputShape = 'already-sorted' | 'reverse-sorted' | 'all-equal' | 'mixed';

export interface SortItem {
  id: string;
  label: string;
  sortKey: number;
  /** Normalized 0..1 visual height/size factor within the current array */
  normalizedValue: number;
  /** Playful consistent palette index assigned from initial array */
  paletteIndex: number;
}

export interface LiftedCardState {
  item: SortItem;
  /** Current horizontal slot index where the empty gap sits */
  gapIndex: number;
  phase: 'picked' | 'comparing' | 'inserting';
}

export interface SortStep {
  items: (SortItem | null)[];
  liftedItem: LiftedCardState | null;
  comparingIndices: number[];
  swappingIndices: number[];
  shiftingIndex: number | null;
  placedIndex: number | null;
  minIndex: number | null;
  scanIndex: number | null;
  sortedIndices: number[];
  explanation: string;
  comparisons: number;
  actions: number;
  isComplete: boolean;
  stepNumber: number;
}

export interface AlgorithmRunResult {
  steps: SortStep[];
  inputShape: InputShape;
  totalComparisons: number;
  totalActions: number;
  passesCount: number;
}

export interface ValidationResult {
  valid: boolean;
  mode?: DataMode;
  items?: SortItem[];
  error?: string;
}
