const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let rankings = []; // メモリに保持されるランキング（再起動で消える）

app.use(express.static('public'));
app.use(express.json());

// 参加または更新
app.post('/submit', (req, res) => {
  const { name, time, asleep } = req.body;
  if (!name) return res.status(400).send("名前が必要です");

  const existing = rankings.find(p => p.name === name);
  if (existing) {
    existing.time = time;
    existing.asleep = asleep;
  } else {
    rankings.push({ name, time, asleep });
  }

  rankings.sort((a, b) => b.time - a.time);
  res.sendStatus(200);
});

// ランキング取得
app.get('/ranking', (req, res) => {
  res.json(rankings);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
