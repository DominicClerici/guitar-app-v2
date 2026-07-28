export class Median3 {
  private buf: number[] = [];

  push(v: number): number {
    this.buf.push(v);
    if (this.buf.length > 3) this.buf.shift();
    if (this.buf.length < 3) return v;
    const sorted = [...this.buf].sort((a, b) => a - b);
    return sorted[1];
  }

  reset() {
    this.buf = [];
  }
}

export class Ema {
  private value: number | null = null;

  constructor(private alpha: number) {}

  push(v: number): number {
    this.value = this.value === null ? v : this.alpha * v + (1 - this.alpha) * this.value;
    return this.value;
  }

  reset() {
    this.value = null;
  }
}
