/**
 * Ameliyat Öncesi AR — Design Token: Colors
 * Dark medical palette — güven, netlik, teknoloji
 */
const Colors = {
  // Backgrounds
  bgPrimary: '#0D1B2A',     // derin lacivert — ana arka plan
  bgSurface: '#162032',     // kart yüzeyleri
  bgElevated: '#1E2D42',    // modal / elevated panel

  // Brand
  brandBlue: '#1976D2',     // medikal mavi
  brandBlueDark: '#0D47A1',
  brandTeal: '#00897B',     // ikincil aksan

  // Semantics
  success: '#43A047',
  successLight: '#1B5E20',
  warning: '#FB8C00',
  warningLight: '#E65100',
  danger: '#E53935',
  dangerLight: '#B71C1C',
  info: '#039BE5',

  // AR Overlays
  arGreen: '#00E676',       // izinli — parlak yeşil
  arRed: '#FF1744',         // yasak — parlak kırmızı
  arBlue: '#40C4FF',        // nötr bilgi rengi
  arYellow: '#FFEA00',      // dikkat uyarısı

  // Text
  textPrimary: '#F0F4F8',
  textSecondary: '#90A4AE',
  textDisabled: '#546E7A',
  textOnBrand: '#FFFFFF',

  // Border / Divider
  border: '#253447',
  divider: '#1E2D42',

  // Glassmorphism overlay
  glassWhite: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
} as const;

export type ColorKey = keyof typeof Colors;
export default Colors;
