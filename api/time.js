// api/time.js
export default async function handler(req, res) {
  try {
    const response = await fetch('http://worldtimeapi.org/api/timezone/Asia/Tokyo');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const serverTimeUTC = new Date(data.datetime); // UTCのDateオブジェクト
    res.status(200).json({ time: serverTimeUTC.toISOString() }); // ISOStringで返す
  } catch (error) {
    console.error("Error fetching time from World Time API:", error);
    const now = new Date();
    now.setHours(now.getUTCHours() + 9);
    res.status(500).json({ time: now.toISOString(), error: "Failed to fetch time from World Time API" });
  }
}
