import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const contacts = await prisma.contact.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const contact = await prisma.contact.create({
    data: {
      displayName: data.displayName || null,
      phone: data.phone || null,
      email: data.email || null,
      notes: data.notes || null,
      tags: JSON.stringify(data.tags || []),
    },
  });
  return NextResponse.json(contact, { status: 201 });
}
