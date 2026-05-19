import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "./firebase.js";

export function createSaveManager({
  gameId,
  statusEl,
  loginStatusEl,
  autoSaveSeconds = 30,
  getSaveData,
  applySaveData,
  afterLoad
}) {
  const localSaveKey = `html5games:${gameId}:save`;

  let currentUser = null;
  let autoSaveRemaining = autoSaveSeconds;
  let isLoaded = false;

  function getSaveTypeText() {
    return currentUser ? "서버" : "로컬";
  }

  function updateAutoSaveText() {
    if (!statusEl) return;

    statusEl.innerText =
      `${getSaveTypeText()} 자동 저장까지 ${autoSaveRemaining}초`;
  }

  async function save() {
    const saveData = {
      gameId,
      ...getSaveData(),
      updatedAt: Date.now()
    };

    if (currentUser) {
      await setDoc(
        doc(db, "users", currentUser.uid, "games", gameId),
        saveData
      );
    } else {
      localStorage.setItem(localSaveKey, JSON.stringify(saveData));
    }

    autoSaveRemaining = autoSaveSeconds;
    updateAutoSaveText();
  }

  async function load() {
    if (currentUser) {
      const docSnap = await getDoc(
        doc(db, "users", currentUser.uid, "games", gameId)
      );

      if (docSnap.exists()) {
        applySaveData(docSnap.data());
      }
    } else {
      const rawData = localStorage.getItem(localSaveKey);

      if (rawData) {
        applySaveData(JSON.parse(rawData));
      }
    }

    isLoaded = true;
    afterLoad?.();
    updateAutoSaveText();
  }

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (loginStatusEl) {
      loginStatusEl.innerText = user
        ? `${user.displayName} 로그인 중`
        : "비로그인 상태";
    }

    await load();
  });

  setInterval(async () => {
    if (!isLoaded) return;

    autoSaveRemaining -= 1;

    if (autoSaveRemaining <= 0) {
      await save();
      return;
    }

    updateAutoSaveText();
  }, 1000);

  updateAutoSaveText();

  return {
    save,
    load,
    getCurrentUser: () => currentUser
  };
}
