# Mexican States - API Reference

Complete list of all Mexican states (entidades federativas) with their IDs for use with the CNE API.

## States by ID

| ID | State Name |
|----|-----------|
| 01 | Aguascalientes |
| 02 | Baja California |
| 03 | Baja California Sur |
| 04 | Campeche |
| 05 | Coahuila |
| 06 | Colima |
| 07 | Chiapas |
| 08 | Chihuahua |
| 09 | Ciudad de México |
| 10 | Durango |
| 11 | Guanajuato |
| 12 | Guerrero |
| 13 | Hidalgo |
| 14 | Jalisco |
| 15 | Estado de México |
| 16 | Michoacán |
| 17 | Morelos |
| 18 | Nayarit |
| 19 | Nuevo León |
| 20 | Oaxaca |
| 21 | Puebla |
| 22 | Querétaro |
| 23 | Quintana Roo |
| 24 | San Luis Potosí |
| 25 | Sinaloa |
| 26 | Sonora |
| 27 | Tabasco |
| 28 | Tamaulipas |
| 29 | Tlaxcala |
| 30 | Veracruz |
| 31 | Yucatán |
| 32 | Zacatecas |

## Usage

Use the state ID with the `--state` parameter in the CLI:

```bash
petrol-scout --state <id> [options]
```

### Examples

```bash
# Fetch all gas stations in Aguascalientes
petrol-scout --state 01

# Fetch specific municipality in Ciudad de México
petrol-scout --state 09 --municipality 001

# Export Estado de México data to JSON
petrol-scout --state 15 --output json --file edomex-all.json

# Get Sonora data as CSV
petrol-scout --state 26 --output csv --file sonora-prices.csv
```

## Reference

These IDs correspond to the `EntidadFederativaId` parameter in the CNE API:

- **Catalog API**: `https://api-catalogo.cne.gob.mx/api/utiles/municipios?EntidadFederativaId=<id>`
- **Report API**: `https://api-reportediario.cne.gob.mx/api/EstacionServicio/Petroliferos?entidadId=<id>&municipioId=<municipioId>`

Both endpoints are public and require no authentication.
