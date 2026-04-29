import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBVZ_ZrTIpoe-NcTPlPbSCVFYRq0X1tZ-I",
  authDomain: "bloodlink-61bb7.firebaseapp.com",
  projectId: "bloodlink-61bb7",
  storageBucket: "bloodlink-61bb7.firebasestorage.app",
  messagingSenderId: "426841026024",
  appId: "1:426841026024:web:f38fdd9fa3f845b191885d",
  measurementId: "G-NREL7XZ6T4"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const VAPID_KEY = "BGvB7-9D1cfiXYYGKxHgadEUlku759PLz4VqO77VJoMX-e35VN-peRiaY_sKT8qZBcDAciELXS5B1JIOAgYF-nI";

export const requestFirebaseNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            let registration;
            try {
                // Try to find the existing service worker or register the new one
                const registrations = await navigator.serviceWorker.getRegistrations();
                registration = registrations.find(r => r.active && (r.active.scriptURL.includes('sw.js') || r.active.scriptURL.includes('firebase-messaging-sw.js'))) || 
                               await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                
                await navigator.serviceWorker.ready;
                console.log('Service Worker ready for messaging');
            } catch (e) {
                console.error('Service Worker registration failed:', e);
                registration = await navigator.serviceWorker.ready;
            }
            
            try {
                const currentToken = await getToken(messaging, { 
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: registration 
                });
                if (currentToken) {
                    console.log('FCM Token retrieved successfully');
                    return currentToken;
                } else {
                    console.warn('No registration token available. Request permission to generate one.');
                    return null;
                }
            } catch (tokenErr) {
                console.error('Error getting FCM token. Check VAPID key and Firebase console setup.', tokenErr);
                return null;
            }
        }
    } catch (err) {
        console.error('An error occurred during permission request or token retrieval:', err);
        return null;
    }
};

export const setupOnMessageListener = (callback: (payload: any) => void) => {
    return onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
    });
};
