// modules/expo-pitch-detector/android/src/main/java/expo/modules/pitchdetector/ExpoPitchDetectorModule.kt
package expo.modules.pitchdetector

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoPitchDetectorModule : Module() {
  private var capture: AudioCapture? = null
  private var sampleRate: Int = 22050
  private val windowSize = 2048
  private val hop = 1024
  private var detector = PitchDetectorMPM(sampleRate.toDouble(), windowSize)
  private val ring = ArrayDeque<Float>()
  private val ringLock = Any()

  override fun definition() = ModuleDefinition {
    Name("ExpoPitchDetector")
    Events("onPitch")

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

      val cap = AudioCapture(sampleRate) { samples -> handle(samples) }
      cap.start()
      capture = cap
    }

    AsyncFunction("stop") {
      capture?.stop()
      capture = null
      synchronized(ringLock) { ring.clear() }
    }

    OnDestroy {
      capture?.stop()
      capture = null
    }
  }

  private fun handle(samples: FloatArray) {
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
