import { requestFirebaseNotificationPermission } from './firebase';

export const subscribeToPush = async (token: string) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const fcmToken = await requestFirebaseNotificationPermission();
    if (fcmToken) {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: fcmToken })
      });
      console.log('Firebase Push notification successfully subscribed with server.');
    }
  } catch (err) {
    console.error('Firebase Push API setup failed:', err);
  }
};
