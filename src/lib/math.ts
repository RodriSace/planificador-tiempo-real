/** Máximo común divisor (algoritmo de Euclides). */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Mínimo común múltiplo de dos números. */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

/** Hiperperiodo: mínimo común múltiplo de todos los periodos. */
export function hyperperiod(periods: number[]): number {
  if (periods.length === 0) return 0;
  return periods.reduce((acc, p) => lcm(acc, p));
}
