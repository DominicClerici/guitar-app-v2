// modules/expo-pitch-detector/ios/AudioEngine.swift
import AVFoundation

final class AudioEngine {
  private let engine = AVAudioEngine()
  private let sampleRate: Double
  private let onSamples: (UnsafePointer<Float>, Int) -> Void
  private var converter: AVAudioConverter?
  private var converterTarget: AVAudioFormat?

  // The AVAudioSession is a process-wide singleton shared with the app's playback
  // engine (react-native-audio-api). Recording requires the `.record` category, so
  // we snapshot whatever the session was configured with and restore it on stop —
  // otherwise playback elsewhere would be stranded on a record-only session.
  private var priorCategory: AVAudioSession.Category?
  private var priorMode: AVAudioSession.Mode?
  private var priorOptions: AVAudioSession.CategoryOptions?

  init(sampleRate: Double, onSamples: @escaping (UnsafePointer<Float>, Int) -> Void) {
    self.sampleRate = sampleRate
    self.onSamples = onSamples
  }

  func start() throws {
    let session = AVAudioSession.sharedInstance()
    priorCategory = session.category
    priorMode = session.mode
    priorOptions = session.categoryOptions
    try session.setCategory(.record, mode: .measurement, options: [])
    try session.setActive(true)

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
    input.installTap(onBus: 0, bufferSize: 1024, format: nativeFormat) { [weak self] inBuf, _ in
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
      self.onSamples(ch0, Int(outBuf.frameLength))
    }

    engine.prepare()
    try engine.start()
  }

  func stop() {
    engine.inputNode.removeTap(onBus: 0)
    engine.stop()
    converter = nil
    converterTarget = nil

    let session = AVAudioSession.sharedInstance()
    try? session.setActive(false, options: [.notifyOthersOnDeactivation])
    // Restore the category we hijacked so the shared session is left playback-ready.
    if let category = priorCategory {
      try? session.setCategory(category, mode: priorMode ?? .default, options: priorOptions ?? [])
    }
    priorCategory = nil
    priorMode = nil
    priorOptions = nil
  }
}
