import axios from 'axios';
import { MunicipiosResponseSchema } from '../schemas.js';
import type { Municipio } from '../schemas.js';

const CATALOG_URL = 'https://api-catalogo.cne.gob.mx/api/utiles/municipios';

export async function getMunicipios(stateId: number): Promise<Municipio[]> {
  const response = await axios.get(CATALOG_URL, {
    params: { EntidadFederativaId: String(stateId).padStart(2, '0') },
    timeout: 15_000,
  });
  return MunicipiosResponseSchema.parse(response.data);
}
