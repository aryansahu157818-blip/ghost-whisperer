// src/lib/fcm.ts
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db, auth } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

// Initialize messaging
const messaging = getMessaging();

/**
 * Get FCM token for browser notifications
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    // Check if notification permission is granted
    if (Notification.permission === 'granted') {
      // VAPID key for FCM - using the provided key
      const vapidKey = 'BMLQY-ViMY3ej4p5_-GYlt9YYVg5j-OYmqqkNRjBrKhywOc9JZ0EwFDVoXRxWROlV8HDBJGcWOF5sJeiBlIjTi4';
      
      const token = await getToken(messaging, { vapidKey });
      return token;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = 'BMLQY-ViMY3ej4p5_-GYlt9YYVg5j-OYmqqkNRjBrKhywOc9JZ0EwFDVoXRxWROlV8HDBJGcWOF5sJeiBlIjTi4';
        const token = await getToken(messaging, { vapidKey });
        return token;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Save FCM token to Firestore for the user
 */
export const saveFcmToken = async (token: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        fcmToken: token,
        updatedAt: new Date()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

/**
 * Request notification permission and get token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getFcmToken();
      if (token) {
        await saveFcmToken(token);
        return token;
      }
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Show browser notification
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
};