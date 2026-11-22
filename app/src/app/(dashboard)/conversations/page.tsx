import { prisma } from '@/lib/prisma';

export default async function ConversationsPage() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: 'desc' },
    take: 50,
    include: { contact: true, messages: { take: 1, orderBy: { createdAt: 'desc' } } },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Conversaciones</h2>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Contacto</th>
              <th className="text-left p-3">Canal</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Último mensaje</th>
              <th className="text-left p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.contact?.displayName || c.contact?.phone || '—'}</td>
                <td className="p-3">{c.channelType}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3 truncate max-w-xs">{c.messages[0]?.content || '—'}</td>
                <td className="p-3">{c.lastMessageAt?.toLocaleString('es-CO') || '—'}</td>
              </tr>
            ))}
            {conversations.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">Sin conversaciones.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
