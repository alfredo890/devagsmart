import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const assistants = await prisma.assistant.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(assistants);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const assistant = await prisma.assistant.create({
    data: {
      name: data.name,
      objective: data.objective || null,
      tone: data.tone || null,
      channels: JSON.stringify(data.channels || []),
      model: data.model || 'openai/gpt-4o-mini',
      status: 'DRAFT',
    },
  });
  return NextResponse.json(assistant, { status: 201 });
}
