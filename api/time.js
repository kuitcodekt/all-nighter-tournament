// api/time.js
export default async function handler(req, res) {
  try {
    const response = await fetch('http://worldtimeapi.org/api/timezone/Asia/Tokyo');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const serverTimeUTC = new Date(data.datetime);

    // UTC時刻をJSTに変換
    const serverTimeJST = new Date(serverTimeUTC.getTime() + (9 * 60 * 60 * 1000)); // +9時間


    res.status(200).json({ time: serverTimeJST.toISOString() }); // JSTで返す

  } catch (error) {
    console.error("Error fetching time from World Time API:", error);
    // エラー時は、サーバー自身の時刻を返す (フォールバック)
    const now = new Date();
    now.setHours(now.getUTCHours() + 9); // JSTに変換
    res.status(500).json({ time: now.toISOString(), error: "Failed to fetch time from World Time API" });
  }
}
