
import { supabase } from './supabaseClient.js';

function setCookie(name, value, days = 30) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
  const value = '; ' + document.cookie;
  const parts = value.split('; ' + name + '=');
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
}

async function join(name = null) {
  if (!name) {
    name = document.getElementById('name-input').value.trim();
    if (!name) return alert("名前を入力してください");
  }

  setCookie("name", name);

  const { data, error } = await supabase
    .from('participants')
    .insert([{ name }]);

  if (error) {
    if (error.code === '23505') {
      alert("既に参加済みです");
    } else {
      alert("参加できません：" + error.message);
    }
  } else {
    alert("参加しました！");
  }

  document.querySelector('.container').style.display = 'none';
}

async function fetchRanking() {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('duration', { ascending: false });

  const list = document.getElementById('ranking-list');
  list.innerHTML = '';
  if (data) {
    data.forEach((p, i) => {
      const trophy = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      const li = document.createElement('li');
      li.textContent = `${trophy} ${p.name} - ${p.duration ?? '???'}分`;
      list.appendChild(li);
    });
  }
}

window.onload = () => {
  const savedName = getCookie("name");
  if (savedName) {
    join(savedName);
  }
};

fetchRanking();
setInterval(fetchRanking, 30000);
