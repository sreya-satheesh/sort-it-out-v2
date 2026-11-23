import {
  AlgorithmId,
  AlgorithmRunResult,
  DataMode,
  InputShape,
  SortItem,
  SortStep,
} from '../types/sorting';

export interface AlgorithmMeta {
  id: AlgorithmId;
  name: string;
  tagline: string;
  approachSummary: string;
  accentHex: string;
  complexity: {
    best: string;
    bestDetail: string;
    average: string;
    worst: string;
    space: string;
    spaceExplain: string;
  };
}

export const ALGORITHM_META: Record<AlgorithmId, AlgorithmMeta> = {
  bubble: {
    id: 'bubble',
    name: 'Bubble Sort',
    tagline: "Compares two neighbors at a time and swaps them if they're out of order.",
    approachSummary:
      'Compares neighbors side by side and swaps them whenever the left item is larger, pushing bigger values to the end.',
    accentHex: '#E03E1A',
    complexity: {
      best: 'O(n)',
      bestDetail: 'if the list is already sorted and stops after one pass',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      spaceExplain:
        'Sorts directly inside the same row, needing only one tiny temporary spot while swapping two neighbors.',
    },
  },
  selection: {
    id: 'selection',
    name: 'Selection Sort',
    tagline: 'Finds the smallest item left and moves it to the front.',
    approachSummary:
      'Scans the remaining unsorted items to find the smallest one, then moves it to the front.',
    accentHex: '#1D4ED8',
    complexity: {
      best: 'O(n²)',
      bestDetail: 'even if already sorted, it still scans the rest to be sure',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      spaceExplain:
        'Sorts directly inside the same row, tracking only the position of the smallest item before swapping.',
    },
  },
  insertion: {
    id: 'insertion',
    name: 'Insertion Sort',
    tagline: 'Picks one item at a time and slides it into the right spot.',
    approachSummary:
      'Picks up one item at a time, slides larger sorted items right to make room, and drops it into place.',
    accentHex: '#047857',
    complexity: {
      best: 'O(n)',
      bestDetail: 'if the list is already sorted and nothing needs to slide',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      spaceExplain:
        'Sorts directly inside the same row, holding only one picked item aside while others slide right.',
    },
  },
};

export function classifyInputShape(items: SortItem[]): InputShape {
  if (items.length <= 1) return 'already-sorted';

  let nonDecreasing = true;
  let nonIncreasing = true;
  let allEqual = true;

  for (let i = 1; i < items.length; i++) {
    if (items[i].sortKey !== items[0].sortKey) {
      allEqual = false;
    }
    if (items[i].sortKey < items[i - 1].sortKey) {
      nonDecreasing = false;
    }
    if (items[i].sortKey > items[i - 1].sortKey) {
      nonIncreasing = false;
    }
  }

  if (allEqual) return 'all-equal';
  if (nonDecreasing) return 'already-sorted';
  if (nonIncreasing) return 'reverse-sorted';
  return 'mixed';
}

export function generateBubbleSortSteps(
  initialItems: SortItem[],
  mode: DataMode,
): AlgorithmRunResult {
  const arr = initialItems.slice();
  const n = arr.length;
  const steps: SortStep[] = [];
  const sortedIndices: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  let passesCount = 0;
  let stepNum = 0;

  const pushStep = (partial: Omit<SortStep, 'stepNumber'>) => {
    steps.push({
      ...partial,
      stepNumber: stepNum++,
    });
  };

  pushStep({
    items: arr.slice(),
    liftedItem: null,
    comparingIndices: [],
    swappingIndices: [],
    shiftingIndex: null,
    placedIndex: null,
    minIndex: null,
    scanIndex: null,
    sortedIndices: [],
    explanation: 'Ready to start the first pass from the left.',
    comparisons: 0,
    actions: 0,
    isComplete: false,
  });

  for (let i = 0; i < n - 1; i++) {
    passesCount++;
    let swappedInPass = false;

    for (let j = 0; j < n - 1 - i; j++) {
      const left = arr[j];
      const right = arr[j + 1];
      comparisons++;

      pushStep({
        items: arr.slice(),
        liftedItem: null,
        comparingIndices: [j, j + 1],
        swappingIndices: [],
        shiftingIndex: null,
        placedIndex: null,
        minIndex: null,
        scanIndex: null,
        sortedIndices: sortedIndices.slice(),
        explanation: `Compare ${left.label} and ${right.label}.`,
        comparisons,
        actions: swaps,
        isComplete: false,
      });

      if (left.sortKey > right.sortKey) {
        arr[j] = right;
        arr[j + 1] = left;
        swaps++;
        swappedInPass = true;

        const swapText =
          mode === 'alpha'
            ? `Swap ${left.label} and ${right.label} (${left.label} goes after ${right.label}).`
            : `Swap ${left.label} and ${right.label} (${left.label} is bigger).`;

        pushStep({
          items: arr.slice(),
          liftedItem: null,
          comparingIndices: [],
          swappingIndices: [j, j + 1],
          shiftingIndex: null,
          placedIndex: null,
          minIndex: null,
          scanIndex: null,
          sortedIndices: sortedIndices.slice(),
          explanation: swapText,
          comparisons,
          actions: swaps,
          isComplete: false,
        });
      } else {
        pushStep({
          items: arr.slice(),
          liftedItem: null,
          comparingIndices: [j, j + 1],
          swappingIndices: [],
          shiftingIndex: null,
          placedIndex: null,
          minIndex: null,
          scanIndex: null,
          sortedIndices: sortedIndices.slice(),
          explanation: `${left.label} and ${right.label} are already in order.`,
          comparisons,
          actions: swaps,
          isComplete: false,
        });
      }
    }

    if (!swappedInPass) {
      const allSorted = Array.from({length: n}, (_, idx) => idx);
      pushStep({
        items: arr.slice(),
        liftedItem: null,
        comparingIndices: [],
        swappingIndices: [],
        shiftingIndex: null,
        placedIndex: null,
        minIndex: null,
        scanIndex: null,
        sortedIndices: allSorted,
        explanation: 'No swaps happened in this pass — everything is sorted!',
        comparisons,
        actions: swaps,
        isComplete: true,
      });

      return {
        steps,
        inputShape: classifyInputShape(initialItems),
        totalComparisons: comparisons,
        totalActions: swaps,
        passesCount,
      };
    }

    const lockedIdx = n - 1 - i;
    sortedIndices.unshift(lockedIdx);

    if (i < n - 2) {
      pushStep({
        items: arr.slice(),
        liftedItem: null,
        comparingIndices: [],
        swappingIndices: [],
        shiftingIndex: null,
        placedIndex: lockedIdx,
        minIndex: null,
        scanIndex: null,
        sortedIndices: sortedIndices.slice(),
        explanation: `${arr[lockedIdx].label} reached its final spot at the end.`,
        comparisons,
        actions: swaps,
        isComplete: false,
      });
    }
  }

  const allSorted = Array.from({length: n}, (_, idx) => idx);
  pushStep({
    items: arr.slice(),
    liftedItem: null,
    comparingIndices: [],
    swappingIndices: [],
    shiftingIndex: null,
    placedIndex: null,
    minIndex: null,
    scanIndex: null,
    sortedIndices: allSorted,
    explanation: 'All done — every item is in order!',
    comparisons,
    actions: swaps,
    isComplete: true,
  });

  return {
    steps,
    inputShape: classifyInputShape(initialItems),
    totalComparisons: comparisons,
    totalActions: swaps,
    passesCount,
  };
}

export function generateSelectionSortSteps(
  initialItems: SortItem[],
): AlgorithmRunResult {
  const arr = initialItems.slice();
  const n = arr.length;
  const steps: SortStep[] = [];
  const sortedIndices: number[] = [];
  let comparisons = 0;
  let swaps = 0;
  let passesCount = 0;
  let stepNum = 0;

  const pushStep = (partial: Omit<SortStep, 'stepNumber'>) => {
    steps.push({
      ...partial,
      stepNumber: stepNum++,
    });
  };

  pushStep({
    items: arr.slice(),
    liftedItem: null,
    comparingIndices: [],
    swappingIndices: [],
    shiftingIndex: null,
    placedIndex: null,
    minIndex: null,
    scanIndex: null,
    sortedIndices: [],
    explanation: 'Ready to find the smallest item and move it to the front.',
    comparisons: 0,
    actions: 0,
    isComplete: false,
  });

  for (let i = 0; i < n - 1; i++) {
    passesCount++;
    let minIdx = i;

    pushStep({
      items: arr.slice(),
      liftedItem: null,
      comparingIndices: [],
      swappingIndices: [],
      shiftingIndex: null,
      placedIndex: null,
      minIndex: minIdx,
      scanIndex: i,
      sortedIndices: sortedIndices.slice(),
      explanation: `Start with ${arr[minIdx].label} as the smallest so far.`,
      comparisons,
      actions: swaps,
      isComplete: false,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const candidate = arr[j];
      const currentMin = arr[minIdx];

      pushStep({
        items: arr.slice(),
        liftedItem: null,
        comparingIndices: [minIdx, j],
        swappingIndices: [],
        shiftingIndex: null,
        placedIndex: null,
        minIndex: minIdx,
        scanIndex: j,
        sortedIndices: sortedIndices.slice(),
        explanation: `Check ${candidate.label} against ${currentMin.label}.`,
        comparisons,
        actions: swaps,
        isComplete: false,
      });

      if (candidate.sortKey < currentMin.sortKey) {
        minIdx = j;
        pushStep({
          items: arr.slice(),
          liftedItem: null,
          comparingIndices: [],
          swappingIndices: [],
          shiftingIndex: null,
          placedIndex: null,
          minIndex: minIdx,
          scanIndex: j,
          sortedIndices: sortedIndices.slice(),
          explanation: `${arr[minIdx].label} is smaller — mark it as the new smallest.`,
          comparisons,
          actions: swaps,
          isComplete: false,
        });
      }
    }

    if (minIdx !== i) {
      const smallest = arr[minIdx];
      const displaced = arr[i];

      arr[i] = smallest;
      arr[minIdx] = displaced;
      swaps++;
      sortedIndices.push(i);

      pushStep({
        items: arr.slice(),
        liftedItem: null,
        comparingIndices: [],
        swappingIndices: [i, minIdx],
        shiftingIndex: null,
        placedIndex: i,
        minIndex: i,
        scanIndex: null,
        sortedIndices: sortedIndices.slice(),
        explanation: `Move smallest (${smallest.label}) to index ${i}.`,
        comparisons,
        actions: swaps,
        isComplete: false,
      });
    } else {
      sortedIndices.push(i);
      pushStep({
        items: arr.slice(),
        liftedItem: null,
        comparingIndices: [],
        swappingIndices: [],
        shiftingIndex: null,
        placedIndex: i,
        minIndex: i,
        scanIndex: null,
        sortedIndices: sortedIndices.slice(),
        explanation: `${arr[i].label} is already the smallest — keep it at index ${i}.`,
        comparisons,
        actions: swaps,
        isComplete: false,
      });
    }
  }

  const allSorted = Array.from({length: n}, (_, idx) => idx);
  pushStep({
    items: arr.slice(),
    liftedItem: null,
    comparingIndices: [],
    swappingIndices: [],
    shiftingIndex: null,
    placedIndex: null,
    minIndex: null,
    scanIndex: null,
    sortedIndices: allSorted,
    explanation: 'All done — every item is in order!',
    comparisons,
    actions: swaps,
    isComplete: true,
  });

  return {
    steps,
    inputShape: classifyInputShape(initialItems),
    totalComparisons: comparisons,
    totalActions: swaps,
    passesCount,
  };
}

export function generateInsertionSortSteps(
  initialItems: SortItem[],
): AlgorithmRunResult {
  const arr: (SortItem | null)[] = initialItems.slice();
  const n = arr.length;
  const steps: SortStep[] = [];
  let comparisons = 0;
  let shifts = 0;
  let passesCount = 0;
  let stepNum = 0;

  const pushStep = (partial: Omit<SortStep, 'stepNumber'>) => {
    steps.push({
      ...partial,
      stepNumber: stepNum++,
    });
  };

  pushStep({
    items: arr.slice(),
    liftedItem: null,
    comparingIndices: [],
    swappingIndices: [],
    shiftingIndex: null,
    placedIndex: null,
    minIndex: null,
    scanIndex: null,
    sortedIndices: [0],
    explanation: `${(arr[0] as SortItem).label} starts the sorted group on the left.`,
    comparisons: 0,
    actions: 0,
    isComplete: false,
  });

  for (let i = 1; i < n; i++) {
    passesCount++;
    const picked = arr[i] as SortItem;
    arr[i] = null;
    const currentSorted = Array.from({length: i}, (_, idx) => idx);

    pushStep({
      items: arr.slice(),
      liftedItem: {item: picked, gapIndex: i, phase: 'picked'},
      comparingIndices: [],
      swappingIndices: [],
      shiftingIndex: null,
      placedIndex: null,
      minIndex: null,
      scanIndex: null,
      sortedIndices: currentSorted,
      explanation: `Pick up ${picked.label} to find where it belongs.`,
      comparisons,
      actions: shifts,
      isComplete: false,
    });

    let j = i - 1;
    let movedAny = false;

    while (j >= 0) {
      const leftItem = arr[j] as SortItem;
      comparisons++;

      pushStep({
        items: arr.slice(),
        liftedItem: {item: picked, gapIndex: j + 1, phase: 'comparing'},
        comparingIndices: [j],
        swappingIndices: [],
        shiftingIndex: null,
        placedIndex: null,
        minIndex: null,
        scanIndex: null,
        sortedIndices: currentSorted,
        explanation: `Compare ${picked.label} with ${leftItem.label}.`,
        comparisons,
        actions: shifts,
        isComplete: false,
      });

      if (leftItem.sortKey > picked.sortKey) {
        arr[j + 1] = leftItem;
        arr[j] = null;
        shifts++;
        movedAny = true;

        pushStep({
          items: arr.slice(),
          liftedItem: {item: picked, gapIndex: j, phase: 'comparing'},
          comparingIndices: [],
          swappingIndices: [],
          shiftingIndex: j + 1,
          placedIndex: null,
          minIndex: null,
          scanIndex: null,
          sortedIndices: Array.from({length: i + 1}, (_, idx) => idx).filter(
            (idx) => idx !== j,
          ),
          explanation: `Slide ${leftItem.label} right to make room.`,
          comparisons,
          actions: shifts,
          isComplete: false,
        });

        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = picked;
    const expandedSorted = Array.from({length: i + 1}, (_, idx) => idx);

    pushStep({
      items: arr.slice(),
      liftedItem: null,
      comparingIndices: [],
      swappingIndices: [],
      shiftingIndex: null,
      placedIndex: j + 1,
      minIndex: null,
      scanIndex: null,
      sortedIndices: expandedSorted,
      explanation: movedAny
        ? `Slide ${picked.label} into index ${j + 1}.`
        : `${picked.label} stays at index ${j + 1}.`,
      comparisons,
      actions: shifts,
      isComplete: false,
    });
  }

  const allSorted = Array.from({length: n}, (_, idx) => idx);
  pushStep({
    items: arr.slice(),
    liftedItem: null,
    comparingIndices: [],
    swappingIndices: [],
    shiftingIndex: null,
    placedIndex: null,
    minIndex: null,
    scanIndex: null,
    sortedIndices: allSorted,
    explanation: 'All done — every item is in order!',
    comparisons,
    actions: shifts,
    isComplete: true,
  });

  return {
    steps,
    inputShape: classifyInputShape(initialItems),
    totalComparisons: comparisons,
    totalActions: shifts,
    passesCount,
  };
}

export function runAlgorithmSteps(
  algorithm: AlgorithmId,
  items: SortItem[],
  mode: DataMode,
): AlgorithmRunResult {
  switch (algorithm) {
    case 'bubble':
      return generateBubbleSortSteps(items, mode);
    case 'selection':
      return generateSelectionSortSteps(items);
    case 'insertion':
      return generateInsertionSortSteps(items);
  }
}
