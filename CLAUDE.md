# Instrucciones para Claude Code en este repo

Este repo (`AquiVane/training`) es el frontend estático de training.cosmart.com.ar. Trabajás para Vaneh (COSMART).

## Al empezar cualquier sesión

Leé **`HANDOFF.md`** (raíz de este repo) ANTES de tocar código o responder preguntas sobre el estado del proyecto. Tiene la arquitectura ya resuelta, el catálogo vigente, lo pendiente real y errores concretos para no repetir. No vuelvas a derivar esa información desde cero ni le preguntes a Vaneh cosas que ya están contestadas ahí.

También existe `HANDOFF.md` en el repo hermano `AquiVane/cosmart-workers` (backend) — si la tarea toca algo de los workers, revisalo también.

## Mantener el handoff al día

Antes de terminar la sesión (o al menos una vez que pasó una semana desde la fecha que dice arriba de `HANDOFF.md`), actualizalo vos mismo con lo que cambió: qué se hizo, qué decisiones nuevas se tomaron, qué quedó pendiente. No hace falta que Vaneh lo pida — es mantenimiento de rutina, como cualquier otro archivo del repo. Si en una sesión no cambió nada relevante, no hace falta tocarlo.

## Reglas duras del proyecto (ver detalle y contexto en HANDOFF.md)

- Vaneh se comunica **solo en español** — nunca respondas en inglés.
- **Nunca hagas cambios no pedidos.** Si algo te parece mejorable, preguntá antes de tocarlo — no asumas.
- **En cuanto Vaneh confirma que un cambio está bien, mergealo a `main` y pusheá vos mismo, sin esperar a que lo pida aparte** (pedido explícito, 17/09 — antes se dejaba en la rama de trabajo esperando permiso para el merge, y eso generó que ella viera la versión vieja en producción y pensara que el cambio no se había hecho). "Está bien" de su parte ya es la autorización para salir a producción.
- La página vieja `cosmart.com.ar/productos-ganadores` (repo `AquiVane/cosmart`, solo lectura) no se toca ni se borra aunque el contenido ya esté migrado acá.
- `iaprincipiantes.html`, `contenidosrrss.html` y `productos-ganadores.html` son landings standalone a propósito, no redirects.
- **`carrito.html`: NUNCA, bajo ningún punto de vista, se saca a la persona del checkout para pagar en otra pestaña/navegador/sitio hosteado** (ni siquiera el checkout hosteado de Mercado Pago). El pago se resuelve embebido ahí mismo, siempre. Ver detalle en `HANDOFF.md`. **Única excepción (decisión de Vaneh, 20/10/2026):** si la persona elige ella misma "Mercado Pago" o "Mercado Crédito" dentro del Brick, sí sale a la pantalla de Mercado Pago (ya tiene sus tarjetas cargadas y así no se pierde la venta) y vuelve por `back_urls`. No se la saca por ningún otro motivo ni se reemplaza el Brick por un link.
- **NUNCA va un formulario de lead magnet (ni ningún otro desvío) en una landing de producto individual** (`iaprincipiantes.html`, `contenidosrrss.html`, `productos-ganadores.html`, y cualquier página standalone equivalente que se agregue). En esas páginas TODO tiene que llevar a la compra, sin distracciones — ni siquiera una oferta "más chica" gratis. Pasó una vez (28/08) y Vaneh lo marcó como error explícito. El mecanismo de lead magnet en sí (KV `LEADS`, `POST /leadmagnet/captura`, secuencias de seguimiento) sigue existiendo y es válido — el problema es DÓNDE se lo muestra, nunca en la página de venta de un producto.
- `iaprincipiantes.html` es una landing 100% dedicada, al estilo `cosmart.com.ar/productos-ganadores` — no se le agrega nada que no sea parte directa de la venta de ese curso.
- **Marcas propias (regla de Vaneh, 17/10/2026):** toda app, ebook o recurso nuevo que NO sea de COSMART y tenga branding propio debe tener su propio AI Operating System, armado con la misma estructura del de COSMART pero con contenido propio. Antes de escribir o diseñar cualquier cosa para esa marca, leé su Operating System (maestros en `AquiVane/cosmart-workers` → `clientes/<marca>/`, repo privado). Nunca se mezcla con el de COSMART ni con el de otra marca.
- **Apps independientes (regla de Vaneh, 20/10/2026):** cada app nueva es 100 % independiente de las demás: cuentas, sesiones, datos y accesos propios, sin relación con ninguna otra app ni con Training/Academy. La única excepción es lo que vive DENTRO de Training (cursos, ebooks, etc.): ahí los productos se van sumando a la misma cuenta porque son una sola plataforma. Una persona que compra solo una app no tiene acceso a nada más de COSMART. Implementación de referencia: Calendario (`appuser:<mail>` en USERS y sesión `apps:<mail>` en `cosmart-training-core`). El mismo mail puede existir en dos apps distintas.

- **Checkout: el pago carga apenas abre la página (regla de Vaneh, 21/10/2026).** El Brick de Mercado Pago y los botones de PayPal se arman al cargar la página, nunca al hacer scroll ni después de escribir el email/nombre: al llegar abajo ya tienen que estar listos. El email/nombre se validan recién al pagar (en `onSubmit` / `onClick`), y escribir datos NO vuelve a armar el Brick. Pedir SDK y preferencia en paralelo lo antes posible (ver `habitos/index.html` de BienSmart y `js/checkout-robusto.js`).
