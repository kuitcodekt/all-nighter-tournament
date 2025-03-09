let joinTime;
let timerInterval;
let popupInterval;
let wakeUpCheckTimeout;
let hasJoined = false;
let isActive = false;
let isSleeping = false;
let confirmedName = "";
let baseTime;
let serverTime;
let lastServerTimeUpdate = 0;

const nameInput = document.getElementById('nameInput');
const joinButton = document.getElementById('joinButton');
const timerDisplay = document.getElementById('timerDisplay');
const startTimerDisplay = document.getElementById('startTimerDisplay');
const rankingTable = document.getElementById('rankingTable').getElementsByTagName('tbody')[0];
const popup = document.getElementById('popup');
const wakeUpButton = document.getElementById('wakeUpButton');
const nameConfirmationPopup = document.getElementById('nameConfirmationPopup');
const confirmNameButton = document.getElementById('confirmNameButton');
const cancelNameButton = document.getElementById('cancelNameButton');

let noSleep = new NoSleep();

function enableNoSleep() {
    noSleep.enable();
    document.removeEventListener('touchstart', enableNoSleep, false);
    document.removeEventListener('click', enableNoSleep, false);
}

document.addEventListener('touchstart', enableNoSleep, false);
document.addEventListener('click', enableNoSleep, false);

nameInput.addEventListener('input', handleNameInput);
joinButton.addEventListener('click', handleJoinButtonClick);
wakeUpButton.addEventListener('click', confirmWakeUp);
confirmNameButton.addEventListener('click', confirmAndJoin);
cancelNameButton.addEventListener('click', cancelJoin);

// --- Time Management ---
async function getServerTime() {
    try {
        const response = await fetch('/api/time'); // VercelのAPIを呼び出す
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        serverTime = new Date(data.time); // そのまま Date オブジェクトにする (JST)
        lastServerTimeUpdate = Date.now();
        console.log("Server Time (JST):", serverTime);

        // 時刻取得に成功したら、必要な処理をここで実行
        setBaseTime();
        checkTimeAndEnableButton();
        startCountdown();
    } catch (error) {
        console.error("Error fetching server time:", error);
        // フォールバック: サーバー時刻取得失敗時はクライアント時刻を使用
        if (!serverTime) {
            serverTime = new Date();
            serverTime.setHours(serverTime.getUTCHours() + 9); // クライアント時刻をJSTに
            lastServerTimeUpdate = Date.now();
            setBaseTime();
            checkTimeAndEnableButton();
            startCountdown();
        }
    }
}

function setBaseTime() {
    if (!serverTime) return;
    baseTime = new Date(serverTime.getFullYear(), serverTime.getMonth(), serverTime.getDate(), 22, 0, 0);
    if (serverTime >= baseTime) {
        baseTime.setDate(baseTime.getDate() + 1);
    }
    console.log("baseTime:", baseTime);
}

// --- UI and Event Handlers ---

function checkTimeAndEnableButton() {
    if (!serverTime) return;

    const now = new Date(serverTime.getTime()); // JST
    const today22h = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0);
    const tomorrow22h = new Date(today22h);
    tomorrow22h.setDate(tomorrow22h.getDate() + 1);

    console.log("checkTimeAndEnableButton - now:", now);

    if (hasJoined && isActive) {
        joinButton.textContent = "参加中";
        joinButton.disabled = true;
        return;
    }

    if (now >= today22h && now < tomorrow22h) {
        joinButton.textContent = confirmedName ? "参加可能" : "名前を設定";
        joinButton.disabled = false;
        checkIfCanRejoin();
    } else {
        joinButton.disabled = true;
        joinButton.textContent = "参加する";
    }
}

function checkIfCanRejoin() {
    const lastJoinDate = localStorage.getItem('lastJoinDate');
    if (!serverTime) return;
    const now = new Date(serverTime.getTime()); //JST

    console.log("checkIfCanRejoin - lastJoinDate:", lastJoinDate);
    console.log("checkIfCanRejoin - now:", now);

    if (lastJoinDate) {
        const lastDate = new Date(lastJoinDate);
        // 日付のみ比較
        if (now.getDate() !== lastDate.getDate() || now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear()) {
            hasJoined = false;
            isActive = false;
            localStorage.removeItem('lastJoinDate');
            localStorage.removeItem('joinTime');
            localStorage.removeItem('hasJoined');
            localStorage.removeItem('isActive');
        } else {
            joinButton.disabled = true;
            joinButton.textContent = "再参加は22:00以降";
        }
    }
}

function startCountdown() {
    if (!serverTime || (hasJoined && isActive)) {
        startTimerDisplay.textContent = "";
        return;
    }

    const now = new Date(serverTime.getTime()); //JST
    let diff = baseTime - now;

    if (diff < 0) {
        startTimerDisplay.textContent = "開始しました！";
        return;
    }

    // 即時表示
    updateCountdownDisplay(diff);

    const countdownInterval = setInterval(() => {
        if (!serverTime) {
            clearInterval(countdownInterval);
            return;
        }
        const now = new Date(serverTime.getTime()); //JST
        let diff = baseTime - now;

        if (diff < 0) {
            clearInterval(countdownInterval);
            startTimerDisplay.textContent = "開始しました！";
            checkTimeAndEnableButton();
            return;
        }

        updateCountdownDisplay(diff);
    }, 1000);
}

function updateCountdownDisplay(diff) {
    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    startTimerDisplay.textContent = `開始まで: ${hours}:${minutes}:${seconds}`;
}

function handleNameInput() {
    if (confirmedName) {
        nameInput.value = confirmedName;
        return;
    }
    checkTimeAndEnableButton();
}

function handleJoinButtonClick() {
    if (!serverTime) return;

    if (confirmedName) {
        if (hasJoined && isActive) return;
        joinContest();
    } else {
        showNameConfirmation();
    }
}

function showNameConfirmation() {
    if (nameInput.value.trim() === '') {
        return;
    }
    nameConfirmationPopup.style.display = 'block';
}

function confirmAndJoin() {
    confirmedName = nameInput.value.trim();
    localStorage.setItem('confirmedName', confirmedName);
    nameInput.disabled = true;
    nameConfirmationPopup.style.display = 'none';
    checkTimeAndEnableButton();
}

function cancelJoin() {
    nameConfirmationPopup.style.display = 'none';
    checkTimeAndEnableButton();
}

function loadConfirmedName() {
    const storedName = localStorage.getItem('confirmedName');
    if (storedName) {
        confirmedName = storedName;
        nameInput.value = confirmedName;
        nameInput.disabled = true;
    }
}

window.addEventListener('load', () => {
    loadConfirmedName();
    getServerTime().then(() => { // getServerTime() が完了してから以下を実行

        hasJoined = localStorage.getItem('hasJoined') === 'true';
        isActive = localStorage.getItem('isActive') === 'true';
        const joinTimeStr = localStorage.getItem('joinTime');

        if (joinTimeStr) {
            joinTime = new Date(joinTimeStr);
        }

        if (hasJoined && isActive) {
            startTimer();
            startPopupChecks(true);
        }
        enableNoSleep();
    });
        //定期実行は削除
});

// --- Core Logic Functions ---

function joinContest() {
    if (hasJoined || !serverTime) return;

    joinTime = new Date(serverTime.getTime());  // JST
    hasJoined = true;
    isActive = true;
    isSleeping = false;
    joinButton.disabled = true;
    joinButton.textContent = "参加中";
    startTimerDisplay.textContent = "";

    console.log("joinContest - now", joinTime);

    startTimer();
    startPopupChecks(true);
    saveToCookie();
    updateRanking();
    localStorage.setItem('lastJoinDate', joinTime.toISOString());
    localStorage.setItem('hasJoined', 'true');
    localStorage.setItem('isActive', 'true');
    localStorage.setItem('joinTime', joinTime.toISOString());
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    if (!serverTime) return;

    timerInterval = setInterval(() => {
        if (!serverTime) {
            clearInterval(timerInterval);
            return;
        }
        const now = new Date(serverTime.getTime()); // JST
        const diff = now - baseTime;

        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

        timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

function startPopupChecks(skipFirst = false) {
    if (popupInterval) clearInterval(popupInterval);

    if (skipFirst) {
        setTimeout(() => {
            if (isActive) {
                popup.style.display = 'block';
                startWakeUpTimeout();
            }
            popupInterval = setInterval(() => {
                if (isActive) {
                    popup.style.display = 'block';
                    startWakeUpTimeout();
                }
            }, 600000);
        }, 600000);
    } else {
        popupInterval = setInterval(() => {
            if (isActive) {
                popup.style.display = 'block';
                startWakeUpTimeout();
            }
        }, 600000);
    }
}

function startWakeUpTimeout() {
    if (wakeUpCheckTimeout) clearTimeout(wakeUpCheckTimeout);

    wakeUpCheckTimeout = setTimeout(() => {
        isActive = false;
        isSleeping = true;
        popup.style.display = 'none';
        saveToCookie();
        updateRanking();
        clearInterval(timerInterval);
        timerDisplay.textContent = "00:00:00";
        clearInterval(popupInterval);
        joinButton.disabled = true;
        joinButton.textContent = "再参加は22:00以降";

        localStorage.setItem('isActive', 'false');

    }, 120000);
}

function confirmWakeUp() {
    clearTimeout(wakeUpCheckTimeout);
    popup.style.display = 'none';
    isSleeping = false;
    saveToCookie();
    updateRanking();
    getServerTime(); // 起きたら時刻更新
}

// --- Cookie and Ranking ---

function saveToCookie() {
    if (!serverTime) return;
    const now = new Date(serverTime.getTime()); //JST
    const elapsedTime = now - baseTime;

    const data = {
        name: confirmedName,
        time: elapsedTime,
        joinTime: joinTime.toISOString(),
        isActive: isActive,
    };

    const cookieData = `${encodeURIComponent(data.name)}=${data.time};${data.joinTime};${data.isActive};`;
    document.cookie = cookieData + "path=/;max-age=" + (60 * 60 * 24 * 365);
}

function loadFromCookie() {
    const cookies = document.cookie.split(';');
    let rankingData = [];

    for (const cookie of cookies) {
        const [namePart, rest] = cookie.trim().split('=');
        const name = decodeURIComponent(namePart);

        if (rest) {
            const [timeString, joinTimeString, isActiveString] = rest.split(';');

            try {
                const time = parseInt(timeString, 10);
                const joinTime = new Date(joinTimeString);
                const isActive = isActiveString === 'true';

                if (!isNaN(time) && !isNaN(joinTime.getTime()) && isActive) {
                    const hours = String(Math.floor(time / (1000 * 60 * 60))).padStart(2, '0');
                    const minutes = String(Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                    const seconds = String(Math.floor((time % (1000 * 60)) / 1000)).padStart(2, '0');
                    const displayTime = `${hours}:${minutes}:${seconds}`;

                    rankingData.push({ name, time, displayTime, joinTime });
                }
            } catch (error) {
                console.error("Error parsing cookie data:", error);
                document.cookie = namePart + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
        }
    }
    return rankingData;
}

function updateRanking() {
    let rankingData = loadFromCookie();

    rankingData.sort((a, b) => b.time - a.time);

    rankingTable.innerHTML = '';

    rankingData.forEach((entry, index) => {
        const row = rankingTable.insertRow();
        const rankCell = row.insertCell();
        const nameCell = row.insertCell();
        const timeCell = row.insertCell();

        rankCell.textContent = index + 1;
        nameCell.textContent = entry.name;
        timeCell.textContent = entry.displayTime;
    });
}
