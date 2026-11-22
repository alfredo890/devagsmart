import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updated = await prisma.assistant.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedVersion: { increment: 1 } },
  });
  return NextResponse.json(updated);
}
