import { vi } from 'vitest'

/** Simula a opção "reduzir movimento" do iPhone (ou a ausência dela). */
export function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia
}

export function clearMatchMedia() {
  // @ts-expect-error jsdom não define matchMedia; voltamos ao estado original
  delete window.matchMedia
}
