import {useMemo} from 'react';
import {LayoutGroup, motion} from 'motion/react';
import {ArrowDown, ArrowLeftRight, Check} from 'lucide-react';
import {AlgorithmId, SortItem, SortStep} from '../types/sorting';
import {BLOCK_STYLES, BlockVisualStyle} from '../utils/palette';

interface SortingStageProps {
  algorithm: AlgorithmId;
  step: SortStep;
}

function getBlockStyle(item: SortItem): BlockVisualStyle {
  return BLOCK_STYLES[item.paletteIndex % BLOCK_STYLES.length];
}

export function SortingStage({algorithm, step}: SortingStageProps) {
  const totalCount = step.items.length;
  const compactMode = totalCount > 10;

  const getBarHeight = (item: SortItem) => {
    const minPx = compactMode ? 48 : 56;
    const maxPx = compactMode ? 156 : 184;
    return Math.round(minPx + item.normalizedValue * (maxPx - minPx));
  };

  // Bubble Sort comparison / swap indicator centered over the active pair
  const bubbleBridge = useMemo(() => {
    if (algorithm !== 'bubble') return null;

    if (step.swappingIndices.length === 2) {
      const [aIdx, bIdx] = step.swappingIndices;
      const a = step.items[aIdx];
      const b = step.items[bIdx];
      if (!a || !b) return null;
      return {aIdx, bIdx, isSwap: true, text: `Swap ${b.label} & ${a.label}`};
    }

    if (step.comparingIndices.length === 2) {
      const [aIdx, bIdx] = step.comparingIndices;
      const a = step.items[aIdx];
      const b = step.items[bIdx];
      if (!a || !b) return null;
      const symbol = a.sortKey > b.sortKey ? '>' : a.sortKey < b.sortKey ? '<' : '=';
      return {aIdx, bIdx, isSwap: false, text: `${a.label} ${symbol} ${b.label}`};
    }

    return null;
  }, [algorithm, step]);

  const sortedSet = useMemo(() => new Set(step.sortedIndices), [step.sortedIndices]);

  const stageTint =
    algorithm === 'bubble'
      ? 'bg-gradient-to-b from-[#FFFEFA] via-[#FFFDF8] to-[#FFF4EC]/85'
      : algorithm === 'selection'
        ? 'bg-gradient-to-b from-[#FFFEFA] via-[#FFFDF8] to-[#F3F7FF]/85'
        : 'bg-gradient-to-b from-[#FFFEFA] via-[#FFFDF8] to-[#F1FAF5]/85';

  return (
    <LayoutGroup id={`stage-${algorithm}`}>
      <div
        className={`relative w-full rounded-3xl border border-amber-900/12 ${stageTint} px-3 sm:px-8 pt-6 pb-5 shadow-[0_12px_36px_-18px_rgba(68,45,10,0.14),inset_0_1px_0_rgba(255,252,244,0.95)]`}
      >
        {step.isComplete && (
          <motion.span
            initial={{opacity: 0, scale: 0.92}}
            animate={{opacity: 1, scale: 1}}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 whitespace-nowrap mb-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            Sorted
          </motion.span>
        )}

        {/* Main visual stage */}
        <div className="relative select-none">
          {/* Insertion Sort Top Holding Rail */}
          {algorithm === 'insertion' && (
            <div className="relative h-24 sm:h-28 mb-2 flex items-end">
              <div className="w-full h-full flex items-end justify-center gap-1.5 sm:gap-3">
                {step.items.map((_, idx) => {
                  const isHoldingHere =
                    step.liftedItem !== null && step.liftedItem.gapIndex === idx;

                  return (
                    <div
                      key={`rail-${idx}`}
                      className="flex-1 min-w-[20px] max-w-[74px] flex flex-col items-center justify-end h-full relative"
                    >
                      {isHoldingHere && step.liftedItem && (
                        <motion.div
                          key={step.liftedItem.item.id}
                          layoutId={step.liftedItem.item.id}
                          transition={{
                            layout: {type: 'spring', stiffness: 220, damping: 24},
                            scale: {duration: 0.2},
                          }}
                          style={{
                            backgroundImage: getBlockStyle(step.liftedItem.item).gradient,
                            boxShadow: `${getBlockStyle(step.liftedItem.item).glow}, 0 0 22px -2px rgba(217,154,28,0.55), inset 0 1px 0 rgba(255,248,220,0.5)`,
                            height: `${Math.max(46, Math.round(getBarHeight(step.liftedItem.item) * 0.48))}px`,
                          }}
                          className={`w-full rounded-xl border-b-3 border-black/15 flex flex-col items-center justify-center font-mono font-bold text-white ring-3 ring-amber-400 ring-offset-2 ring-offset-[#FFFEFA] relative ${
                            compactMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg'
                          }`}
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-sans font-semibold text-amber-900 bg-amber-100/95 px-2 py-0.5 rounded-md shadow-2xs">
                            Picked
                          </span>
                          {step.liftedItem.item.label}
                          <ArrowDown
                            className="w-3.5 h-3.5 text-amber-700 absolute -bottom-5 left-1/2 -translate-x-1/2"
                            aria-hidden="true"
                          />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Array Row */}
          <div
            className={`relative flex items-end justify-center gap-1.5 sm:gap-3 ${
              algorithm === 'insertion' ? 'h-52 sm:h-60' : 'h-64 sm:h-76 pt-12'
            }`}
          >
            {step.items.map((item, idx) => {
              const isSorted = step.isComplete || sortedSet.has(idx);
              const isComparing = step.comparingIndices.includes(idx);
              const isSwapping = step.swappingIndices.includes(idx);
              const isShifting = step.shiftingIndex === idx;
              const isPlaced = step.placedIndex === idx;
              const isMin = algorithm === 'selection' && step.minIndex === idx;
              const isScanning = algorithm === 'selection' && step.scanIndex === idx;

              // Empty slot for Insertion Sort while card is lifted
              if (item === null) {
                return (
                  <div
                    key={`empty-slot-${idx}`}
                    className="flex-1 min-w-[20px] max-w-[74px] flex flex-col items-center justify-end h-full"
                  >
                    <div className="w-full h-16 sm:h-20 rounded-xl border-2 border-dashed border-amber-600/70 bg-amber-50/75 flex items-center justify-center text-xs font-mono font-semibold text-amber-800">
                      ?
                    </div>
                    <span className="mt-2 text-[11px] font-mono text-stone-400 tabular-nums">
                      {idx}
                    </span>
                  </div>
                );
              }

              const barHeight = getBarHeight(item);

              // Distinct physical motion per algorithm
              let yOffset = 0;
              let scaleVal = 1;
              if (!step.isComplete) {
                if (algorithm === 'bubble') {
                  if (isSwapping) {
                    // Item moved right arcs up high; item moved left dips slightly so they clearly pass each other
                    yOffset = idx === step.swappingIndices[1] ? -24 : 4;
                    scaleVal = 1.07;
                  } else if (isComparing) {
                    yOffset = -8;
                    scaleVal = 1.03;
                  }
                } else if (algorithm === 'selection') {
                  if (isSwapping) {
                    yOffset = idx === step.swappingIndices[0] ? -24 : 4;
                    scaleVal = 1.07;
                  } else if (isMin) {
                    yOffset = -10;
                    scaleVal = 1.04;
                  } else if (isScanning) {
                    yOffset = -5;
                  }
                } else if (algorithm === 'insertion') {
                  if (isPlaced) {
                    yOffset = -8;
                    scaleVal = 1.06;
                  } else if (isShifting) {
                    yOffset = -6;
                    scaleVal = 1.04;
                  } else if (isComparing) {
                    yOffset = -5;
                  }
                }
              }

              const isHighlighted =
                isComparing || isSwapping || isMin || isScanning || isShifting || isPlaced;

              return (
                <div
                  key={`slot-wrap-${idx}`}
                  className="flex-1 min-w-[20px] max-w-[74px] flex flex-col items-center justify-end h-full relative"
                >
                  {/* Selection Sort Scanning Spotlight Beam */}
                  {isScanning && (
                    <motion.div
                      layoutId="selection-spotlight"
                      transition={{type: 'spring', stiffness: 320, damping: 28}}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 bottom-6 rounded-t-2xl bg-gradient-to-b from-blue-500/16 via-blue-400/6 to-transparent border-t-2 border-blue-600"
                    >
                      <span className="block text-center -mt-5 text-[10px] sm:text-xs font-sans font-semibold text-blue-700 whitespace-nowrap">
                        Checking
                      </span>
                    </motion.div>
                  )}

                  {/* Selection Sort Current Smallest Marker (no star icon) */}
                  {isMin && !step.isComplete && !isSwapping && (
                    <motion.div
                      layoutId="selection-min-pin"
                      transition={{type: 'spring', stiffness: 320, damping: 28}}
                      className="pointer-events-none mb-2 flex flex-col items-center text-amber-800 font-semibold text-[10px] sm:text-xs whitespace-nowrap"
                    >
                      <span className="hidden sm:inline bg-amber-100 px-1.5 py-0.5 rounded-md mb-0.5">
                        Smallest
                      </span>
                      <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                    </motion.div>
                  )}

                  {/* Bubble Sort comparison/swap badge centered between neighboring pair */}
                  {bubbleBridge && bubbleBridge.aIdx === idx && (
                    <motion.div
                      key={`bridge-${step.stepNumber}`}
                      initial={{opacity: 0, y: 4, scale: 0.95}}
                      animate={{opacity: 1, y: 0, scale: 1}}
                      className={`pointer-events-none absolute top-0 left-[calc(100%+0.25rem)] sm:left-[calc(100%+0.375rem)] -translate-x-1/2 z-10 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold shadow-sm inline-flex items-center gap-1 ${
                        bubbleBridge.isSwap
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-900 text-amber-100'
                      }`}
                    >
                      {bubbleBridge.isSwap && (
                        <ArrowLeftRight className="w-3 h-3" aria-hidden="true" />
                      )}
                      {bubbleBridge.text}
                    </motion.div>
                  )}

                  {/* Actual Moving Element keyed by item.id so Framer Motion physically animates swaps & slides */}
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    animate={
                      step.isComplete
                        ? {
                            y: [0, -10, 0],
                            scale: 1,
                            transition: {
                              delay: idx * 0.045,
                              duration: 0.42,
                              ease: [0.16, 1, 0.3, 1],
                            },
                          }
                        : {
                            y: yOffset,
                            scale: scaleVal,
                          }
                    }
                    transition={{
                      layout: {type: 'spring', stiffness: 210, damping: 24},
                      y: {type: 'spring', stiffness: 260, damping: 22},
                      scale: {duration: 0.18},
                    }}
                    style={{
                      height: `${barHeight}px`,
                      backgroundImage: getBlockStyle(item).gradient,
                      boxShadow: isHighlighted
                        ? `${getBlockStyle(item).glow}, 0 0 22px -2px rgba(217,154,28,0.52), inset 0 1px 0 rgba(255,248,220,0.55)`
                        : '0 4px 12px -5px rgba(68,45,10,0.24), inset 0 1px 0 rgba(255,248,220,0.42)',
                    }}
                    aria-label={`Value ${item.label}, index ${idx}${isSorted ? ', sorted' : ''}`}
                    className={`relative w-full rounded-t-xl rounded-b-lg border-b-4 border-black/15 flex flex-col items-center justify-end pb-2 sm:pb-3 font-mono font-bold text-white ${
                      compactMode ? 'text-xs sm:text-base' : 'text-sm sm:text-xl'
                    } ${
                      isSwapping || isPlaced
                        ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-[#FFFEFA] z-10'
                        : isMin
                          ? 'ring-3 ring-amber-500 ring-offset-2 ring-offset-[#FFFEFA]'
                          : isComparing || isScanning
                            ? 'ring-3 ring-stone-900/80 ring-offset-2 ring-offset-[#FFFEFA]'
                            : isShifting
                              ? 'ring-3 ring-emerald-500 ring-offset-2 ring-offset-[#FFFEFA] z-10'
                              : ''
                    }`}
                  >
                    {isSorted && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-200/35 flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </span>
                    )}
                    <span className="leading-none">{item.label}</span>
                  </motion.div>

                  {/* Position number & sorted zone underline */}
                  <div className="mt-2 flex flex-col items-center w-full">
                    <div
                      className={`h-1 w-full rounded-full transition-colors ${
                        isSorted
                          ? algorithm === 'bubble'
                            ? 'bg-[#E03E1A]'
                            : algorithm === 'selection'
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                          : 'bg-stone-200/90'
                      }`}
                    />
                    <span className="mt-1 text-[11px] font-mono text-stone-400 tabular-nums">
                      {idx}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean Zone Legend */}
          <div className="mt-4 pt-3 border-t border-amber-900/8 flex items-center justify-end gap-4 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`w-3 h-1 rounded-full ${
                  algorithm === 'bubble'
                    ? 'bg-[#E03E1A]'
                    : algorithm === 'selection'
                      ? 'bg-blue-600'
                      : 'bg-emerald-600'
                }`}
                aria-hidden="true"
              />
              Sorted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-stone-300" aria-hidden="true" />
              Unsorted
            </span>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
