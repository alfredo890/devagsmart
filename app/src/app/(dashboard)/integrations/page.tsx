'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IntegrationsPage() {
  const [form, setForm] = useState({
    type: 'WHATSAPP', label: '', phoneNumber: '', phoneNumberId: '', wabaId: '',
    igUsername: '', igUserId: '', pageId: '', metaAppId: '', accessToken: '', verifyToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { setMsg('Guardado.'); router.refresh(); }
    else setMsg('Error al guardar.');
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold">Integraciones</h2>
      <Card>
        <CardHeader><CardTitle>Conectar canal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Etiqueta</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Número de teléfono (WhatsApp)</Label>
              <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number ID</Label>
              <Input value={form.phoneNumberId} onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>WABA ID</Label>
              <Input value={form.wabaId} onChange={(e) => setForm({ ...form, wabaId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Usuario Instagram</Label>
              <Input value={form.igUsername} onChange={(e) => setForm({ ...form, igUsername: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Instagram User ID</Label>
              <Input value={form.igUserId} onChange={(e) => setForm({ ...form, igUserId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Page ID</Label>
              <Input value={form.pageId} onChange={(e) => setForm({ ...form, pageId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Meta App ID</Label>
              <Input value={form.metaAppId} onChange={(e) => setForm({ ...form, metaAppId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input type="password" value={form.accessToken} onChange={(e) => setForm({ ...form, accessToken: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Verify Token</Label>
              <Input value={form.verifyToken} onChange={(e) => setForm({ ...form, verifyToken: e.target.value })} />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar conexión'}</Button>
            {msg && <p className="text-sm text-green-600">{msg}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
