---
name: ebook-training
description: Crear un ebook nuevo de COSMART Training (o de una marca propia de Vaneh) de punta a punta: entrevista, textos aprobados, landing, tienda, SEO, checkout, alta en backend/Hub (ventas, facturación, profit) y métricas. Usalo SIEMPRE que Vaneh diga "ebook nuevo", "nuevo producto digital", "subamos un ebook" o pase un PDF para vender. Basado en «La P de precio» (01/11/2026).
---

# Skill: ebook nuevo de COSMART Training

Hablás en español rioplatense, sos Elena. Nunca en inglés. Optimizá tokens: no releas lo que ya está en este skill ni en los HANDOFF.

## 0. Antes de tocar nada
1. Leé `HANDOFF.md` de `AquiVane/training` y de `AquiVane/cosmart-workers` (si no está en la sesión: `add_repo` + clonar shallow). No le preguntes a Vaneh lo que ya está contestado ahí.
2. `list_sessions` (mine) y buscá sesiones que hablen del mismo ebook o tema: recuperá datos, no dupliques tareas.
3. **AI Operating System: lectura OBLIGATORIA en todos los casos**, antes de escribir o diseñar nada, por branding:
   - Producto de COSMART o de una vertical dentro de COSMART (Training, Academy, Apps, etc.): leé el Operating System de COSMART (`cosmart-workers/clientes/cosmart/`) y revisá además el branding propio de esa vertical/repositorio/landing (paleta, tipografías, tono).
   - Marca aparte con branding propio: leé SU Operating System en `cosmart-workers/clientes/<marca>/` (repo privado). Si no existe, frená y avisá. Nunca se mezcla con el de COSMART ni con el de otra marca.
   - Los demás repos de Vaneh (`list_repos`: hub, cosmart, vama, BienSmart, apps-cosmart, apps-vama, etc.) sirven de referencia de estilo; no se tocan sin pedido.
   - **Alcance de los textos:** solo se escriben los textos del propio ebook, su landing/single page y sus correos. Nada más (no se reescribe home, menús ni otras páginas).
4. Referencia de implementación: el ebook «La P de precio» (`precio.html`, `PRODUCT_DB['la-p-de-precio']` en `404.html`, `COURSES['la-p-de-precio']` en `cosmart-training-core`). Copiá su estructura, no la re-derives.

## 1. Entrevista (AskUserQuestion, de a pocas preguntas)
**Primera pregunta siempre: ¿en qué tienda se va a vender?** (Training, VAMA Academy, Apps COSMART, Apps VAMA, BienSmart u otra). De eso dependen el repo, el catálogo, la vertical de ventas y el branding a leer.
Después, solo lo que falte: título, slug (kebab-case, el nombre del ebook; ver «Estructura de links»), autora, marca, promesa y público, páginas/formato del PDF, **precio en USD** (siempre se pregunta), mínimo PayPal (≈50 % del precio USD), mail de entrega, origen del tráfico previsto (Instagram, mail, anuncios, Google/IAs) y si lleva upsell o crédito con otro producto.
**Precio en pesos:** conversión SIEMPRE al dólar del día. Consultá la cotización de HOY (WebFetch/WebSearch, ej. dolarapi.com), usá siempre el **dólar oficial** (decisión de Vaneh, 02/11/2026), decile de dónde salió el valor del día, y **fijá** el ARS = USD × dólar (mismo valor en landing, ficha, card, carrito y backend). No se recalcula solo después.
**Imágenes:** pedíselas a Vaneh por el chat y Claude las sube él mismo (`images/<slug>/`, webp optimizado): (a) imagen de catálogo en formato **horizontal** (el que usa la card de esa tienda; fijate en las cards existentes), (b) versión **mobile** para responsive, (c) las de la single page del producto. Si falta alguna, pedila antes de armar la página.

## Estructura de links (regla de Vaneh, 02/11/2026)
Siempre la misma, en el dominio principal del repo/tienda elegida:
- **Landing page:** `<dominio>/<nombre-del-ebook>` (ej. `training.cosmart.com.ar/<nombre-del-ebook>`).
- **Single page de producto:** `<dominio>/tienda/<nombre-del-ebook>`.
Mismo `<nombre-del-ebook>` en las dos, igual al slug del backend (`COURSES`, `PRODUCT_DB`, sitemap, llms.txt, carrito). No usar slugs cortos distintos entre landing y ficha. (Excepción heredada: «La P de precio» tiene landing en `/precio` y ficha en `/tienda/la-p-de-precio`; no se cambia sin pedido.)

## 2. Textos: primero al chat, esperar OK
Todo texto (landing, ficha, mail de compra, FAQ, anuncios) se publica en la conversación y se espera aprobación explícita antes de seguir. **No se sube nada de textos hasta tener el OK.** Si hay un email marketing: primero contenido, después previsualización estética; fondo oscuro ⇒ texto blanco. Todo mail nuevo del backend va envuelto en `emailBase()` y, si es automático, con la línea final «Este es un mail automático.»

## 3. Diseño y landing (repo `training`)
- Preview primero como **Artifact** (con comentarios) para nuevas landings; corregir desde ahí antes de subir.
- Archivo `<slug>.html` standalone, servido como `/<slug>` (ver «Estructura de links»). Landing 100 % de venta: **nunca** formulario de lead magnet ni desvíos.
- Fondos: azul marino `#091C47`, `#0D2B6B`/`#1A4DAA`, marino profundo `#060F22`, rojo `#E02020` de acento. **Nunca arena, crema, beige ni blanco.** Texto claro sobre oscuro.
- Botones con la animación `tum` (latido) como en `precio.html`. Responsive mobile-first (probar 360/390/768/1280). **Probar que cada botón funcione** (Playwright está instalado: `require('playwright')`).
- Botón de compra: guarda `ct_carrito` con `{slug, nombre, precio (ARS), precioUsd}` y va a `/carrito`. No se saca a la persona del checkout (única excepción: Mercado Pago/Crédito elegidos por ella dentro del Brick).
- **Beacon de métricas obligatorio** en la landing, la ficha y el carrito: `page_view` al cargar y `add_to_cart` en cada botón de compra, con `slug` y `titulo` del producto (copiar el bloque `ctSessionId`/`ctTrack` de `precio.html`). Sumar `utm_source/utm_medium/utm_campaign` y `document.referrer` al evento para medir el origen del tráfico.
- Imágenes en `images/<slug>/` (webp optimizado). `og:image` 1200×630.

## 4. Tienda, single page y catálogo de la home
- **Single page de producto: se desarrolla una por cada ebook nuevo** (ficha en `404.html`, `PRODUCT_DB`, slug del ebook; modelo `pastor` de `iaprincipiantes` si lleva ficha completa, mobile y desktop). Sus textos van al chat y esperan aprobación, igual que la landing.
- **Subir el producto a la tienda que corresponda** (la elegida en la entrevista): card en el catálogo de esa tienda (`tienda.html` en Training; en las demás, el archivo/repo equivalente) con la imagen horizontal y su versión mobile.
- **Agregarlo también al catálogo de la home de esa tienda** (sección de productos/destacados de su página principal), verificando que el link, el precio y el botón funcionen en mobile y desktop.
- Antes de terminar, **aplicá el skill `anthropic-skills:seo-strategy`**: `sitemap.xml`, `llms.txt`, JSON-LD (Book, Product, FAQPage), hreflang, OG/Twitter, canonical, FAQ pensada para que las IAs lo recomienden.

## 5. Alta en backend y Hub (solo con el OK de «producto aprobado» de Vaneh en el chat)
Repo `cosmart-workers`, rama de trabajo propia, `node --check` antes de commitear:
1. `cosmart-training-core/src/index.js`: constante del slug + entrada en `COURSES` (`esProductoSimple`, `oculto:true`, `precioUsd`, `entregaPorMail:true`, `archivos` → key `ebook-<slug>/<Archivo>.pdf`, `archivoUrl`, `mailCompra`) + mínimo en `PAYPAL_MIN_USD`.
2. `mp-productos-ganadores/src/index.js`: mapa `{courseId, useCore:true}` y título («E-book: …»).
3. PDF a R2 (`training-product-files`) con el workflow `upload-r2-file.yml`. Los PDF los ubica Claude; Vaneh solo los pasa por el chat. Nunca el binario en el repo.
4. **Hub / ventas:** un producto del core ya anota su venta solo (vertical Training vía `verticalDeVenta`, con producto). Si es otra vertical/marca, revisar `verticalDeVenta` y `VERTICALES_VENTAS`. **Facturación ARCA:** ARS se factura sola (pendiente de CAE, cron cada 15 min); USD/PayPal no se factura.
5. **Profit = ventas − comisiones (MP/PayPal) − inversión.** Se usa el **Panel de ventas del Hub** (ya existe: `GET/PUT /admin/ventas-panel/config?vertical=&mes=` en `marketing-hub`, con `gastoAnuncios`, `retencionMP`, `retencionPaypal` y `meta`). Vaneh carga la inversión ahí; hoy es por vertical y por mes, no por producto: no inventar otra planilla. Recordale cargar el gasto del mes cuando salga el ebook.
   - **PENDIENTE (dejar anotado en el HANDOFF de ambos repos):** conectar **Meta Ads** al Hub para traer la inversión directo, y que se vea por producto/campaña en el Panel de ventas. Todavía no está conectado.
6. **Deploy MANUAL, avisando antes, nunca «all»:** solo `cosmart-training-core` y `mp-productos-ganadores`. Antes: `git fetch` y revisar `git diff --name-only origin/main...origin/<rama>` de las ramas `claude/*` abiertas; si otra sesión tiene cambios en ese worker, no desplegar sin permiso.

## 6. Métricas que tiene que mostrar el Hub por ebook
Visitas a la landing, agregados al carrito, inicio de checkout, compras y conversión paso a paso, carritos abandonados y origen del tráfico (UTM/referrer), más ventas, comisiones, inversión y **profit**. Tablero en la pestaña «Métricas» del admin (`GET /admin/metricas`, filtro por `slug`). Verificá que el slug del ebook aparezca en el desglose después del primer evento.

## 7. Cierre (checklist)
- [ ] Operating System (COSMART/vertical/marca) leído · [ ] tienda elegida · [ ] USD preguntado y ARS fijado al dólar del día (fuente informada)
- [ ] Textos (ebook, landing/single page, mails) aprobados en el chat · [ ] preview Artifact aprobado · [ ] botones probados · [ ] responsive revisado
- [ ] Imágenes (catálogo horizontal + mobile + single page) subidas por Claude · [ ] single page creada · [ ] card en la tienda · [ ] agregado al catálogo de la home
- [ ] SEO aplicado (sitemap, llms.txt, JSON-LD) · [ ] beacon + UTM cableados
- [ ] Alta backend desplegada con aviso · [ ] PDF en R2 · [ ] venta de prueba MP y PayPal: llega el mail con el PDF y queda en el Panel de ventas (Training)
- [ ] Profit/inversión cargados · [ ] cambios pusheados; **tras el «está bien» de Vaneh, merge a `main` y push sin esperar otro pedido** (producción = Cloudflare Pages, auto-deploy)
- [ ] `HANDOFF.md` de ambos repos actualizados con fecha, decisiones y pendientes

## Errores a no repetir
Formulario de lead magnet en una landing de producto · fondos arena/blanco · armar el Brick al hacer scroll o al escribir el email · mandar un pago sin `producto` · desplegar «all» · subir textos sin OK · precio ARS distinto entre landing, ficha y `carrito` · olvidar el beacon en la landing nueva.
