import { loadBoard } from './board.js';

export const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();

export const API = "https://anilocp.vercel.app/api/miniapp";
export const CHAT_ID = "-1001236366475";

export const state = { period: 'mingguan', lastTap: 0, myProfile: null };

const debug = document.getElementById('debug');
debug.textContent = `TG:${!!tg} | id:${tg.initDataUnsafe?.user?.id||'-'}`;

let tries = 0;
const wait = setInterval(() => {
  if ((tg.initData && tg.initData.length > 20) || tries++ > 50) {
    clearInterval(wait);
    setActive('board');
    loadBoard();
  }
}, 100);

const btnBoard = document.getElementById('btn-board');
const btnShop = document.getElementById('btn-shop');
const btnGame = document.getElementById('btn-game');
const btnMining = document.getElementById('btn-mining');
const btnProfile = document.getElementById('btn-profile');

btnBoard.onclick = () => { setActive('board'); loadBoard(); };
btnShop.onclick = async () => { setActive('shop'); const {loadShop}=await import('./shop.js'); loadShop(); };
btnGame.onclick = async () => { setActive('game'); const {loadGame}=await import('./game.js'); loadGame(); };
btnMining.onclick = async () => { setActive('mining'); const {loadMining}=await import('./mining.js'); loadMining(); };
btnProfile.onclick = async () => { setActive('profile'); const {loadProfile}=await import('./profile.js'); loadProfile(); };

function setActive(v){
  btnBoard.classList.toggle('active', v==='board');
  btnShop.classList.toggle('active', v==='shop');
  btnGame.classList.toggle('active', v==='game');
  btnMining.classList.toggle('active', v==='mining');
  btnProfile.classList.toggle('active', v==='profile');
  document.getElementById('board-controls').style.display = v==='board'? 'flex' : 'none';
}

document.querySelectorAll('.tab').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    state.period = b.dataset.p;
    loadBoard();
  };
});
