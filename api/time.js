// api/time.js
 export default function handler(req, res) {
   const now = new Date();
   // 日本時間のタイムゾーンオフセット（UTC+9時間）
const japanOffset = 9 * 60;

// 現在のタイムゾーンオフセットを取得（分単位）
const localOffset = now.getTimezoneOffset();

// 日本時間を計算
const japanTime = new Date(now.getTime() + (japanOffset + localOffset) * 60 * 1000);

console.log(japanTime.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));

   res.status(200).json({ time: now.toISOString() });
 }
