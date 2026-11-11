/* COSMART · conteo de visitas (12/11/2026).
   Se incluye en las páginas de los sitios de COSMART con:
   <script src="https://training.cosmart.com.ar/js/ct-track.js" data-sitio="vama" defer></script>
   Manda un page_view anónimo al core (nunca bloquea ni rompe la página).
   Comparte ct_session_id con Training: es el navegador del visitante. */
(function () {
  try {
    var el = document.currentScript;
    var sitio = (el && el.getAttribute('data-sitio')) || 'training';
    var id;
    try { id = localStorage.getItem('ct_session_id'); if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)); localStorage.setItem('ct_session_id', id); } } catch (e) { id = 'sin-sesion'; }
    var enviar = function (tipo, extra) {
      try {
        var cuerpo = Object.assign({ session_id: id, sitio: sitio, event_type: tipo, path: location.pathname, ref: document.referrer || null }, extra || {});
        fetch('https://cosmart-training-core.conglomeradocosmart.workers.dev/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify(cuerpo) }).catch(function () {});
      } catch (e) {}
    };
    window.ctTrackSitio = enviar;
    enviar('page_view');
  } catch (e) {}
})();
