// Public API for the scale engine. Pure music theory — no React, no UI.
// Sits downstream of key-analysis the way key-analysis sits downstream of
// chord-analysis:
//
//   ProgressionChord[] + KeyCandidate (the displayed key)
//     → scalePlanFor    (global scale, pentatonic verdict, exception spans)
//
// The plan never re-estimates the key: it reads the candidate's assignment for
// each chord's reading, so relabelling against a runner-up key re-plans the
// scales to match. The scale dictionary is scale-library's catalogue — this
// module adds no scales of its own.

export { scalePlanFor } from './analyze';
export type { ExceptionSpan, NoteDelta, PentatonicVerdict, ScalePlan, ScaleTone } from './types';
