import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

export async function GET() {
  const channels = await prisma.channelConnection.findMany({ orderBy: { createdAt: 'desc' } });
  // mask tokens
  const safe = channels.map((c) => ({
    ...c,
    accessTokenEnc: c.accessTokenEnc ? '••••' : null,
  }));
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const channel = await prisma.channelConnection.create({
    data: {
      type: data.type,
      label: data.label,
      phoneNumber: data.phoneNumber || null,
      phoneNumberId: data.phoneNumberId || null,
      wabaId: data.wabaId || null,
      igUserId: data.igUserId || null,
      igUsername: data.igUsername || null,
      pageId: data.pageId || null,
      metaAppId: data.metaAppId || null,
      verifyToken: data.verifyToken || null,
      accessTokenEnc: data.accessToken ? encrypt(data.accessToken) : null,
      connected: false,
    },
  });
  return NextResponse.json(channel, { status: 201 });
}
