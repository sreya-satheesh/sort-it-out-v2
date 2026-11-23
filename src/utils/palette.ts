export interface BlockVisualStyle {
  gradient: string;
  solid: string;
  glow: string;
}

export const BLOCK_STYLES: BlockVisualStyle[] = [
  {
    // Coral Rose
    gradient: 'linear-gradient(180deg, #FB7185 0%, #E11D48 100%)',
    solid: '#E11D48',
    glow: '0 6px 16px -6px rgba(225, 29, 72, 0.45)',
  },
  {
    // Warm Tangerine
    gradient: 'linear-gradient(180deg, #FB923C 0%, #EA580C 100%)',
    solid: '#EA580C',
    glow: '0 6px 16px -6px rgba(234, 88, 12, 0.45)',
  },
  {
    // Marigold Amber
    gradient: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
    solid: '#B45309',
    glow: '0 6px 16px -6px rgba(180, 83, 9, 0.42)',
  },
  {
    // Forest Emerald
    gradient: 'linear-gradient(180deg, #10B981 0%, #047857 100%)',
    solid: '#047857',
    glow: '0 6px 16px -6px rgba(4, 120, 87, 0.42)',
  },
  {
    // Ocean Sky
    gradient: 'linear-gradient(180deg, #0EA5E9 0%, #0369A1 100%)',
    solid: '#0369A1',
    glow: '0 6px 16px -6px rgba(3, 105, 161, 0.45)',
  },
  {
    // Cobalt Blue
    gradient: 'linear-gradient(180deg, #60A5FA 0%, #1D4ED8 100%)',
    solid: '#1D4ED8',
    glow: '0 6px 16px -6px rgba(29, 78, 216, 0.45)',
  },
  {
    // Royal Violet
    gradient: 'linear-gradient(180deg, #A78BFA 0%, #6D28D9 100%)',
    solid: '#6D28D9',
    glow: '0 6px 16px -6px rgba(109, 40, 217, 0.45)',
  },
  {
    // Berry Magenta
    gradient: 'linear-gradient(180deg, #F472B6 0%, #BE185D 100%)',
    solid: '#BE185D',
    glow: '0 6px 16px -6px rgba(190, 24, 93, 0.45)',
  },
];

export const VALUE_BLOCK_MAP: Record<number, BlockVisualStyle> = {
  1: BLOCK_STYLES[3], // Emerald
  2: BLOCK_STYLES[4], // Ocean Sky
  3: BLOCK_STYLES[2], // Marigold Amber
  4: BLOCK_STYLES[6], // Royal Violet
  5: BLOCK_STYLES[0], // Coral Rose
};
