# Issues & Debugging Log

## Issue-001: Web Audio in Node.js Test Environment
- **Symptom**: `ReferenceError: Audio is not defined` occurred when running Vitest test suite on `AudioEngine.test.ts`.
- **Root Cause**: `AudioEngine` singleton instantiated `new Audio()` at module load time. Vitest's default environment is Node.js, where `window.Audio` is not defined globally.
- **Failed Attempts**: Adding mock inside test file after import failed because the singleton instance executed immediately on import.
- **Solution**: Added environment guard in `AudioEngine` constructor:
  ```ts
  if (typeof Audio !== 'undefined') {
    this.audioElement = new Audio()
    // ...
  } else {
    this.audioElement = { ...mock methods... } as unknown as HTMLAudioElement
  }
  ```
- **Verification**: `npx vitest run` passed all 15 tests.

---

## Issue-002: TypeScript 6 verbatimModuleSyntax Enforcement
- **Symptom**: `tsc -b` compilation failed with multiple `TS1484: ... is a type and must be imported using a type-only import`.
- **Root Cause**: Modern Vite + TypeScript template enables `verbatimModuleSyntax: true` and `noUnusedLocals: true`.
- **Solution**: Refactored all type imports to use `import type { ... }` and removed unused icon imports across view and layout components.
- **Verification**: `npm run build` completed with code 0 and generated clean production bundles.

---

## Issue-003: All-Glass Low Contrast & UI Visual Overload Refactor
- **Symptom**: Prior design implemented full-window translucent glass (`LiquidGlassContainer` on outer frame, sidebar, cards, and tables). Floating directly above the dynamic canvas backdrop caused low readability, visual clutter, and made "liquid glass" lose its visual focus.
- **Root Cause**: Lack of solid physical grounding (实体背景). When every container is glass, contrast between foreground text and moving backgrounds degrades.
- **Solution**:
  1. Built physical solid surface system (`solid-window`, `solid-panel`, `solid-card`, `solid-dock`) with high-contrast, deep obsidian/graphite textures and subtle 1px specular edges.
  2. Implemented dedicated `LiquidButton` component focused on interactive controls (playback orb, skip buttons, nav tabs, library mount pill, search bar, equalizer toggles, favorite buttons).
  3. Replaced all flat buttons with `LiquidButton` featuring dynamic mouse glint, specular rim highlights, and surface tension over solid dark panels.
- **Verification**: TDD test suite `liquidButtonStyles.test.ts` created and passing; all 23 tests pass; TypeScript `tsc -b` and Vite production build passed with code 0; Oxlint reported 0 errors and 0 warnings.
