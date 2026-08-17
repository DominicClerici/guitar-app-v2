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
