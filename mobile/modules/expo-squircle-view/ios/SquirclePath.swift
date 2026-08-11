import CoreGraphics
import Foundation

/**
 The rounded rectangle Apple draws — the native twin of `src/lib/squircle.ts`,
 which carries the full explanation of the shape. Both are the piecewise cubic
 fit Figma reverse-engineered in "Desperately seeking squircles": each corner is
 a Bézier ramping curvature up, a circular arc of reduced sweep through the apex,
 and a mirrored Bézier ramping it back down.

 `smoothing` runs 0…1 — the same scale the TypeScript uses, not the 0…100 the
 npm package took — so the two implementations can be handed the same number and
 draw the same curve.
 */
struct SquircleRadii {
  var topLeft: CGFloat = 0
  var topRight: CGFloat = 0
  var bottomRight: CGFloat = 0
  var bottomLeft: CGFloat = 0
}

enum SquirclePath {
  /// One corner's Bézier fit. Control-point offsets are from figure 11.1 of the article.
  private struct Corner {
    let a: CGFloat
    let b: CGFloat
    let c: CGFloat
    let d: CGFloat
    /// How far back along each edge the corner reaches.
    let p: CGFloat
    /// The chord of the shortened arc, on both axes.
    let arc: CGFloat
    let radius: CGFloat
  }

  static func create(
    width: CGFloat,
    height: CGFloat,
    radii: SquircleRadii,
    smoothing: CGFloat
  ) -> CGPath {
    let path = CGMutablePath()
    guard width > 0, height > 0 else { return path }

    // Every corner spends out of the same edge length, so they share a budget.
    let budget = min(width, height) / 2
    let topLeft = corner(radii.topLeft, smoothing, budget)
    let topRight = corner(radii.topRight, smoothing, budget)
    let bottomRight = corner(radii.bottomRight, smoothing, budget)
    let bottomLeft = corner(radii.bottomLeft, smoothing, budget)

    // Opening at the top-right corner's reach; the top edge is what `close` draws.
    path.move(to: CGPoint(x: width - topRight.p, y: 0))

    if topRight.radius > 0 {
      curve(path, topRight.a, 0, topRight.a + topRight.b, 0, topRight.a + topRight.b + topRight.c, topRight.d)
      arc(path, topRight.radius, topRight.arc, topRight.arc)
      curve(path, topRight.d, topRight.c, topRight.d, topRight.b + topRight.c, topRight.d, topRight.a + topRight.b + topRight.c)
    }

    path.addLine(to: CGPoint(x: width, y: height - bottomRight.p))

    if bottomRight.radius > 0 {
      curve(path, 0, bottomRight.a, 0, bottomRight.a + bottomRight.b, -bottomRight.d, bottomRight.a + bottomRight.b + bottomRight.c)
      arc(path, bottomRight.radius, -bottomRight.arc, bottomRight.arc)
      curve(path, -bottomRight.c, bottomRight.d, -(bottomRight.b + bottomRight.c), bottomRight.d, -(bottomRight.a + bottomRight.b + bottomRight.c), bottomRight.d)
    }

    path.addLine(to: CGPoint(x: bottomLeft.p, y: height))

    if bottomLeft.radius > 0 {
      curve(path, -bottomLeft.a, 0, -(bottomLeft.a + bottomLeft.b), 0, -(bottomLeft.a + bottomLeft.b + bottomLeft.c), -bottomLeft.d)
      arc(path, bottomLeft.radius, -bottomLeft.arc, -bottomLeft.arc)
      curve(path, -bottomLeft.d, -bottomLeft.c, -bottomLeft.d, -(bottomLeft.b + bottomLeft.c), -bottomLeft.d, -(bottomLeft.a + bottomLeft.b + bottomLeft.c))
    }

    path.addLine(to: CGPoint(x: 0, y: topLeft.p))

    if topLeft.radius > 0 {
      curve(path, 0, -topLeft.a, 0, -(topLeft.a + topLeft.b), topLeft.d, -(topLeft.a + topLeft.b + topLeft.c))
      arc(path, topLeft.radius, topLeft.arc, -topLeft.arc)
      curve(path, topLeft.c, -topLeft.d, topLeft.b + topLeft.c, -topLeft.d, topLeft.a + topLeft.b + topLeft.c, -topLeft.d)
    }

    path.closeSubpath()
    return path
  }

  private static func corner(_ radius: CGFloat, _ smoothing: CGFloat, _ budget: CGFloat) -> Corner {
    let r = min(max(radius, 0), budget)
    guard r > 0 else { return Corner(a: 0, b: 0, c: 0, d: 0, p: 0, arc: 0, radius: 0) }

    // Spreading the curve costs edge length, and a short edge cannot pay for it —
    // past this point the ramps would run into each other.
    let spread = max(0, min(smoothing, budget / r - 1))
    let p = min((1 + spread) * r, budget)

    let sweep = 90 * (1 - spread)
    let arc = sin(radians(sweep / 2)) * r * CGFloat(2.0).squareRoot()

    let alpha = (90 - sweep) / 2
    let beta = 45 * spread
    let c = r * tan(radians(alpha / 2)) * cos(radians(beta))
    let d = c * tan(radians(beta))
    let b = (p - arc - c - d) / 3

    return Corner(a: 2 * b, b: b, c: c, d: d, p: p, arc: arc, radius: r)
  }

  /// A cubic given, like the SVG `c` command, as offsets from the current point.
  private static func curve(
    _ path: CGMutablePath,
    _ dx1: CGFloat, _ dy1: CGFloat,
    _ dx2: CGFloat, _ dy2: CGFloat,
    _ dx: CGFloat, _ dy: CGFloat
  ) {
    let from = path.currentPoint
    path.addCurve(
      to: CGPoint(x: from.x + dx, y: from.y + dy),
      control1: CGPoint(x: from.x + dx1, y: from.y + dy1),
      control2: CGPoint(x: from.x + dx2, y: from.y + dy2)
    )
  }

  /// Beyond this, the arc is cut in half and fitted twice; the error of a cubic
  /// fit grows with the sixth power of the sweep, so one cut is worth a lot.
  private static let maxFittedSweep = CGFloat.pi / 4

  /**
   The SVG `a` command, for the one flavour this shape uses: equal radii, no
   rotation, the small arc, and a positive sweep. Core Graphics has `addArc`, but
   it takes a centre and a winding direction whose sense flips in a view's
   y-down space; fitting cubics sidesteps that, and holds the true arc to within
   a ten-thousandth of a point.
   */
  private static func arc(_ path: CGMutablePath, _ radius: CGFloat, _ dx: CGFloat, _ dy: CGFloat) {
    let from = path.currentPoint
    let to = CGPoint(x: from.x + dx, y: from.y + dy)

    let halfX = (from.x - to.x) / 2
    let halfY = (from.y - to.y) / 2
    let halfSquared = halfX * halfX + halfY * halfY
    guard halfSquared > 0, radius > 0 else { return }

    // Endpoint parameterisation → centre (SVG spec F.6.5, with the sign the
    // small-arc/positive-sweep pair asks for).
    let reach = max(0, radius * radius / halfSquared - 1).squareRoot()
    let centre = CGPoint(
      x: reach * halfY + (from.x + to.x) / 2,
      y: -reach * halfX + (from.y + to.y) / 2
    )
    // Whatever the caller asked for, the circle actually through both endpoints.
    let r = (pow(from.x - centre.x, 2) + pow(from.y - centre.y, 2)).squareRoot()

    let start = atan2(from.y - centre.y, from.x - centre.x)
    var total = atan2(to.y - centre.y, to.x - centre.x) - start
    if total < 0 { total += 2 * .pi }

    let pieces = max(1, Int((total / maxFittedSweep).rounded(.up)))
    let step = total / CGFloat(pieces)
    let handle = 4.0 / 3.0 * tan(step / 4) * r

    for piece in 0..<pieces {
      let fromAngle = start + step * CGFloat(piece)
      let toAngle = fromAngle + step
      // The given endpoints rather than the recomputed ones, so the corner's
      // Béziers still meet the arc exactly.
      let head = piece == 0 ? from : on(centre, r, fromAngle)
      let tail = piece == pieces - 1 ? to : on(centre, r, toAngle)

      path.addCurve(
        to: tail,
        control1: CGPoint(
          x: head.x - handle * sin(fromAngle),
          y: head.y + handle * cos(fromAngle)
        ),
        control2: CGPoint(
          x: tail.x + handle * sin(toAngle),
          y: tail.y - handle * cos(toAngle)
        )
      )
    }
  }

  private static func on(_ centre: CGPoint, _ radius: CGFloat, _ angle: CGFloat) -> CGPoint {
    CGPoint(x: centre.x + radius * cos(angle), y: centre.y + radius * sin(angle))
  }

  private static func radians(_ degrees: CGFloat) -> CGFloat {
    degrees * .pi / 180
  }
}
