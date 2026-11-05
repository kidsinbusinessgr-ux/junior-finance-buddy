self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  const data = event.data.json();
  const title = data.title || 'Kids in Business';
  const options = {
    body: data.body || '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: { url: data.url || '/stocks' },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/stocks';
  event.waitUntil(clients.openWindow(url));
});
