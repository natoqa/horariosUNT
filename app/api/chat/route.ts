import { mistral } from '@ai-sdk/mistral';
import { streamText } from 'ai';
import { createClient } from '@/shared/lib/supabase/server';

export const runtime = 'nodejs';

async function getUserRole() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.role || 'docente';
  } catch {
    return 'docente';
  }
}

async function getTeachers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('docentes')
    .select('*')
    .eq('estado', 'Activo')
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

async function getCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cursos')
    .select('*')
    .eq('estado', 'Activo')
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

async function getPeriods() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('periodos')
    .select('*')
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

async function getClassrooms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('aulas')
    .select('*')
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

async function getStudyPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('planes_estudio')
    .select('*')
    .eq('estado', 'Activo')
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

async function detectIntentAndCallTools(userMessage: string) {
  const lowerMessage = userMessage.toLowerCase();

  try {
    // Detectar intención de consultar docentes
    if (lowerMessage.includes('docente') || lowerMessage.includes('profesor') || lowerMessage.includes('maestro')) {
      console.log('Detected intent: getTeachers');
      const result = await getTeachers();
      return formatToolResult('docentes', result);
    }

    // Detectar intención de consultar cursos
    if (lowerMessage.includes('curso') || lowerMessage.includes('asignatura')) {
      console.log('Detected intent: getCourses');
      const result = await getCourses();
      return formatToolResult('cursos', result);
    }

    // Detectar intención de consultar periodos
    if (lowerMessage.includes('periodo') || lowerMessage.includes('semestre') || lowerMessage.includes('ciclo')) {
      console.log('Detected intent: getPeriods');
      const result = await getPeriods();
      return formatToolResult('periodos', result);
    }

    // Detectar intención de consultar aulas
    if (lowerMessage.includes('aula') || lowerMessage.includes('salon') || lowerMessage.includes('salón')) {
      console.log('Detected intent: getClassrooms');
      const result = await getClassrooms();
      return formatToolResult('aulas', result);
    }

    // Detectar intención de consultar planes de estudio
    if (lowerMessage.includes('plan') && lowerMessage.includes('estudio')) {
      console.log('Detected intent: getStudyPlans');
      const result = await getStudyPlans();
      return formatToolResult('planes de estudio', result);
    }
  } catch (error: any) {
    console.error('Error executing database tool query:', error);
    return `No se pudo obtener la información debido a restricciones de acceso o error de conexión. Detalle: ${error.message || error}`;
  }

  return null;
}

function formatToolResult(entity: string, data: any[]) {
  if (!data || data.length === 0) {
    return `No se encontraron ${entity}.`;
  }

  let result = `**${entity.charAt(0).toUpperCase() + entity.slice(1)}:**\n\n`;
  data.forEach((item: any, index: number) => {
    result += `${index + 1}. `;
    if (item.nombres && item.apellidos) {
      result += `${item.nombres} ${item.apellidos}`;
    } else if (item.nombre) {
      result += item.nombre;
    } else if (item.name) {
      result += item.name;
    } else if (item.codigo) {
      result += `${item.codigo} - ${item.nombre || ''}`;
    } else {
      result += JSON.stringify(item);
    }
    result += '\n';
  });

  return result;
}

function generateLocalResponse(userMessage: string, userRole: string, toolResult: string | null): string {
  const lowerMessage = userMessage.toLowerCase();

  // Si hay datos recuperados por las herramientas
  if (toolResult) {
    let response = `¡Claro! He consultado la base de datos del sistema y encontré la siguiente información:\n\n${toolResult}\n`;
    if (userRole === 'director') {
      response += `\nComo director, puedes gestionar y actualizar estos registros directamente desde su sección de administración.`;
    }
    return response;
  }

  // Saludos e introducción del asistente
  if (
    lowerMessage.includes('hola') || 
    lowerMessage.includes('buenos dias') || 
    lowerMessage.includes('buenos días') || 
    lowerMessage.includes('buenas tardes') || 
    lowerMessage.includes('buenas noches') ||
    lowerMessage.includes('saludos') ||
    lowerMessage.trim() === 'asistente'
  ) {
    let response = `¡Hola! Soy tu asistente virtual para la gestión de horarios de la UNT.\n\n`;
    response += `Puedo ayudarte a buscar rápidamente información del sistema en tiempo real. Intenta preguntándome por:\n`;
    response += `* **Docentes**: *"¿Quiénes son los docentes activos?"* o *"mostrar profesores"*\n`;
    response += `* **Cursos**: *"¿Qué cursos hay registrados?"* o *"ver asignaturas"*\n`;
    response += `* **Aulas**: *"¿Cuáles son los salones?"* o *"listar aulas"*\n`;
    response += `* **Periodos**: *"¿Qué ciclos académicos están configurados?"* o *"periodos"*\n`;
    response += `* **Planes de estudio**: *"mostrar planes de estudio"*\n\n`;
    
    if (userRole === 'director') {
      response += `Como **Director**, también te puedo guiar en el proceso de generación automática de horarios en la sección principal.`;
    } else if (userRole === 'docente') {
      response += `Como **Docente**, puedo ayudarte a consultar tu carga lectiva y la disponibilidad registrada.`;
    } else if (userRole === 'secretaria') {
      response += `Como **Secretaria**, puedo ayudarte a revisar la asignación administrativa.`;
    }
    
    return response;
  }

  // Ayuda
  if (lowerMessage.includes('ayuda') || lowerMessage.includes('que haces') || lowerMessage.includes('qué haces') || lowerMessage.includes('como te uso') || lowerMessage.includes('cómo te uso')) {
    return `Puedo buscar y mostrarte datos en tiempo real de la base de datos de Horarios UNT.\n\n` +
      `Prueba consultando directamente por palabras clave como **docentes**, **cursos**, **aulas**, **periodos** o **planes de estudio**.\n\n` +
      `Actualmente me encuentro ejecutando en **modo local** integrado a la base de datos, por lo que no necesito conexión a internet ni API keys externas para responderte.`;
  }

  // Respuesta por defecto si no detecta intención
  let response = `Entendido. Como asistente del sistema, puedo realizar consultas a la base de datos si mencionas términos clave como **docente**, **curso**, **aula**, **periodo** o **plan de estudio**.\n\n`;
  
  if (userRole === 'director') {
    response += `Como **Director de Escuela**, tienes acceso completo para crear o modificar horarios. ¿Te gustaría consultar alguna información específica para tu planificación?`;
  } else if (userRole === 'docente') {
    response += `Como **Docente**, ¿deseas consultar tus cursos o aulas asignadas? Prueba buscando con la palabra "cursos".`;
  } else {
    response += `¿En qué más te puedo asistir hoy respecto a la gestión horaria?`;
  }
  
  return response;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log('Messages received:', messages);

    const userRole = await getUserRole();
    console.log('User role:', userRole);

    const lastMessage = messages[messages.length - 1];
    const userContent = lastMessage?.content || '';

    // Intentar detectar intención y llamar herramientas
    const toolResult = await detectIntentAndCallTools(userContent);

    // Verificar si existe una clave de API de Mistral configurada y no sea el placeholder
    const hasMistralKey = !!process.env.MISTRAL_API_KEY && 
                          process.env.MISTRAL_API_KEY !== 'your-mistral-api-key-here' && 
                          process.env.MISTRAL_API_KEY.trim() !== '';

    if (!hasMistralKey) {
      console.log('Mistral API Key not configured. Using intelligent local assistant fallback.');
      
      const responseText = generateLocalResponse(userContent, userRole, toolResult);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const chunkSize = 6;
          for (let i = 0; i < responseText.length; i += chunkSize) {
            const chunk = responseText.slice(i, i + chunkSize);
            controller.enqueue(encoder.encode(chunk));
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    let systemPrompt = `Eres un asistente virtual para el sistema de gestión de horarios académicos de la UNT.`;
    systemPrompt += `\n\nEl usuario actual tiene el rol: ${userRole}.`;

    if (userRole === 'docente') {
      systemPrompt += `\n\nComo docente, el usuario puede consultar su disponibilidad, horarios asignados, y cursos que imparte.`;
    } else if (userRole === 'director') {
      systemPrompt += `\n\nComo director, el usuario puede gestionar toda la información del sistema: docentes, cursos, horarios, periodos, etc.`;
    } else if (userRole === 'secretaria') {
      systemPrompt += `\n\nComo secretaria, el usuario puede gestionar información administrativa del sistema.`;
    }

    if (toolResult) {
      systemPrompt += `\n\nDATOS DEL SISTEMA:\n${toolResult}\n\nUsa estos datos para responder al usuario. Si el usuario pidió solo nombres, muestra solo los nombres.`;
    } else {
      systemPrompt += `\n\nSi el usuario pide información del sistema (docentes, cursos, periodos, aulas, etc.), indícale que puedes consultar esa información.`;
    }

    const result = streamText({
      model: mistral('mistral-small-latest'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error en chat API:', error);
    return new Response('Error al procesar el mensaje', { status: 500 });
  }
}

