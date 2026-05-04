import { z } from 'zod';

export const MunicipioSchema = z.object({
  MunicipioId: z.string(),
  Nombre: z.string(),
});

export const MunicipiosResponseSchema = z.array(MunicipioSchema);

export const EstacionPrecioSchema = z.object({
  Numero: z.string(),
  Nombre: z.string(),
  Direccion: z.string(),
  Producto: z.string(),
  SubProducto: z.string(),
  PrecioVigente: z.number().nullable(),
  EntidadFederativaId: z.number().int(),
  MunicipioId: z.string(),
});

export const EstacionesResponseSchema = z.array(EstacionPrecioSchema);

export type Municipio = z.infer<typeof MunicipioSchema>;
export type EstacionPrecio = z.infer<typeof EstacionPrecioSchema>;
