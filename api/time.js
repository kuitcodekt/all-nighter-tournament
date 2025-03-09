// api/time.js
export default async function handler(req, res) {
  try {
    const response = await fetch('http://worldtimeapi.org/api/timezone/Asia/Tokyo'); // 正しいエンドポイント
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // 正しいUTC Dateオブジェクトの作成
    const serverTimeUTC = new Date(data.datetime);


    res.status(200).json({ time: serverTimeUTC.toISOString() }); // ISO 8601 形式で返す

  } catch (error) {
    console.error("Error fetching time from World Time API:", error);
    // エラー時は、サーバー自身の時刻を返す (フォールバック)
    const now = new Date();
    now.setHours(now.getUTCHours() + 9); // JSTに変換
    res.status(500).json({ time: now.toISOString(), error: "Failed to fetch time from World Time API" });
  }
}
