/** Fiyatı para birimi biçiminde gösterir. DummyJSON fiyatları USD cinsindedir. */
export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
