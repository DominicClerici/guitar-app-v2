package expo.modules.squircleview

import android.graphics.Path
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.tan

/**
 * The rounded rectangle Apple draws — the native twin of `src/lib/squircle.ts`,
 * which carries the full explanation of the shape. Both are the piecewise cubic
 * fit Figma reverse-engineered in "Desperately seeking squircles": each corner is
 * a Bézier ramping curvature up, a circular arc of reduced sweep through the apex,
 * and a mirrored Bézier ramping it back down.
 *
 * `smoothing` runs 0..1 — the same scale the TypeScript uses, not the 0..100 the
 * npm package took — so the two implementations can be handed the same number and
 * draw the same curve. Every length here is in pixels; the view converts.
 */
data class SquircleRadii(
    val topLeft: Float = 0f,
    val topRight: Float = 0f,
    val bottomRight: Float = 0f,
    val bottomLeft: Float = 0f,
) {
    /** The centreline of a stroke runs half a width inside each corner's arc. */
    fun inset(amount: Float) = SquircleRadii(
        max(0f, topLeft - amount),
        max(0f, topRight - amount),
        max(0f, bottomRight - amount),
        max(0f, bottomLeft - amount),
    )
}

object SquirclePath {

    /** One corner's Bézier fit. Control-point offsets are from figure 11.1 of the article. */
    private data class Corner(
        val a: Float,
        val b: Float,
        val c: Float,
        val d: Float,
        /** How far back along each edge the corner reaches. */
        val p: Float,
        /** The chord of the shortened arc, on both axes. */
        val arc: Float,
        val radius: Float,
    )

    fun create(width: Float, height: Float, radii: SquircleRadii, smoothing: Float): Path {
        val builder = PathBuilder()
        if (width <= 0f || height <= 0f) return builder.path

        // Every corner spends out of the same edge length, so they share a budget.
        val budget = min(width, height) / 2f
        val topLeft = corner(radii.topLeft, smoothing, budget)
        val topRight = corner(radii.topRight, smoothing, budget)
        val bottomRight = corner(radii.bottomRight, smoothing, budget)
        val bottomLeft = corner(radii.bottomLeft, smoothing, budget)

        // Opening at the top-right corner's reach; the top edge is what `close` draws.
        builder.moveTo(width - topRight.p, 0f)

        if (topRight.radius > 0f) {
            builder.curve(
                topRight.a, 0f,
                topRight.a + topRight.b, 0f,
                topRight.a + topRight.b + topRight.c, topRight.d,
            )
            builder.arc(topRight.radius, topRight.arc, topRight.arc)
            builder.curve(
                topRight.d, topRight.c,
                topRight.d, topRight.b + topRight.c,
                topRight.d, topRight.a + topRight.b + topRight.c,
            )
        }

        builder.lineTo(width, height - bottomRight.p)

        if (bottomRight.radius > 0f) {
            builder.curve(
                0f, bottomRight.a,
                0f, bottomRight.a + bottomRight.b,
                -bottomRight.d, bottomRight.a + bottomRight.b + bottomRight.c,
            )
            builder.arc(bottomRight.radius, -bottomRight.arc, bottomRight.arc)
            builder.curve(
                -bottomRight.c, bottomRight.d,
                -(bottomRight.b + bottomRight.c), bottomRight.d,
                -(bottomRight.a + bottomRight.b + bottomRight.c), bottomRight.d,
            )
        }

        builder.lineTo(bottomLeft.p, height)

        if (bottomLeft.radius > 0f) {
            builder.curve(
                -bottomLeft.a, 0f,
                -(bottomLeft.a + bottomLeft.b), 0f,
                -(bottomLeft.a + bottomLeft.b + bottomLeft.c), -bottomLeft.d,
            )
            builder.arc(bottomLeft.radius, -bottomLeft.arc, -bottomLeft.arc)
            builder.curve(
                -bottomLeft.d, -bottomLeft.c,
                -bottomLeft.d, -(bottomLeft.b + bottomLeft.c),
                -bottomLeft.d, -(bottomLeft.a + bottomLeft.b + bottomLeft.c),
            )
        }

        builder.lineTo(0f, topLeft.p)

        if (topLeft.radius > 0f) {
            builder.curve(
                0f, -topLeft.a,
                0f, -(topLeft.a + topLeft.b),
                topLeft.d, -(topLeft.a + topLeft.b + topLeft.c),
            )
            builder.arc(topLeft.radius, topLeft.arc, -topLeft.arc)
            builder.curve(
                topLeft.c, -topLeft.d,
                topLeft.b + topLeft.c, -topLeft.d,
                topLeft.a + topLeft.b + topLeft.c, -topLeft.d,
            )
        }

        builder.close()
        return builder.path
    }

    private fun corner(radius: Float, smoothing: Float, budget: Float): Corner {
        val r = min(max(radius, 0f), budget)
        if (r <= 0f) return Corner(0f, 0f, 0f, 0f, 0f, 0f, 0f)

        // Spreading the curve costs edge length, and a short edge cannot pay for it —
        // past this point the ramps would run into each other.
        val spread = max(0f, min(smoothing, budget / r - 1f))
        val p = min((1f + spread) * r, budget)

        val sweep = 90f * (1f - spread)
        val arc = sin(radians(sweep / 2f)) * r * sqrt(2f)

        val alpha = (90f - sweep) / 2f
        val beta = 45f * spread
        val c = r * tan(radians(alpha / 2f)) * cos(radians(beta))
        val d = c * tan(radians(beta))
        val b = (p - arc - c - d) / 3f

        return Corner(a = 2f * b, b = b, c = c, d = d, p = p, arc = arc, radius = r)
    }

    private fun radians(degrees: Float): Float = degrees * (PI.toFloat() / 180f)

    /**
     * `Path` will take relative segments but never says where it currently is, so
     * the arc — which needs its own start point to find its centre — is drawn
     * through a builder that remembers.
     */
    private class PathBuilder {
        val path = Path()
        private var x = 0f
        private var y = 0f

        fun moveTo(toX: Float, toY: Float) {
            x = toX
            y = toY
            path.moveTo(x, y)
        }

        fun lineTo(toX: Float, toY: Float) {
            x = toX
            y = toY
            path.lineTo(x, y)
        }

        /** A cubic given, like the SVG `c` command, as offsets from the current point. */
        fun curve(dx1: Float, dy1: Float, dx2: Float, dy2: Float, dx: Float, dy: Float) {
            path.rCubicTo(dx1, dy1, dx2, dy2, dx, dy)
            x += dx
            y += dy
        }

        /**
         * The SVG `a` command, for the one flavour this shape uses: equal radii, no
         * rotation, the small arc, and a positive sweep. Fitted with cubics rather
         * than handed to `arcTo`, so both platforms run the identical arithmetic —
         * the fit holds the true arc to within a ten-thousandth of a pixel.
         */
        fun arc(radius: Float, dx: Float, dy: Float) {
            val toX = x + dx
            val toY = y + dy

            val halfX = -dx / 2f
            val halfY = -dy / 2f
            val halfSquared = halfX * halfX + halfY * halfY
            if (halfSquared <= 0f || radius <= 0f) return

            // Endpoint parameterisation → centre (SVG spec F.6.5, with the sign the
            // small-arc/positive-sweep pair asks for).
            val reach = sqrt(max(0f, radius * radius / halfSquared - 1f))
            val centreX = reach * halfY + (x + toX) / 2f
            val centreY = -reach * halfX + (y + toY) / 2f
            // Whatever the caller asked for, the circle actually through both endpoints.
            val r = sqrt((x - centreX) * (x - centreX) + (y - centreY) * (y - centreY))

            val start = atan2(y - centreY, x - centreX)
            var total = atan2(toY - centreY, toX - centreX) - start
            if (total < 0f) total += 2f * PI.toFloat()

            // The error of a cubic fit grows with the sixth power of the sweep, so
            // anything past an eighth turn is cut in half and fitted twice.
            val pieces = max(1, ceil(total / (PI.toFloat() / 4f)).toInt())
            val step = total / pieces
            val handle = 4f / 3f * tan(step / 4f) * r

            for (piece in 0 until pieces) {
                val fromAngle = start + step * piece
                val toAngle = fromAngle + step
                // The given endpoints rather than the recomputed ones, so the
                // corner's Béziers still meet the arc exactly.
                val headX = if (piece == 0) x else centreX + r * cos(fromAngle)
                val headY = if (piece == 0) y else centreY + r * sin(fromAngle)
                val tailX = if (piece == pieces - 1) toX else centreX + r * cos(toAngle)
                val tailY = if (piece == pieces - 1) toY else centreY + r * sin(toAngle)

                path.cubicTo(
                    headX - handle * sin(fromAngle), headY + handle * cos(fromAngle),
                    tailX + handle * sin(toAngle), tailY - handle * cos(toAngle),
                    tailX, tailY,
                )
            }

            x = toX
            y = toY
        }

        fun close() = path.close()
    }
}
