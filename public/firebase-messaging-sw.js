// firebase-messaging-sw.js
// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting, adjust the URLs accordingly
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
const firebaseConfig = {
  apiKey: self.FIREBASE_CONFIG?.apiKey || '',
  authDomain: self.FIREBASE_CONFIG?.authDomain || '',
  projectId: self.FIREBASE_CONFIG?.projectId || '',
  storageBucket: self.FIREBASE_CONFIG?.storageBucket || '',
  messagingSenderId: self.FIREBASE_CONFIG?.messagingSenderId || '',
  appId: self.FIREBASE_CONFIG?.appId || '',
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});