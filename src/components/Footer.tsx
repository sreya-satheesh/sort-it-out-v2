import {useState} from 'react';
import {motion} from 'motion/react';
import {ArrowUpRight} from 'lucide-react';
import {VALUE_BLOCK_MAP} from '../utils/palette';

const SORTED_SEQUENCE = [
  {val: 1, height: 18},
  {val: 2, height: 24},
  {val: 3, height: 30},
  {val: 4, height: 36},
  {val: 5, height: 42},
];

const SCRAMBLED_ORDER = [3, 0, 4, 1, 2];

export function Footer() {
  const [scrambled, setScrambled] = useState(false);

  const displayed = scrambled
    ? SCRAMBLED_ORDER.map((idx) => SORTED_SEQUENCE[idx])
    : SORTED_SEQUENCE;

  const triggerPlayfulSort = () => {
    setScrambled(true);
    window.setTimeout(() => {
      setScrambled(false);
    }, 520);
  };

  return (
    <footer className="border-t border-amber-900/10 bg-gradient-to-b from-[#F3EBD8]/75 to-[#EAE0C8]/90 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="space-y-2.5 max-w-md">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl font-bold tracking-tight text-stone-900">
                Sort It Out!
              </span>
            </div>
            <p className="text-sm sm:text-base text-stone-700 font-medium">
              Let the sorting begin.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-stone-500 pt-1">
              <span>© 2026</span>
              <span aria-hidden="true">·</span>
              <span>Made by Sreya Satheesh</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-10">
            {/* Playful miniature sorted sequence */}
            <button
              type="button"
              onClick={triggerPlayfulSort}
              onMouseEnter={() => {
                if (!scrambled) triggerPlayfulSort();
              }}
              aria-label="Replay miniature sorted sequence"
              className="group flex flex-col items-start sm:items-end gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 rounded-xl p-1.5"
            >
              <div className="flex items-end gap-1.5 h-11">
                {displayed.map((block) => {
                  const style = VALUE_BLOCK_MAP[block.val];
                  return (
                    <motion.div
                      key={block.val}
                      layout
                      transition={{type: 'spring', stiffness: 420, damping: 28}}
                      style={{
                        height: `${block.height}px`,
                        backgroundImage: style.gradient,
                        boxShadow:
                          '0 3px 8px -3px rgba(68,45,10,0.28), inset 0 1px 0 rgba(255,248,220,0.45)',
                      }}
                      className="w-6 rounded-t-lg rounded-b-sm border-b-2 border-black/15 flex items-end justify-center pb-1 text-[11px] font-mono font-semibold text-white"
                    >
                      {block.val}
                    </motion.div>
                  );
                })}
              </div>
              <span className="text-xs text-stone-500 group-hover:text-stone-800 transition-colors">
                {scrambled ? 'Finding order…' : '1, 2, 3, 4, 5 · click to scramble'}
              </span>
            </button>

            <div className="flex items-center gap-5 text-sm font-medium text-stone-700">
              <a
                href="https://github.com/sreya-satheesh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-stone-950 underline decoration-amber-800/30 underline-offset-4 hover:decoration-amber-700 transition-colors whitespace-nowrap shrink-0"
              >
                GitHub
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href="https://dev.to/sreya-satheesh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-stone-950 underline decoration-amber-800/30 underline-offset-4 hover:decoration-amber-700 transition-colors whitespace-nowrap shrink-0"
              >
                DEV.to
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
