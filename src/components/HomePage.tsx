import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {ArrowDown, ArrowRight, Check} from 'lucide-react';
import {AlgorithmId} from '../types/sorting';
import {VALUE_BLOCK_MAP} from '../utils/palette';

interface HomePageProps {
  onSelectAlgorithm: (id: AlgorithmId) => void;
}

interface PreviewStep {
  durationMs: number;
  caption: string;
  isComplete?: boolean;
}

function useCyclePlayer<T extends PreviewStep>(steps: T[]) {
  const [index, setIndex] = useState(0);
  const [cycleId, setCycleId] = useState(0);

  useEffect(() => {
    const current = steps[index];
    const timer = window.setTimeout(() => {
      if (index + 1 >= steps.length) {
        setCycleId((c) => c + 1);
        setIndex(0);
      } else {
        setIndex(index + 1);
      }
    }, current.durationMs);

    return () => window.clearTimeout(timer);
  }, [index, steps]);

  return {step: steps[index], cycleId};
}

/* -------------------------------------------------------------------------- */
/* Bubble Sort Preview: [4, 1, 5, 2, 3] -> [1, 2, 3, 4, 5]                   */
/* -------------------------------------------------------------------------- */
interface BubblePreviewStep extends PreviewStep {
  order: number[];
  compare: [number, number] | null;
  swapped: boolean;
  locked: number[];
}

const BUBBLE_STEPS: BubblePreviewStep[] = [
  {order: [4, 1, 5, 2, 3], compare: null, swapped: false, locked: [], durationMs: 950, caption: 'Start unsorted: 4, 1, 5, 2, 3'},
  {order: [4, 1, 5, 2, 3], compare: [0, 1], swapped: false, locked: [], durationMs: 800, caption: 'Compare 4 and 1'},
  {order: [1, 4, 5, 2, 3], compare: [0, 1], swapped: true, locked: [], durationMs: 900, caption: '4 > 1, swap them!'},
  {order: [1, 4, 5, 2, 3], compare: [1, 2], swapped: false, locked: [], durationMs: 800, caption: 'Compare 4 and 5 — in order'},
  {order: [1, 4, 5, 2, 3], compare: [2, 3], swapped: false, locked: [], durationMs: 750, caption: 'Compare 5 and 2'},
  {order: [1, 4, 2, 5, 3], compare: [2, 3], swapped: true, locked: [], durationMs: 900, caption: '5 > 2, swap them!'},
  {order: [1, 4, 2, 5, 3], compare: [3, 4], swapped: false, locked: [], durationMs: 750, caption: 'Compare 5 and 3'},
  {order: [1, 4, 2, 3, 5], compare: [3, 4], swapped: true, locked: [4], durationMs: 950, caption: '5 reaches the end!'},
  {order: [1, 4, 2, 3, 5], compare: [0, 1], swapped: false, locked: [4], durationMs: 750, caption: 'Compare 1 and 4 — in order'},
  {order: [1, 4, 2, 3, 5], compare: [1, 2], swapped: false, locked: [4], durationMs: 750, caption: 'Compare 4 and 2'},
  {order: [1, 2, 4, 3, 5], compare: [1, 2], swapped: true, locked: [4], durationMs: 900, caption: '4 > 2, swap them!'},
  {order: [1, 2, 4, 3, 5], compare: [2, 3], swapped: false, locked: [4], durationMs: 750, caption: 'Compare 4 and 3'},
  {order: [1, 2, 3, 4, 5], compare: [2, 3], swapped: true, locked: [3, 4], durationMs: 950, caption: '4 settles into place!'},
  {order: [1, 2, 3, 4, 5], compare: [0, 1], swapped: false, locked: [3, 4], durationMs: 750, caption: 'Check 1 and 2 — in order'},
  {order: [1, 2, 3, 4, 5], compare: [1, 2], swapped: false, locked: [3, 4], durationMs: 750, caption: 'Check 2 and 3 — in order'},
  {order: [1, 2, 3, 4, 5], compare: null, swapped: false, locked: [0, 1, 2, 3, 4], isComplete: true, durationMs: 2600, caption: 'Sorted! 1, 2, 3, 4, 5'},
];

function BubblePreview() {
  const {step, cycleId} = useCyclePlayer(BUBBLE_STEPS);

  return (
    <div className="relative flex flex-col items-center justify-end h-42 w-full px-4 pb-3.5 pt-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={cycleId}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.25}}
          className="flex items-end justify-center gap-2.5 h-24"
        >
          {step.order.map((val, idx) => {
            const isPair =
              step.compare !== null && (step.compare[0] === idx || step.compare[1] === idx);
            const isLocked = step.locked.includes(idx);
            const style = VALUE_BLOCK_MAP[val];

            return (
              <motion.div
                key={`${cycleId}-${val}`}
                layout
                transition={{type: 'spring', stiffness: 360, damping: 26}}
                animate={
                  step.isComplete
                    ? {y: [0, -7, 0], transition: {delay: idx * 0.05, duration: 0.35}}
                    : {y: isPair ? (step.swapped ? -10 : -6) : 0}
                }
                style={{
                  height: `${28 + val * 11}px`,
                  backgroundImage: style.gradient,
                  boxShadow: isPair
                    ? `${style.glow}, 0 0 16px -2px rgba(217,154,28,0.45), inset 0 1px 0 rgba(255,248,220,0.48)`
                    : '0 3px 10px -3px rgba(68,45,10,0.22), inset 0 1px 0 rgba(255,248,220,0.42)',
                }}
                className={`relative w-9 rounded-t-xl rounded-b-md border-b-3 border-black/15 flex items-end justify-center pb-1.5 font-mono text-xs font-bold text-white ${
                  isPair ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#FFFEFA]' : ''
                }`}
              >
                {isLocked && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-200/35 flex items-center justify-center"
                  >
                    <Check className="w-2 h-2 text-white stroke-[3]" />
                  </span>
                )}
                {val}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
      <span
        className={`mt-3 text-xs font-medium inline-flex items-center gap-1 ${
          step.isComplete ? 'text-amber-800 font-semibold' : 'text-stone-600'
        }`}
      >
        {step.caption}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Selection Sort Preview: [4, 2, 5, 1, 3] -> [1, 2, 3, 4, 5]                */
/* -------------------------------------------------------------------------- */
interface SelectionPreviewStep extends PreviewStep {
  order: number[];
  scan: number | null;
  minVal: number | null;
  lockedCount: number;
}

const SELECTION_STEPS: SelectionPreviewStep[] = [
  {order: [4, 2, 5, 1, 3], scan: null, minVal: null, lockedCount: 0, durationMs: 950, caption: 'Start unsorted: 4, 2, 5, 1, 3'},
  {order: [4, 2, 5, 1, 3], scan: 0, minVal: 4, lockedCount: 0, durationMs: 700, caption: 'Start with 4 as smallest'},
  {order: [4, 2, 5, 1, 3], scan: 1, minVal: 2, lockedCount: 0, durationMs: 700, caption: '2 is smaller!'},
  {order: [4, 2, 5, 1, 3], scan: 2, minVal: 2, lockedCount: 0, durationMs: 650, caption: 'Scan 5 — keep 2'},
  {order: [4, 2, 5, 1, 3], scan: 3, minVal: 1, lockedCount: 0, durationMs: 750, caption: '1 is smallest!'},
  {order: [4, 2, 5, 1, 3], scan: 4, minVal: 1, lockedCount: 0, durationMs: 650, caption: 'Scan 3 — 1 is smallest'},
  {order: [1, 2, 5, 4, 3], scan: null, minVal: null, lockedCount: 1, durationMs: 950, caption: 'Move 1 to the front'},
  {order: [1, 2, 5, 4, 3], scan: 1, minVal: 2, lockedCount: 1, durationMs: 700, caption: 'Search from 2'},
  {order: [1, 2, 5, 4, 3], scan: 3, minVal: 2, lockedCount: 1, durationMs: 650, caption: 'Nothing smaller than 2'},
  {order: [1, 2, 5, 4, 3], scan: null, minVal: null, lockedCount: 2, durationMs: 850, caption: '2 stays in place'},
  {order: [1, 2, 5, 4, 3], scan: 2, minVal: 5, lockedCount: 2, durationMs: 650, caption: 'Start with 5'},
  {order: [1, 2, 5, 4, 3], scan: 3, minVal: 4, lockedCount: 2, durationMs: 650, caption: '4 is smaller'},
  {order: [1, 2, 5, 4, 3], scan: 4, minVal: 3, lockedCount: 2, durationMs: 750, caption: '3 is smallest!'},
  {order: [1, 2, 3, 4, 5], scan: null, minVal: null, lockedCount: 3, durationMs: 950, caption: 'Move 3 into index 2'},
  {order: [1, 2, 3, 4, 5], scan: 4, minVal: 4, lockedCount: 3, durationMs: 750, caption: '4 < 5 — already in order'},
  {order: [1, 2, 3, 4, 5], scan: null, minVal: null, lockedCount: 5, isComplete: true, durationMs: 2600, caption: 'Sorted! 1, 2, 3, 4, 5'},
];

function SelectionPreview() {
  const {step, cycleId} = useCyclePlayer(SELECTION_STEPS);

  return (
    <div className="relative flex flex-col items-center justify-end h-42 w-full px-4 pb-3.5 pt-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={cycleId}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.25}}
          className="flex items-end justify-center gap-2.5 h-24"
        >
          {step.order.map((val, idx) => {
            const isScanning = step.scan === idx;
            const isMin = step.minVal === val;
            const isLocked = idx < step.lockedCount;
            const style = VALUE_BLOCK_MAP[val];

            return (
              <motion.div
                key={`${cycleId}-${val}`}
                layout
                transition={{type: 'spring', stiffness: 350, damping: 26}}
                animate={
                  step.isComplete
                    ? {y: [0, -7, 0], transition: {delay: idx * 0.05, duration: 0.35}}
                    : {y: isMin ? -6 : 0}
                }
                style={{
                  height: `${28 + val * 11}px`,
                  backgroundImage: style.gradient,
                  boxShadow:
                    isScanning || isMin
                      ? `${style.glow}, 0 0 16px -2px rgba(217,154,28,0.45), inset 0 1px 0 rgba(255,248,220,0.48)`
                      : '0 3px 10px -3px rgba(68,45,10,0.22), inset 0 1px 0 rgba(255,248,220,0.42)',
                }}
                className={`relative w-9 rounded-t-xl rounded-b-md border-b-3 border-black/15 flex items-end justify-center pb-1.5 font-mono text-xs font-bold text-white ${
                  isScanning ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#FFFEFA]' : ''
                }`}
              >
                {isMin && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-700"
                  >
                    <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                )}
                {isLocked && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-200/35 flex items-center justify-center"
                  >
                    <Check className="w-2 h-2 text-white stroke-[3]" />
                  </span>
                )}
                {val}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
      <span
        className={`mt-3 text-xs font-medium ${
          step.isComplete ? 'text-amber-800 font-semibold' : 'text-stone-600'
        }`}
      >
        {step.caption}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Insertion Sort Preview: [3, 5, 2, 4, 1] -> [1, 2, 3, 4, 5]                */
/* -------------------------------------------------------------------------- */
interface InsertionPreviewStep extends PreviewStep {
  slots: (number | null)[];
  lifted: {val: number; col: number} | null;
  sortedCount: number;
}

const INSERTION_STEPS: InsertionPreviewStep[] = [
  {slots: [3, 5, 2, 4, 1], lifted: null, sortedCount: 1, durationMs: 950, caption: 'Start: 3 is our sorted hand'},
  {slots: [3, null, 2, 4, 1], lifted: {val: 5, col: 1}, sortedCount: 1, durationMs: 750, caption: 'Pick 5 — already > 3'},
  {slots: [3, 5, 2, 4, 1], lifted: null, sortedCount: 2, durationMs: 800, caption: 'Sorted hand: 3, 5'},
  {slots: [3, 5, null, 4, 1], lifted: {val: 2, col: 2}, sortedCount: 2, durationMs: 750, caption: 'Pick the next card: 2'},
  {slots: [3, null, 5, 4, 1], lifted: {val: 2, col: 1}, sortedCount: 2, durationMs: 750, caption: 'Slide 5 right'},
  {slots: [null, 3, 5, 4, 1], lifted: {val: 2, col: 0}, sortedCount: 2, durationMs: 750, caption: 'Slide 3 right'},
  {slots: [2, 3, 5, 4, 1], lifted: null, sortedCount: 3, durationMs: 850, caption: 'Drop 2 into place!'},
  {slots: [2, 3, 5, null, 1], lifted: {val: 4, col: 3}, sortedCount: 3, durationMs: 750, caption: 'Pick the next card: 4'},
  {slots: [2, 3, null, 5, 1], lifted: {val: 4, col: 2}, sortedCount: 3, durationMs: 750, caption: 'Slide 5 right'},
  {slots: [2, 3, 4, 5, 1], lifted: null, sortedCount: 4, durationMs: 850, caption: 'Drop 4 between 3 and 5!'},
  {slots: [2, 3, 4, 5, null], lifted: {val: 1, col: 4}, sortedCount: 4, durationMs: 750, caption: 'Pick the last card: 1'},
  {slots: [2, 3, 4, null, 5], lifted: {val: 1, col: 3}, sortedCount: 4, durationMs: 650, caption: 'Slide 5 right'},
  {slots: [2, 3, null, 4, 5], lifted: {val: 1, col: 2}, sortedCount: 4, durationMs: 650, caption: 'Slide 4 right'},
  {slots: [2, null, 3, 4, 5], lifted: {val: 1, col: 1}, sortedCount: 4, durationMs: 650, caption: 'Slide 3 right'},
  {slots: [null, 2, 3, 4, 5], lifted: {val: 1, col: 0}, sortedCount: 4, durationMs: 650, caption: 'Slide 2 right'},
  {slots: [1, 2, 3, 4, 5], lifted: null, sortedCount: 5, isComplete: true, durationMs: 2600, caption: 'Sorted! 1, 2, 3, 4, 5'},
];

function InsertionPreview() {
  const {step, cycleId} = useCyclePlayer(INSERTION_STEPS);

  return (
    <div className="relative flex flex-col items-center justify-end h-42 w-full px-4 pb-3.5 pt-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={cycleId}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.25}}
          className="relative flex items-end justify-center gap-2.5 h-24"
        >
          {step.slots.map((val, idx) => {
            if (val === null) {
              return (
                <div
                  key={`gap-${idx}`}
                  className="w-9 h-11 rounded-xl border-2 border-dashed border-amber-500/80 bg-amber-50/70"
                />
              );
            }

            const isSorted = idx < step.sortedCount;
            const style = VALUE_BLOCK_MAP[val];

            return (
              <motion.div
                key={`${cycleId}-${val}`}
                layoutId={`preview-ins-${cycleId}-${val}`}
                transition={{type: 'spring', stiffness: 350, damping: 26}}
                animate={
                  step.isComplete
                    ? {y: [0, -7, 0], transition: {delay: idx * 0.05, duration: 0.35}}
                    : {y: 0}
                }
                style={{
                  height: `${26 + val * 9}px`,
                  backgroundImage: style.gradient,
                  boxShadow:
                    '0 3px 10px -3px rgba(68,45,10,0.22), inset 0 1px 0 rgba(255,248,220,0.42)',
                }}
                className="relative w-9 rounded-t-xl rounded-b-md border-b-3 border-black/15 flex items-end justify-center pb-1.5 font-mono text-xs font-bold text-white"
              >
                {isSorted && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-200/35 flex items-center justify-center"
                  >
                    <Check className="w-2 h-2 text-white stroke-[3]" />
                  </span>
                )}
                {val}
              </motion.div>
            );
          })}

          {step.lifted && (
            <motion.div
              key={`${cycleId}-${step.lifted.val}`}
              layoutId={`preview-ins-${cycleId}-${step.lifted.val}`}
              transition={{type: 'spring', stiffness: 350, damping: 25}}
              style={{
                left: `calc(${step.lifted.col} * (2.25rem + 0.625rem))`,
                height: `${24 + step.lifted.val * 8}px`,
                backgroundImage: VALUE_BLOCK_MAP[step.lifted.val].gradient,
                boxShadow: `${VALUE_BLOCK_MAP[step.lifted.val].glow}, 0 0 18px -2px rgba(217,154,28,0.5), inset 0 1px 0 rgba(255,248,220,0.5)`,
              }}
              className="absolute -top-2 w-9 rounded-xl flex items-end justify-center pb-1.5 font-mono text-xs font-bold text-white ring-2 ring-amber-400"
            >
              {step.lifted.val}
              <ArrowDown
                className="w-3 h-3 text-amber-600 absolute -bottom-3.5 left-1/2 -translate-x-1/2"
                aria-hidden="true"
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <span
        className={`mt-3 text-xs font-medium ${
          step.isComplete ? 'text-amber-800 font-semibold' : 'text-stone-600'
        }`}
      >
        {step.caption}
      </span>
    </div>
  );
}

const ALGORITHM_CARDS: {
  id: AlgorithmId;
  title: string;
  cardSurface: string;
  wellGradient: string;
  accentColor: string;
  preview: () => React.JSX.Element;
}[] = [
  {
    id: 'bubble',
    title: 'Bubble Sort',
    cardSurface:
      'bg-gradient-to-b from-[#FFF9F2] to-[#FDECE3]/85 hover:border-amber-600/45 hover:shadow-[0_14px_34px_-14px_rgba(217,119,6,0.28)]',
    wellGradient:
      'bg-gradient-to-b from-[#FFFEFA] to-[#FFF6EE]/75 border-amber-900/12',
    accentColor: '#C2410C',
    preview: BubblePreview,
  },
  {
    id: 'selection',
    title: 'Selection Sort',
    cardSurface:
      'bg-gradient-to-b from-[#F9FAFF] to-[#EBF1FE]/85 hover:border-amber-600/45 hover:shadow-[0_14px_34px_-14px_rgba(37,99,235,0.24)]',
    wellGradient:
      'bg-gradient-to-b from-[#FFFEFA] to-[#F3F6FE]/75 border-amber-900/12',
    accentColor: '#1D4ED8',
    preview: SelectionPreview,
  },
  {
    id: 'insertion',
    title: 'Insertion Sort',
    cardSurface:
      'bg-gradient-to-b from-[#F8FCF9] to-[#E7F6EE]/85 hover:border-amber-600/45 hover:shadow-[0_14px_34px_-14px_rgba(5,150,105,0.24)]',
    wellGradient:
      'bg-gradient-to-b from-[#FFFEFA] to-[#F1FAF5]/75 border-amber-900/12',
    accentColor: '#047857',
    preview: InsertionPreview,
  },
];

export function HomePage({onSelectAlgorithm}: HomePageProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8 pt-10 sm:pt-16 pb-8">
      <section className="relative max-w-3xl py-2 sm:py-4">
        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 text-balance leading-[1.06]">
          Watch numbers{' '}
          <span className="bg-gradient-to-r from-[#B45309] via-[#E11D48] to-[#1D4ED8] bg-clip-text text-transparent">
            find their place.
          </span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl font-medium text-stone-600 text-balance leading-relaxed">
          Choose an algorithm and see how it works.
        </p>
      </section>

      <section
        aria-label="Choose a sorting algorithm"
        className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7"
      >
        {ALGORITHM_CARDS.map(
          ({id, title, cardSurface, wellGradient, accentColor, preview: Preview}) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectAlgorithm(id)}
              className={`group text-left rounded-3xl border border-amber-900/12 ${cardSurface} p-6 shadow-[0_8px_24px_-14px_rgba(68,45,10,0.14),inset_0_1px_0_rgba(255,252,244,0.85)] transition-all duration-200 hover:-translate-y-1.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900">
                  {title}
                </h2>
                <span
                  style={{color: accentColor}}
                  className="inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  Explore
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>

              <div
                className={`mt-5 rounded-2xl border ${wellGradient} shadow-[inset_0_1px_2px_rgba(68,45,10,0.04)] overflow-hidden`}
              >
                <Preview />
              </div>
            </button>
          ),
        )}
      </section>
    </main>
  );
}
