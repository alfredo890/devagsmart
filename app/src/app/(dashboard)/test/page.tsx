'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPage() {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [assistantId, setAssistantId] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/assistants').then((r) => r.json()).then(setAssistants);
  }, []);

  async function send() {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    const res = await fetch('/api/test/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assistantId, message: userMsg }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { role: 'assistant', text: data.reply }]);
    setLoading(false);
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold">Probar</h2>
      <select
        className="border rounded p-2 w-full"
        value={assistantId}
        onChange={(e) => setAssistantId(e.target.value)}
      >
        <option value="">Seleccionar asistente</option>
        {assistants.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <Card>
        <CardContent className="pt-4 space-y-2 min-h-[300px]">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <span className={`inline-block px-3 py-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
                {m.text}
              </span>
            </div>
          ))}
          {loading && <p className="text-sm text-slate-400">Pensando...</p>}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Mensaje de prueba..." />
        <Button onClick={send} disabled={loading}>Enviar</Button>
      </div>
    </div>
  );
}
