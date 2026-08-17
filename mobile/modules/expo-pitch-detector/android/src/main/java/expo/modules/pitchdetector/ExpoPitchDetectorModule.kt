// modules/expo-pitch-detector/android/src/main/java/expo/modules/pitchdetector/ExpoPitchDetectorModule.kt
package expo.modules.pitchdetector

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoPitchDetectorModule : Module() {
  private var capture: AudioCapture? = null
  // Deliberately still 22050 while iOS runs at 48000: `windowSize` and OnsetDetector's
  // hop are sample counts, so raising the rate here without doubling both would halve
  // the analysis window and cost the low strings their NSDF reliability. Raise all
  // three together, or not at all — and note that a `sampleRate` passed from JS reaches
  // both platforms, so it would hit exactly that trap.
  private var sampleRate: Int = 22050
  private val windowSize = 2048
  private val hop = 1024
  private var detector = PitchDetectorMPM(sampleRate.toDouble(), windowSize)
  private val ring = ArrayDeque<Float>()
  private val ringLock = Any()

  // Outlives any one capture so `configureOnsets` means something before start() and
  // survives stop(). It carries its own lock, so it is reachable from every thread.
  private val onsets = OnsetDetector()

  override fun definition() = ModuleDefinition {
    Name("ExpoPitchDetector")
    Events("onPitch", "onOnset")

    AsyncFunction("configureOnsets") { config: Map<String, Any> ->
      onsets.configure(
        enabled = (config["enabled"] as? Boolean) ?: false,
        threshold = (config["threshold"] as? Number)?.toFloat() ?: 0f,
        refractoryMs = (config["refractoryMs"] as? Number)?.toDouble() ?: 0.0,
      )
    }

    AsyncFunction("start") { opts: Map<String, Any>? ->
      val ctx = appContext.reactContext
        ?: throw IllegalStateException("PERMISSION_DENIED")
      val granted = androidx.core.content.ContextCompat.checkSelfPermission(
        ctx, android.Manifest.permission.RECORD_AUDIO,
      ) == android.content.pm.PackageManager.PERMISSION_GRANTED
      if (!granted) throw IllegalStateException("PERMISSION_DENIED")

      // Idempotent: stop any prior capture before reconfiguring.
      capture?.stop()
      capture = null

      opts?.get("sampleRate")?.let { sampleRate = (it as Number).toInt() }
      detector = PitchDetectorMPM(sampleRate.toDouble(), windowSize)
      synchronized(ringLock) { ring.clear() }
      onsets.begin(sampleRate.toDouble())

      val cap = AudioCapture(sampleRate) { samples, startEpochMs -> handle(samples, startEpochMs) }
      cap.start()
      capture = cap
    }

    AsyncFunction("stop") {
      capture?.stop()
      capture = null
      synchronized(ringLock) { ring.clear() }
      // Config survives; only the envelope history and any undrained detections go.
      onsets.reset()
    }

    OnDestroy {
      capture?.stop()
      capture = null
      onsets.reset()
    }
  }

  private fun handle(samples: FloatArray, startEpochMs: Double) {
    // Onsets first: their timestamps are their own, but the MPM pass below is the slow
    // part of this block and there is no reason to sit behind it.
    onsets.feed(samples, startEpochMs)
    for (onset in onsets.drain()) {
      sendEvent("onOnset", mapOf("at" to onset.atMs, "peak" to onset.peak.toDouble()))
    }

    // Drain into a local window buffer under lock, then run MPM and emit outside the lock
    // to keep the critical section short.
    val windows = mutableListOf<FloatArray>()
    synchronized(ringLock) {
      for (s in samples) ring.addLast(s)
      while (ring.size >= windowSize) {
        val win = FloatArray(windowSize) { ring.elementAt(it) }
        repeat(hop) { ring.removeFirst() }
        windows.add(win)
      }
    }
    for (win in windows) {
      val rms = detector.rms(win)
      val r = detector.detect(win)
      sendEvent(
        "onPitch",
        mapOf(
          "frequency" to (r?.frequency ?: 0.0),
          "clarity" to (r?.clarity ?: 0.0),
          "rms" to rms,
          "timestamp" to System.currentTimeMillis().toDouble(),
        ),
      )
    }
  }
}
