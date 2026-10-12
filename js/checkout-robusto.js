/* COSMART — checkout robusto (Mercado Pago Brick + PayPal)
 *
 * Por qué existe: en Safari (sobre todo iOS) el SDK de Mercado Pago o el pedido
 * de la preferencia fallan seguido (bloqueadores de contenido, ITP, bfcache,
 * timers pausados, red lenta). Antes había UN solo intento: si fallaba, quedaba
 * un hueco vacío + "El formulario de pago está tardando en cargar".
 * Ahora: reintentos automáticos, recarga del SDK si no cargó, reinicio al volver
 * de bfcache / al recuperar red / al volver a la pestaña, y un "Reintentar".
 *
 * Regla dura: NUNCA se saca a la persona del checkout (ni link a MP hosteado).
 */
(function () {
  var MP_SDK = 'https://sdk.mercadopago.com/js/v2';
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function conTimeout(p, ms, msg) {
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { rej(new Error(msg || 'timeout')); }, ms);
      p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }

  // Carga (o recarga) un <script>. Si `listo()` ya da true, no hace nada.
  function cargarScript(src, listo, attrs) {
    if (listo()) return Promise.resolve();
    return new Promise(function (res, rej) {
      // Sacar el tag viejo roto para no quedar con uno "fallido" cacheado.
      Array.prototype.forEach.call(document.querySelectorAll('script[data-ct-sdk="' + src + '"]'), function (s) { s.remove(); });
      var s = document.createElement('script');
      s.src = src; s.async = true; s.setAttribute('data-ct-sdk', src);
      if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
      s.onload = function () { listo() ? res() : rej(new Error('sdk sin objeto global')); };
      s.onerror = function () { rej(new Error('sdk no cargó')); };
      document.head.appendChild(s);
    });
  }

  var ESTILO_BTN = 'background:#009EE3;color:#fff;border:none;padding:12px 28px;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;font-family:inherit';
  function htmlCargando(txt) {
    return '<div style="text-align:center;padding:28px 12px;color:#64748b;font-size:14px">' +
      '<div style="width:28px;height:28px;margin:0 auto 10px;border:3px solid #cbd5e1;border-top-color:#009EE3;border-radius:50%;animation:ctspin .8s linear infinite"></div>' +
      txt + '</div><style>@keyframes ctspin{to{transform:rotate(360deg)}}</style>';
  }
  function htmlFallo(handler) {
    return '<div style="text-align:center;padding:16px;background:#fffbeb;border-radius:8px;border:1px solid #fbbf24;margin-top:12px">' +
      '<p style="color:#78350f;font-size:13px;margin-bottom:10px">No pudimos cargar el formulario de pago.</p>' +
      '<button type="button" onclick="' + handler + '" style="' + ESTILO_BTN + '">🔄 Reintentar</button>' +
      '<p style="color:#78350f;font-size:12px;margin-top:10px">Si sigue sin cargar, escribinos a <a href="mailto:info@cosmart.com.ar" style="color:#0D2B6B;font-weight:700">info@cosmart.com.ar</a> y te ayudamos a completar la compra.</p></div>';
  }

  /* Brick de Mercado Pago.
   * cfg.crear(): async, hace UN intento completo (preferencia + bricks().create)
   *   y resuelve cuando el Brick está LISTO (onReady) devolviendo el controller.
   * cfg.contenedor / cfg.alt: ids del contenedor del Brick y del div de avisos. */
  function brick(cfg) {
    var DELAYS = cfg.delays || [0, 2500, 6000, 12000];
    var estado = 'idle', run = 0, ctrl = null;
    function ui(h) { var a = document.getElementById(cfg.alt); if (a) a.innerHTML = h; }
    function limpiar() {
      try { ctrl && ctrl.unmount && ctrl.unmount(); } catch (e) {}
      ctrl = null;
      var c = document.getElementById(cfg.contenedor); if (c) c.innerHTML = '';
    }
    async function arrancar() {
      if (estado === 'cargando' || estado === 'listo') return;
      estado = 'cargando';
      var my = ++run;
      for (var i = 0; i < DELAYS.length; i++) {
        if (DELAYS[i]) await sleep(DELAYS[i]);
        if (my !== run) return;
        ui(htmlCargando(i ? 'Reintentando cargar el formulario de pago…' : 'Cargando el formulario de pago…'));
        try {
          await cargarScript(MP_SDK, function () { return typeof MercadoPago !== 'undefined'; });
          limpiar();
          ctrl = await conTimeout(cfg.crear(), 25000, 'brick timeout');
          if (my !== run) return;
          estado = 'listo'; ui('');
          return;
        } catch (e) {
          console.warn('[checkout] intento ' + (i + 1) + ' falló:', e && e.message);
          limpiar();
        }
      }
      if (my === run) { estado = 'fallo'; ui(htmlFallo('CTPago.reintentarBrick()')); }
    }
    // Descarta lo montado (ej. cambió el email) y vuelve a empezar.
    function reiniciar() { run++; estado = 'idle'; limpiar(); return arrancar(); }
    var api = { iniciar: arrancar, reiniciar: reiniciar, estado: function () { return estado; } };
    // Recuperación automática (Safari: bfcache, pestaña dormida, red que vuelve).
    window.addEventListener('pageshow', function (e) { if (e.persisted && estado !== 'idle') reiniciar(); });
    window.addEventListener('online', function () { if (estado === 'fallo') reiniciar(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && estado === 'fallo') reiniciar(); });
    window.CTPago._brick = api;
    return api;
  }

  /* PayPal: asegura el SDK (lo recarga si Safari/un bloqueador lo cortó) y
   * llama a `montar()`. Si falla, deja un "Reintentar" en `altId`. */
  async function paypal(cfg) {
    var alt = document.getElementById(cfg.alt);
    var tag = document.querySelector('script[src*="paypal.com/sdk"]');
    var src = (tag && (tag.getAttribute('data-ct-sdk') || tag.src)) || cfg.src;
    var attrs = {};
    if (tag && tag.getAttribute('data-sdk-integration-source')) attrs['data-sdk-integration-source'] = tag.getAttribute('data-sdk-integration-source');
    for (var i = 0; i < 3; i++) {
      if (alt) alt.innerHTML = htmlCargando('Cargando PayPal…');
      try {
        await cargarScript(src, function () { return typeof window.paypal !== 'undefined' && window.paypal.Buttons; }, attrs);
        if (alt) alt.innerHTML = '';
        await cfg.montar();
        return true;
      } catch (e) {
        console.warn('[checkout] PayPal intento ' + (i + 1) + ':', e && e.message);
        await sleep(1500 * (i + 1));
      }
    }
    if (alt) alt.innerHTML = htmlFallo('CTPago.reintentarPayPal()');
    return false;
  }

  window.CTPago = {
    brick: brick, paypal: paypal, cargarScript: cargarScript, htmlCargando: htmlCargando,
    reintentarBrick: function () { if (window.CTPago._brick) window.CTPago._brick.reiniciar(); },
    reintentarPayPal: function () { if (window.CTPago._ppReintento) window.CTPago._ppReintento(); },
  };
})();
