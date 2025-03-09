// api/time.js
export default async function handler(req, res) {
  try {
    const response = await fetch('http://worldtimeapi.org/api/timezone/Asia/Tokyo');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const serverTimeUTC = new Date(data.datetime); // UTCのDateオブジェクト

    // UTC時刻をJSTに変換 (明示的に変換)
    const serverTimeJST = new Date(serverTimeUTC.getTime() + (9 * 60 * 60 * 1000));

    res.status(200).json({ time: serverTimeJST.toISOString() }); // JSTで返す

  } catch (error) {
    console.error("Error fetching time from World Time API:", error);
    const now = new Date();
    now.setHours(now.getUTCHours() + 9); // JSTに変換
    res.status(500).json({ time: now.toISOString(), error: "Failed to fetch time from World Time API" });
  }
}
