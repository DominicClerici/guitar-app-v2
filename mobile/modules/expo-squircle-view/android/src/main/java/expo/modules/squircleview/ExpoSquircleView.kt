package expo.modules.squircleview

import android.content.Context
import android.graphics.Canvas
import android.graphics.DashPathEffect
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.util.DisplayMetrics
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

/**
 * A squircle drawn straight onto the canvas. The view normally carries no
 * content of its own — it is stretched behind whatever it is meant to be the
 * background of.
 *
 * With `clipsContent` it becomes a container instead: children lay out inside it
 * and are masked to the shape, which is the only way to give a corner that has
 * to clip — a scroller, an image, a row of ticks — the same curve as its
 * neighbours.
 *
 * The stroke is inset by half its width, the way a CSS border sits inside the
 * box, so a bordered squircle occupies exactly the frame it was given.
 *
 * Props arrive in dp, as every React Native length does; the path is in pixels.
 */
class ExpoSquircleView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }

    /**
     * Punches the corners out of the children once they are drawn. A plain
     * `clipPath` would do the same job in one step, but the hardware canvas
     * clips without antialiasing and a jagged squircle is worse than a round one.
     */
    private val erasePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR)
    }

    /** The shape at its full size — what the fill paints and the mask keeps. */
    private val outline = Path()

    /** The same, inset by half the stroke, so the hairline lands inside the box. */
    private val hairline = Path()

    /** Everything the mask throws away: the box minus the shape. */
    private val surround = Path()

    private var radii = SquircleRadii()
    private var smoothing = 0f
    private var clipsContent = false
    private var stale = true

    init {
        fillPaint.color = 0x00000000
        strokePaint.color = 0x00000000
        setWillNotDraw(false)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Rebuilt here rather than in each setter: a render hands the view its
        // props one at a time, and only the last of them has the whole shape.
        if (stale) rebuild()

        canvas.drawPath(outline, fillPaint)

        // With nothing drawn over it, the hairline can go down beside the fill
        // and `dispatchDraw` is left alone.
        if (!clipsContent) drawStroke(canvas)
    }

    override fun dispatchDraw(canvas: Canvas) {
        if (!clipsContent) {
            super.dispatchDraw(canvas)
            return
        }

        if (stale) rebuild()

        val layer = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null)
        super.dispatchDraw(canvas)
        canvas.drawPath(surround, erasePaint)
        canvas.restoreToCount(layer)

        // Over the children rather than under them, or a full-bleed child would
        // paint the border out.
        drawStroke(canvas)
    }

    override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
        super.onSizeChanged(width, height, oldWidth, oldHeight)
        stale = true
    }

    private fun drawStroke(canvas: Canvas) {
        if (strokePaint.strokeWidth > 0f) canvas.drawPath(hairline, strokePaint)
    }

    private fun rebuild() {
        stale = false
        outline.reset()
        hairline.reset()
        surround.reset()
        if (width == 0 || height == 0) return

        val size = { inset: Float ->
            SquirclePath.create(
                width = width - inset * 2f,
                height = height - inset * 2f,
                radii = if (inset > 0f) radii.inset(inset) else radii,
                smoothing = smoothing,
            )
        }

        size(0f).transform(Matrix(), outline)

        val inset = strokePaint.strokeWidth / 2f
        if (inset > 0f) {
            size(inset).transform(Matrix().apply { setTranslate(inset, inset) }, hairline)
        } else {
            hairline.set(outline)
        }

        surround.addRect(RectF(0f, 0f, width.toFloat(), height.toFloat()), Path.Direction.CW)
        surround.op(outline, Path.Op.DIFFERENCE)
    }

    private fun invalidateShape() {
        stale = true
        invalidate()
    }

    private fun toPixels(dp: Float): Float =
        dp * (context.resources.displayMetrics.densityDpi.toFloat() / DisplayMetrics.DENSITY_DEFAULT)

    fun setFillColor(color: Int) {
        fillPaint.color = color
        invalidate()
    }

    fun setStrokeColor(color: Int) {
        strokePaint.color = color
        invalidate()
    }

    /** Lengths of the drawn and undrawn runs, or nothing at all for a solid line. */
    fun setStrokeDash(pattern: List<Float>) {
        strokePaint.pathEffect =
            if (pattern.isEmpty()) null
            else DashPathEffect(pattern.map { toPixels(it) }.toFloatArray(), 0f)
        invalidate()
    }

    fun setStrokeWidth(dp: Float) {
        strokePaint.strokeWidth = toPixels(dp)
        invalidateShape()
    }

    fun setSmoothing(value: Float) {
        smoothing = value
        invalidateShape()
    }

    fun setClipsContent(value: Boolean) {
        clipsContent = value
        invalidate()
    }

    fun setRadii(transform: SquircleRadii.() -> SquircleRadii) {
        radii = radii.transform()
        invalidateShape()
    }

    fun setRadiusTopLeft(dp: Float) = setRadii { copy(topLeft = toPixels(dp)) }

    fun setRadiusTopRight(dp: Float) = setRadii { copy(topRight = toPixels(dp)) }

    fun setRadiusBottomRight(dp: Float) = setRadii { copy(bottomRight = toPixels(dp)) }

    fun setRadiusBottomLeft(dp: Float) = setRadii { copy(bottomLeft = toPixels(dp)) }
}
