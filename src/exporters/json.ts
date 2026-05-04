import type { EstacionPrecio } from '../schemas.js';

export function toJson(stations: EstacionPrecio[]): string {
  return JSON.stringify(stations, null, 2);
}
