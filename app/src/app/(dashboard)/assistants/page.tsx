import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AssistantsPage() {
  const assistants = await prisma.assistant.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Asistentes</h2>
        <Link href="/assistants/new" className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm">Nuevo asistente</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assistants.map((a) => (
          <div key={a.id} className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{a.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${a.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {a.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{a.objective}</p>
            <p className="text-xs text-slate-400 mt-3">Tono: {a.tone || '—'} · Modelo: {a.model}</p>
            <Link href={`/assistants/${a.id}`} className="text-sm text-blue-600 mt-3 inline-block">Editar →</Link>
          </div>
        ))}
        {assistants.length === 0 && <p className="text-slate-500">Sin asistentes.</p>}
      </div>
    </div>
  );
}
