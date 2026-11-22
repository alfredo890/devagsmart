import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';

async function TasksList() {
  const tasks = await prisma.crmTask.findMany({ orderBy: { createdAt: 'desc' }, include: { contact: true } });
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-3">Título</th>
            <th className="text-left p-3">Contacto</th>
            <th className="text-left p-3">Vence</th>
            <th className="text-left p-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="p-3">{t.title}</td>
              <td className="p-3">{t.contact?.displayName || '—'}</td>
              <td className="p-3">{t.dueAt?.toLocaleDateString('es-CO') || '—'}</td>
              <td className="p-3">{t.done ? 'Hecha' : 'Pendiente'}</td>
            </tr>
          ))}
          {tasks.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">Sin tareas.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tareas y operaciones</h2>
      <Suspense fallback={<div className="bg-white rounded-lg border p-6 text-center text-slate-500">Cargando...</div>}>
        <TasksList />
      </Suspense>
    </div>
  );
}
