package expo.modules.squircleview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSquircleViewModule : Module() {
    override fun definition() = ModuleDefinition {

        Name("ExpoSquircleView")

        View(ExpoSquircleView::class) {
            Prop("squircleFillColor") { view: ExpoSquircleView, color: Int? ->
                view.setFillColor(color ?: 0x00000000)
            }
            Prop("squircleStrokeColor") { view: ExpoSquircleView, color: Int? ->
                view.setStrokeColor(color ?: 0x00000000)
            }
            Prop("squircleStrokeWidth") { view: ExpoSquircleView, width: Float ->
                view.setStrokeWidth(width)
            }
            Prop("squircleStrokeDash") { view: ExpoSquircleView, dash: List<Float> ->
                view.setStrokeDash(dash)
            }
            Prop("squircleClip") { view: ExpoSquircleView, clip: Boolean ->
                view.setClipsContent(clip)
            }
            Prop("squircleSmoothing") { view: ExpoSquircleView, smoothing: Float ->
                view.setSmoothing(smoothing)
            }
            Prop("squircleRadiusTopLeft") { view: ExpoSquircleView, radius: Float ->
                view.setRadiusTopLeft(radius)
            }
            Prop("squircleRadiusTopRight") { view: ExpoSquircleView, radius: Float ->
                view.setRadiusTopRight(radius)
            }
            Prop("squircleRadiusBottomRight") { view: ExpoSquircleView, radius: Float ->
                view.setRadiusBottomRight(radius)
            }
            Prop("squircleRadiusBottomLeft") { view: ExpoSquircleView, radius: Float ->
                view.setRadiusBottomLeft(radius)
            }
        }
    }
}
