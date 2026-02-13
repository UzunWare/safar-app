/**
 * Audio Cache
 * Story 3.4: Shared audio cache for preloading and playback
 *
 * Module-level cache allowing useAudioPreloader to store
 * pre-loaded sounds for useAudio to consume, achieving the
 * <500ms playback latency target (AC1).
 */

const cache = new Map<string, any>();

export function getCachedSound(url: string) {
  return cache.get(url);
}

export function setCachedSound(url: string, sound: unknown): void {
  cache.set(url, sound);
}

export function removeCachedSound(url: string): void {
  cache.delete(url);
}

export function clearCache(): void {
  cache.clear();
}
