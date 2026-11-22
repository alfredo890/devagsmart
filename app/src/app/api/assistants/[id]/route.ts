import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assistant = await prisma.assistant.findUnique({ where: { id } });
  if (!assistant) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(assistant);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const updated = await prisma.assistant.update({
    where: { id },
    data: {
      name: data.name,
      objective: data.objective,
      tone: data.tone,
      instructions: data.instructions,
      prohibitions: data.prohibitions,
      model: data.model,
      status: data.status,
    },
  });
  return NextResponse.json(updated);
}
