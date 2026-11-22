'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewAssistantPage() {
  const [form, setForm] = useState({ name: '', objective: '', tone: '', channels: 'WHATSAPP', model: 'openai/gpt-4o-mini' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/assistants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, channels: [form.channels] }),
    });
    setLoading(false);
    router.push('/assistants');
    router.refresh();
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Nuevo asistente</h2>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tono</Label>
              <Input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Canal</Label>
              <Input value={form.channels} onChange={(e) => setForm({ ...form, channels: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
