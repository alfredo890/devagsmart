# Dev.AGSmart — Asistente de Empresa

Aplicación para gestionar clientes, conversaciones y automatizaciones con IA mediante
WhatsApp Cloud API e Instagram Messaging API oficiales de Meta.

## Stack

- Next.js 16 (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite (dev) / PostgreSQL (prod)
- Auth.js (credentials, JWT, roles OWNER/ADMIN/AGENT)
- Zod, Vitest, Playwright (e2e opcional)

## Instalación local

```bash
cd app
npm install
cp .env.example .env
# Editar .env con tus valores
npx prisma migrate dev
npx tsx src/lib/seed.ts
npm run dev
```

URL local: http://localhost:3000
Usuario admin: admin@devagsmart.local / Admin123!

## Variables de entorno

Ver `.env.example`. Las credenciales de Meta se obtienen siguiendo `configuracion-y-credenciales.txt`.

## Meta (WhatsApp / Instagram)

### WhatsApp Cloud API
1. Crear app en Meta for Developers.
2. Agregar producto "WhatsApp".
3. Crear/obtener WABA y Phone Number ID.
4. Generar token permanente (System User).
5. Configurar webhook: URL `{APP_URL}/api/webhooks/whatsapp`, Verify Token = `WHATSAPP_VERIFY_TOKEN`.
6. Suscribir a `messages`.

### Instagram
1. Convertir cuenta a profesional.
2. Vincular a página de Facebook (si el flujo lo requiere).
3. Autorizar con permisos: `instagram_basic`, `instagram_manage_messages`, `pages_manage_metadata`.
4. Configurar webhook `{APP_URL}/api/webhooks/instagram`.

## Pruebas

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

## Modo seguro

Activado por defecto (`SAFE_MODE=true`). Bloquea envíos reales; guarda operaciones como SIMULATED.

## Estructura

- `src/app` — rutas y páginas
- `src/app/api` — endpoints (webhooks, CRUD)
- `src/lib` — prisma, auth, crypto, meta, seed
- `prisma/schema.prisma` — modelo de datos (empresa única)

## Despliegue (Netlify)

Configurar variables de entorno en Netlify. Usar PostgreSQL en producción
(cambiar `provider` en schema.prisma y `DATABASE_URL`).
Webhooks deben apuntar al dominio de producción.

## Seguridad

- Cookies HttpOnly, Secure en prod, SameSite.
- Tokens AES-256-GCM en reposo.
- Validación de firma HMAC de Meta.
- Deduplicación de webhooks.
- Rate limiting (pendiente de configurar en producción).
- Sin secretos versionados (ver .gitignore).
