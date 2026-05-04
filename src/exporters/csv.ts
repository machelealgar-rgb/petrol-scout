import { stringify } from 'csv-stringify/sync';
import type { EstacionPrecio } from '../schemas.js';

const HEADERS: (keyof EstacionPrecio)[] = [
  'Numero', 'Nombre', 'Direccion', 'Producto', 'SubProducto',
  'PrecioVigente', 'EntidadFederativaId', 'MunicipioId',
];

export async function toCsv(stations: EstacionPrecio[]): Promise<string> {
  const rows = stations.map((s) => HEADERS.map((h) => s[h] ?? ''));
  return stringify([HEADERS, ...rows]);
}
