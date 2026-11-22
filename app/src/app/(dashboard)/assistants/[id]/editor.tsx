'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export default function AssistantEditor() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [assistant, setAssistant] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/assistants/${id}`)
      .then((r) => r.json())
      .then((a) => { setAssistant(a); setForm(a); setLoading(false); });
  }, [id]);

  async function save() {
    await fetch(`/api/assistants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    router.refresh();
  }

  async function publish() {
    await fetch(`/api/assistants/${id}/publish`, { method: 'POST' });
    router.refresh();
  }

  if (loading) return <p>Cargando...</p>;
  if (!assistant) return <p>No encontrado.</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Editor: {assistant.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={publish}>Publicar</Button>
          <Button onClick={save}>Guardar</Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Objetivo</Label>
            <Textarea value={form.objective || ''} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tono</Label>
            <Input value={form.tone || ''} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Instrucciones</Label>
            <Textarea rows={6} value={form.instructions || ''} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Prohibiciones</Label>
            <Textarea value={form.prohibitions || ''} onChange={(e) => setForm({ ...form, prohibitions: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Input value={form.status || ''} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
