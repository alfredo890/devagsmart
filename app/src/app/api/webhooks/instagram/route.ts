import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/meta';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  const connection = await prisma.channelConnection.findFirst({
    where: { type: 'INSTAGRAM', verifyToken: token || undefined },
  });
  if (mode === 'subscribe' && connection) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');
  const appSecret = process.env.META_APP_SECRET || '';
  if (appSecret && !verifyWebhookSignature(rawBody, signature, appSecret)) {
    return new NextResponse('Invalid signature', { status: 401 });
  }
  let body: any;
  try { body = JSON.parse(rawBody); } catch { return new NextResponse('Bad JSON', { status: 400 }); }

  processInstagramPayload(body).catch((e) => console.error('IG process error:', e));
  return NextResponse.json({ received: true });
}

async function processInstagramPayload(body: any) {
  const entries = body?.entry || [];
  for (const entry of entries) {
    const messaging = entry?.messaging || [];
    for (const event of messaging) {
      const senderId = event.sender?.id;
      const recipientId = event.recipient?.id;
      const msg = event.message;
      if (!msg) continue;
      const eventId = msg.mid;
      const existing = await prisma.processedWebhookEvent.findUnique({ where: { eventId } }).catch(() => null);
      if (existing) continue;
      await prisma.processedWebhookEvent.create({ data: { eventId, source: 'instagram', payload: JSON.stringify(event) } }).catch(() => {});

      let contact = await prisma.contact.findFirst({ where: { externalIds: { contains: senderId } } });
      const now = new Date();
      if (!contact) {
        contact = await prisma.contact.create({
          data: {
            displayName: null,
            firstInteraction: now,
            lastInteraction: now,
            externalIds: JSON.stringify({ instagram: senderId }),
          },
        });
      } else {
        await prisma.contact.update({ where: { id: contact.id }, data: { lastInteraction: now } });
      }

      let conversation = await prisma.conversation.findFirst({
        where: { contactId: contact.id, channelType: 'INSTAGRAM' },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            contactId: contact.id,
            channelType: 'INSTAGRAM',
            lastMessageAt: now,
          },
        });
      }

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'IN',
          channelType: 'INSTAGRAM',
          externalId: eventId,
          type: msg.attachments ? 'media' : 'text',
          content: msg.text || (msg.attachments ? '[media]' : ''),
        },
      });
      await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: now } });
    }
  }
}
