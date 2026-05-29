import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCYg8cOHAq36074tyuTyrcGGIppnPQpTL0",
  authDomain: "fighter-tiers.firebaseapp.com",
  projectId: "fighter-tiers",
  storageBucket: "fighter-tiers.firebasestorage.app",
  messagingSenderId: "14653168345",
  appId: "1:14653168345:web:457731ddc8d18b1b5a3cc8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  onSnapshot
};
