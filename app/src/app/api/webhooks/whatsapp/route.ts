import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/meta';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const connection = await prisma.channelConnection.findFirst({
    where: { type: 'WHATSAPP', verifyToken: token || undefined },
  });

  if (mode === 'subscribe' && connection && token === connection.verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  // Fallback: env verify token
  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  // Determine app secret
  const appSecret = process.env.META_APP_SECRET || '';
  if (appSecret && !verifyWebhookSignature(rawBody, signature, appSecret)) {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new NextResponse('Bad JSON', { status: 400 });
  }

  // Process asynchronously (respond fast)
  processWhatsAppPayload(body).catch((e) => console.error('WA process error:', e));

  return NextResponse.json({ received: true });
}

async function processWhatsAppPayload(body: any) {
  const entries = body?.entry || [];
  for (const entry of entries) {
    const changes = entry?.changes || [];
    for (const change of changes) {
      const value = change?.value;
      if (!value) continue;

      // Status updates
      if (value.statuses) {
        for (const st of value.statuses) {
          const extId = st.id;
          if (!extId) continue;
          await prisma.message.updateMany({
            where: { externalId: extId },
            data: { status: st.status },
          }).catch(() => {});
        }
      }

      // Messages
      const messages = value.messages || [];
      const contacts = value.contacts || [];
      const phoneNumberId = value.metadata?.phone_number_id;

      for (const msg of messages) {
        const eventId = msg.id;
        // Dedup
        const existing = await prisma.processedWebhookEvent.findUnique({ where: { eventId } }).catch(() => null);
        if (existing) continue;
        await prisma.processedWebhookEvent.create({ data: { eventId, source: 'whatsapp', payload: JSON.stringify(msg) } }).catch(() => {});

        const from = msg.from;
        const type = msg.type;
        let content = '';
        if (type === 'text') content = msg.text?.body || '';
        else if (msg[type]?.caption) content = msg[type].caption;
        else content = `[${type}]`;

        // Find channel connection
        const channel = phoneNumberId
          ? await prisma.channelConnection.findFirst({ where: { phoneNumberId } })
          : null;

        // Find or create contact by phone
        let contact = await prisma.contact.findFirst({ where: { phone: from } });
        const now = new Date();
        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              phone: from,
              displayName: contacts?.[0]?.profile?.name || null,
              firstInteraction: now,
              lastInteraction: now,
              externalIds: JSON.stringify({ whatsapp: from }),
            },
          });
        } else {
          await prisma.contact.update({ where: { id: contact.id }, data: { lastInteraction: now } });
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findFirst({
          where: { contactId: contact.id, channelType: 'WHATSAPP' },
        });
        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              contactId: contact.id,
              channelType: 'WHATSAPP',
              channelId: channel?.id,
              assistantId: channel?.assistantId,
              lastMessageAt: now,
            },
          });
        }

        // Save message
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            direction: 'IN',
            channelType: 'WHATSAPP',
            externalId: eventId,
            type,
            content,
          },
        });

        await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: now } });

        // Create opportunity if commercial intent (simple heuristic)
        // (placeholder - AI engine would decide)
      }
    }
  }
}
