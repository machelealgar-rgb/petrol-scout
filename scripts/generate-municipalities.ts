import axios from 'axios';

const CATALOG_URL = 'https://api-catalogo.cne.gob.mx/api/utiles/municipios';

const STATES = [
  { id: 1, name: 'Aguascalientes' },
  { id: 2, name: 'Baja California' },
  { id: 3, name: 'Baja California Sur' },
  { id: 4, name: 'Campeche' },
  { id: 5, name: 'Coahuila' },
  { id: 6, name: 'Colima' },
  { id: 7, name: 'Chiapas' },
  { id: 8, name: 'Chihuahua' },
  { id: 9, name: 'Ciudad de México' },
  { id: 10, name: 'Durango' },
  { id: 11, name: 'Guanajuato' },
  { id: 12, name: 'Guerrero' },
  { id: 13, name: 'Hidalgo' },
  { id: 14, name: 'Jalisco' },
  { id: 15, name: 'Estado de México' },
  { id: 16, name: 'Michoacán' },
  { id: 17, name: 'Morelos' },
  { id: 18, name: 'Nayarit' },
  { id: 19, name: 'Nuevo León' },
  { id: 20, name: 'Oaxaca' },
  { id: 21, name: 'Puebla' },
  { id: 22, name: 'Querétaro' },
  { id: 23, name: 'Quintana Roo' },
  { id: 24, name: 'San Luis Potosí' },
  { id: 25, name: 'Sinaloa' },
  { id: 26, name: 'Sonora' },
  { id: 27, name: 'Tabasco' },
  { id: 28, name: 'Tamaulipas' },
  { id: 29, name: 'Tlaxcala' },
  { id: 30, name: 'Veracruz' },
  { id: 31, name: 'Yucatán' },
  { id: 32, name: 'Zacatecas' },
];

interface Municipality {
  MunicipioId: string;
  Nombre: string;
}

async function fetchMunicipalities(stateId: number): Promise<Municipality[]> {
  try {
    const paddedId = String(stateId).padStart(2, '0');
    const response = await axios.get(CATALOG_URL, {
      params: { EntidadFederativaId: paddedId },
      timeout: 15_000,
    });
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching municipalities for state ${stateId}:`, error);
    return [];
  }
}

function generateMarkdown(data: Map<number, { name: string; municipalities: Municipality[] }>): string {
  let markdown = `# Mexican Municipalities - API Reference

Complete list of all Mexican municipalities (municipios) organized by state, with their IDs for use with the CNE API.

**Total Municipalities**: ${Array.from(data.values()).reduce((sum, state) => sum + state.municipalities.length, 0)}

---

`;

  // Generate table of contents
  markdown += `## Table of Contents\n\n`;
  Array.from(data.values()).forEach((state) => {
    const anchor = state.name.toLowerCase().replace(/\s+/g, '-').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
    markdown += `- [${state.name}](#${anchor})\n`;
  });
  markdown += '\n---\n\n';

  // Generate sections for each state
  Array.from(data.values()).forEach((state) => {
    markdown += `## ${state.name}\n\n`;
    markdown += `| ID | Municipality |\n`;
    markdown += `|----|---------------|\n`;
    state.municipalities.forEach((mun) => {
      markdown += `| ${mun.MunicipioId} | ${mun.Nombre} |\n`;
    });
    markdown += '\n';
  });

  return markdown;
}

async function main() {
  console.log('🔄 Fetching municipalities from CNE API...');
  console.log(`Total states to fetch: ${STATES.length}\n`);

  const data = new Map<number, { name: string; municipalities: Municipality[] }>();

  for (const state of STATES) {
    process.stdout.write(`[${state.id}/32] Fetching ${state.name}... `);
    const municipalities = await fetchMunicipalities(state.id);
    data.set(state.id, { name: state.name, municipalities });
    console.log(`✓ (${municipalities.length} municipalities)`);
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log('\n✅ All data fetched successfully!');

  const markdown = generateMarkdown(data);
  const fs = await import('fs');
  fs.writeFileSync('/Users/marcelo/Desktop/Proyectos/maybe/MUNICIPALITIES.md', markdown);

  const totalMunicipalities = Array.from(data.values()).reduce((sum, state) => sum + state.municipalities.length, 0);
  console.log(`\n📄 Generated MUNICIPALITIES.md with ${totalMunicipalities} total municipalities`);
}

main().catch(console.error);
