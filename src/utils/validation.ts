import {DataMode, SortItem, ValidationResult} from '../types/sorting';

export const MAX_ITEMS = 15;
export const MIN_ITEMS = 2;

export const DEFAULT_INPUT = '8, 3, 5, 1, 9, 4';

const NUMBER_TOKEN_RE = /^-?\d+$/;
const ALPHA_TOKEN_RE = /^[a-zA-Z]$/;

/**
 * Normalizes sort keys to a 0.2..1.0 visual scale so negative numbers,
 * large multi-digit numbers, and A-Z letters all render cleanly as tactile blocks.
 */
function buildSortItems(
  rawTokens: {label: string; sortKey: number}[],
): SortItem[] {
  const keys = rawTokens.map((t) => t.sortKey);
  const minKey = Math.min(...keys);
  const maxKey = Math.max(...keys);
  const span = maxKey - minKey;

  return rawTokens.map((token, idx) => ({
    id: `item-${idx}-${token.label}-${Math.random().toString(36).slice(2, 6)}`,
    label: token.label,
    sortKey: token.sortKey,
    normalizedValue: span === 0 ? 0.65 : 0.22 + ((token.sortKey - minKey) / span) * 0.78,
    paletteIndex: idx % 8,
  }));
}

export function parseAndValidateInput(raw: string): ValidationResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: 'Enter some numbers or letters separated by commas to begin.',
    };
  }

  if (trimmed.startsWith(',') || trimmed.endsWith(',')) {
    return {
      valid: false,
      error: 'Remove the extra comma at the start or end.',
    };
  }

  const rawParts = trimmed.split(',');
  const parts: string[] = [];

  for (const part of rawParts) {
    const clean = part.trim();
    if (!clean) {
      return {
        valid: false,
        error: 'There is an empty spot between commas — make sure every comma separates two values.',
      };
    }
    parts.push(clean);
  }

  if (parts.length < MIN_ITEMS) {
    return {
      valid: false,
      error: 'Add at least 2 comma-separated values so there is something to sort.',
    };
  }

  if (parts.length > MAX_ITEMS) {
    return {
      valid: false,
      error: `Keep it to ${MAX_ITEMS} values or fewer so every block stays clear and readable.`,
    };
  }

  let detectedMode: DataMode | null = null;
  const parsedTokens: {label: string; sortKey: number}[] = [];

  for (const token of parts) {
    if (/\s/.test(token)) {
      return {
        valid: false,
        error: `Separate "${token}" with a comma instead of a space.`,
      };
    }

    const isNum = NUMBER_TOKEN_RE.test(token);
    const isAlpha = ALPHA_TOKEN_RE.test(token);

    if (!isNum && !isAlpha) {
      if (/^[a-zA-Z]{2,}$/.test(token)) {
        return {
          valid: false,
          error: `"${token}" has multiple letters — use single letters like A, B, C separated by commas.`,
        };
      }
      return {
        valid: false,
        error: `"${token}" isn't valid — enter whole numbers or single letters (A–Z).`,
      };
    }

    const tokenMode: DataMode = isNum ? 'number' : 'alpha';

    if (detectedMode === null) {
      detectedMode = tokenMode;
    } else if (detectedMode !== tokenMode) {
      return {
        valid: false,
        error: 'Use either all numbers or all letters in one list — not a mix of both.',
      };
    }

    if (tokenMode === 'number') {
      const numeric = Number(token);
      if (!Number.isSafeInteger(numeric) || Math.abs(numeric) > 9999) {
        return {
          valid: false,
          error: `"${token}" is too large — stick to whole numbers between -9999 and 9999.`,
        };
      }
      parsedTokens.push({
        label: String(numeric),
        sortKey: numeric,
      });
    } else {
      const upper = token.toUpperCase();
      parsedTokens.push({
        label: token,
        sortKey: upper.charCodeAt(0),
      });
    }
  }

  return {
    valid: true,
    mode: detectedMode ?? 'number',
    items: buildSortItems(parsedTokens),
  };
}

export function generateRandomInput(mode: DataMode = 'number', count = 7): string {
  const safeCount = Math.max(5, Math.min(MAX_ITEMS, count));

  if (mode === 'alpha') {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    // Pick a varied set of letters
    const picked: string[] = [];
    while (picked.length < safeCount) {
      const candidate = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!picked.includes(candidate) || picked.length > 10) {
        picked.push(candidate);
      }
    }
    // Ensure it isn't already sorted
    const sortedCheck = [...picked].sort((a, b) => a.localeCompare(b)).join(',');
    if (picked.join(',') === sortedCheck) {
      picked.reverse();
    }
    return picked.join(', ');
  }

  const numbers: number[] = [];
  while (numbers.length < safeCount) {
    const candidate = Math.floor(Math.random() * 24) + 1;
    if (!numbers.includes(candidate) || numbers.length > 10) {
      numbers.push(candidate);
    }
  }

  const sortedCheck = [...numbers].sort((a, b) => a - b).join(',');
  if (numbers.join(',') === sortedCheck) {
    numbers.reverse();
  }

  return numbers.join(', ');
}
