# Guía de Despliegue en Producción

## 1. Base de datos PostgreSQL (Neon - gratis)

1. Ve a https://neon.tech y crea una cuenta
2. Crea un proyecto (nombre: devagsmart)
3. Copia la **Connection String** (DATABASE_URL) y **Direct URL** (DIRECT_URL)
4. Ejemplo:
   ```
   DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

## 2. Preparar el código para PostgreSQL

1. Reemplaza `prisma/schema.prisma` con el contenido de `prisma/schema.postgresql.prisma`
2. Actualiza `prisma.config.ts`:
   ```typescript
   import { defineConfig } from 'prisma/config';
   import 'dotenv/config';
   export default defineConfig({
     schema: 'prisma/schema.prisma',
     migrations: { path: 'prisma/migrations' },
     datasource: { url: process.env.DATABASE_URL },
   });
   ```
3. Actualiza `src/lib/prisma.ts` para usar el adapter de PostgreSQL:
   ```typescript
   import { PrismaPg } from '@prisma/adapter-pg';
   import { Pool } from 'pg';
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);
   export const prisma = new PrismaClient({ adapter });
   ```
4. Instala: `npm install @prisma/adapter-pg pg @types/pg`
5. Ejecuta: `npx prisma migrate dev --name init`
6. Ejecuta: `npx tsx src/lib/seed.ts`

## 3. Desplegar en Netlify

1. Sube el código a GitHub
2. Ve a https://app.netlify.com → "Add new site" → "Import an existing project"
3. Conecta tu repositorio de GitHub
4. Configuración de build:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Instala el plugin de Next.js: `npm install -D @netlify/plugin-nextjs`
6. Agrega `netlify.toml` (ya incluido en el proyecto)

## 4. Variables de entorno en Netlify

En Netlify → Site settings → Environment variables, agrega:
```
DATABASE_URL=<tu connection string de Neon>
DIRECT_URL=<tu direct url de Neon>
NEXTAUTH_SECRET=<genera uno nuevo: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
NEXTAUTH_URL=https://tudominio.com
META_APP_ID=2394939191309244
META_APP_SECRET=1ce46c917d7d9a7031bf9ff80ee0a655
WHATSAPP_VERIFY_TOKEN=devagsmart-verify-2024
WHATSAPP_ACCESS_TOKEN=<tu token permanente>
WHATSAPP_WABA_ID=<tu WABA ID>
WHATSAPP_PHONE_NUMBER_ID=<tu Phone Number ID>
GRAPH_API_VERSION=v21.0
AI_PROVIDER=openrouter
AI_API_KEY=sk-or-v1-tu-clave
AI_MODEL=openai/gpt-4o-mini
ENCRYPTION_KEY=2ea1ff8acbde7233759e6d64c36db6657ed059b1240ab1fc33e9800bb6ff2f19
SAFE_MODE=true
```

## 5. Conectar dominio personalizado

1. En Netlify → Site settings → Domain management → Add custom domain
2. Ingresa `mipaginapersonal.com`
3. Configura DNS en tu registrador:
   - Tipo: CNAME
   - Host: www
   - Valor: tu-sitio.netlify.app
   - Para el apex (@): usa A record con la IP de Netlify (104.198.14.52)
4. Netlify configura SSL automáticamente (Let's Encrypt)

## 6. Actualizar webhook en Meta

1. Ve a Meta for Developers → tu app → WhatsApp → Configuration
2. Callback URL: `https://mipaginapersonal.com/api/webhooks/whatsapp`
3. Verify Token: `devagsmart-verify-2024`
4. Suscribir a: `messages`

## 7. Verificar

1. Abre `https://mipaginapersonal.com` → debería mostrar el login
2. Inicia sesión con `admin@devagsmart.local` / `Admin123!`
3. Envía un mensaje de prueba a tu número de WhatsApp
4. Verifica que aparezca en Conversaciones del CRM

## Costos estimados (mensual):
- Netlify: $0-20 USD
- Neon PostgreSQL: $0-25 USD
- OpenRouter (IA): $5-50 USD
- Dominio: ~$1-2 USD/mes (anual)
- **Total: $5-97 USD/mes por cliente**
