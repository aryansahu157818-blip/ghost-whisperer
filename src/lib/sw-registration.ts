// src/lib/sw-registration.ts

/**
 * Register the service worker for FCM notifications
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      // In development, we need to handle the service worker differently
      // Vite serves the service worker from the public folder
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return undefined;
    }
  }
  
  return undefined;
};

/**
 * Initialize FCM and service worker
 */
export const initFCM = async (): Promise<void> => {
  // Register service worker first
  await registerServiceWorker();
};