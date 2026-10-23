# Aula virtual de COSMART Training — manual, despliegue y límites

Última actualización: 23/10/2026. Código: `cosmart-workers` → `workers/cosmart-training-core/src/aula.js` y `aula-youtube.js`; páginas: `aula/index.html` (alumnos) y `admin/aula.html` (administración).

## 1. Manual de uso (administración)
Entrá a `training.cosmart.com.ar/admin/aula` con la clave de administración.

**Flujo de siempre**
1. **Curso**: «+ Nuevo curso» (identificador `capacitacion-marketing`, título, precio, encuentros). Queda en *Borrador*: los alumnos no lo ven. Cuando esté listo, «Editar curso / publicar» → *Publicado*.
2. **Clases**: pestaña *Clases* → «Nueva clase» con título, fecha y hora (hora de Argentina) y duración. Creá las 3.
3. **Vivos**: en YouTube Studio programá cada vivo como **No listado** y activá «Permitir inserción» (la fecha y hora deben coincidir con la clase; en el título poné «Clase 1», «Clase 2»… o parte del título de la clase).
4. **Vinculación**: el sistema la hace solo. Si hay dudas, la clase queda en *Requiere revisión* y te muestra las opciones: tocás «Es esta». Para verlo al instante: pestaña *YouTube* → «Sincronizar ahora».
5. **Alumnos**: quienes compran entran solos. Para inscribir a mano: pestaña *Alumnos* → email → «Inscribir y avisar por mail».
6. **Durante la clase**: pestaña *Preguntas* (podés dejarla abierta en otra ventana o en el celular; se actualiza sola cada 8 s). Botones: *Marcar respondida* (con respuesta opcional), *Destacar*, *Ocultar (moderar)*.
7. **Después**: cuando YouTube termina de procesar, la clase pasa a *Grabación disponible* y los alumnos la ven en su aula.

**Respaldo manual**: en cada clase, pegá el enlace de YouTube y tocá «Vincular». «Desvincular» lo quita. Material: título + enlace (PDF, documento, descargable).
**Accesos**: *Alumnos* → Suspender / Reactivar / Revocar. **Registro**: todas las operaciones administrativas.

## 2. Conectar tu canal de YouTube (una sola vez, ~15 min)
1. Entrá a https://console.cloud.google.com con la cuenta dueña del canal → **Crear proyecto** («COSMART Training Aula»).
2. *APIs y servicios → Biblioteca* → buscá **YouTube Data API v3** → **Habilitar**.
3. *Pantalla de consentimiento de OAuth* (o «Google Auth Platform»): tipo **Externo**, nombre «COSMART Training», tu mail de contacto. En *Permisos* agregá solo `.../auth/youtube.readonly`. **Publicá la app («En producción»)**: si queda en «Prueba», Google corta el acceso cada 7 días. Para tu propio canal no hace falta verificación; vas a ver un aviso de «app no verificada» solo vos: *Avanzado → Continuar*.
4. *Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web*. En **URI de redireccionamiento autorizados** pegá: `https://cosmart-training-core.conglomeradocosmart.workers.dev/aula/youtube/callback` (también aparece en el panel, pestaña YouTube). Copiá el **ID de cliente** y el **Secreto**.
5. Cargá los dos valores como secrets del worker (GitHub → `cosmart-workers` → Actions → **Set Worker Secret (admin)**, dos corridas): worker `cosmart-training-core`, nombres `YT_CLIENT_ID` y `YT_CLIENT_SECRET`.
6. En el panel → *YouTube* → **Conectar YouTube** → elegí tu canal → aceptar. Listo.
La conexión es **solo de lectura**: no puede publicar, editar ni borrar nada. «Desconectar» revoca el permiso en Google y borra los tokens.

## 3. Despliegue (manual, siempre avisando a Vaneh antes)
1. Revisar que ninguna otra rama `claude/*` tenga cambios sin mergear en `workers/cosmart-training-core` (`git diff --name-only origin/main...origin/<rama> -- workers/cosmart-training-core`).
2. GitHub → Actions → **Deploy** → worker `cosmart-training-core` (nunca «all»).
3. Comprobar: `…/aula/cursos` sin sesión debe dar 401 (no 404).
4. Frontend: merge a `main` de `training` (Cloudflare Pages publica solo).
La base D1 `training-aula` ya está creada con las migraciones `0001_aula.sql` y `0002_youtube.sql` (son idempotentes: `CREATE TABLE IF NOT EXISTS`).

## 4. Reversión
- **Frontend**: revertir el merge en `training` (o desactivar el botón «Ir al aula en vivo» de `cursos/capacitacion-marketing/acceso.html`). Las páginas `aula/` y `admin/aula` son independientes del resto.
- **Backend**: volver a desplegar el commit anterior del core desde Actions (Deploy fija la rama; usar un commit previo en `main`). Las rutas `/aula/*` y `/admin/aula/*` son aditivas: sin ellas, el resto del core funciona igual.
- **YouTube**: pestaña *YouTube* → Desconectar (o quitar `YT_CLIENT_ID`/`YT_CLIENT_SECRET`). Las clases conservan el video vinculado.
- **Datos**: las tablas `aula_*` no tocan USERS/SESSIONS ni compras; borrarlas no afecta a nada más.

## 5. Costos y escala
Costo fijo adicional: **US$0** (D1, Workers, KV, Pages y YouTube Data API están en planes gratuitos).
| Alumnos | Estado |
|---|---|
| 10 | Sin problema. |
| 100 | Sin problema: el alumno consulta al abrir la clase, al enviar una pregunta y 1 vez por minuto mientras la clase no terminó. |
| 1.000 | Una clase en vivo con 1.000 personas conectadas hace ~60.000 consultas por clase; con otras visitas puede acercarse al tope de **100.000 solicitudes/día de Workers Free**. A esa escala conviene Workers Paid (~US$5/mes). Vaneh ya lo contempló: se decide cuando llegue. |
- **Cuota de YouTube**: 10.000 unidades/día; cada sincronización usa 2. Con clases cerca se sincroniza cada 15 min (≈200/día como máximo); sin clases cerca, 1 vez por hora o nada.
- D1: 5 GB y 5 millones de lecturas/día gratis; el aula usa una fracción mínima.
- **Cron triggers**: la cuenta está en el tope de 5. El aula **no suma ninguno**: usa el cron de 15 min que ya tiene `cosmart-training-core`.

## 6. Limitaciones (sin promesas de más)
- Un vivo **no listado no es un video protegido** (no hay DRM). El aula restringe el acceso a la *página*; quien extraiga el enlace de YouTube puede compartirlo. No se promete protección absoluta.
- **Contador de espectadores**: la interfaz de COSMART nunca muestra cantidades ni listados. Con el reproductor integrado (`youtube.com/embed`) YouTube **no suele mostrar** el contador de espectadores en vivo, pero no hay una opción oficial que lo garantice: **hay que confirmarlo con un vivo real** (ver checklist). No se pueden controlar los contadores que YouTube muestre en youtube.com.
- **La detección no es instantánea**: depende de consultas periódicas (hasta 15 min cerca de una clase). «Sincronizar ahora» la adelanta.
- La grabación aparece cuando YouTube termina de procesarla (puede tardar desde minutos hasta horas) y solo si permite inserción.
- Quienes compran aparecen en el listado de *Alumnos* del panel la primera vez que entran al aula (el acceso funciona igual desde la compra).
- Las contraseñas de las cuentas de Training usan el método vigente del sitio (HMAC-SHA256 con sal); no se cambió para no afectar cuentas existentes. Mejora sugerida: migrar a PBKDF2/Argon2 con re-hash al iniciar sesión.

## 7. Pruebas
**Automáticas** (`workers/cosmart-training-core`, `npm test`): 83 tests; acceso sin sesión, curso no comprado/borrador, permisos de administración, suspensión/vencimiento, preguntas privadas y límite de envío, enlaces inválidos, OAuth (state de un solo uso, permisos, tokens cifrados), coincidencias única/ambigua/ya vinculada/título distinto/sin inserción, en vivo → grabación, renovación de token, permiso revocado, fallas de Google y consultas innecesarias.
**En navegador** (Playwright, celular y escritorio): recorrido admin → alumna → pregunta → respuesta; conexión OAuth simulada; vinculación automática y revisión; botón del aula; sin scroll horizontal; sin errores de JavaScript.
**Checklist manual pendiente (necesita Google real)**
- [ ] Conectar el canal real y ver el nombre en la pestaña YouTube.
- [ ] Programar un vivo no listado y comprobar la vinculación automática (y «Sincronizar ahora»).
- [ ] Vivo real, 2 cuentas de alumno en 2 dispositivos: se ve el reproductor y **no aparece contador de espectadores** dentro del aula.
- [ ] Enviar una pregunta desde la alumna y responderla desde el celular de administración.
- [ ] Terminar el vivo: la clase pasa a *Grabación disponible* y se reproduce.
- [ ] Verificar la renovación del token a las 24 h (sin reconectar).
- [ ] Revisar accesibilidad básica con lector de pantalla y teclado.
