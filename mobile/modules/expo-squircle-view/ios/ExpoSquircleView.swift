import ExpoModulesCore
import UIKit

/**
 A squircle painted on shape layers. The view normally carries no content of its
 own — it is stretched behind whatever it is meant to be the background of, so
 the fill and the stroke land on native layers rather than on a measured SVG.

 With `clipsContent` it becomes a container instead: children lay out inside it
 and are masked to the shape, which is the only way to give a corner that has to
 clip — a scroller, an image, a row of ticks — the same curve as its neighbours.

 The stroke is inset by half its width, the way a CSS border sits inside the box,
 so a bordered squircle occupies exactly the frame it was given.
 */
class ExpoSquircleView: ExpoView {
  private let fill = CAShapeLayer()
  private let stroke = CAShapeLayer()
  private let clip = CAShapeLayer()

  var radii = SquircleRadii() { didSet { setNeedsLayout() } }
  var cornerSmoothing: CGFloat = 0 { didSet { setNeedsLayout() } }
  var clipsContent = false { didSet { setNeedsLayout() } }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    for shape in [fill, stroke] {
      shape.fillColor = UIColor.clear.cgColor
      shape.strokeColor = UIColor.clear.cgColor
      layer.addSublayer(shape)
    }
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    super.layoutSubviews()

    // Implicit animations would trail the shape behind a resize by a quarter
    // second, which reads as the background lagging its own view.
    withoutAnimation {
      let outline = path(inset: 0)

      fill.frame = bounds
      fill.path = outline

      stroke.frame = bounds
      stroke.path = stroke.lineWidth > 0 ? path(inset: stroke.lineWidth / 2) : outline

      clip.frame = bounds
      clip.path = outline
      layer.mask = clipsContent ? clip : nil
    }

    raiseStroke()
  }

  /// A child arrives as a subview, so its layer lands above the ones added here.
  override func didAddSubview(_ subview: UIView) {
    super.didAddSubview(subview)
    raiseStroke()
  }

  /// The hairline belongs over whatever the view is clipping, not under it.
  private func raiseStroke() {
    guard clipsContent, layer.sublayers?.last !== stroke else { return }
    withoutAnimation { layer.addSublayer(stroke) }
  }

  private func path(inset: CGFloat) -> CGPath {
    let shape = SquirclePath.create(
      width: bounds.width - inset * 2,
      height: bounds.height - inset * 2,
      radii: inset > 0 ? radii.inset(by: inset) : radii,
      smoothing: cornerSmoothing
    )

    guard inset > 0 else { return shape }

    var shift = CGAffineTransform(translationX: inset, y: inset)
    return shape.copy(using: &shift) ?? shape
  }

  func setFillColor(_ color: UIColor) {
    withoutAnimation { fill.fillColor = color.cgColor }
  }

  func setStrokeColor(_ color: UIColor) {
    withoutAnimation { stroke.strokeColor = color.cgColor }
  }

  /// Lengths of the drawn and undrawn runs, or nothing at all for a solid line.
  func setStrokeDash(_ pattern: [CGFloat]) {
    withoutAnimation {
      stroke.lineDashPattern = pattern.isEmpty ? nil : pattern.map { NSNumber(value: Double($0)) }
    }
  }

  func setStrokeWidth(_ width: CGFloat) {
    withoutAnimation { stroke.lineWidth = width }
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
