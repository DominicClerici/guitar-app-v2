// modules/expo-pitch-detector/ios/PitchDetectorMPM.swift
import Accelerate
import Foundation

public struct PitchResult {
  public let frequency: Double
  public let clarity: Double
}

public final class PitchDetectorMPM {
  private let sampleRate: Double
  private let n: Int
  private let window: [Float]
  private let clarityFloor: Double = 0.6
  private let kCutoff: Double = 0.93
  private let minFreq: Double = 55
  private let maxFreq: Double = 1500

  public init(sampleRate: Double, windowSize: Int) {
    self.sampleRate = sampleRate
    self.n = windowSize
    self.window = (0..<windowSize).map { i in
      0.5 * (1 - cos(2 * .pi * Float(i) / Float(windowSize - 1)))
    }
  }

  public func detect(_ samples: [Float]) -> PitchResult? {
    guard samples.count >= n else { return nil }

    // Hann-window the signal (Float), then promote to Double for the NSDF math.
    var windowed = [Float](repeating: 0, count: n)
    vDSP_vmul(samples, 1, window, 1, &windowed, 1, vDSP_Length(n))
    var x = [Double](repeating: 0, count: n)
    vDSP_vspdp(windowed, 1, &x, 1, vDSP_Length(n))

    // Prefix sums of squares make the NSDF normalizer an O(1) lookup:
    //   m(tau) = sum_{i<n-tau} x[i]^2 + sum_{i<n-tau} x[i+tau]^2
    //          = prefix[n-tau] + (prefix[n] - prefix[tau])
    var sq = [Double](repeating: 0, count: n)
    vDSP_vsqD(x, 1, &sq, 1, vDSP_Length(n))
    var prefix = [Double](repeating: 0, count: n + 1)
    var running: Double = 0
    for i in 0..<n {
      running += sq[i]
      prefix[i + 1] = running
    }
    let total = prefix[n]

    let maxLag = n / 2
    let minLag = max(2, Int(sampleRate / maxFreq))
    let maxAllowedLag = min(maxLag, Int(sampleRate / minFreq))

    var nsdf = [Double](repeating: 0, count: maxAllowedLag + 1)
    x.withUnsafeBufferPointer { xp in
      let base = xp.baseAddress!
      for tau in 0...maxAllowedLag {
        var acf: Double = 0
        vDSP_dotprD(base, 1, base + tau, 1, &acf, vDSP_Length(n - tau))
        let m = prefix[n - tau] + (total - prefix[tau])
        nsdf[tau] = (m > 0) ? (2 * acf / m) : 0
      }
    }

    // --- peak picking (unchanged from the scalar implementation) ---
    // Skip the initial positive lobe (NSDF starts at 1.0 and descends through its
    // first zero-crossing) so the scan doesn't latch onto that descent.
    var i = minLag
    while i < maxAllowedLag && nsdf[i] > 0 { i += 1 }

    // Key maxima: highest peak in each positively-sloped region between zero-crossings.
    var peaks: [(tau: Int, val: Double)] = []
    while i < maxAllowedLag {
      if nsdf[i] > 0 {
        var j = i
        var best = (tau: j, val: nsdf[j])
        while j < maxAllowedLag && nsdf[j] > 0 {
          if nsdf[j] > best.val { best = (tau: j, val: nsdf[j]) }
          j += 1
        }
        peaks.append(best)
        i = j + 1
      } else {
        i += 1
      }
    }
    guard let maxVal = peaks.map({ $0.val }).max() else { return nil }
    guard let chosen = peaks.first(where: { $0.val >= kCutoff * maxVal }) else { return nil }

    let tau = chosen.tau
    let y0 = (tau > 0) ? nsdf[tau - 1] : nsdf[tau]
    let y1 = nsdf[tau]
    let y2 = (tau + 1 <= maxAllowedLag) ? nsdf[tau + 1] : nsdf[tau]
    let denom = (y0 - 2 * y1 + y2)
    let shift = denom == 0 ? 0 : 0.5 * (y0 - y2) / denom
    let tauStar = Double(tau) + shift

    let freq = sampleRate / tauStar
    let clarity = y1
    if clarity < clarityFloor { return nil }
    if freq < minFreq || freq > maxFreq { return nil }
    return PitchResult(frequency: freq, clarity: clarity)
  }
}
