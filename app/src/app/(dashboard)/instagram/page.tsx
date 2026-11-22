import { prisma } from '@/lib/prisma';

export default async function InstagramPage() {
  const channels = await prisma.channelConnection.findMany({ where: { type: 'INSTAGRAM' } });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Instagram</h2>
      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm text-slate-600">
          Instagram se integra mediante la API oficial de Meta. Requiere cuenta profesional y permisos aprobados.
        </p>
        <p className="text-sm mt-2">
          Permisos típicos: <code>instagram_basic</code>, <code>instagram_manage_messages</code>, <code>pages_manage_metadata</code>.
        </p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Cuentas conectadas</h3>
        {channels.length === 0 && <p className="text-slate-500 text-sm">Sin cuentas conectadas.</p>}
        <ul className="divide-y">
          {channels.map((c) => (
            <li key={c.id} className="py-2 text-sm">
              <strong>{c.label}</strong> — {c.igUsername || c.igUserId} — {c.connected ? 'Conectado' : 'Pendiente'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
