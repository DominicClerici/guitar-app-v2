package expo.modules.squircleview

import android.content.Context
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.util.DisplayMetrics
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

/**
 * A squircle drawn straight onto the canvas. The view carries no content of its
 * own — it is stretched behind whatever it is meant to be the background of.
 *
 * The stroke is inset by half its width, the way a CSS border sits inside the
 * box, so a bordered squircle occupies exactly the frame it was given.
 *
 * Props arrive in dp, as every React Native length does; the path is in pixels.
 */
class ExpoSquircleView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
    private val path = Path()

    private var radii = SquircleRadii()
    private var smoothing = 0f
    private var strokeWidth = 0f
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

        canvas.drawPath(path, fillPaint)
        if (strokePaint.strokeWidth > 0f) canvas.drawPath(path, strokePaint)
    }

    override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
        super.onSizeChanged(width, height, oldWidth, oldHeight)
        stale = true
    }

    private fun rebuild() {
        stale = false
        path.reset()
        if (width == 0 || height == 0) return

        val stroke = strokePaint.strokeWidth
        val inset = stroke / 2f
        val shape = SquirclePath.create(
            width = width - stroke,
            height = height - stroke,
            radii = if (inset > 0f) radii.inset(inset) else radii,
            smoothing = smoothing,
        )

        shape.transform(Matrix().apply { setTranslate(inset, inset) }, path)
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

    fun setStrokeWidth(dp: Float) {
        strokePaint.strokeWidth = toPixels(dp)
        invalidateShape()
    }

    fun setSmoothing(value: Float) {
        smoothing = value
        invalidateShape()
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
