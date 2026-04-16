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

// debug
const debug = document.getElementById('debug');
function setDebug(){
  const u = tg.initDataUnsafe?.user;
  debug.textContent = `TG:${!!tg} | len:${tg.initData?.length||0} | id:${u?.id||'-'} | @${u?.username||'-'}`;
}
setDebug();
setInterval(setDebug, 800);

// tunggu Telegram initData
let tries = 0;
const wait = setInterval(() => {
  if ((tg.initData && tg.initData.length > 50) || tries++ > 80) {
    clearInterval(wait);
    setActive('board');
    loadBoard();
  }
}, 100);

// === NAV ===
const btnBoard = document.getElementById('btn-board');
const btnShop = document.getElementById('btn-shop');
const btnGame = document.getElementById('btn-game');
const btnProfile = document.getElementById('btn-profile');

btnBoard.onclick = () => {
  setActive('board');
  loadBoard();
};

btnShop.onclick = async () => {
  setActive('shop');
  const { loadShop } = await import('./shop.js');
  loadShop();
};

btnGame.onclick = async () => {
  setActive('game');
  const { loadGame } = await import('./game.js');
  loadGame();
};

btnProfile.onclick = async () => {
  setActive('profile');
  const { loadProfile } = await import('./profile.js');
  loadProfile();
};

function setActive(v){
  btnBoard.classList.toggle('active', v === 'board');
  btnShop.classList.toggle('active', v === 'shop');
  btnGame.classList.toggle('active', v === 'game');
  btnProfile.classList.toggle('active', v === 'profile');
}

// === TABS ===
document.querySelectorAll('.tab').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    state.period = b.dataset.p; // 'mingguan' atau 'harian'
    loadBoard();
  };
});
