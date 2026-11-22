import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAIConfig, chatCompletion, composeSystemPrompt } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const { assistantId, message } = await req.json();
  if (!message) return NextResponse.json({ reply: 'Mensaje vacío.' }, { status: 400 });

  const config = getAIConfig();
  if (!config.apiKey) {
    return NextResponse.json({
      reply: '[Modo prueba] No hay API Key configurada. Configura AI_API_KEY en .env para respuestas reales.',
      simulated: true,
    });
  }

  try {
    const systemPrompt = await composeSystemPrompt(assistantId);
    const result = await chatCompletion(config, [{ role: 'user', content: message }], systemPrompt);
    return NextResponse.json({ reply: result.content, simulated: false, tokens: { in: result.tokensIn, out: result.tokensOut } });
  } catch (e: any) {
    return NextResponse.json({ reply: `Error IA: ${e.message}`, simulated: false, error: true }, { status: 500 });
  }
}
