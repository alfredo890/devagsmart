import { prisma } from '@/lib/prisma';
import CurrentDate from '@/components/current-date';

export default async function DashboardPage() {
  const [contacts, conversations, assistants, opportunities, tasks] = await Promise.all([
    prisma.contact.count(),
    prisma.conversation.count(),
    prisma.assistant.count(),
    prisma.opportunity.count(),
    prisma.crmTask.count({ where: { done: false } }),
  ]);

  const recentConversations = await prisma.conversation.findMany({
    take: 5,
    orderBy: { lastMessageAt: 'desc' },
    include: { contact: true },
  });

  const cards = [
    { label: 'Contactos', value: contacts, color: 'stat-card-blue', icon: '👥' },
    { label: 'Conversaciones', value: conversations, color: 'stat-card-green', icon: '💬' },
    { label: 'Asistentes', value: assistants, color: 'stat-card-purple', icon: '🤖' },
    { label: 'Oportunidades', value: opportunities, color: 'stat-card-orange', icon: '🎯' },
    { label: 'Tareas pendientes', value: tasks, color: 'stat-card-pink', icon: '📋' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Resumen</h2>
          <p className="text-slate-500 mt-1">Vista general de tu empresa</p>
        </div>
        <CurrentDate />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div key={c.label} className={`${c.color} rounded-2xl p-5 card-hover bounce-in`} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{c.icon}</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">{c.label}</p>
            <p className="text-3xl font-black mt-1 text-slate-800">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white/70 backdrop-blur rounded-2xl border border-slate-200/50 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="text-xl">💬</span> Conversaciones recientes
        </h3>
        {recentConversations.length === 0 && <p className="text-sm text-slate-500">Sin conversaciones aún. Los mensajes de WhatsApp e Instagram aparecerán aquí.</p>}
        <ul className="divide-y divide-slate-100">
          {recentConversations.map((c) => (
            <li key={c.id} className="py-3 flex justify-between items-center text-sm hover:bg-slate-50 px-3 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {(c.contact?.displayName || '?')[0].toUpperCase()}
                </div>
                <span className="font-medium">{c.contact?.displayName || c.contact?.phone || 'Contacto'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${c.channelType === 'WHATSAPP' ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>
                  {c.channelType}
                </span>
                <span className="text-slate-400 text-xs">{c.lastMessageAt?.toLocaleDateString('es-CO') || '—'}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
