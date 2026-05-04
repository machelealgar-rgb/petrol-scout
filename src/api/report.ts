import axios from 'axios';
import { EstacionesResponseSchema } from '../schemas.js';
import type { EstacionPrecio } from '../schemas.js';

const REPORT_URL =
  'https://api-reportediario.cne.gob.mx/api/EstacionServicio/Petroliferos';

export async function getEstaciones(
  stateId: number,
  municipioId: string
): Promise<EstacionPrecio[]> {
  const response = await axios.get(REPORT_URL, {
    params: { entidadId: stateId, municipioId },
    timeout: 15_000,
  });
  return EstacionesResponseSchema.parse(response.data);
}
