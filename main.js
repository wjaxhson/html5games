import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "./shared/firebase.js";

const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const userText = document.getElementById("userText");

loginBtn.addEventListener("click", async () => {
  await signInWithPopup(auth, provider);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    userText.innerText = `${user.displayName}님 환영합니다!`;
    loginBtn.style.display = "none";
  } else {
    userText.innerText = "로그인하지 않음";
    loginBtn.style.display = "inline-block";
  }
});
