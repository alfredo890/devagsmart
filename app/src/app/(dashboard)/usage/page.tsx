import { prisma } from '@/lib/prisma';

export default async function UsagePage() {
  const records = await prisma.usageRecord.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  const totals = await prisma.usageRecord.aggregate({ _sum: { tokensIn: true, tokensOut: true, costUsd: true } });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Uso y costos</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-slate-500">Tokens entrada</p>
          <p className="text-xl font-bold">{totals._sum.tokensIn || 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-slate-500">Tokens salida</p>
          <p className="text-xl font-bold">{totals._sum.tokensOut || 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-slate-500">Costo USD</p>
          <p className="text-xl font-bold">{(totals._sum.costUsd || 0).toFixed(4)}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Proveedor</th>
              <th className="text-left p-3">Modelo</th>
              <th className="text-left p-3">In</th>
              <th className="text-left p-3">Out</th>
              <th className="text-left p-3">Costo</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.createdAt.toLocaleDateString('es-CO')}</td>
                <td className="p-3">{r.provider}</td>
                <td className="p-3">{r.model || '—'}</td>
                <td className="p-3">{r.tokensIn}</td>
                <td className="p-3">{r.tokensOut}</td>
                <td className="p-3">{r.costUsd.toFixed(4)}</td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Sin registros.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
