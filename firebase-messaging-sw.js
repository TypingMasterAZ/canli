importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAFaXweRjTkEL6WZZUzvJNPsr2Et-uwH94",
    authDomain: "rabona-media.firebaseapp.com",
    projectId: "rabona-media",
    storageBucket: "rabona-media.firebasestorage.app",
    messagingSenderId: "687991431553",
    appId: "1:687991431553:web:d047c1f2d6af53e9f20880",
    measurementId: "G-75VQ3Q8GH7"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Create BroadcastChannel to communicate with main thread
const bc = new BroadcastChannel('goal_notifications');

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Determine notification content
    const notificationTitle = payload.notification?.title || payload.data?.title || "Yeni Qol!";
    const notificationBody = payload.notification?.body || payload.data?.body || "Matçda yenilik var.";
    
    // For iOS, the system handles 'notification' payload automatically if it exists.
    // If it's a data-only payload, we show it manually.
    if (!payload.notification) {
        const notificationOptions = {
            body: notificationBody,
            icon: 'https://imglink.cc/cdn/hC_7Jg-pCe.png', 
            badge: 'https://imglink.cc/cdn/hC_7Jg-pCe.png',
            data: payload.data, 
            vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
            requireInteraction: true,
            tag: payload.data?.matchId ? `goal-${payload.data.matchId}` : 'general-notification',
            renotify: true,
            // iOS specific: 'sound' must be present in options if showing manually
            sound: 'default'
        };
        return self.registration.showNotification(notificationTitle, notificationOptions);
    }
    
    // Notify main thread via BroadcastChannel
    bc.postMessage({
        type: 'GOAL_NOTIFICATION',
        payload: {
            title: notificationTitle,
            body: notificationBody,
            matchId: payload.data ? payload.data.matchId : null,
            time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
        }
    });
});
