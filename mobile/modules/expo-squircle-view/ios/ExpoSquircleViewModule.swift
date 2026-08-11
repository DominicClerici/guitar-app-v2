import ExpoModulesCore

public class ExpoSquircleViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoSquircleView")

    View(ExpoSquircleView.self) {
      Prop("squircleFillColor") { (view: ExpoSquircleView, color: UIColor) in
        view.setFillColor(color)
      }
      Prop("squircleStrokeColor") { (view: ExpoSquircleView, color: UIColor) in
        view.setStrokeColor(color)
      }
      Prop("squircleStrokeWidth") { (view: ExpoSquircleView, width: Double) in
        view.setStrokeWidth(CGFloat(width))
      }
      Prop("squircleSmoothing") { (view: ExpoSquircleView, smoothing: Double) in
        view.cornerSmoothing = CGFloat(smoothing)
      }
      Prop("squircleRadiusTopLeft") { (view: ExpoSquircleView, radius: Double) in
        view.radii.topLeft = CGFloat(radius)
      }
      Prop("squircleRadiusTopRight") { (view: ExpoSquircleView, radius: Double) in
        view.radii.topRight = CGFloat(radius)
      }
      Prop("squircleRadiusBottomRight") { (view: ExpoSquircleView, radius: Double) in
        view.radii.bottomRight = CGFloat(radius)
      }
      Prop("squircleRadiusBottomLeft") { (view: ExpoSquircleView, radius: Double) in
        view.radii.bottomLeft = CGFloat(radius)
      }
    }
  }
}
