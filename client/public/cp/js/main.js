import { loadBoard } from './board.js';

export const tg = window.Telegram.WebApp;
tg.ready(); 
tg.expand();

export const API = "https://anilocp.vercel.app/api/miniapp";
export const CHAT_ID = "-1001236366475";

export const state = {
  period: 'mingguan',
  lastTap: 0,
  myProfile: null
};

// debug info
const debug = document.getElementById('debug');
function setDebug(){
  const u = tg.initDataUnsafe?.user;
  debug.textContent = `TG:${!!tg} | len:${tg.initData?.length||0} | id:${u?.id||'-'} | @${u?.username||'-'}`;
}
setDebug(); 
setInterval(setDebug, 800);

// tunggu initData Telegram siap
let tries = 0;
const wait = setInterval(() => {
  if ((tg.initData && tg.initData.length > 50) || tries++ > 80) {
    clearInterval(wait);
    setActive('board');
    loadBoard();
  }
}, 100);

// === NAVIGATION ===
const btnBoard = document.getElementById('btn-board');
const btnProfile = document.getElementById('btn-profile');
const btnGame = document.getElementById('btn-game');
const btnShop = document.getElementById('btn-shop'); // tambahin tombol ini di HTML kalau mau

btnBoard.onclick = () => { 
  setActive('board'); 
  loadBoard(); 
};

btnProfile.onclick = async () => {
  setActive('profile');
  const { loadProfile } = await import('./profile.js');
  loadProfile();
};

btnGame.onclick = async () => {
  setActive('game');
  const { loadGame } = await import('./game.js');
  loadGame();
};

// SHOP - baru
if (btnShop) {
  btnShop.onclick = async () => {
    setActive('shop');
    const { loadShop } = await import('./shop.js');
    loadShop();
  };
}

function setActive(v){
  // matiin semua, nyalain yang dipilih
  ['board','profile','game','shop'].forEach(key => {
    document.getElementById(`btn-${key}`)?.classList.toggle('active', v === key);
  });
}

// === TABS LEADERBOARD ===
document.querySelectorAll('.tab').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    state.period = b.dataset.p;
    loadBoard();
  };
});
