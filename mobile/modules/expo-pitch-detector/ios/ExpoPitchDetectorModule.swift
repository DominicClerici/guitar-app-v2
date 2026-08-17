import AVFoundation
import Accelerate
import ExpoModulesCore

public class ExpoPitchDetectorModule: Module {
  // 48kHz is the hardware rate on every modern iPhone, so the converter in AudioEngine
  // passes samples through instead of resampling. The window is sized in *time*, not
  // samples: NSDF needs several periods of the lowest note in view, so halving the
  // window duration to keep 2048 samples would cost the low strings their reliability.
  // 4096 @ 48kHz = 85ms, which holds ~4.7 periods of the 55Hz `minFreq` floor.
  private let windowSize = 4096
  private let defaultSampleRate: Double = 48000

  // engine/ring/detector/timer are owned by processingQueue: they are only read or written
  // from it (in tick, startProcessing, and the publish/teardown blocks). The real-time audio
  // tap never touches them — it writes into a ring instance captured directly in its closure.
  private let processingQueue = DispatchQueue(label: "expo.pitchdetector.processing")
  private var engine: AudioEngine?
  private var ring: SampleRing?
  private var detector: PitchDetectorMPM?
  private var timer: DispatchSourceTimer?

  // Outlives any one session so `configureOnsets` means something before start() and
  // survives stop(). It carries its own lock, so it is reachable from every queue.
  private let onsets = OnsetDetector()

  public func definition() -> ModuleDefinition {
    Name("ExpoPitchDetector")

    Events("onPitch", "onOnset")

    AsyncFunction("configureOnsets") { (config: [String: Any]) -> Void in
      self.onsets.configure(
        enabled: (config["enabled"] as? Bool) ?? false,
        threshold: Float((config["threshold"] as? Double) ?? 0),
        refractoryMs: (config["refractoryMs"] as? Double) ?? 0
      )
    }

    AsyncFunction("start") { (opts: [String: Any]?) async throws -> Void in
      // Idempotent: tear down any prior session before reconfiguring.
      self.teardown()

      let status = AVCaptureDevice.authorizationStatus(for: .audio)
      switch status {
      case .authorized:
        break
      case .notDetermined:
        let granted = await AVCaptureDevice.requestAccess(for: .audio)
        if !granted {
          throw NSError(domain: "ExpoPitchDetector", code: 100, userInfo: [
            NSLocalizedDescriptionKey: "PERMISSION_DENIED",
          ])
        }
      default:
        throw NSError(domain: "ExpoPitchDetector", code: 100, userInfo: [
          NSLocalizedDescriptionKey: "PERMISSION_DENIED",
        ])
      }

      let sr = (opts?["sampleRate"] as? Double) ?? defaultSampleRate
      let ring = SampleRing(capacity: self.windowSize)
      let detector = PitchDetectorMPM(sampleRate: sr, windowSize: self.windowSize)

      let onsets = self.onsets
      onsets.begin(sampleRate: sr)

      // The tap captures these instances directly, so the real-time audio thread never
      // reads a shared mutable property.
      let engine = AudioEngine(sampleRate: sr) { samples, count, startEpochMs in
        ring.write(samples, count: count)
        // Fed from the converter output, not from the ring: hops must be consecutive and
        // the ring only keeps the freshest window.
        onsets.feed(samples, count: count, startEpochMs: startEpochMs)
      }
      try engine.start()

      // Publish the session on processingQueue so it is sequenced with tick()/teardown().
      self.processingQueue.async {
        self.engine = engine
        self.ring = ring
        self.detector = detector
        self.startProcessing()
      }
    }

    AsyncFunction("stop") { () -> Void in
      self.teardown()
    }

    OnDestroy {
      self.teardown()
    }
  }

  // Must be called on processingQueue.
  private func startProcessing() {
    let t = DispatchSource.makeTimerSource(queue: processingQueue)
    // 15ms rather than 30 because the JS filter chain downstream (Median3, then the EMA
    // in TunerGate) is measured in *frames*, not milliseconds — halving the period
    // halves their wall-clock latency too, which is most of what this buys. Leeway
    // shrinks with it; at 15ms a 5ms slip is a third of the period.
    t.schedule(deadline: .now() + .milliseconds(15),
               repeating: .milliseconds(15),
               leeway: .milliseconds(2))
    t.setEventHandler { [weak self] in self?.tick() }
    self.timer = t
    t.resume()
  }

  // Runs on processingQueue at ~15ms cadence. Always analyzes the freshest window; the timer
  // coalesces missed firings, so a slow tick can't pile up a backlog of catch-up work.
  private func tick() {
    // Drained ahead of the pitch guard below: onsets must not wait on the ring filling,
    // and their timestamps are their own — a late tick does not make them late.
    for onset in onsets.drain() {
      sendEvent("onOnset", [
        "at":   onset.atMs,
        "peak": Double(onset.peak),
      ])
    }

    guard let ring = ring, let detector = detector, let window = ring.snapshot() else { return }

    var meanSquare: Float = 0
    vDSP_measqv(window, 1, &meanSquare, vDSP_Length(window.count))
    let rms = sqrt(meanSquare)

    let result = detector.detect(window)
    sendEvent("onPitch", [
      "frequency": result?.frequency ?? 0,
      "clarity":   result?.clarity   ?? 0,
      "rms":       Double(rms),
      "timestamp": Date().timeIntervalSince1970 * 1000,
    ])
  }

  private func teardown() {
    processingQueue.sync {
      timer?.cancel()
      timer = nil
      engine?.stop()
      engine = nil
      ring = nil
      detector = nil
      // Config survives; only the envelope history and any undrained detections go.
      onsets.reset()
    }
  }
}
