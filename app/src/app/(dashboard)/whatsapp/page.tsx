import { prisma } from '@/lib/prisma';

export default async function WhatsAppPage() {
  const channels = await prisma.channelConnection.findMany({ where: { type: 'WHATSAPP' } });
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'no-configurado';
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">WhatsApp</h2>
      <div className="bg-white rounded-lg border p-4 space-y-2 text-sm">
        <p><strong>Webhook URL:</strong> {appUrl}/api/webhooks/whatsapp</p>
        <p><strong>Verify Token:</strong> {verifyToken}</p>
        <p className="text-slate-500">Configura estos valores en Meta for Developers → WhatsApp → Configuration.</p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Números conectados</h3>
        {channels.length === 0 && <p className="text-slate-500 text-sm">Sin números conectados. Agrega uno en Integraciones.</p>}
        <ul className="divide-y">
          {channels.map((c) => (
            <li key={c.id} className="py-2 text-sm">
              <strong>{c.label}</strong> — {c.phoneNumber || c.phoneNumberId} — {c.connected ? 'Conectado' : 'Pendiente'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
