// modules/expo-pitch-detector/android/src/main/java/expo/modules/pitchdetector/OnsetDetector.kt
package expo.modules.pitchdetector

import kotlin.math.sqrt

data class Onset(val atMs: Double, val peak: Float)

/**
 * Envelope-following transient detector, fed from the capture thread.
 *
 * Detections land on a small lock-protected queue rather than being emitted from inside
 * the read loop, so draining is a decision the caller makes at a block boundary.
 *
 * Hops are consecutive and non-overlapping, which is why this is fed the raw capture
 * blocks rather than the 2048-sample analysis windows: those advance by a 1024 hop and
 * would double-count half of every block.
 */
class OnsetDetector {
  private val hopSize = 256

  /**
   * `peak` spans the crossing hop and the two after it, which defers emission by ~23ms
   * at 22050 Hz. Late with an honest `atMs` beats prompt with a peak measured before the
   * transient finished rising.
   */
  private val peakHops = 3

  /**
   * A consumer that stops draining must not turn into unbounded memory. The oldest
   * detection is the least useful one to keep.
   */
  private val maxQueued = 64

  private val lock = Any()
  private var sampleRate = 22050.0
  private var enabled = false
  private var threshold = 0f
  private var refractoryMs = 0.0

  private var hopSumSquares = 0.0
  private var hopFilled = 0
  private var hopStartMs = 0.0
  private var previousRms: Float? = null
  private var lastOnsetMs = Double.NEGATIVE_INFINITY
  private var pendingAtMs = 0.0
  private var pendingPeak = 0f
  private var pendingHopsLeft = 0
  private val queue = ArrayDeque<Onset>()

  /**
   * Valid at any point in the session lifecycle — the detector outlives the capture it is
   * attached to, so JS can arm onsets before the mic is even open.
   */
  fun configure(enabled: Boolean, threshold: Float, refractoryMs: Double) {
    synchronized(lock) {
      this.enabled = enabled
      this.threshold = threshold
      this.refractoryMs = refractoryMs
      if (!enabled) resetLocked()
    }
  }

  /**
   * A capture session is starting: the sample rate fixes the hop duration, and nothing
   * from the previous session may leak into this one's envelope history.
   */
  fun begin(sampleRate: Double) {
    synchronized(lock) {
      this.sampleRate = sampleRate
      resetLocked()
    }
  }

  fun reset() {
    synchronized(lock) { resetLocked() }
  }

  fun feed(samples: FloatArray, startEpochMs: Double) {
    synchronized(lock) {
      if (!enabled || sampleRate <= 0) return
      var i = 0
      while (i < samples.size) {
        if (hopFilled == 0) {
          hopStartMs = startEpochMs + i / sampleRate * 1000.0
        }
        val take = minOf(hopSize - hopFilled, samples.size - i)
        var sum = hopSumSquares
        for (k in i until i + take) {
          val v = samples[k].toDouble()
          sum += v * v
        }
        hopSumSquares = sum
        hopFilled += take
        i += take

        if (hopFilled == hopSize) {
          processHop(sqrt(hopSumSquares / hopSize).toFloat(), hopStartMs)
          hopSumSquares = 0.0
          hopFilled = 0
        }
      }
    }
  }

  fun drain(): List<Onset> {
    synchronized(lock) {
      if (queue.isEmpty()) return emptyList()
      val out = queue.toList()
      queue.clear()
      return out
    }
  }

  // Must be called with `lock` held.
  private fun processHop(rms: Float, atMs: Double) {
    if (pendingHopsLeft > 0) {
      if (rms > pendingPeak) pendingPeak = rms
      pendingHopsLeft -= 1
      if (pendingHopsLeft == 0) enqueueLocked(Onset(pendingAtMs, pendingPeak))
    }

    // A rising edge needs something to rise from, so the first hop after a reset can
    // never open one.
    val previous = previousRms
    if (
      previous != null &&
      previous < threshold &&
      rms >= threshold &&
      atMs - lastOnsetMs >= refractoryMs
    ) {
      // A refractory shorter than the peak window can open a second onset while the first
      // is still measuring. Publish that one with what it has rather than lose it.
      if (pendingHopsLeft > 0) {
        enqueueLocked(Onset(pendingAtMs, pendingPeak))
        pendingHopsLeft = 0
      }
      lastOnsetMs = atMs
      pendingAtMs = atMs
      pendingPeak = rms
      pendingHopsLeft = peakHops - 1
    }

    previousRms = rms
  }

  // Must be called with `lock` held.
  private fun enqueueLocked(onset: Onset) {
    if (queue.size >= maxQueued) queue.removeFirst()
    queue.addLast(onset)
  }

  // Must be called with `lock` held.
  private fun resetLocked() {
    hopSumSquares = 0.0
    hopFilled = 0
    hopStartMs = 0.0
    previousRms = null
    lastOnsetMs = Double.NEGATIVE_INFINITY
    pendingAtMs = 0.0
    pendingPeak = 0f
    pendingHopsLeft = 0
    queue.clear()
  }
}
