importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBVZ_ZrTIpoe-NcTPlPbSCVFYRq0X1tZ-I",
    authDomain: "bloodlink-61bb7.firebaseapp.com",
    projectId: "bloodlink-61bb7",
    storageBucket: "bloodlink-61bb7.firebasestorage.app",
    messagingSenderId: "426841026024",
    appId: "1:426841026024:web:f38fdd9fa3f845b191885d",
    measurementId: "G-NREL7XZ6T4"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title || payload.data.title;
    const notificationOptions = {
        body: payload.notification.body || payload.data.message,
        icon: '/icon.svg',
        data: {
          url: payload.data.link || '/'
        }
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});
