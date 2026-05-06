export function haptic(pattern: number | number[] = 10) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors
    }
  }
}

export const HAPTIC_PATTERNS = {
  light: 10,
  medium: 20,
  heavy: [30, 50, 30],
  snap: [10, 30, 20],
  wave: [10, 20, 10, 20, 10]
};
