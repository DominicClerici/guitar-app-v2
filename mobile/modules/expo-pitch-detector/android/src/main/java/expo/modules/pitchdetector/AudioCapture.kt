// modules/expo-pitch-detector/android/src/main/java/expo/modules/pitchdetector/AudioCapture.kt
package expo.modules.pitchdetector

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.AudioTimestamp
import android.media.MediaRecorder
import kotlin.concurrent.thread

class AudioCapture(
  private val sampleRate: Int,
  /** Called on the capture thread with a block and the epoch ms of its *first* frame. */
  private val onSamples: (FloatArray, Double) -> Unit,
) {
  private var record: AudioRecord? = null
  private var captureThread: Thread? = null
  @Volatile private var running = false

  fun start() {
    val min = AudioRecord.getMinBufferSize(
      sampleRate,
      AudioFormat.CHANNEL_IN_MONO,
      AudioFormat.ENCODING_PCM_16BIT,
    )
    if (min <= 0) {
      throw IllegalStateException(
        "AudioRecord.getMinBufferSize returned $min for $sampleRate Hz mono PCM16 — unsupported on this device"
      )
    }
    val bufSize = maxOf(min, 1024 * 2)

    val source = tryCreate(MediaRecorder.AudioSource.UNPROCESSED, bufSize)
      ?: tryCreate(MediaRecorder.AudioSource.VOICE_RECOGNITION, bufSize)
      ?: throw IllegalStateException(
        "Could not create AudioRecord for $sampleRate Hz mono PCM16 with bufSize=$bufSize"
      )

    record = source
    source.startRecording()
    running = true

    val t = thread(name = "ExpoPitchDetector-mic", isDaemon = true) {
      val shorts = ShortArray(1024)

      // nanoTime has no epoch of its own, so the two clocks are pinned to each other once.
      // Re-reading the wall clock per block would fold this loop's own scheduling jitter
      // (and any clock adjustment) into onset timestamps.
      val epochAtMonoZeroMs = System.currentTimeMillis() - System.nanoTime() / 1_000_000.0
      var framesRead = 0L
      var anchorFrame = -1L
      var anchorEpochMs = 0.0

      while (running) {
        val n = try {
          source.read(shorts, 0, shorts.size)
        } catch (_: Throwable) {
          break
        }
        if (n <= 0) continue

        if (anchorFrame < 0) {
          val ts = AudioTimestamp()
          val ok = try {
            source.getTimestamp(ts, AudioTimestamp.TIMEBASE_MONOTONIC) == AudioRecord.SUCCESS
          } catch (_: Throwable) {
            false
          }
          if (ok) {
            anchorFrame = ts.framePosition
            anchorEpochMs = epochAtMonoZeroMs + ts.nanoTime / 1_000_000.0
          } else {
            // Fallback for devices where getTimestamp is unsupported or errors: the block
            // that just came back was captured over the window ending roughly now, so its
            // last frame is "now" and its first is n frames earlier. This ignores whatever
            // the HAL had buffered ahead of us, so onsets can read a few ms late — the
            // hardware timestamp above is the accurate path and this is only a floor.
            anchorFrame = framesRead + n
            anchorEpochMs = System.currentTimeMillis().toDouble()
          }
        }

        val startEpochMs = anchorEpochMs + (framesRead - anchorFrame) * 1000.0 / sampleRate
        val floats = FloatArray(n) { shorts[it] / 32768f }
        framesRead += n
        try { onSamples(floats, startEpochMs) } catch (_: Throwable) { /* swallow to keep the loop alive */ }
      }
    }
    captureThread = t
  }

  fun stop() {
    running = false
    try { record?.stop() } catch (_: Throwable) { /* may already be stopped */ }
    captureThread?.join(500)
    captureThread = null
    record?.release()
    record = null
  }

  private fun tryCreate(audioSource: Int, bufSize: Int): AudioRecord? =
    try {
      AudioRecord(
        audioSource,
        sampleRate,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT,
        bufSize,
      ).takeIf { it.state == AudioRecord.STATE_INITIALIZED }
        ?: run { /* failed init */ null }
    } catch (_: Throwable) {
      null
    }
}
