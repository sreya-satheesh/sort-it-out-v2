import {AlgorithmId} from '../types/sorting';

interface NavbarProps {
  activeView: 'home' | AlgorithmId;
  onSelectView: (view: 'home' | AlgorithmId) => void;
}

const NAV_ITEMS: {id: 'home' | AlgorithmId; label: string}[] = [
  {id: 'home', label: 'Home'},
  {id: 'bubble', label: 'Bubble Sort'},
  {id: 'selection', label: 'Selection Sort'},
  {id: 'insertion', label: 'Insertion Sort'},
];

export function Navbar({activeView, onSelectView}: NavbarProps) {
  return (
    <header className="w-full border-b border-amber-900/10 bg-[#F9F4E8]/85 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_14px_-4px_rgba(120,82,20,0.08)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8 h-14 sm:h-16">
        <button
          type="button"
          onClick={() => onSelectView('home')}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 rounded-lg px-1.5 py-0.5 transition-opacity hover:opacity-85"
        >
          Sort It Out!
        </button>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 rounded-sm ${
                  isActive
                    ? 'text-stone-950 font-semibold'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile compact single-row algorithm switcher */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-between gap-2 px-4 pb-2.5 overflow-x-auto text-xs font-medium text-stone-600"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-stone-900 text-amber-50 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
