// Service worker propio de la PWA de ventas -- sin SDK de terceros, solo
// la Push API estándar del browser. Lo mínimo: mostrar la notificación
// que llega y abrir/enfocar la tarjeta de la venta al tocarla.
self.addEventListener('push', function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  var title = data.title || 'COSMART Ventas';
  var options = {
    body: data.body || '',
    icon: data.icon || '/images/favicon-192.png',
    badge: '/images/favicon-192.png',
    data: data.data || {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/admin/app/index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
