import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const settings = await prisma.companySettings.findFirst();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const data = await req.json();
  const existing = await prisma.companySettings.findFirst();
  if (!existing) {
    const created = await prisma.companySettings.create({ data });
    return NextResponse.json(created);
  }
  const updated = await prisma.companySettings.update({ where: { id: existing.id }, data });
  return NextResponse.json(updated);
}
