'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, MessageSquare, Bot, BookOpen, Phone, Camera,
  Plug, FlaskConical, ListTodo, Activity, BarChart3, Shield, Settings, LogOut,
} from 'lucide-react';

const nav = [
  { href: '/', label: 'Resumen', icon: LayoutDashboard },
  { href: '/crm', label: 'CRM', icon: Users },
  { href: '/conversations', label: 'Conversaciones', icon: MessageSquare },
  { href: '/assistants', label: 'Asistentes', icon: Bot },
  { href: '/knowledge', label: 'Conocimiento', icon: BookOpen },
  { href: '/whatsapp', label: 'WhatsApp', icon: Phone },
  { href: '/instagram', label: 'Instagram', icon: Camera },
  { href: '/integrations', label: 'Integraciones', icon: Plug },
  { href: '/test', label: 'Probar', icon: FlaskConical },
  { href: '/tasks', label: 'Tareas', icon: ListTodo },
  { href: '/activity', label: 'Actividad', icon: Activity },
  { href: '/usage', label: 'Uso y costos', icon: BarChart3 },
  { href: '/users', label: 'Usuarios', icon: Shield },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 h-screen sticky top-0 flex flex-col shadow-2xl">
      <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
        <img src="/logo.svg" alt="Dev.AGSmart" width="32" height="32" className="rounded-lg" />
        <div>
          <h1 className="font-bold text-lg text-white">Dev.AGSmart</h1>
          <p className="text-xs text-slate-400">Asistente IA</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                active
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className={cn('h-4 w-4 transition-transform group-hover:scale-110', active && 'text-white')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-700/50">
        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/10" onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="h-4 w-4 mr-2" /> Salir
        </Button>
      </div>
    </aside>
  );
}
