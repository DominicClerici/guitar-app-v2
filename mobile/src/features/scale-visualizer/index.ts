export { ExpandedNeck } from './ExpandedNeck';
// The pluck engine doubles as the app's generic "hear one note" voice — the
// articles feature plays through it too. If a third consumer appears, promote
// it to a shared audio module rather than exporting it from here.
export { pluck, prepare, release } from './scalePluck';
export { NeckStrip } from './NeckStrip';
export { RelatedScales } from './RelatedScales';
export { ScaleHeading } from './ScaleHeading';
export { ScaleNeck } from './ScaleNeck';
export { ScalePicker } from './ScalePicker';
export { ScaleSummary } from './ScaleSummary';
export {
    useScaleVisualizer,
    type Cell,
    type DotTone,
    type LabelMode,
    type ScaleVisualizer
} from './useScaleVisualizer';
