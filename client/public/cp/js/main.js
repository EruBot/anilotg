import { loadBoard } from './board.js';

export const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();

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
setDebug(); setInterval(setDebug,500);

// tunggu initData
let tries=0;
const wait = setInterval(()=>{
  if((tg.initData && tg.initData.length>50) || tries++>80){
    clearInterval(wait);
    loadBoard();
  }
},100);

// nav
document.getElementById('btn-board').onclick = () => { setActive('board'); loadBoard(); };
document.getElementById('btn-profile').onclick = async () => {
  setActive('profile');
  const { loadProfile } = await import('./profile.js');
  loadProfile();
};
document.getElementById('btn-game').onclick = async () => {
  setActive('game');
  const { loadGame } = await import('./game.js');
  loadGame();
};

function setActive(v){
  document.getElementById('btn-board').classList.toggle('active', v==='board');
  document.getElementById('btn-profile').classList.toggle('active', v==='profile');
}

// tabs board
document.querySelectorAll('.tab').forEach(b=>{
  b.onclick = () => {
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    state.period = b.dataset.p;
    loadBoard();
  };
});
