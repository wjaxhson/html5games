import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiKBsyStMu6M70dWsW76iattfxj1Ike4k",
  authDomain: "html5games-cca1b.firebaseapp.com",
  projectId: "html5games-cca1b",
  storageBucket: "html5games-cca1b.firebasestorage.app",
  messagingSenderId: "472070043446",
  appId: "1:472070043446:web:b57799d5deb6f6bce06597"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
