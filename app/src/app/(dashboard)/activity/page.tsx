import { prisma } from '@/lib/prisma';

export default async function ActivityPage() {
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Actividad</h2>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Acción</th>
              <th className="text-left p-3">Entidad</th>
              <th className="text-left p-3">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.createdAt.toLocaleString('es-CO')}</td>
                <td className="p-3">{l.action}</td>
                <td className="p-3">{l.entity || '—'}</td>
                <td className="p-3 truncate max-w-xs">{l.metadata || '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">Sin actividad.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
