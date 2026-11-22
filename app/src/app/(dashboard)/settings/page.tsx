'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => { setForm(d || {}); setLoading(false); });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setMsg('Guardado.');
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold">Ajustes de la empresa</h2>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rubro</Label>
              <Input value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Input value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Zona horaria</Label>
              <Input value={form.timezone || ''} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Input value={form.currency || ''} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Correo</Label>
              <Input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sitio web</Label>
              <Input value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Modo seguro</Label>
              <Input type="checkbox" checked={!!form.safeMode} onChange={(e) => setForm({ ...form, safeMode: e.target.checked })} />
            </div>
            <Button type="submit">Guardar</Button>
            {msg && <p className="text-sm text-green-600">{msg}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
