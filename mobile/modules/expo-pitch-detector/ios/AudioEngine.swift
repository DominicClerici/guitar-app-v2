// modules/expo-pitch-detector/ios/AudioEngine.swift
import AVFoundation
import Darwin

final class AudioEngine {
  private let engine = AVAudioEngine()
  private let sampleRate: Double
  /// Called on the real-time audio thread with converted mono samples and the epoch
  /// time in ms of the block's *first* sample.
  private let onSamples: (UnsafePointer<Float>, Int, Double) -> Void
  private var converter: AVAudioConverter?
  private var converterTarget: AVAudioFormat?

  // The AVAudioSession is a process-wide singleton shared with the app's playback
  // engine (react-native-audio-api). Recording requires a category that includes
  // input, so we snapshot whatever the session was configured with and restore it on
  // stop — otherwise playback elsewhere would be stranded on our configuration.
  private var priorCategory: AVAudioSession.Category?
  private var priorMode: AVAudioSession.Mode?
  private var priorOptions: AVAudioSession.CategoryOptions?
  // The IO buffer duration is process-wide too, and a 5ms buffer means more wakeups for
  // whoever is playing audio. Restored with the category for the same reason.
  private var priorIOBufferDuration: TimeInterval?

  // Host time -> epoch is anchored once per session, and every later timestamp is
  // derived from the converted-frame count instead. Reading the wall clock per buffer
  // would fold the callback's own scheduling jitter into onset timestamps, which is
  // the one error a rhythm grader cannot absorb.
  private var timebase = mach_timebase_info_data_t()
  private var anchorEpochMs: Double?
  private var framesConverted: Int64 = 0

  init(sampleRate: Double, onSamples: @escaping (UnsafePointer<Float>, Int, Double) -> Void) {
    self.sampleRate = sampleRate
    self.onSamples = onSamples
  }

  func start() throws {
    let session = AVAudioSession.sharedInstance()
    priorCategory = session.category
    priorMode = session.mode
    priorOptions = session.categoryOptions
    priorIOBufferDuration = session.preferredIOBufferDuration
    // `.playAndRecord` rather than `.record` so a click track can play while we listen;
    // `.defaultToSpeaker` keeps that click on the speaker instead of the earpiece, and
    // `.mixWithOthers` keeps a backing track alive underneath it.
    //
    // `.measurement` stays: it turns off input processing (AGC, EQ), which is what makes
    // the pitch reading trustworthy. It also turns off echo cancellation, so a click
    // played through the speaker WILL bleed back into the mic. That is expected — the
    // rhythm feature calibrates it out on the JS side, not here.
    try session.setCategory(.playAndRecord,
                            mode: .measurement,
                            options: [.defaultToSpeaker, .mixWithOthers])
    // Without this the session keeps its default IO buffer (~23ms at 48kHz), which is
    // coarser than the module's 15ms analysis tick — a third of ticks would re-analyze a
    // window the tap had not refreshed, paying full NSDF cost for a duplicate answer.
    // A preference, not a guarantee: the OS clamps it to what the hardware allows, and a
    // refusal only costs us the latency we were trying to save.
    try? session.setPreferredIOBufferDuration(0.005)
    try session.setActive(true)

    mach_timebase_info(&timebase)
    anchorEpochMs = nil
    framesConverted = 0

    let input = engine.inputNode
    let nativeFormat = input.outputFormat(forBus: 0)

    guard let target = AVAudioFormat(commonFormat: .pcmFormatFloat32,
                                     sampleRate: sampleRate,
                                     channels: 1,
                                     interleaved: false) else {
      throw NSError(domain: "ExpoPitchDetector", code: 1, userInfo: [
        NSLocalizedDescriptionKey: "Failed to construct target PCM Float32 mono format",
      ])
    }
    guard let conv = AVAudioConverter(from: nativeFormat, to: target) else {
      throw NSError(domain: "ExpoPitchDetector", code: 2, userInfo: [
        NSLocalizedDescriptionKey: "Failed to create audio converter \(nativeFormat) -> \(target)",
      ])
    }
    self.converter = conv
    self.converterTarget = target

    input.removeTap(onBus: 0)
    // Sized to match the IO buffer requested above rather than the old 1024 (21ms at
    // 48kHz): the tap can only deliver as often as the hardware fills, so leaving this
    // large would have kept the coarse cadence the preferred duration is meant to break.
    input.installTap(onBus: 0, bufferSize: 256, format: nativeFormat) { [weak self] inBuf, when in
      guard let self,
            let converter = self.converter,
            let targetFormat = self.converterTarget else { return }

      // Target frame capacity scales with the sample-rate ratio.
      let ratio = targetFormat.sampleRate / inBuf.format.sampleRate
      let outCapacity = AVAudioFrameCount(Double(inBuf.frameLength) * ratio + 0.5)
      guard outCapacity > 0,
            let outBuf = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: outCapacity) else { return }

      var supplied = false
      var convError: NSError?
      let status = converter.convert(to: outBuf, error: &convError) { _, outStatus in
        if supplied {
          outStatus.pointee = .noDataNow
          return nil
        }
        supplied = true
        outStatus.pointee = .haveData
        return inBuf
      }
      guard status != .error, let ch0 = outBuf.floatChannelData?[0] else { return }

      let frames = Int(outBuf.frameLength)
      let startEpochMs = self.blockStartEpochMs(when: when, targetSampleRate: targetFormat.sampleRate)
      // Advanced before the callback so a re-entrant delivery can never reuse an index.
      self.framesConverted += Int64(frames)
      self.onSamples(ch0, frames, startEpochMs)
    }

    engine.prepare()
    try engine.start()
  }

  /// Epoch ms of the next converted frame. Frames are counted in the *target* domain,
  /// so the sample-rate conversion is already accounted for.
  private func blockStartEpochMs(when: AVAudioTime, targetSampleRate: Double) -> Double {
    if anchorEpochMs == nil {
      // The wall clock is read now, but this buffer was captured `nowHost - bufferHost`
      // ago; subtracting that difference pins the anchor to the buffer rather than to us.
      let nowHost = mach_absolute_time()
      let bufferHost = when.isHostTimeValid ? when.hostTime : nowHost
      let elapsedNs = (Double(nowHost) - Double(bufferHost))
        * Double(timebase.numer) / Double(max(timebase.denom, 1))
      anchorEpochMs = Date().timeIntervalSince1970 * 1000 - elapsedNs / 1_000_000
    }
    return (anchorEpochMs ?? 0) + Double(framesConverted) / targetSampleRate * 1000
  }

  func stop() {
    engine.inputNode.removeTap(onBus: 0)
    engine.stop()
    converter = nil
    converterTarget = nil
    anchorEpochMs = nil
    framesConverted = 0

    let session = AVAudioSession.sharedInstance()
    try? session.setActive(false, options: [.notifyOthersOnDeactivation])
    // Restore the category we hijacked so the shared session is left playback-ready.
    if let category = priorCategory {
      try? session.setCategory(category, mode: priorMode ?? .default, options: priorOptions ?? [])
    }
    if let duration = priorIOBufferDuration {
      try? session.setPreferredIOBufferDuration(duration)
    }
    priorCategory = nil
    priorMode = nil
    priorOptions = nil
    priorIOBufferDuration = nil
  }
}
