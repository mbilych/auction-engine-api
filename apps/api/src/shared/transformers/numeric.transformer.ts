// Transformer to convert string decimals from DB to numbers in JS
export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number | string {
    return data ? parseFloat(data) : data;
  }
}
