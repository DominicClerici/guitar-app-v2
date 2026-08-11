import ExpoModulesCore
import UIKit

/**
 A squircle painted on a shape layer. The view carries no content of its own — it
 is stretched behind whatever it is meant to be the background of, so the fill
 and the stroke land on the native layer rather than on a measured SVG.

 The stroke is inset by half its width, the way a CSS border sits inside the box,
 so a bordered squircle occupies exactly the frame it was given.
 */
class ExpoSquircleView: ExpoView {
  private let shape = CAShapeLayer()

  var radii = SquircleRadii() { didSet { setNeedsLayout() } }
  var cornerSmoothing: CGFloat = 0 { didSet { setNeedsLayout() } }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    shape.fillColor = UIColor.clear.cgColor
    shape.strokeColor = UIColor.clear.cgColor
    layer.addSublayer(shape)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    super.layoutSubviews()

    // Implicit animations would trail the shape behind a resize by a quarter
    // second, which reads as the background lagging its own view.
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    shape.frame = bounds
    shape.path = squirclePath()
    CATransaction.commit()
  }

  private func squirclePath() -> CGPath {
    let inset = shape.lineWidth / 2
    let path = SquirclePath.create(
      width: bounds.width - shape.lineWidth,
      height: bounds.height - shape.lineWidth,
      radii: inset > 0 ? radii.inset(by: inset) : radii,
      smoothing: cornerSmoothing
    )

    var shift = CGAffineTransform(translationX: inset, y: inset)
    return path.copy(using: &shift) ?? path
  }

  func setFillColor(_ color: UIColor) {
    withoutAnimation { shape.fillColor = color.cgColor }
  }

  func setStrokeColor(_ color: UIColor) {
    withoutAnimation { shape.strokeColor = color.cgColor }
  }

  func setStrokeWidth(_ width: CGFloat) {
    withoutAnimation { shape.lineWidth = width }
    setNeedsLayout()
  }

  private func withoutAnimation(_ body: () -> Void) {
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    body()
    CATransaction.commit()
  }
}

private extension SquircleRadii {
  /// The centreline of a stroke runs half a width inside each corner's arc.
  func inset(by amount: CGFloat) -> SquircleRadii {
    SquircleRadii(
      topLeft: max(0, topLeft - amount),
      topRight: max(0, topRight - amount),
      bottomRight: max(0, bottomRight - amount),
      bottomLeft: max(0, bottomLeft - amount)
    )
  }
}
