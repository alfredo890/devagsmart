import { prisma } from '@/lib/prisma';

export default async function KnowledgePage() {
  const sources = await prisma.knowledgeSource.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Conocimiento</h2>
        <a href="/knowledge/new" className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm">Nueva fuente</a>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Título</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Activo</th>
              <th className="text-left p-3">Creado</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.title}</td>
                <td className="p-3">{s.type}</td>
                <td className="p-3">{s.active ? 'Sí' : 'No'}</td>
                <td className="p-3">{s.createdAt.toLocaleDateString('es-CO')}</td>
              </tr>
            ))}
            {sources.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">Sin fuentes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
