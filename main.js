import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "./shared/firebase.js";
import { games } from "./shared/game-list.js";

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

games
  .filter((game) => game.visible)
  .forEach((game) => {
    const li = document.createElement("li");

    const gamePath = `./games/${game.id}/`;
    const thumbnailPath = `./games/${game.id}/thumbnail.png`;

    li.innerHTML = `
      <a href="${gamePath}" class="game-card">
        <img
          src="${thumbnailPath}"
          alt="${game.title}"
          class="game-thumbnail"
          onerror="this.src='./shared/default-thumbnail.png'"
        >

        <div class="game-info">
          <h3>${game.title}</h3>
          <p>${game.description}</p>
        </div>
      </a>
    `;

    gameListEl.appendChild(li);
  });
