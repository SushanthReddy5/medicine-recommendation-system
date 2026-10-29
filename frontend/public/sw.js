// MediAssist Service Worker - Handles System Notifications & Background Alarms
const CACHE_NAME = "mediassist-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle user clicking the system notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/reminders";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle background push messages if sent
self.addEventListener("push", (event) => {
  let data = {
    title: "💊 MediAssist Medicine Reminder",
    body: "Time for your scheduled medication dose.",
  };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const title = data.title || "💊 MediAssist Medicine Reminder";
  const options = {
    body: data.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: data.data || { url: "/reminders" },
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
