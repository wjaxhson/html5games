export function createSaveUI(options = {}) {
  const {
    root,
    autoSaveSeconds = 30,
    onSave,
  } = options;

  if (!root) {
    throw new Error("createSaveUI: root가 필요합니다.");
  }

  if (typeof onSave !== "function") {
    throw new Error("createSaveUI: onSave 함수가 필요합니다.");
  }

  let remainSeconds = autoSaveSeconds;
  let isSaving = false;
  let timerId = null;

  root.classList.add("save-ui");

  root.innerHTML = `
    <span class="save-ui__status">저장 대기 중</span>
    <span class="save-ui__timer">다음 자동저장까지 ${remainSeconds}초</span>
    <button class="save-ui__button" type="button">저장</button>
  `;

  const statusEl = root.querySelector(".save-ui__status");
  const timerEl = root.querySelector(".save-ui__timer");
  const buttonEl = root.querySelector(".save-ui__button");

  function setStatus(text, type = "") {
    statusEl.textContent = text;
    statusEl.className = "save-ui__status";

    if (type) {
      statusEl.classList.add(`is-${type}`);
    }
  }

  function updateTimerText() {
    timerEl.textContent = `다음 자동저장까지 ${remainSeconds}초`;
  }

  function resetTimer() {
    remainSeconds = autoSaveSeconds;
    updateTimerText();
  }

  async function save(reason = "manual") {
    if (isSaving) return;

    try {
      isSaving = true;
      buttonEl.disabled = true;
      setStatus("저장 중...", "saving");

      await onSave({ reason });

      const now = new Date();
      const timeText = now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setStatus(`${timeText} 저장됨`, "saved");
      resetTimer();
    } catch (error) {
      console.error(error);
      setStatus("저장 실패", "error");
    } finally {
      isSaving = false;
      buttonEl.disabled = false;
    }
  }

  function start() {
    stop();

    timerId = window.setInterval(() => {
      remainSeconds -= 1;

      if (remainSeconds <= 0) {
        save("auto");
        return;
      }

      updateTimerText();
    }, 1000);
  }

  function stop() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  buttonEl.addEventListener("click", () => {
    save("manual");
  });

  updateTimerText();
  start();

  return {
    save,
    start,
    stop,
    resetTimer,
    setStatus,
  };
}
