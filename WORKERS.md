# Mapa de Workers — COSMART

Referencia rápida de qué hace cada Worker de Cloudflare hoy (17 ago 2026), **sin renombrar nada todavía**. La idea es que cuando me pidas algo puedas decirme "tocá el worker que maneja X" sin tener que acordarte de qué nombre tiene puesto.

> Nada de esto se tocó en el código real. Es solo documentación para ordenar la cabeza. Los renombres (`mp-productos-ganadores` → algo más genérico, y separar lo de Productos Ganadores del viejo `cosmart-training`) quedan pendientes hasta que decidas dar ese paso — ahora mismo hay campañas orgánicas entrando a cosmart.com.ar y no queremos romper nada en el medio.

## Los 3 que importan para la migración de Productos Ganadores

### 1. `cosmart-training` — el viejo monolito
**Alias mental: "el worker de Productos Ganadores (todo incluido) + Brújula"**

Hoy hace TODO lo de Productos Ganadores y además Brújula (que no es un curso):
- Cuentas, login, sesiones (30 días) — Productos Ganadores
- Progreso del curso por "Escalas" (el currículum)
- Testimonios, certificados (los genera dinámicamente, no son archivos)
- Pagos: token post-compra, PayPal, MercadoPago (para asesorías)
- **Video streaming** (`/videos/login`, `/videos/stream/1,2,3`) — **esto NO es de Productos Ganadores**, lo confirmé revisando el repo de `cosmart`: es la herramienta que armaste para tu clienta de Ando Reciclaje (el tutorial de Mailchimp), no está linkeada desde ninguna página del curso. Ella la necesita de forma permanente → **esto se queda en este worker pase lo que pase**, no migra con el curso.
- Brújula: captura de leads (`/brujula/lead`) y booking de asesorías (`/asesoria/*`) — se queda acá, no es curso.
- Export de leads en CSV (`/export/...`)

**Dominio:** `cosmart-training.conglomeradocosmart.workers.dev`, y algunas rutas puenteadas desde `cosmart.com.ar` (ej. `/metodo/lead`).

**KV que usa:** `COSMART_USERS`, `COSMART_SESSIONS`, `COSMART_RESETS`, `COSMART_REG_TOKENS`, `COSMART_PROGRESS`, `COSMART_CODES`, `COSMART_LEADS` (brújula), `METODO_LEADS` (vacío, todavía no lanzaste Método).
**R2 que usa:** `training-videos` (los videos de Ando Reciclaje).

**Qué va a pasar cuando migremos productos ganadores:** se le va a poder sacar todo lo de progreso/certificados/testimonios/pagos de curso. Lo único que le queda es Brújula + el video de Ando Reciclaje + export de leads. En ese momento tiene sentido pensar un nombre nuevo — pero eso es una decisión para más adelante, no ahora.

---

### 2. `cosmart-training-core` — el nuevo, genérico
**Alias mental: "el worker de training multi-curso"**

Es el worker "limpio" pensado para *cualquier* curso nuevo de training.cosmart.com.ar. Ya lo usan **contenidosrrss** y **cutralco** en producción. Hace:
- Cuentas, login, sesiones (mismo esquema de 30 días)
- Catálogo de cursos (`COURSES` — cada curso nuevo se agrega ahí como una entrada, no como un worker nuevo)
- Certificados (dinámicos, iguales al viejo)
- Registro post-pago y registro gratuito (para cursos sin costo)
- Cron de secuencias de email automáticas

Ya tiene una entrada reservada para `productos-ganadores` en el catálogo, pero apunta temporalmente al worker viejo (`cosmart.com.ar/cosmart-training-plataforma.html`) — ahí es donde vamos a enchufar el curso migrado.

**Dominio:** `cosmart-training-core.conglomeradocosmart.workers.dev`
**KV que usa:** las mismas `COSMART_USERS/SESSIONS/RESETS/REG_TOKENS` (comparte cuentas con el worker viejo a propósito) + una KV de progreso propia por curso (ej. `cosmart-training-progress-contenidosrrss`).

**Qué va a pasar cuando migremos productos ganadores:** acá va a vivir la lógica del curso (progreso, certificado) una vez portada desde el worker viejo.

---

### 3. `mp-productos-ganadores` — pasarela de pago (MercadoPago)
**Alias mental: "el worker de cobros de training" (aunque el nombre diga otra cosa)**

A pesar del nombre, **ya no es solo de Productos Ganadores**: tiene un mapa interno (`PRODUCTOS`) que decide, según qué se compró, a qué worker avisarle. Hoy `productos-ganadores` va al worker viejo y `contenidosrrss` va al nuevo (`cosmart-training-core`). Cuando migremos productos ganadores, simplemente se cambia esa entrada del mapa para que también vaya al worker nuevo — no hace falta tocar nada más de este worker todavía.

**Dominio:** `mp-productos-ganadores.conglomeradocosmart.workers.dev`

**Nota sobre el nombre:** tiene sentido renombrarlo a algo tipo `mp-cursos-training` más adelante, pero en Cloudflare no se puede "renombrar" un worker — hay que crear uno nuevo, copiar el código, mover las rutas, y recién ahí borrar el viejo. Es un cambio real de infraestructura, no cosmético. **Lo dejamos pendiente**, como pediste, hasta que quieras dar ese paso con calma.

---

## Otros workers (no se tocan en esta migración)

| Worker | Para qué es (a confirmar contigo si hace falta más detalle) |
|---|---|
| `mpg-bot` | Subdominio `mpg.cosmart.com.ar`, automatizaciones — fuera de alcance |
| `euforia-worker` | Vertical `euforio.cosmart.com.ar` |
| `cosmart-blog-worker` | Blog de `cosmart.com.ar` |
| `marketing-hub` / `hub` | A confirmar — no los audité todavía |
| `cosmart-design` | A confirmar — no lo audité todavía |
| `capacitacion` | A confirmar — no lo audité todavía |

Si en algún momento querés que te arme el mismo tipo de ficha para estos, lo hacemos — pero no forma parte de la migración de Productos Ganadores.

---

## Estado de la migración de Productos Ganadores (checklist)

- [x] Landing de venta → `training.cosmart.com.ar/productos-ganadores`
- [x] Método (lead magnet) → `training.cosmart.com.ar/productos-ganadores/metodo`
- [x] PDF imán de leads
- [ ] El curso en sí (Escalas, progreso, certificado) → `training.cosmart.com.ar/cursos/productosganadores/` — pendiente, ya tengo acceso de lectura al repo `cosmart` para portarlo
- [ ] Login/registro específicos del curso (hoy en `cosmart-training-login.html`, `cosmart-training-registro.html`, `cosmart-training-reset.html` dentro del repo `cosmart`) → adaptar al esquema genérico de `cosmart-training-core`
- [ ] Portar la lógica de Escalas/progreso/certificado del worker viejo al `cosmart-training-core`
- [ ] Recién al final: cambiar el apuntador en `mp-productos-ganadores` y el `dashboardUrl` del catálogo
