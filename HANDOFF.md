# HANDOFF — training (frontend, training.cosmart.com.ar)

Actualizado: 2026-08-27. Este archivo reemplaza cualquier handoff anterior que hayas recibido pegado en el chat (ej. `HANDOFFcontenidosrrss.md`, `Handoff — IA para Emprendedores`) — esos describían un flujo de trabajo viejo que ya no existe, ver más abajo. Léelo entero antes de tocar código en este repo. Ver también `HANDOFF.md` en `AquiVane/cosmart-workers` para todo lo del backend.

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

## Reglas duras aprendidas a los golpes (no repetir errores)

- **Vaneh se comunica solo en español.** Nunca responder en inglés.
- **Nunca hacer cambios no pedidos.** Ejemplo real: se cambió `.grid` a flexbox en `tienda.html` sin que lo pidiera → corrección explícita ("Nunca te dije que hicieras ese cambio, como estaba estaba bien, volvelo"). Preguntar antes de "mejorar" algo que no se quejó.
- `iaprincipiantes.html` se convirtió por error en un simple redirect en una sesión — tuvo que revertirse porque es una landing de marca standalone a propósito. No volver a convertirla en redirect.
- `.price.discount` scopeado de más (`.price-row .price.discount`) no aplicaba dentro de la barra sticky mobile — si agregás una clase de color condicional, chequear que no esté sobre-scopeada a un contenedor específico.
- No re-renderizar el DOM después de que un SDK de pago (MP Brick, PayPal Buttons) ya se montó ahí — no son idempotentes.
- Al pedir imágenes/prompts, dar tamaños concretos en px y aclarar si mobile/desktop necesitan encuadres distintos (banner) o si un solo tamaño alcanza (galería) — no asumir que se entiende solo.

## Cómo seguir desde acá

Este archivo se actualiza **al menos una vez por semana**, o antes si hubo cambios grandes — ver `CLAUDE.md` en la raíz del repo para la instrucción exacta. Si lo encontrás desactualizado, actualizalo vos mismo antes de terminar la sesión.
