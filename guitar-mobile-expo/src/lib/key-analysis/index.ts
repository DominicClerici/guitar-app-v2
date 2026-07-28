// Public API for the key-analysis engine. Pure music theory — no React, no UI.
// Pipeline:
//
//   accepted ChordResult (from @/lib/chord-analysis)
//     → extractFeature      (rootPc, triad/seventh quality, sounding pitch classes)
//     → ProgressionChord[]  (assembled by the caller; up to 12)
//     → estimateKey         (ranks all 24 keys, best first, with a status)
//     → romanLabelsFor      (one numeral per chord, against any chosen candidate)
//
// estimateKey and romanLabelsFor are independent: relabelling against a
// user-picked runner-up does not re-run estimation.

export { estimateKey } from './estimate';
export { extractFeature, qualityOf } from './extract';
export { romanLabelsFor } from './roman';
export type {
  ChordFeature,
  KeyCandidate,
  KeyEstimate,
  KeyStatus,
  Mode,
  ProgressionChord,
  Quality,
  RomanLabel,
  SeventhQuality,
  TriadQuality,
} from './types';
