const firebaseConfig = {
  apiKey: "AIzaSyC_QPmomjx6YmP55SiorvkODVHf7-z8mTA",
  authDomain: "digilayn-core-app.firebaseapp.com",
  projectId: "digilayn-core-app",
  storageBucket: "digilayn-core-app.firebasestorage.app",
  messagingSenderId: "362012916883",
  appId: "1:362012916883:web:3a3d64ee448c536e912166",
  measurementId: "G-13CS1P7XJ2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const analytics = firebase.analytics();

// Connect to Firebase Emulators if running locally
// if (location.hostname === "localhost" ||
//     location.hostname === "127.0.0.1" ||
//     location.hostname.startsWith("192.168.") ||
//     location.hostname.startsWith("10.") ||
//     location.hostname.endsWith(".local")) {
//   const host = location.hostname;
//   console.log(`Connecting to Firebase Emulators at ${host}...`);
//   db.useEmulator(host, 8080);
//   auth.useEmulator(`http://${host}:9099`);
//   // If you use Storage, add: firebase.storage().useEmulator(host, 9199);
// }

// Enable offline persistence with multi-tab support
if (location.protocol !== 'file:') {
  db.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        // This can still happen if multiple tabs are open with different persistence settings.
        console.warn('Firebase persistence failed: multiple tabs open with different settings.');
      } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence.
        console.warn('Firebase persistence failed: browser does not support it.');
      }
    });
}

/**
 * Logs a user trace (login or register event) to Firestore.
 * @param {string} uid - The user's Firebase UID.
 */
async function logUserTrace(uid) {
  try {
    await db.collection('user_traces').doc(uid).set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      browser: navigator.userAgent
    }, { merge: true });
  } catch (error) {
    console.error('Error logging user trace:', error);
  }
}
