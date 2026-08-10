package expo.modules.pitchdetector

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

data class PitchResult(val frequency: Double, val clarity: Double)

class PitchDetectorMPM(
  private val sampleRate: Double,
  private val n: Int,
) {
  private val clarityFloor = 0.7
  private val kCutoff = 0.93
  private val minFreq = 55.0
  private val maxFreq = 1500.0
  private val window: FloatArray = FloatArray(n) { i ->
    (0.5 * (1 - cos(2 * PI * i / (n - 1)))).toFloat()
  }

  fun detect(samples: FloatArray): PitchResult? {
    if (samples.size < n) return null
    val x = FloatArray(n) { samples[it] * window[it] }

    val maxLag = n / 2
    val minLag = max(2, (sampleRate / maxFreq).toInt())
    val maxAllowedLag = min(maxLag, (sampleRate / minFreq).toInt())

    val nsdf = DoubleArray(maxAllowedLag + 1)
    for (tau in 0..maxAllowedLag) {
      var acf = 0.0
      var m = 0.0
      val upper = n - tau
      var i = 0
      while (i < upper) {
        val a = x[i].toDouble()
        val b = x[i + tau].toDouble()
        acf += a * b
        m += a * a + b * b
        i++
      }
      nsdf[tau] = if (m > 0) 2 * acf / m else 0.0
    }

    // Skip the initial positive lobe — NSDF starts at 1.0 and descends through its first
    // zero-crossing. Without this the peak scan latches onto that descent and reports a
    // spurious high-frequency artifact (e.g. sampleRate / minLag).
    var i = minLag
    while (i < maxAllowedLag && nsdf[i] > 0) i++

    val peaks = mutableListOf<Pair<Int, Double>>()
    while (i < maxAllowedLag) {
      if (nsdf[i] > 0) {
        var j = i
        var bestTau = j
        var bestVal = nsdf[j]
        while (j < maxAllowedLag && nsdf[j] > 0) {
          if (nsdf[j] > bestVal) { bestTau = j; bestVal = nsdf[j] }
          j++
        }
        peaks += bestTau to bestVal
        i = j + 1
      } else {
        i++
      }
    }
    val maxVal = peaks.maxOfOrNull { it.second } ?: return null
    val chosen = peaks.firstOrNull { it.second >= kCutoff * maxVal } ?: return null

    val tau = chosen.first
    val y0 = if (tau > 0) nsdf[tau - 1] else nsdf[tau]
    val y1 = nsdf[tau]
    val y2 = if (tau + 1 <= maxAllowedLag) nsdf[tau + 1] else nsdf[tau]
    val denom = y0 - 2 * y1 + y2
    val shift = if (denom == 0.0) 0.0 else 0.5 * (y0 - y2) / denom
    val tauStar = tau + shift
    val freq = sampleRate / tauStar
    val clarity = y1
    if (clarity < clarityFloor) return null
    if (freq < minFreq || freq > maxFreq) return null
    return PitchResult(freq, clarity)
  }

  fun rms(samples: FloatArray): Double {
    var s = 0.0
    for (v in samples) s += v.toDouble() * v
    return if (samples.isNotEmpty()) sqrt(s / samples.size) else 0.0
  }
}
