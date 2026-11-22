import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const sources = await prisma.knowledgeSource.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(sources);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const source = await prisma.knowledgeSource.create({
    data: {
      title: data.title,
      type: data.type || 'TEXT',
      content: data.content || null,
      url: data.url || null,
      active: true,
    },
  });
  return NextResponse.json(source, { status: 201 });
}
