import type { EstacionPrecio } from '../schemas.js';
import type { OutputFormat } from '../types.js';
import { toJson } from './json.js';
import { toCsv } from './csv.js';
import { toXlsx } from './xlsx.js';

export async function exportData(
  format: OutputFormat,
  stations: EstacionPrecio[]
): Promise<string | Buffer> {
  switch (format) {
    case 'json': return toJson(stations);
    case 'csv': return toCsv(stations);
    case 'xlsx': return toXlsx(stations);
  }
}
