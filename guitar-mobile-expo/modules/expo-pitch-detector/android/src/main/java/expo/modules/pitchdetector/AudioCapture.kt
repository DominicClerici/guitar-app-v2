// modules/expo-pitch-detector/android/src/main/java/expo/modules/pitchdetector/AudioCapture.kt
package expo.modules.pitchdetector

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import kotlin.concurrent.thread

class AudioCapture(
  private val sampleRate: Int,
  private val onSamples: (FloatArray) -> Unit,
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
      while (running) {
        val n = try {
          source.read(shorts, 0, shorts.size)
        } catch (_: Throwable) {
          break
        }
        if (n <= 0) continue
        val floats = FloatArray(n) { shorts[it] / 32768f }
        try { onSamples(floats) } catch (_: Throwable) { /* swallow to keep the loop alive */ }
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
