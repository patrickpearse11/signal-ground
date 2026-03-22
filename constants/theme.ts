export const fonts = {
  heading: 'SpaceGrotesk_700Bold',
  mono: 'JetBrainsMono_600SemiBold',
  body: 'DMSans_400Regular',
  // legacy alias — components using fonts.editorial get Space Grotesk automatically
  editorial: 'SpaceGrotesk_700Bold',
}

export const colors = {
  background: '#0D0F14',
  surface: '#161920',
  surfaceAlt: '#1C1F2A',
  border: '#2A2D3A',

  text: {
    primary: '#F0EDE6',
    secondary: '#8A8D9B',
    accent: '#E8A838',       // amber — Signal layer primary
  },

  signal: {
    primary: '#E8A838',
    dark: '#D4782A',
  },

  ground: {
    primary: '#2DD4A8',
    dark: '#1A9E8F',
  },

  critical: '#E84C4C',
  blueMuted: '#7B8CDE',

  escalation: {
    1: '#2DD4A8',
    2: '#8BC34A',
    3: '#E8A838',
    4: '#FF5722',
    5: '#E84C4C',
  },

  perspectives: {
    balanced: '#2DD4A8',
    consensus: '#8BC34A',
    divergent: '#E8A838',
  },

  tabs: {
    active: '#F0EDE6',
    inactive: '#8A8D9B',
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 24,
}
