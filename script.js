// script.js (ステップ 3)
console.log("script.js loaded!");

let serverTime; // サーバー時刻を格納する変数

async function getServerTime() {
    try {
        const response = await fetch('/api/time');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        serverTime = new Date(data.time);
        console.log("Server Time (JST):", serverTime); // 取得した時刻を表示

    } catch (error) {
        console.error("Error fetching server time:", error);
    }
}

window.addEventListener('load', () => {
    alert("Page loaded!");

    // NoSleep.js のテスト (省略 - ステップ2で確認済みなら不要)

    getServerTime(); // ページ読み込み時にサーバー時刻を取得
});
