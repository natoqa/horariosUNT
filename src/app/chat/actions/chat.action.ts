'use server';

import { mistral } from '@ai-sdk/mistral';
import { streamText } from 'ai';

export async function chatAction(messages: Array<{ role: string; content: string }>) {
  try {
    const result = streamText({
      model: mistral('mistral-small-latest'),
      messages: messages as any,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error en chat:', error);
    throw new Error('Error al procesar el mensaje');
  }
}
