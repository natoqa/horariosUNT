import { mistral } from '@ai-sdk/mistral';
import { streamText } from 'ai';
import { chatTools } from './tools';
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

async function detectIntentAndCallTools(userMessage: string) {
  const lowerMessage = userMessage.toLowerCase();

  // Detectar intención de consultar docentes
  if (lowerMessage.includes('docente') || lowerMessage.includes('profesor') || lowerMessage.includes('maestro')) {
    console.log('Detected intent: getTeachers');
    const result = await chatTools.getTeachers.execute({});
    return formatToolResult('docentes', result);
  }

  // Detectar intención de consultar cursos
  if (lowerMessage.includes('curso') || lowerMessage.includes('asignatura')) {
    console.log('Detected intent: getCourses');
    const result = await chatTools.getCourses.execute({});
    return formatToolResult('cursos', result);
  }

  // Detectar intención de consultar periodos
  if (lowerMessage.includes('periodo') || lowerMessage.includes('semestre') || lowerMessage.includes('ciclo')) {
    console.log('Detected intent: getPeriods');
    const result = await chatTools.getPeriods.execute({});
    return formatToolResult('periodos', result);
  }

  // Detectar intención de consultar aulas
  if (lowerMessage.includes('aula') || lowerMessage.includes('salon') || lowerMessage.includes('salón')) {
    console.log('Detected intent: getClassrooms');
    const result = await chatTools.getClassrooms.execute({});
    return formatToolResult('aulas', result);
  }

  // Detectar intención de consultar planes de estudio
  if (lowerMessage.includes('plan') && lowerMessage.includes('estudio')) {
    console.log('Detected intent: getStudyPlans');
    const result = await chatTools.getStudyPlans.execute({});
    return formatToolResult('planes de estudio', result);
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
