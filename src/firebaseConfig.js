import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { isSupported } from 'firebase/analytics'; // Ensure this import

// Your web app's Firebase configuration
const firebaseConfig = {
  
  apiKey: "AIzaSyAS12XxTYyK9uDJqNL4iQx4u5ibXoGsxaE",  authDomain: "carbon-emission-tracker-7521c.firebaseapp.com",
  projectId: "carbon-emission-tracker-7521c",
  storageBucket: "carbon-emission-tracker-7521c.appspot.com",
  messagingSenderId: "893318710937",
  appId: "1:893318710937:web:0e87666e0d6ebc9c2d1a08",
  measurementId: "G-JLJ6CLCTYN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analyticsPromise = isSupported().then(supported => {
  return supported ? import('firebase/analytics').then(({ getAnalytics }) => getAnalytics(app)) : null;
});
// Initialize Firestore
export const db = getFirestore(app);
// Initialize Authentication
export const auth = getAuth(app);
export { analyticsPromise as analytics };
// Usage example
analyticsPromise.then(analytics => {
  // Use `analytics` only if supported, otherwise `analytics` will be `null`
});