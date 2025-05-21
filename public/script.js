const STORAGE_KEY = "allnighter-name";
const joinTime = new Date();
joinTime.setHours(22, 0, 0, 0);
const endTime = new Date();
endTime.setHours(6, 30, 0, 0);
endTime.setDate(endTime.getHours() < 12 ? endTime.getDate() + 1 : endTime.getDate());

let joined = false;
let startTimestamp = joinTime.getTime();
let asleep = false;
let lastCheck = null;
let popupTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem(STORAGE_KEY);
  if (name) {
    document.getElementById("nameSection").classList.add("hidden");
    document.getElementById("mainSection").classList.remove("hidden");
  }

  document.getElementById("setNameBtn").onclick = () => {
    const input = document.getElementById("nameInput");
    const name = input.value.trim();
    if (name) {
      localStorage.setItem(STORAGE_KEY, name);
      document.getElementById("nameSection").classList.add("hidden");
      document.getElementById("mainSection").classList.remove("hidden");
    }
  };

  document.getElementById("joinBtn").onclick = () => {
    if (!joined && isJoinable()) {
      joined = true;
      lastCheck = Date.now();
      document.getElementById("joinBtn").disabled = true;
    }
  };

  document.getElementById("awakeBtn").onclick = () => {
    lastCheck = Date.now();
    document.getElementById("popup").classList.add("hidden");
    clearTimeout(popupTimeout);
  };

  setInterval(updateStatus, 1000);
  setInterval(() => {
    if (joined && !asleep) {
      const now = Date.now();
      if (!lastCheck || now - lastCheck >= 10 * 60 * 1000) {
        showPopup();
        popupTimeout = setTimeout(() => {
          asleep = true;
          submitResult();
        }, 3 * 60 * 1000);
      }
    }
  }, 10000);

  setInterval(() => {
    if (joined) submitResult();
    updateRanking();
  }, 30000);
});

function updateStatus() {
  const now = new Date();
  const statusText = document.getElementById("statusText");
  const timer = document.getElementById("timer");

  if (now < joinTime) {
