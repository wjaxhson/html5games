import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "./shared/firebase.js";
import { loadGames } from "./shared/game-list.js";

const provider = new GoogleAuthProvider();

const gameListEl = document.getElementById("gameList");
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

loadGames().then((games) => {
  games.forEach((game) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <a href="${game.path}">
        <img
          src="${game.path}${game.thumbnail}"
          alt="${game.title}"
          width="160"
          onerror="this.src='./shared/default-thumbnail.png'"
        />
        <strong>${game.title}</strong>
        <p>${game.description}</p>
      </a>
    `;

    gameListEl.appendChild(li);
  });
});
