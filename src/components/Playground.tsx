import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import {AlgorithmId, DataMode, InputShape, SortItem} from '../types/sorting';
import {ALGORITHM_META, runAlgorithmSteps} from '../utils/algorithms';
import {
  DEFAULT_INPUT,
  generateRandomInput,
  parseAndValidateInput,
} from '../utils/validation';
import {SortingStage} from './SortingStage';

interface PlaygroundProps {
  algorithm: AlgorithmId;
}

const STEP_INTERVAL_MS = 920;

function getInputComplexityExplanation(
  algorithm: AlgorithmId,
  inputShape: InputShape,
  n: number,
  passes: number,
): {headline: string; detail: string} {
  if (algorithm === 'bubble') {
    if (inputShape === 'already-sorted' || inputShape === 'all-equal') {
      return {
        headline: `Your list of ${n} items is already in order.`,
        detail:
          'Bubble Sort checks the row once, sees zero swaps, and stops early — showing its best-case O(n) behavior.',
      };
    }
    if (inputShape === 'reverse-sorted') {
      return {
        headline: `Your list of ${n} items starts in reverse order.`,
        detail: `Every item has to move across the row over ${passes} passes, showing its worst-case O(n²) behavior.`,
      };
    }
    return {
      headline: `Your list of ${n} items is mixed.`,
      detail: `Bubble Sort takes ${passes} passes to move larger values toward the end — typical O(n²) work as lists grow.`,
    };
  }

  if (algorithm === 'selection') {
    if (inputShape === 'already-sorted' || inputShape === 'all-equal') {
      return {
        headline: `Your list of ${n} items is already in order.`,
        detail:
          'Even so, Selection Sort still scans the remaining items on every round to confirm the smallest one — so it always takes O(n²) checks.',
      };
    }
    if (inputShape === 'reverse-sorted') {
      return {
        headline: `Your list of ${n} items starts in reverse order.`,
        detail:
          'Selection Sort scans the remaining unsorted section on each round to find the smallest item and place it at the front, taking O(n²) checks.',
      };
    }
    return {
      headline: `Your list of ${n} items is mixed.`,
      detail:
        'Selection Sort always scans every remaining item on each round regardless of order, giving it O(n²) time across best, average, and worst cases.',
    };
  }

  // Insertion Sort
  if (inputShape === 'already-sorted' || inputShape === 'all-equal') {
    return {
      headline: `Your list of ${n} items is already in order.`,
      detail:
        'Each item is checked once and stays right where it is with zero shifting — showing its best-case O(n) behavior.',
    };
  }
  if (inputShape === 'reverse-sorted') {
    return {
      headline: `Your list of ${n} items starts in reverse order.`,
      detail:
        'Every picked item is smaller than everything before it and has to slide all the way to the front — showing its worst-case O(n²) behavior.',
    };
  }
  return {
    headline: `Your list of ${n} items is mixed.`,
    detail:
      'Some picked items slide past larger neighbors while others stay put, giving typical O(n²) work as lists grow larger.',
  };
}

export function Playground({algorithm}: PlaygroundProps) {
  const meta = ALGORITHM_META[algorithm];

  const [rawInput, setRawInput] = useState(DEFAULT_INPUT);
  const [activeItems, setActiveItems] = useState<SortItem[]>(() => {
    const res = parseAndValidateInput(DEFAULT_INPUT);
    return res.valid && res.items ? res.items : [];
  });
  const [activeMode, setActiveMode] = useState<DataMode>('number');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const listContainerRef = useRef<HTMLOListElement | null>(null);

  const runResult = useMemo(() => {
    return runAlgorithmSteps(algorithm, activeItems, activeMode);
  }, [algorithm, activeItems, activeMode]);

  const totalSteps = runResult.steps.length;
  const clampedStepIndex = Math.min(stepIndex, Math.max(0, totalSteps - 1));
  const currentStep = runResult.steps[clampedStepIndex];
  const isAtEnd = clampedStepIndex >= totalSteps - 1;
  const isInputValid = validationError === null && activeItems.length >= 2;

  const visibleSteps = useMemo(() => {
    return runResult.steps.slice(0, clampedStepIndex + 1);
  }, [runResult.steps, clampedStepIndex]);

  const inputComplexity = useMemo(() => {
    return getInputComplexityExplanation(
      algorithm,
      runResult.inputShape,
      activeItems.length,
      runResult.passesCount,
    );
  }, [algorithm, runResult.inputShape, activeItems.length, runResult.passesCount]);

  // Reset playback cleanly when switching algorithms
  useEffect(() => {
    setIsPlaying(false);
    setStepIndex(0);
  }, [algorithm]);

  // Smooth playback timer
  useEffect(() => {
    if (!isPlaying || !isInputValid) return;

    if (clampedStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
    }, STEP_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [isPlaying, isInputValid, clampedStepIndex, totalSteps]);

  // Keep the latest step scrolled smoothly into view inside the steps list
  useEffect(() => {
    const el = listContainerRef.current;
    if (el) {
      el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
    }
  }, [clampedStepIndex]);

  const handleInputChange = (value: string) => {
    setRawInput(value);
    setIsPlaying(false);
    const parsed = parseAndValidateInput(value);
    if (parsed.valid && parsed.items && parsed.mode) {
      setValidationError(null);
      setActiveItems(parsed.items);
      setActiveMode(parsed.mode);
      setStepIndex(0);
    } else {
      setValidationError(parsed.error ?? 'Check your input format.');
    }
  };

  const handleShuffle = () => {
    setIsPlaying(false);
    const randomRaw = generateRandomInput(activeMode, 7);
    setRawInput(randomRaw);
    const parsed = parseAndValidateInput(randomRaw);
    if (parsed.valid && parsed.items && parsed.mode) {
      setValidationError(null);
      setActiveItems(parsed.items);
      setActiveMode(parsed.mode);
      setStepIndex(0);
    }
  };

  const handleResetArray = () => {
    setIsPlaying(false);
    const parsed = parseAndValidateInput(rawInput);
    if (parsed.valid && parsed.items && parsed.mode) {
      setValidationError(null);
      setActiveItems(parsed.items);
      setActiveMode(parsed.mode);
    } else if (activeItems.length >= 2) {
      setRawInput(activeItems.map((it) => it.label).join(', '));
      setValidationError(null);
    }
    setStepIndex(0);
  };

  const handleStart = useCallback(() => {
    if (!isInputValid) return;
    if (isAtEnd) {
      setStepIndex(0);
    }
    setIsPlaying(true);
  }, [isInputValid, isAtEnd]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    setStepIndex(0);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8 pt-6 sm:pt-10 pb-8 space-y-6">
      {/* Algorithm Heading + Input Row */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-1 max-w-xl">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            {meta.name}
          </h1>
          <p className="text-sm sm:text-base text-stone-600">{meta.tagline}</p>
        </div>

        {/* Input & Validation Controls */}
        <div className="w-full lg:w-auto lg:min-w-[460px] space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <label htmlFor="array-input" className="sr-only">
              Enter comma-separated numbers or letters
            </label>
            <input
              id="array-input"
              type="text"
              value={rawInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Try: 8, 3, 5, 1, 9"
              aria-invalid={validationError !== null}
              aria-describedby={validationError ? 'input-validation-error' : undefined}
              className={`flex-1 rounded-xl border bg-[#FFFEFA] px-4 py-2.5 font-mono text-sm text-stone-900 placeholder:text-stone-400 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                validationError
                  ? 'border-rose-500 focus-visible:ring-rose-500'
                  : 'border-amber-900/18 focus-visible:ring-amber-700'
              }`}
            />

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleShuffle}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-amber-900/15 bg-gradient-to-b from-white to-stone-50 px-3.5 py-2.5 text-sm font-semibold text-stone-800 shadow-xs hover:from-stone-50 hover:to-stone-100 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                <Shuffle className="w-4 h-4" aria-hidden="true" />
                Shuffle
              </button>
              <button
                type="button"
                onClick={handleResetArray}
                className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-amber-900/15 bg-gradient-to-b from-white to-stone-50 px-3.5 py-2.5 text-sm font-semibold text-stone-800 shadow-xs hover:from-stone-50 hover:to-stone-100 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          {validationError && (
            <p
              id="input-validation-error"
              role="alert"
              className="flex items-start gap-1.5 text-xs sm:text-sm font-medium text-rose-600"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{validationError}</span>
            </p>
          )}
        </div>
      </section>

      {/* Main Visualization Stage */}
      {currentStep && (
        <section aria-label="Sorting visualization" className="space-y-4">
          <div className={isInputValid ? '' : 'opacity-50 pointer-events-none transition-opacity'}>
            <SortingStage algorithm={algorithm} step={currentStep} />
          </div>

          {/* Simple Three-Button Playback Controls: Start, Pause, Restart */}
          <div className="rounded-3xl border border-amber-900/12 bg-[#FFFEFA]/95 px-4 sm:px-6 py-4 shadow-[0_8px_24px_-14px_rgba(68,45,10,0.12),inset_0_1px_0_rgba(255,252,244,0.9)] flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              disabled={!isInputValid || isPlaying}
              style={
                isInputValid && !isPlaying
                  ? {
                      backgroundImage:
                        algorithm === 'bubble'
                          ? 'linear-gradient(180deg, #FF6D4A 0%, #E03E1A 100%)'
                          : algorithm === 'selection'
                            ? 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)'
                            : 'linear-gradient(180deg, #10B981 0%, #047857 100%)',
                      boxShadow:
                        algorithm === 'bubble'
                          ? '0 6px 18px -6px rgba(224,62,26,0.55), inset 0 1px 0 rgba(255,255,255,0.25)'
                          : algorithm === 'selection'
                            ? '0 6px 18px -6px rgba(29,78,216,0.5), inset 0 1px 0 rgba(255,255,255,0.25)'
                            : '0 6px 18px -6px rgba(4,120,87,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
                    }
                  : undefined
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-stone-300 hover:brightness-105 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:bg-stone-300 disabled:text-stone-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              Start
            </button>

            <button
              type="button"
              onClick={handlePause}
              disabled={!isPlaying}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
            >
              <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
              Pause
            </button>

            <button
              type="button"
              onClick={handleRestart}
              disabled={!isInputValid || (clampedStepIndex === 0 && !isPlaying)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Restart
            </button>
          </div>
        </section>
      )}

      {/* Steps List + Input-Aware Complexity Explanation */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Readable Step-by-Step Text List */}
        <div className="rounded-3xl border border-amber-900/12 bg-[#FFFEFA]/95 px-5 sm:px-6 py-5 shadow-[0_8px_24px_-14px_rgba(68,45,10,0.12),inset_0_1px_0_rgba(255,252,244,0.9)]">
          <div className="pb-3 border-b border-amber-900/8 space-y-1">
            <h2 className="font-display text-lg font-bold tracking-tight text-stone-900">
              What’s happening
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              {meta.approachSummary}
            </p>
          </div>

          <ol
            ref={listContainerRef}
            aria-live="polite"
            className="mt-3 max-h-56 overflow-y-auto pr-1 space-y-1.5"
          >
            {visibleSteps.map((s, idx) => {
              const isCurrent = idx === clampedStepIndex;
              return (
                <li
                  key={s.stepNumber}
                  className={`flex items-start gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                    isCurrent
                      ? 'bg-amber-100/75 text-stone-950 font-semibold'
                      : 'text-stone-500'
                  }`}
                >
                  {isCurrent ? (
                    <ArrowRight
                      className="w-4 h-4 text-amber-700 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                  ) : (
                    <Check
                      className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-1"
                      aria-hidden="true"
                    />
                  )}
                  <span>{s.explanation}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Input-Relevant Time & Space Complexity */}
        <div className="rounded-3xl border border-amber-900/12 bg-gradient-to-b from-[#FFFEFA] to-[#FBF3E0]/65 px-5 sm:px-6 py-5 shadow-[0_8px_24px_-14px_rgba(68,45,10,0.12),inset_0_1px_0_rgba(255,252,244,0.9)] space-y-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-stone-900 pb-3 border-b border-amber-900/8">
            Time & memory for this list
          </h2>

          {isInputValid ? (
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-stone-900">
                  {inputComplexity.headline}
                </p>
                <p className="text-stone-600 leading-relaxed">
                  {inputComplexity.detail}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-amber-900/8">
                <p className="font-semibold text-stone-900">
                  Extra memory: <span className="font-mono">{meta.complexity.space}</span>
                </p>
                <p className="text-stone-600 leading-relaxed">
                  {meta.complexity.spaceExplain}
                </p>
              </div>

              <div className="pt-2 border-t border-amber-900/8 space-y-1.5">
                <p className="text-xs font-medium text-stone-500">
                  In general (as a list of size <span className="font-mono">n</span> grows much larger):
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-700">
                  <span>
                    Best <strong className="font-mono text-stone-950">{meta.complexity.best}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Average <strong className="font-mono text-stone-950">{meta.complexity.average}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Worst <strong className="font-mono text-stone-950">{meta.complexity.worst}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Space <strong className="font-mono text-stone-950">{meta.complexity.space}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500">
              Fix the input above to see how {meta.name} handles your list.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
