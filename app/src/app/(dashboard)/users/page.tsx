import { prisma } from '@/lib/prisma';

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Usuarios y permisos</h2>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Correo</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Activo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.active ? 'Sí' : 'No'}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">Sin usuarios.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
