import Foundation

/// Fixed-capacity circular buffer holding the most recent `capacity` samples.
/// Thread-safe for one writer (audio tap thread) and one reader (processing queue).
final class SampleRing {
  private let capacity: Int
  private var buffer: [Float]
  private var writeIndex = 0
  private var filled = 0
  private let lock = NSLock()

  init(capacity: Int) {
    precondition(capacity > 0, "SampleRing capacity must be positive")
    self.capacity = capacity
    self.buffer = [Float](repeating: 0, count: capacity)
  }

  func write(_ samples: UnsafePointer<Float>, count: Int) {
    lock.lock()
    defer { lock.unlock() }
    for i in 0..<count {
      buffer[writeIndex] = samples[i]
      writeIndex = (writeIndex + 1) % capacity
    }
    filled = min(filled + count, capacity)
  }

  /// The most recent `capacity` samples in chronological order, or nil if not yet full.
  func snapshot() -> [Float]? {
    // Allocate outside the lock so malloc never contends with the audio thread.
    var out = [Float](repeating: 0, count: capacity)
    lock.lock()
    defer { lock.unlock() }
    guard filled >= capacity else { return nil }
    // When full, the oldest sample sits at writeIndex (the next slot to overwrite).
    for i in 0..<capacity {
      out[i] = buffer[(writeIndex + i) % capacity]
    }
    return out
  }

  func clear() {
    lock.lock()
    defer { lock.unlock() }
    writeIndex = 0
    filled = 0
  }
}
