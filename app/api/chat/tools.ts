import { createClient } from '@/shared/lib/supabase/server';
import { tool } from 'ai';

export const chatTools = {
  getCourses: tool({
    description: 'Obtener lista de cursos del sistema',
    parameters: {
      search: {
        type: 'string',
        description: 'Término de búsqueda para filtrar cursos por nombre o código',
      },
    },
    execute: async ({ search }: { search?: string }) => {
      const supabase = await createClient();
      let query = supabase.from('cursos').select('*').eq('estado', 'Activo');

      if (search) {
        query = query.or(`nombre.ilike.%${search}%,codigo.ilike.%${search}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  }),

  getCourseDetails: tool({
    description: 'Obtener detalles de un curso específico por su código',
    parameters: {
      codigo: {
        type: 'string',
        description: 'Código del curso (ej: CS101)',
      },
    },
    execute: async ({ codigo }: { codigo: string }) => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  }),

  getTeachers: tool({
    description: 'Obtener lista de docentes del sistema',
    parameters: {
      search: {
        type: 'string',
        description: 'Término de búsqueda para filtrar por nombres o apellidos',
      },
      escuela: {
        type: 'string',
        description: 'Filtrar por escuela específica',
      },
    },
    execute: async ({ search, escuela }: { search?: string; escuela?: string }) => {
      const supabase = await createClient();
      let query = supabase
        .from('docentes')
        .select('*')
        .eq('estado', 'Activo');

      if (search) {
        query = query.or(`nombres.ilike.%${search}%,apellidos.ilike.%${search}%`);
      }

      if (escuela) {
        query = query.eq('escuela', escuela);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  }),

  getTeacherByDni: tool({
    description: 'Obtener información de un docente por su DNI',
    parameters: {
      dni: {
        type: 'string',
        description: 'DNI del docente (8 dígitos)',
      },
    },
    execute: async ({ dni }: { dni: string }) => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('docentes')
        .select('*')
        .eq('dni', dni)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  }),

  getPeriods: tool({
    description: 'Obtener lista de periodos académicos',
    parameters: {},
    execute: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('periodos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  }),

  getClassrooms: tool({
    description: 'Obtener lista de aulas disponibles',
    parameters: {
      tipo: {
        type: 'string',
        description: 'Filtrar por tipo de aula (Aula Teórica, Laboratorio de Cómputo, etc)',
      },
    },
    execute: async ({ tipo }: { tipo?: string }) => {
      const supabase = await createClient();
      let query = supabase
        .from('aulas')
        .select('*')
        .eq('estado', 'Activa');

      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  }),

  getStudyPlans: tool({
    description: 'Obtener planes de estudio disponibles',
    parameters: {},
    execute: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('planes_estudio')
        .select('*')
        .eq('estado', 'Activo')
        .order('anio', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  }),

  getActivePeriod: tool({
    description: 'Obtener el periodo académico actual activo',
    parameters: {},
    execute: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('periodos')
        .select('*')
        .in('state', ['Recopilación', 'Generación', 'Aprobado', 'Publicado'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      return data?.[0] || null;
    },
  }),

  getCourseGroups: tool({
    description: 'Obtener grupos (secciones) de un curso en un periodo específico',
    parameters: {
      cursoCodigo: {
        type: 'string',
        description: 'Código del curso',
      },
      periodoId: {
        type: 'string',
        description: 'ID del periodo académico (opcional, usa el periodo activo si no se proporciona)',
      },
    },
    execute: async ({ cursoCodigo, periodoId }: { cursoCodigo: string; periodoId?: string }) => {
      const supabase = await createClient();

      // First get the course ID
      const { data: course, error: courseError } = await supabase
        .from('cursos')
        .select('id')
        .eq('codigo', cursoCodigo)
        .single();

      if (courseError || !course) {
        throw new Error('Curso no encontrado');
      }

      // If no periodoId provided, get the active period
      let targetPeriodId = periodoId;
      if (!targetPeriodId) {
        const { data: period } = await supabase
          .from('periodos')
          .select('id')
          .in('state', ['Recopilación', 'Generación', 'Aprobado', 'Publicado'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (period && period.length > 0) {
          targetPeriodId = period[0].id;
        }
      }

      if (!targetPeriodId) {
        throw new Error('No hay periodo activo disponible');
      }

      // Get groups with teacher info
      const { data, error } = await supabase
        .from('grupos')
        .select(`
          *,
          docentes (
            id,
            nombres,
            apellidos,
            correo
          )
        `)
        .eq('curso_id', course.id)
        .eq('periodo_id', targetPeriodId);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  }),

  assignTeacherToGroup: tool({
    description: 'Asignar un docente a un grupo (sección) de un curso',
    parameters: {
      grupoId: {
        type: 'string',
        description: 'ID del grupo (sección)',
      },
      docenteDni: {
        type: 'string',
        description: 'DNI del docente a asignar',
      },
    },
    execute: async ({ grupoId, docenteDni }: { grupoId: string; docenteDni: string }) => {
      const supabase = await createClient();

      // Get teacher by DNI
      const { data: teacher, error: teacherError } = await supabase
        .from('docentes')
        .select('id')
        .eq('dni', docenteDni)
        .single();

      if (teacherError || !teacher) {
        throw new Error('Docente no encontrado con el DNI proporcionado');
      }

      // Update the group with the teacher
      const { data, error } = await supabase
        .from('grupos')
        .update({ docente_id: teacher.id })
        .eq('id', grupoId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Docente asignado exitosamente al grupo`,
        group: data,
      };
    },
  }),

  createCourse: tool({
    description: 'Crear un nuevo curso en el sistema',
    parameters: {
      codigo: {
        type: 'string',
        description: 'Código único del curso (ej: CS101)',
      },
      nombre: {
        type: 'string',
        description: 'Nombre del curso',
      },
      ciclo: {
        type: 'string',
        description: 'Ciclo del curso (I, II, III, IV, V, VI, VII, VIII, IX, X)',
      },
      tipo: {
        type: 'string',
        description: 'Tipo de curso (Teórico, Práctico, Teórico-Práctico)',
      },
      horasTeoricas: {
        type: 'number',
        description: 'Horas teóricas semanales',
      },
      horasPracticas: {
        type: 'number',
        description: 'Horas prácticas semanales',
      },
      creditos: {
        type: 'number',
        description: 'Número de créditos del curso',
      },
      requiereLaboratorio: {
        type: 'boolean',
        description: 'Si el curso requiere laboratorio',
      },
      tipoLaboratorio: {
        type: 'string',
        description: 'Tipo de laboratorio requerido (si aplica)',
      },
    },
    execute: async ({
      codigo,
      nombre,
      ciclo,
      tipo,
      horasTeoricas,
      horasPracticas,
      creditos,
      requiereLaboratorio,
      tipoLaboratorio,
    }: {
      codigo: string;
      nombre: string;
      ciclo: string;
      tipo: string;
      horasTeoricas?: number;
      horasPracticas?: number;
      creditos?: number;
      requiereLaboratorio?: boolean;
      tipoLaboratorio?: string;
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('cursos')
        .insert({
          codigo,
          nombre,
          ciclo,
          tipo,
          horas_teoricas: horasTeoricas || 0,
          horas_practicas: horasPracticas || 0,
          creditos: creditos || 0,
          requiere_laboratorio: requiereLaboratorio || false,
          tipo_laboratorio: tipoLaboratorio || null,
          estado: 'Activo',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Curso creado exitosamente`,
        course: data,
      };
    },
  }),

  updateCourse: tool({
    description: 'Actualizar un curso existente',
    parameters: {
      codigo: {
        type: 'string',
        description: 'Código del curso a actualizar',
      },
      nombre: {
        type: 'string',
        description: 'Nuevo nombre del curso',
      },
      ciclo: {
        type: 'string',
        description: 'Nuevo ciclo del curso',
      },
      tipo: {
        type: 'string',
        description: 'Nuevo tipo de curso',
      },
      horasTeoricas: {
        type: 'number',
        description: 'Nuevas horas teóricas',
      },
      horasPracticas: {
        type: 'number',
        description: 'Nuevas horas prácticas',
      },
      creditos: {
        type: 'number',
        description: 'Nuevo número de créditos',
      },
      estado: {
        type: 'string',
        description: 'Nuevo estado (Activo, Inactivo)',
      },
    },
    execute: async ({
      codigo,
      nombre,
      ciclo,
      tipo,
      horasTeoricas,
      horasPracticas,
      creditos,
      estado,
    }: {
      codigo: string;
      nombre?: string;
      ciclo?: string;
      tipo?: string;
      horasTeoricas?: number;
      horasPracticas?: number;
      creditos?: number;
      estado?: string;
    }) => {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (ciclo !== undefined) updateData.ciclo = ciclo;
      if (tipo !== undefined) updateData.tipo = tipo;
      if (horasTeoricas !== undefined) updateData.horas_teoricas = horasTeoricas;
      if (horasPracticas !== undefined) updateData.horas_practicas = horasPracticas;
      if (creditos !== undefined) updateData.creditos = creditos;
      if (estado !== undefined) updateData.estado = estado;

      const { data, error } = await supabase
        .from('cursos')
        .update(updateData)
        .eq('codigo', codigo)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Curso actualizado exitosamente`,
        course: data,
      };
    },
  }),

  deleteCourse: tool({
    description: 'Eliminar un curso (cambiar estado a Inactivo)',
    parameters: {
      codigo: {
        type: 'string',
        description: 'Código del curso a eliminar',
      },
    },
    execute: async ({ codigo }: { codigo: string }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('cursos')
        .update({ estado: 'Inactivo' })
        .eq('codigo', codigo)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Curso eliminado (estado cambiado a Inactivo)`,
        course: data,
      };
    },
  }),

  createTeacher: tool({
    description: 'Crear un nuevo docente en el sistema',
    parameters: {
      nombres: {
        type: 'string',
        description: 'Nombres del docente',
      },
      apellidos: {
        type: 'string',
        description: 'Apellidos del docente',
      },
      dni: {
        type: 'string',
        description: 'DNI del docente (8 dígitos)',
      },
      correo: {
        type: 'string',
        description: 'Correo electrónico del docente',
      },
      telefono: {
        type: 'string',
        description: 'Teléfono del docente',
      },
      categoria: {
        type: 'string',
        description: 'Categoría (Principal, Asociado, Auxiliar)',
      },
      regimen: {
        type: 'string',
        description: 'Régimen (Dedicación Exclusiva, Tiempo Completo, Tiempo Parcial)',
      },
      condicion: {
        type: 'string',
        description: 'Condición (Nombrado, Contratado)',
      },
      escuela: {
        type: 'string',
        description: 'Escuela del docente',
      },
      fechaIngreso: {
        type: 'string',
        description: 'Fecha de ingreso (YYYY-MM-DD)',
      },
      cargaMaxima: {
        type: 'number',
        description: 'Carga máxima horaria',
      },
    },
    execute: async ({
      nombres,
      apellidos,
      dni,
      correo,
      telefono,
      categoria,
      regimen,
      condicion,
      escuela,
      fechaIngreso,
      cargaMaxima,
    }: {
      nombres: string;
      apellidos: string;
      dni: string;
      correo: string;
      telefono?: string;
      categoria: string;
      regimen: string;
      condicion: string;
      escuela: string;
      fechaIngreso: string;
      cargaMaxima?: number;
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('docentes')
        .insert({
          nombres,
          apellidos,
          dni,
          correo,
          telefono: telefono || null,
          categoria,
          regimen,
          condicion,
          escuela,
          fecha_ingreso: fechaIngreso,
          carga_maxima: cargaMaxima || 40,
          estado: 'Activo',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Docente creado exitosamente`,
        teacher: data,
      };
    },
  }),

  updateTeacher: tool({
    description: 'Actualizar un docente existente',
    parameters: {
      dni: {
        type: 'string',
        description: 'DNI del docente a actualizar',
      },
      nombres: {
        type: 'string',
        description: 'Nuevos nombres del docente',
      },
      apellidos: {
        type: 'string',
        description: 'Nuevos apellidos del docente',
      },
      correo: {
        type: 'string',
        description: 'Nuevo correo electrónico',
      },
      telefono: {
        type: 'string',
        description: 'Nuevo teléfono',
      },
      categoria: {
        type: 'string',
        description: 'Nueva categoría',
      },
      regimen: {
        type: 'string',
        description: 'Nuevo régimen',
      },
      condicion: {
        type: 'string',
        description: 'Nueva condición',
      },
      escuela: {
        type: 'string',
        description: 'Nueva escuela',
      },
      estado: {
        type: 'string',
        description: 'Nuevo estado (Activo, Inactivo)',
      },
    },
    execute: async ({
      dni,
      nombres,
      apellidos,
      correo,
      telefono,
      categoria,
      regimen,
      condicion,
      escuela,
      estado,
    }: {
      dni: string;
      nombres?: string;
      apellidos?: string;
      correo?: string;
      telefono?: string;
      categoria?: string;
      regimen?: string;
      condicion?: string;
      escuela?: string;
      estado?: string;
    }) => {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {};
      if (nombres !== undefined) updateData.nombres = nombres;
      if (apellidos !== undefined) updateData.apellidos = apellidos;
      if (correo !== undefined) updateData.correo = correo;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (categoria !== undefined) updateData.categoria = categoria;
      if (regimen !== undefined) updateData.regimen = regimen;
      if (condicion !== undefined) updateData.condicion = condicion;
      if (escuela !== undefined) updateData.escuela = escuela;
      if (estado !== undefined) updateData.estado = estado;

      const { data, error } = await supabase
        .from('docentes')
        .update(updateData)
        .eq('dni', dni)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Docente actualizado exitosamente`,
        teacher: data,
      };
    },
  }),

  deleteTeacher: tool({
    description: 'Eliminar un docente (cambiar estado a Inactivo)',
    parameters: {
      dni: {
        type: 'string',
        description: 'DNI del docente a eliminar',
      },
    },
    execute: async ({ dni }: { dni: string }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('docentes')
        .update({ estado: 'Inactivo' })
        .eq('dni', dni)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Docente eliminado (estado cambiado a Inactivo)`,
        teacher: data,
      };
    },
  }),

  createPeriod: tool({
    description: 'Crear un nuevo periodo académico',
    parameters: {
      name: {
        type: 'string',
        description: 'Nombre del periodo',
      },
      tipoCiclo: {
        type: 'string',
        description: 'Tipo de ciclo (Impar, Par)',
      },
      startDate: {
        type: 'string',
        description: 'Fecha de inicio (YYYY-MM-DD)',
      },
      endDate: {
        type: 'string',
        description: 'Fecha de fin (YYYY-MM-DD)',
      },
      availabilityDeadline: {
        type: 'string',
        description: 'Fecha límite de disponibilidad (YYYY-MM-DD)',
      },
    },
    execute: async ({
      name,
      tipoCiclo,
      startDate,
      endDate,
      availabilityDeadline,
    }: {
      name: string;
      tipoCiclo: string;
      startDate: string;
      endDate: string;
      availabilityDeadline: string;
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('periodos')
        .insert({
          name,
          tipo_ciclo: tipoCiclo,
          start_date: startDate,
          end_date: endDate,
          availability_deadline: availabilityDeadline,
          state: 'Configuración',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Periodo creado exitosamente`,
        period: data,
      };
    },
  }),

  updatePeriod: tool({
    description: 'Actualizar un periodo académico',
    parameters: {
      id: {
        type: 'string',
        description: 'ID del periodo a actualizar',
      },
      name: {
        type: 'string',
        description: 'Nuevo nombre del periodo',
      },
      state: {
        type: 'string',
        description: 'Nuevo estado (Configuración, Recopilación, Generación, Aprobado, Publicado, Cerrado)',
      },
    },
    execute: async ({
      id,
      name,
      state,
    }: {
      id: string;
      name?: string;
      state?: string;
    }) => {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (state !== undefined) updateData.state = state;

      const { data, error } = await supabase
        .from('periodos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Periodo actualizado exitosamente`,
        period: data,
      };
    },
  }),

  createClassroom: tool({
    description: 'Crear una nueva aula',
    parameters: {
      codigo: {
        type: 'string',
        description: 'Código único del aula',
      },
      nombre: {
        type: 'string',
        description: 'Nombre del aula',
      },
      pabellon: {
        type: 'string',
        description: 'Pabellón del aula',
      },
      piso: {
        type: 'number',
        description: 'Piso del aula',
      },
      capacidad: {
        type: 'number',
        description: 'Capacidad del aula',
      },
      tipo: {
        type: 'string',
        description: 'Tipo de aula (Aula Teórica, Laboratorio de Cómputo, Laboratorio Especializado, Auditorio)',
      },
      equipamiento: {
        type: 'string',
        description: 'Equipamiento del aula (separado por comas)',
      },
    },
    execute: async ({
      codigo,
      nombre,
      pabellon,
      piso,
      capacidad,
      tipo,
      equipamiento,
    }: {
      codigo: string;
      nombre: string;
      pabellon?: string;
      piso?: number;
      capacidad?: number;
      tipo: string;
      equipamiento?: string;
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('aulas')
        .insert({
          codigo,
          nombre,
          pabellon: pabellon || null,
          piso: piso || null,
          capacidad: capacidad || 30,
          tipo,
          equipamiento: equipamiento ? equipamiento.split(',').map(e => e.trim()) : null,
          estado: 'Activa',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Aula creada exitosamente`,
        classroom: data,
      };
    },
  }),

  updateClassroom: tool({
    description: 'Actualizar un aula existente',
    parameters: {
      codigo: {
        type: 'string',
        description: 'Código del aula a actualizar',
      },
      nombre: {
        type: 'string',
        description: 'Nuevo nombre del aula',
      },
      capacidad: {
        type: 'number',
        description: 'Nueva capacidad',
      },
      estado: {
        type: 'string',
        description: 'Nuevo estado (Activa, Inactiva, Mantenimiento)',
      },
    },
    execute: async ({
      codigo,
      nombre,
      capacidad,
      estado,
    }: {
      codigo: string;
      nombre?: string;
      capacidad?: number;
      estado?: string;
    }) => {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (capacidad !== undefined) updateData.capacidad = capacidad;
      if (estado !== undefined) updateData.estado = estado;

      const { data, error } = await supabase
        .from('aulas')
        .update(updateData)
        .eq('codigo', codigo)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Aula actualizada exitosamente`,
        classroom: data,
      };
    },
  }),

  createStudyPlan: tool({
    description: 'Crear un nuevo plan de estudio',
    parameters: {
      nombre: {
        type: 'string',
        description: 'Nombre del plan de estudio',
      },
      anio: {
        type: 'number',
        description: 'Año del plan de estudio',
      },
      pdfUrl: {
        type: 'string',
        description: 'URL del PDF del plan',
      },
    },
    execute: async ({
      nombre,
      anio,
      pdfUrl,
    }: {
      nombre: string;
      anio: number;
      pdfUrl?: string;
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('planes_estudio')
        .insert({
          nombre,
          anio,
          pdf_url: pdfUrl || null,
          estado: 'Activo',
          fecha_publicacion: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Plan de estudio creado exitosamente`,
        plan: data,
      };
    },
  }),

  createGroup: tool({
    description: 'Crear un nuevo grupo (sección) para un curso',
    parameters: {
      cursoCodigo: {
        type: 'string',
        description: 'Código del curso',
      },
      periodoId: {
        type: 'string',
        description: 'ID del periodo académico',
      },
      nombre: {
        type: 'string',
        description: 'Nombre del grupo (ej: A, B, C)',
      },
      numEstudiantes: {
        type: 'number',
        description: 'Número de estudiantes',
      },
    },
    execute: async ({
      cursoCodigo,
      periodoId,
      nombre,
      numEstudiantes,
    }: {
      cursoCodigo: string;
      periodoId: string;
      nombre: string;
      numEstudiantes?: number;
    }) => {
      const supabase = await createClient();

      // Get course ID
      const { data: course, error: courseError } = await supabase
        .from('cursos')
        .select('id')
        .eq('codigo', cursoCodigo)
        .single();

      if (courseError || !course) {
        throw new Error('Curso no encontrado');
      }

      const { data, error } = await supabase
        .from('grupos')
        .insert({
          curso_id: course.id,
          periodo_id: periodoId,
          nombre,
          num_estudiantes: numEstudiantes || 30,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Grupo creado exitosamente`,
        group: data,
      };
    },
  }),

  updateGroup: tool({
    description: 'Actualizar un grupo existente',
    parameters: {
      id: {
        type: 'string',
        description: 'ID del grupo a actualizar',
      },
      nombre: {
        type: 'string',
        description: 'Nuevo nombre del grupo',
      },
      numEstudiantes: {
        type: 'number',
        description: 'Nuevo número de estudiantes',
      },
    },
    execute: async ({
      id,
      nombre,
      numEstudiantes,
    }: {
      id: string;
      nombre?: string;
      numEstudiantes?: number;
    }) => {
      const supabase = await createClient();

      const updateData: Record<string, unknown> = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (numEstudiantes !== undefined) updateData.num_estudiantes = numEstudiantes;

      const { data, error } = await supabase
        .from('grupos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Grupo actualizado exitosamente`,
        group: data,
      };
    },
  }),

  setAvailability: tool({
    description: 'Establecer disponibilidad de un docente',
    parameters: {
      docenteDni: {
        type: 'string',
        description: 'DNI del docente',
      },
      periodoId: {
        type: 'string',
        description: 'ID del periodo académico',
      },
      dia: {
        type: 'string',
        description: 'Día de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado)',
      },
      bloque: {
        type: 'string',
        description: 'Bloque horario',
      },
      estado: {
        type: 'string',
        description: 'Estado (Disponible, No disponible, Preferido)',
      },
    },
    execute: async ({
      docenteDni,
      periodoId,
      dia,
      bloque,
      estado,
    }: {
      docenteDni: string;
      periodoId: string;
      dia: string;
      bloque: string;
      estado: string;
    }) => {
      const supabase = await createClient();

      // Get teacher ID
      const { data: teacher, error: teacherError } = await supabase
        .from('docentes')
        .select('id')
        .eq('dni', docenteDni)
        .single();

      if (teacherError || !teacher) {
        throw new Error('Docente no encontrado');
      }

      const { data, error } = await supabase
        .from('disponibilidad')
        .upsert({
          docente_id: teacher.id,
          periodo_id: periodoId,
          dia,
          bloque,
          estado,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Disponibilidad establecida exitosamente`,
        availability: data,
      };
    },
  }),
};
