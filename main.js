import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiKBsyStMu6M70dWsW76iattfxj1Ike4k",
  authDomain: "html5games-cca1b.firebaseapp.com",
  projectId: "html5games-cca1b",
  storageBucket: "html5games-cca1b.firebasestorage.app",
  messagingSenderId: "472070043446",
  appId: "1:472070043446:web:b57799d5deb6f6bce06597"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const userText = document.getElementById("userText");

loginBtn.addEventListener("click", async () => {
  await signInWithPopup(auth, provider);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    userText.innerText = `${user.displayName} 로그인 중`;
    loginBtn.style.display = "none";
  } else {
    userText.innerText = "로그인하지 않음";
    loginBtn.style.display = "inline-block";
  }
});
