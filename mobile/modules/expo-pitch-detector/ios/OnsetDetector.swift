// modules/expo-pitch-detector/ios/OnsetDetector.swift
import Foundation

struct Onset {
  let atMs: Double
  let peak: Float
}

/// Envelope-following transient detector, fed from the real-time audio thread.
///
/// It never emits from that thread: detections land on a small lock-protected queue
/// that the module's processing timer drains, the same split the pitch path uses.
///
/// The hop size is fixed in the *target* sample-rate domain, so it must be fed from the
/// converter's output rather than from `SampleRing` — the ring only ever holds the
/// freshest 4096 samples and would silently drop hops between reads.
final class OnsetDetector {
  /// Sized to hold the hop near 10ms across sample-rate changes: the rhythm feature's
  /// calibration is tuned against that duration, not against a sample count.
  private let hopSize = 512
  /// `peak` spans the crossing hop and the two after it, which defers emission by
  /// ~21ms at 48000 Hz. Late with an honest `atMs` beats prompt with a peak measured
  /// before the transient finished rising.
  private let peakHops = 3
  /// A consumer that stops draining must not turn into unbounded memory. The oldest
  /// detection is the least useful one to keep.
  private let maxQueued = 64

  private let lock = NSLock()
  private var sampleRate: Double = 48000
  private var enabled = false
  private var threshold: Float = 0
  private var refractoryMs: Double = 0

  private var hopSumSquares: Double = 0
  private var hopFilled = 0
  private var hopStartMs: Double = 0
  private var previousRms: Float?
  private var lastOnsetMs = -Double.infinity
  private var pending: (atMs: Double, peak: Float, hopsLeft: Int)?
  private var queue: [Onset] = []

  /// Valid at any point in the session lifecycle — the detector outlives the capture it
  /// is attached to, so JS can arm onsets before the mic is even open.
  func configure(enabled: Bool, threshold: Float, refractoryMs: Double) {
    lock.lock()
    defer { lock.unlock() }
    self.enabled = enabled
    self.threshold = threshold
    self.refractoryMs = refractoryMs
    if !enabled { resetLocked() }
  }

  /// A capture session is starting: the sample rate fixes the hop duration, and nothing
  /// from the previous session may leak into this one's envelope history.
  func begin(sampleRate: Double) {
    lock.lock()
    defer { lock.unlock() }
    self.sampleRate = sampleRate
    resetLocked()
  }

  func reset() {
    lock.lock()
    defer { lock.unlock() }
    resetLocked()
  }

  func feed(_ samples: UnsafePointer<Float>, count: Int, startEpochMs: Double) {
    lock.lock()
    defer { lock.unlock() }
    guard enabled, sampleRate > 0 else { return }

    var i = 0
    while i < count {
      if hopFilled == 0 {
        hopStartMs = startEpochMs + Double(i) / sampleRate * 1000
      }
      let take = min(hopSize - hopFilled, count - i)
      var sum = hopSumSquares
      for k in i..<(i + take) {
        let v = Double(samples[k])
        sum += v * v
      }
      hopSumSquares = sum
      hopFilled += take
      i += take

      if hopFilled == hopSize {
        let rms = Float((hopSumSquares / Double(hopSize)).squareRoot())
        processHop(rms: rms, atMs: hopStartMs)
        hopSumSquares = 0
        hopFilled = 0
      }
    }
  }

  func drain() -> [Onset] {
    lock.lock()
    defer { lock.unlock() }
    if queue.isEmpty { return [] }
    let out = queue
    queue.removeAll(keepingCapacity: true)
    return out
  }

  // Must be called with `lock` held.
  private func processHop(rms: Float, atMs: Double) {
    if var p = pending {
      p.peak = max(p.peak, rms)
      p.hopsLeft -= 1
      if p.hopsLeft <= 0 {
        enqueueLocked(Onset(atMs: p.atMs, peak: p.peak))
        pending = nil
      } else {
        pending = p
      }
    }

    // A rising edge needs something to rise from, so the first hop after a reset can
    // never open one.
    if let previous = previousRms,
       previous < threshold,
       rms >= threshold,
       atMs - lastOnsetMs >= refractoryMs {
      // A refractory shorter than the peak window can open a second onset while the
      // first is still measuring. Publish that one with what it has rather than lose it.
      if let p = pending {
        enqueueLocked(Onset(atMs: p.atMs, peak: p.peak))
        pending = nil
      }
      lastOnsetMs = atMs
      pending = (atMs: atMs, peak: rms, hopsLeft: peakHops - 1)
    }

    previousRms = rms
  }

  // Must be called with `lock` held.
  private func enqueueLocked(_ onset: Onset) {
    if queue.count >= maxQueued { queue.removeFirst() }
    queue.append(onset)
  }

  // Must be called with `lock` held.
  private func resetLocked() {
    hopSumSquares = 0
    hopFilled = 0
    hopStartMs = 0
    previousRms = nil
    lastOnsetMs = -Double.infinity
    pending = nil
    queue.removeAll(keepingCapacity: true)
  }
}
