import AVFoundation
import Accelerate
import ExpoModulesCore

public class ExpoPitchDetectorModule: Module {
  private let windowSize = 2048
  private let defaultSampleRate: Double = 22050

  // engine/ring/detector/timer are owned by processingQueue: they are only read or written
  // from it (in tick, startProcessing, and the publish/teardown blocks). The real-time audio
  // tap never touches them — it writes into a ring instance captured directly in its closure.
  private let processingQueue = DispatchQueue(label: "expo.pitchdetector.processing")
  private var engine: AudioEngine?
  private var ring: SampleRing?
  private var detector: PitchDetectorMPM?
  private var timer: DispatchSourceTimer?

  public func definition() -> ModuleDefinition {
    Name("ExpoPitchDetector")

    Events("onPitch")

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

      // The tap captures this ring instance directly, so the real-time audio thread never
      // reads a shared mutable property.
      let engine = AudioEngine(sampleRate: sr) { samples, count in
        ring.write(samples, count: count)
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
    t.schedule(deadline: .now() + .milliseconds(30),
               repeating: .milliseconds(30),
               leeway: .milliseconds(5))
    t.setEventHandler { [weak self] in self?.tick() }
    self.timer = t
    t.resume()
  }

  // Runs on processingQueue at ~30ms cadence. Always analyzes the freshest window; the timer
  // coalesces missed firings, so a slow tick can't pile up a backlog of catch-up work.
  private func tick() {
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
    }
  }
}
