# HANDOFF — training (frontend, training.cosmart.com.ar)

Actualizado: 2026-08-28. Este archivo reemplaza cualquier handoff anterior que hayas recibido pegado en el chat (ej. `HANDOFFcontenidosrrss.md`, `Handoff — IA para Emprendedores`) — esos describían un flujo de trabajo viejo que ya no existe, ver más abajo. Léelo entero antes de tocar código en este repo. Ver también `HANDOFF.md` en `AquiVane/cosmart-workers` para todo lo del backend.

## Novedades 28/08

- **Escala nueva en contenidosrrss: "Prospección B2B en LinkedIn"** (`escala-linkedin`, 2 pasos + mini-evaluación de 5 preguntas). Se portó el sistema de mini-evaluación (que antes solo tenía `iaprincipiantes`) a `cursos/contenidosrrss/acceso.html` — ver funciones `esUltimoDeEscala`/`evaluacionPendiente`/`renderEvalBox`/`enviarEvaluacion` y el CSS `.eval-box` al final del `<style>`.
- **Sistema de lead magnets completo**: formularios de captura en `iaprincipiantes.html` y `contenidosrrss.html` (sección antes del footer, función `enviarLeadMagnet()`), backend en `cosmart-workers` (KV `LEADS`, `POST /leadmagnet/captura`, secuencia de 3 emails de seguimiento que se corta sola si la persona compra). **Pendiente de Vaneh**: subir los dos PDFs finales (contenido ya escrito y entregado, ella hace el diseño) — ver sección de pendientes abajo para el nombre exacto de archivo que tienen que llevar.

## ⚠️ Lo primero: el flujo de trabajo cambió

Los handoffs viejos asumían una sesión LOCAL sin acceso a GitHub, editando archivos sueltos que Vaneh subía a mano. Ahora esta sesión (y cualquiera que herede este repo) tiene acceso directo de lectura/escritura vía git (commit + push a `main`, o a la rama que te hayan indicado), y el sitio es 100% estático servido por GitHub Pages — no hay build ni deploy manual, el push a `main` ya lo publica.

**Varias sesiones de Claude corren en paralelo sobre este repo.** Es normal que `git push` rebote — resolver con `git fetch origin main && git merge origin/main --no-edit -m "..."` y volver a pushear. Nunca `--force`, nunca reescribir historia ajena.

## Arquitectura (ya resuelta, no volver a discutir)

- Sitio 100% estático (HTML/CSS/JS sin build step), servido por GitHub Pages. `CNAME` apunta a `training.cosmart.com.ar`.
- **URLs limpias `/tienda/{slug}`** se logran con el truco de GitHub Pages: `/404.html` en la raíz se sirve para cualquier ruta no encontrada, sin cambiar la URL del navegador. `404.html` lee el slug de la URL, busca el producto en `PRODUCT_DB` (o lo trae del catálogo dinámico) y renderiza la ficha completa ahí mismo. **Todos los links/assets dentro de ese archivo tienen que ser absolutos (`/...`)**, porque relativos resolverían contra la URL profunda, no contra la ubicación real del archivo.
- `carrito.html` usa `localStorage` (`ct_carrito`) como fuente de verdad del carrito, compartido entre `tienda.html`, `carrito.html`, `404.html`, `iaprincipiantes.html`, `productos-ganadores.html`.
- El backend vive en `AquiVane/cosmart-workers` (worker `cosmart-training-core`, ver su propio `HANDOFF.md`). `CORE_API` en cada página apunta a ese worker.
- **Páginas de venta individuales que SON y deben seguir siendo standalone** (no redirects): `iaprincipiantes.html`, `contenidosrrss.html`, `productos-ganadores.html`. Sirven como landings de marca para campañas propias, aparte de sus entradas en `/tienda/{slug}`. `producto.html` sí es un shim de redirect (`?slug=` viejo → `/tienda/{slug}`), ese no se toca.
- **La página vieja `cosmart.com.ar/productos-ganadores`** (repo `AquiVane/cosmart`, solo lectura) sigue viva a propósito — el contenido ya está migrado acá pero la vieja no se borra, pueden circular links a cualquiera de las dos.

## Catálogo vigente (ver tabla completa en `cosmart-workers/HANDOFF.md`)

`iaprincipiantes` cambió de nombre visible a **"IA para Emprendedores"** el 27/08 (slug/URL/`<title>`/meta-description siguen diciendo "principiantes" a propósito, por SEO — solo cambió lo que ve la gente: h1, cards, botones, emails). Aparece hardcodeado con ese nombre en: `tienda.html`, `iaprincipiantes.html`, `404.html` (`PRODUCT_DB` y `UPSELL_BASE`), `carrito.html`, `productos-ganadores.html`, `admin/dashboard.html` (mapa de nombres de campaña), `cursos/iaprincipiantes/acceso.html`. Si se vuelve a renombrar, tocar los mismos 7 archivos + el worker.

## Sistema de promociones (agregado 27/08)

Igual lógica que en el backend (ver ese handoff). Del lado frontend, 4 páginas aplican la promoción global al cargar (`cargarPromocionGlobal`/`aplicarPromoSiCorresponde`, fetch a `GET /api/promocion`): `tienda.html`, `404.html`, `iaprincipiantes.html`, `productos-ganadores.html`. Todas mutan los objetos de producto en memoria (nunca el HTML fuente), así que desactivar la promo en el admin alcanza para que todo vuelva a precios normales sin tocar código.

## Banner de la tienda (carrusel)

`tienda.html` tiene un carrusel automático (`BANNER_SLIDES`, hoy vacío — Vaneh tiene que subir las imágenes reales) con autoplay + swipe + puntos. Tamaños definidos: **1600×500px desktop, 1080×1080px mobile** (vía `<picture>`+`<source media>`, no es la misma imagen escalada — son dos encuadres distintos a propósito). Las imágenes de galería de cada producto (no el banner) usan un contenedor de `aspect-ratio` fijo, así que ahí SÍ alcanza con una sola imagen por producto.

## Favicon

`images/favicon*` (ico + png en 8 tamaños) son compartidos por casi todas las páginas del sitio — cambiarlos una vez actualiza el ícono en todo el sitio sin tocar HTML por página. Diseño actual: birrete rojo con un palito vertical simulando la T de Training, calibrado a los golpes (ver sección de errores). Si hay que retocarlo de nuevo, renderizar con `cairosvg` en tamaño real (32px) antes de asumir que se ve bien, no solo en el preview grande.

## Pendiente real / decisiones abiertas

1. **Subir las imágenes reales del banner de la tienda** — el carrusel está armado, solo falta contenido (`BANNER_SLIDES` en `tienda.html`). Prompt sugerido ya entregado a Vaneh.
2. **Crear un código de descuento nuevo** ahora tiene UI en `admin/dashboard.html` (sección "Todos los códigos") — antes solo se podían ver, no crear.
3. Reducir el peso del ebook de `iaprincipiantes` (130MB) — lo hace Vaneh, no bloqueante para nada más.
4. "2x1" real (llevar 2, pagar 1) no está construido — requiere carrito con cantidades, feature aparte.
5. **Meta Pixel/Conversions API** (worker `mp-productos-ganadores`, ver `cosmart-workers/HANDOFF.md`): Vaneh confirmó el 27/08 que quiere activarlo para cuando corra anuncios — está limpiando su cuenta de Meta Ads antes de pasar el Pixel ID/token. Falta: (a) que ella cargue `META_PIXEL_ID` y `META_CAPI_ACCESS_TOKEN` como secrets vía el workflow "Set Worker Secret (admin)", y (b) agregar el script del Pixel del lado del cliente a las páginas de la tienda (hoy no existe, solo quedó el aviso server-side de Purchase) — ofrecido, sin confirmar todavía.
6. **Subir los 2 PDFs de los lead magnets** (contenido ya escrito por Claude, Vaneh hace el diseño): vía `admin/dashboard.html` → subir archivo → carpeta **`leadmagnets`** → el archivo tiene que llamarse **exactamente** `iaprincipiantes.pdf` (guía de IA) y `contenidosrrss.pdf` (guía de contenido) — el nombre importa, es lo que hace que el link ya hardcodeado en el email de entrega funcione. Mientras no estén subidos, ese link da 404 (esperado).
7. **Rediseño de la tienda estilo Cutral-Có** (28/08): Vaneh pidió adaptar `tienda.html` a una estética con fondo azul (en vez de arena/blanco) igual a una presentación que dijo haber adjuntado — **el archivo nunca llegó a esta sesión**, no hay ningún adjunto nuevo en el sistema de subida. Bloqueado hasta que lo vuelva a mandar. También pidió opinión de cuál versión convierte mejor (justificada) — pendiente de tener ambas versiones para comparar.

## Backlog general de Vaneh (Google Sheet, cargado 27/08)

Vaneh mantiene una planilla de Google Sheets con tareas pendientes de TODOS sus productos, no solo training.cosmart.com.ar. Se leyó completa el 27/08 y se repartió por repo. Los repos de cada producto (todos en la cuenta `AquiVane`, todos con push habilitado):

- **training.cosmart.com.ar** → este repo (`AquiVane/training`)
- **hub.cosmart.com.ar** (Marketing Hub, panel de gestión de clientes/contenidos/tareas) → repo `AquiVane/hub`. El backend es el worker `marketing-hub` en `cosmart-workers`.
- **Euforia** (creadoras/marcas, incluye el formulario "UNIRME") → repo `AquiVane/euforia`. Backend: worker `euforia-worker` en `cosmart-workers`.
- **cosmart.com.ar** (sitio institucional viejo + bitácora/blog) → repo `AquiVane/cosmart` (existe una nota vieja de "solo lectura" para no tocar `productos-ganadores` ahí, pero SÍ se puede escribir el resto del sitio, como la bitácora).
- Otros repos de la cuenta vistos pero sin tareas de la planilla todavía: `shows`, `talent`, `mpg`, `germanaquino`, `rumbovoraz`, `comunicos`, `desing`, `euforia-ugc`, `ClaudeIA`, `linkvault` — no tocar sin que Vaneh los mencione.

### Pendientes de training.cosmart.com.ar (este repo)

- ~~Migrar Productos Ganadores a training, sin sacar la vieja~~ — **la planilla dice "In Progress" pero YA ESTÁ HECHO** (ver arriba, `productos-ganadores.html`) — avisar a Vaneh para que actualice el estado en su sheet.
- ~~Actualizar `cursos.html`~~ — **HECHO 27/08**: el link de Productos Ganadores apuntaba a la página vieja `cosmart.com.ar/productos-ganadores.html`, se cambió a `training.cosmart.com.ar/productos-ganadores`. También faltaba `iaprincipiantes` en la grilla pública de "Recursos disponibles" (solo tenía Productos Ganadores + contenidosrrss) — se agregó, y se agregó `iaprincipiantes` al mapa `ICONOS` del dashboard privado (`🤖`).
- ~~"Hacer e-commerce como Spotify"~~ — **confirmado por Vaneh 27/08: ya está hecho, es `tienda.html`**. Cerrado, no requiere nada más.
- ~~"Arreglar curso de estrategia de contenidos que Claude arruinó"~~ (contenidosrrss) — **CONFIRMADO Y ARREGLADO 27/08**: Vaneh confirmó en mayúsculas que sí, el problema era el goteo — las 6 Escalas no se tenían que desbloquear juntas. Se restauró el goteo diario (`calcUnlocked()` en `cursos/contenidosrrss/acceso.html`, una Escala nueva por día desde la fecha de embarque, igual que `calcularDesbloqueadas()` del worker de Productos Ganadores), se corrigió el texto de la UI y de la bienvenida del curso (KV) que todavía decía "no hay goteo", y se agregó el mensaje de bloqueo correcto ("todavía no se desbloqueó" vs. "confirmá tu fecha primero"). Cerrado.
- ~~Infografías de contenidosrrss~~ — **HECHO 27/08**: Vaneh ya las tenía diseñadas y subidas al repo desde el 25/08 (`cursos/contenidosrrss/images/`, pares desktop+mobile: algoritmo-ig, formatos-validados, prisma-hamburguesería, claude-skill) pero nunca se habían wireado al contenido real — solo un placeholder genérico (`puerto1.png`) estaba en uso. Se reemplazó ese placeholder y se agregaron las otras 3 infografías (con `<picture>` responsive) a sus Escalas correspondientes en el seed JSON (`cosmart-workers/workers/cosmart-training-core/seed/contenido-contenidosrrss.json`), y se corrió el workflow "Seed Course Content (KV)" para publicarlas. Cerrado.
- LinkedIn B2B: **confirmado 27/08 por Vaneh — SÍ, ampliar contenidosrrss (no curso aparte), con enfoque de prospección, siempre desde estrategia de contenido** (no ventas/CRM). Investigación hecha vía WebSearch el 27/08, resumen para la próxima sesión que arme el copy:
  - *Contenido*: el algoritmo de LinkedIn en 2026 premia punto de vista por sobre volumen; perfiles personales rinden mucho más que páginas de empresa (la jugada ganadora es postear desde el perfil personal y amplificar desde la página); 3-5 posts/semana desde el perfil personal es lo ideal, más de 1 por día frena el alcance; mejor horario martes-jueves 8-10am y 12-2pm; para pymes/servicios el foco tiene que ser generar consultas concretas, no solo awareness (momentos personales + contenido de solución + CTA claro).
  - *Prospección*: connection requests personalizados (mencionar algo puntual del perfil/contenido/empresa) tienen 55% más aceptación que genéricos; InMail personalizado rinde ~20% mejor que el genérico y hay que ser breve (3 párrafos cortos ganan a 6 largos); cadencia sugerida: día 0 solicitud de conexión, día 2 mensaje de valor (no venta directa), día 7 check-in si no hubo respuesta.
  - Con esto ya se puede armar el módulo/Escala nueva de contenidosrrss — falta que Vaneh revise el enfoque de contenido, y ahí arrancamos con el copy.
- Lead magnet gratuito: **el pedido original de Vaneh quedó ambiguo hasta para ella misma** ("eso quizás quise decir" — 27/08). Dos lecturas posibles: (a) una guía de IA como lead magnet DEL curso `iaprincipiantes`, o (b) una guía de IA como lead magnet PARA atraer gente hacia `contenidosrrss` (el "para emprendimientos" del pedido original sugiere que podría ser esto último). Sin resolver — aclarar con Vaneh antes de escribir una sola línea de copy.
- Adaptar el contenido de Cutral-Có a un curso genérico "Marketing básico para comerciantes" — ya se había dado una opinión sobre esto en una sesión anterior (no lanzarlo aparte, usarlo como lead magnet o producto institucional B2B), retomar esa conversación con Vaneh antes de construir.

### Pendientes de hub.cosmart.com.ar (repo `AquiVane/hub`, sin explorar todavía en detalle)

Urgentes: forzar cambio de contraseña temporal en primer login, asignar tareas a colaboradores dentro del panel de cada cliente, que se mande el mail cuando arroban a alguien en un comentario de una tarjeta de contenido, ~~el botón de editar de un link abre "crear nuevo" en vez de editar~~ (**arreglado 27/08** — links viejos sin campo `id` hacían que `openLinkModal` no encontrara el link correcto; ahora se les asigna un id estable al cargar, ver `js/app.js`/`loadAllData`), asignar automáticamente la tarea de cargar el logo al crear un cliente, soportar que un cliente tenga más de una cuenta conectada (ej. Martín Cañeque con Pharus y MC, o COSMART con Talent/Design/Shows/Euforia) con panel individual + panel conjunto, ~~corregir el botón de eliminar del panel de control (posición/tamaño de la cruz)~~ (**arreglado 27/08** — el botón `.btn-danger` no tenía borde mientras los demás `.btn` sí, causando la diferencia de altura; se igualó la caja de todos los `.btn` con `border:1px solid transparent` + `justify-content:center`). **Nuevo bug reportado 27/08, sin arreglar todavía**: en `admin/index.html`, el menú de "⋮ Más opciones" de cada cliente (`client-row-menu`) se abre recortado/clippeado por la fila de abajo en vez de flotar por encima de todo el contenido — Vaneh ve "✏️ Editar" cortado y no llega a ver "🗑 Eliminar" (que si está en el código, condicionado a `user.role === 'admin'`). Es un problema de posicionamiento/z-index del menú, no de que falte el botón.
Alta: agregar el link directo al admin de training y al admin de Euforia dentro del hub, título separado "CONTENIDOS"/"TAREAS" en Inicio con conteos que alimenten el reporte por mail, favicon del panel, tareas con rango de fechas/sub-tareas tipo proyecto.
Media/sin priorizar: lista de clientes colapsable tipo menú, integración con Meta/Instagram Marketing API (botón "Importar desde Meta"), categorías + drag-to-reorder en Links, Ctrl+Z en campos, límites de duración de video por plataforma (Vaneh tiene que dar los datos), auto-guardado de borrador, pegar links/imágenes inline en Ideas, botón "Crear contenido desde esta idea", revisar una lista vieja de 19 issues del banco de contenidos, confirmar que Links/Sitio Web persisten bien, probar emails de Brevo con un cliente nuevo, panel de control de ventas para el cliente COSMART, sistema de notificaciones de tareas resueltas por colaboradores con filtro por cliente, panel personal de tareas para Vaneh, que las tareas del sitio web también aparezan en el listado general, subir más el azul de fondo del logo de COSMART, pegar imágenes en el resultado final de una pieza de contenido (con límite de peso), plan de suscripción barata (USD 3/mes o USD 30/año) para agencias/creadores/pymes que suban contenido, foto de cliente en PNG con fondo blanco en vez de bordes punteados.
Sin estado en la planilla: conectar aperturas de email de las plataformas internas de COSMART al hub, panel interno compilado de tareas de gestión + verticals con disparo de mails.

### Pendientes de Euforia (repo `AquiVane/euforia`, formulario `unirme.html`)

Alta: agregar edad al formulario de UNIRME, agregar localidad de residencia, agregar checkbox de "Acepto presencias físicas + contenido".

### Pendientes de cosmart.com.ar (repo `AquiVane/cosmart`)

- Artículo de blog nuevo en `/bitacora` una vez por mes — recurrente, tarea de contenido de Vaneh, no de código.
- Redireccionamiento a la bitácora — **la planilla dice "Hecho"**, no requiere nada.
- Subir el PDF de liderazgo y marketing — pendiente, falta el archivo de Vaneh.

## Reglas duras aprendidas a los golpes (no repetir errores)

- **Vaneh se comunica solo en español.** Nunca responder en inglés.
- **Nunca hacer cambios no pedidos.** Ejemplo real: se cambió `.grid` a flexbox en `tienda.html` sin que lo pidiera → corrección explícita ("Nunca te dije que hicieras ese cambio, como estaba estaba bien, volvelo"). Preguntar antes de "mejorar" algo que no se quejó.
- `iaprincipiantes.html` se convirtió por error en un simple redirect en una sesión — tuvo que revertirse porque es una landing de marca standalone a propósito. No volver a convertirla en redirect.
- `.price.discount` scopeado de más (`.price-row .price.discount`) no aplicaba dentro de la barra sticky mobile — si agregás una clase de color condicional, chequear que no esté sobre-scopeada a un contenedor específico.
- No re-renderizar el DOM después de que un SDK de pago (MP Brick, PayPal Buttons) ya se montó ahí — no son idempotentes.
- Al pedir imágenes/prompts, dar tamaños concretos en px y aclarar si mobile/desktop necesitan encuadres distintos (banner) o si un solo tamaño alcanza (galería) — no asumir que se entiende solo.

## Cómo seguir desde acá

Este archivo se actualiza **al menos una vez por semana**, o antes si hubo cambios grandes — ver `CLAUDE.md` en la raíz del repo para la instrucción exacta. Si lo encontrás desactualizado, actualizalo vos mismo antes de terminar la sesión.
