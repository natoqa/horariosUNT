import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Obteniendo período activo...');
  let { data: periodoActivo, error: errPeriodo } = await supabase
    .from('periodos')
    .select('id, nombre')
    .eq('estado', 'Activo')
    .single();

  if (errPeriodo || !periodoActivo) {
    console.log('No activo found, obtaining any period...');
    const res = await supabase.from('periodos').select('id, nombre').limit(1).single();
    periodoActivo = res.data;
  }

  if (!periodoActivo) {
    console.error('No se encontró NINGÚN período en la base de datos.');
    process.exit(1);
  }
  
  console.log(`Período activo: ${periodoActivo.nombre} (${periodoActivo.id})`);

  console.log('Obteniendo cursos activos...');
  const { data: cursos, error: errCursos } = await supabase
    .from('cursos')
    .select('id, nombre, ciclo')
    .eq('estado', 'Activo');

  if (errCursos || !cursos || cursos.length === 0) {
    console.error('No se encontraron cursos activos.');
    process.exit(1);
  }

  console.log(`Se encontraron ${cursos.length} cursos activos.`);
  let count = 0;

  for (const curso of cursos) {
    // Check if group A already exists
    const { data: existingGroups } = await supabase
      .from('grupos')
      .select('id')
      .eq('curso_id', curso.id)
      .eq('periodo_id', periodoActivo.id)
      .eq('nombre', 'A');

    if (!existingGroups || existingGroups.length === 0) {
      const { error: insertErr } = await supabase
        .from('grupos')
        .insert({
          curso_id: curso.id,
          periodo_id: periodoActivo.id,
          nombre: 'A',
          num_estudiantes: 30
        });
      
      if (!insertErr) {
        count++;
        console.log(`Creado Grupo A para curso: ${curso.nombre}`);
      } else {
        console.error(`Error al crear grupo para ${curso.nombre}:`, insertErr);
      }
    }
  }

  console.log(`\n¡Listo! Se crearon ${count} grupos 'A' exitosamente.`);
}

main();
