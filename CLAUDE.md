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
- La página vieja `cosmart.com.ar/productos-ganadores` (repo `AquiVane/cosmart`, solo lectura) no se toca ni se borra aunque el contenido ya esté migrado acá.
- `iaprincipiantes.html`, `contenidosrrss.html` y `productos-ganadores.html` son landings standalone a propósito, no redirects.
- **`carrito.html`: NUNCA, bajo ningún punto de vista, se saca a la persona del checkout para pagar en otra pestaña/navegador/sitio hosteado** (ni siquiera el checkout hosteado de Mercado Pago). El pago se resuelve embebido ahí mismo, siempre. Ver detalle en `HANDOFF.md`.
