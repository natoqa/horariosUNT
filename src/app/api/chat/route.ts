import { mistral } from '@ai-sdk/mistral';
import { streamText } from 'ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: mistral('mistral-small-latest'),
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error en chat API:', error);
    return new Response('Error al procesar el mensaje', { status: 500 });
  }
}
