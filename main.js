import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
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
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;

document.getElementById("loginBtn").addEventListener("click", async () => {
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;

  document.getElementById("userText").innerText =
    currentUser.displayName + " 로그인 성공";
});

document.getElementById("saveBtn").addEventListener("click", async () => {
  if (!currentUser) {
    alert("먼저 로그인하세요.");
    return;
  }

  const saveData = {
    stage: 1,
    gold: Math.floor(Math.random() * 1000),
    hp: 30,
    updatedAt: Date.now()
  };

  await setDoc(doc(db, "saves", currentUser.uid), saveData);

  document.getElementById("saveText").innerText =
    "저장 완료: " + JSON.stringify(saveData);
});

document.getElementById("loadBtn").addEventListener("click", async () => {
  if (!currentUser) {
    alert("먼저 로그인하세요.");
    return;
  }

  const docSnap = await getDoc(doc(db, "saves", currentUser.uid));

  if (docSnap.exists()) {
    document.getElementById("saveText").innerText =
      "불러오기 완료: " + JSON.stringify(docSnap.data());
  } else {
    document.getElementById("saveText").innerText =
      "저장된 데이터가 없습니다.";
  }
});
