import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CrmPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: { opportunities: true, conversations: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">CRM — Contactos</h2>
        <Link href="/crm/new" className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm">Nuevo contacto</Link>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Teléfono</th>
              <th className="text-left p-3">Correo</th>
              <th className="text-left p-3">Etiquetas</th>
              <th className="text-left p-3">Conversaciones</th>
              <th className="text-left p-3">Oportunidades</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.displayName || '—'}</td>
                <td className="p-3">{c.phone || '—'}</td>
                <td className="p-3">{c.email || '—'}</td>
                <td className="p-3">{c.tags}</td>
                <td className="p-3">{c.conversations.length}</td>
                <td className="p-3">{c.opportunities.length}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">Sin contactos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
