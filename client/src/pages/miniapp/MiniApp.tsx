import { useEffect, useState, useRef } from "react";

type Period = "harian" | "mingguan";
type View = "board" | "profile";

interface Row {
  rank: number; user_id: string; display_name: string;
  username: string | null; value: number; unit: string; avatar_seed: string;
}
interface Profile {
  user_id: string; first_name: string; username: string | null; chat_id: string;
  chat_mingguan: number; cp_mingguan: number; total_chat: number; total_cp: number;
  custom_title: string | null; last_chat_mingguan: string | null;
  highest_rank: string | null; highest_rank_value: number | null; current_rank: string;
}

const API_BASE = "https://anilocp.vercel.app/api/miniapp/leaderboard";
const PROFILE_API = "https://anilocp.vercel.app/api/miniapp/profile";
const FIXED_CHAT = "-1001236366475";
const GROUP_NAME = "Anime Lovers Indo";

function decodeStart(s:string){ if(!s) return null; if(/^c\d+$/.test(s)) return `-${s.slice(1)}`; return s; }
function getChatId(tg:any){
  const sp = decodeStart(tg?.initDataUnsafe?.start_param || "");
  if(sp) return sp;
  const url = new URLSearchParams(location.search).get("chat_id");
  if(url) return url;
  const hash = new URLSearchParams(location.hash.slice(1)).get("chat_id");
  if(hash) return hash;
  return FIXED_CHAT;
}
const avatar = (s:string)=>`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(s)}&backgroundColor=0a0a1a,111827,1e293b`;
const fmt = (n:number)=>n.toLocaleString("id-ID");

export default function MiniApp(){
  const [tg,setTg]=useState<any>(null);
  const [chatId,setChatId]=useState(FIXED_CHAT);
  const [view,setView]=useState<View>("board");
  const [period,setPeriod]=useState<Period>("mingguan");
  const [rows,setRows]=useState<Row[]>([]);
  const [top,setTop]=useState<Row[]>([]);
  const [loading,setLoading]=useState(true);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [profileRank,setProfileRank]=useState<number|null>(null);
  const [pLoading,setPLoading]=useState(false);
  const abort=useRef<AbortController|null>(null);

  // INIT TELEGRAM - TUNGGU SAMPAI SIAP
  useEffect(()=>{
    let tries=0;
    const init=()=>{
      const w=(window as any).Telegram?.WebApp;
      if(w){ w.ready(); w.expand(); w.setHeaderColor?.("#020617"); setTg(w); setChatId(getChatId(w)); }
      else if(tries++<50) setTimeout(init,100);
    };
    init();
  },[]);

  // BOARD
  useEffect(()=>{
    if(view!=="board"||!chatId) return;
    abort.current?.abort(); const c=new AbortController(); abort.current=c;
    setLoading(true);
    fetch(`${API_BASE}?chat_id=${chatId}&type=cp&period=${period}`,{
      signal:c.signal, headers:{"X-Telegram-Init-Data":tg?.initData||""}
    }).then(r=>r.json()).then(j=>{ setRows(j.rows||[]); setTop(j.top_three||[]); })
     .finally(()=>setLoading(false));
  },[chatId,period,view,tg]);

  // PROFILE - SEKARANG PASTI DAPAT initData
  useEffect(()=>{
    if(view!=="profile"||!tg||!chatId) return;
    setPLoading(true);
    const user=tg.initDataUnsafe?.user;
    if(!user){ setPLoading(false); return; }

    fetch(`${PROFILE_API}?chat_id=${chatId}`,{
      headers:{"X-Telegram-Init-Data":tg.initData||""}
    }).then(r=>r.json()).then(async j=>{
      if(j.ok){ setProfile(j.user);
        const lb=await fetch(`${API_BASE}?chat_id=${chatId}&type=cp&period=mingguan`).then(r=>r.json());
        const me=lb.rows?.find((x:Row)=>String(x.user_id)===String(user.id));
        setProfileRank(me?.rank||null);
      }
    }).finally(()=>setPLoading(false));
  },[view,tg,chatId]);

  const rest=rows.slice(3);
  const user=tg?.initDataUnsafe?.user;

  return (
  <div style={s.root}>
    <div style={s.header}>
      <div style={s.ht}>{view==="board"?"Leaderboard Chat Point":"Profile"}</div>
      <div style={s.hs}>{view==="board"?`Grup: ${GROUP_NAME}`:`@${user?.username||user?.first_name||"..."}`}</div>
      {view==="board"&&<div style={s.tabs}>
        {(["harian","mingguan"] as Period[]).map(p=><button key={p} onClick={()=>setPeriod(p)} style={{...s.tab,p:period===p?s.tabA:{}}}>{p==="harian"?"Harian":"Mingguan"}</button>)}
      </div>}
    </div>

    <div style={s.ct}>
      {view==="board"&&<>
        {loading?<div style={s.sk}>Loading...</div>:<>
          <div style={s.pod}>{[1,0,2].map(i=>{const u=top[i];return u?<div key={u.user_id} style={s.pc}>
            <img src={avatar(u.avatar_seed)} style={{...s.av,w:i===0?64:52,h:i===0?64:52}}/>
            <div style={s.pn}>{u.display_name}</div><div style={s.pv}>{fmt(u.value)} CP</div>
          </div>:<div key={i} style={{flex:1}}/>})}</div>
          {rest.map(u=><div key={u.user_id} style={s.row}>
            <span style={s.rn}>#{u.rank}</span><img src={avatar(u.avatar_seed)} style={s.ra}/>
            <div style={{flex:1}}><div style={s.rnm}>{u.display_name}</div>{u.username&&<div style={s.ru}>@{u.username}</div>}</div>
            <div style={s.rv}>{fmt(u.value)}</div>
          </div>)}
        </>}
      </>}

      {view==="profile"&&<>
        {pLoading&&<div style={s.sk}>Loading profile...</div>}
        {profile&&<>
          <div style={s.hero}>
            <img src={avatar(profile.username||profile.first_name)} style={s.ha}/>
            <div style={s.hn}>{profile.first_name}</div>
            <div style={s.hh}>@{profile.username||profile.user_id}</div>
          </div>
          <div style={s.grid}>
            <div style={s.gc}><span>🏆 Rank</span><b>{profile.current_rank}</b></div>
            <div style={s.gc}><span>🏅 Highest</span><b>{profile.highest_rank||"-"}</b></div>
            <div style={s.gc}><span>📊 CP Minggu</span><b>{fmt(profile.cp_mingguan)}</b></div>
            <div style={s.gc}><span>💬 Chat Minggu</span><b>{fmt(profile.chat_mingguan)}</b></div>
            <div style={s.gc}><span>💬 Total Chat</span><b>{fmt(profile.total_chat)}</b></div>
            <div style={s.gc}><span>📍 Rank CP</span><b>{profileRank?`#${profileRank}`:"-"}</b></div>
          </div>
          <div style={s.life}><span>⚡ TOTAL CP</span><b>{fmt(profile.total_cp)}</b></div>
        </>}
        {!profile&&!pLoading&&<div style={s.err}>Buka dari Telegram. Jika masih Guest, tunggu 2 detik.</div>}
      </>}
    </div>

    <div style={s.nav}>
      <button onClick={()=>setView("board")} style={{...s.nb,...(view==="board"?s.nba:{})}}>📊 Board</button>
      <button onClick={()=>setView("profile")} style={{...s.nb,...(view==="profile"?s.nba:{})}}>👤 Profile</button>
    </div>
  </div>
  );
}

const s:Record<string,any>={
  root:{minHeight:"100vh",background:"#020617",color:"#e2e8f0",fontFamily:"Inter,system-ui",paddingBottom:70},
  header:{position:"sticky",top:0,padding:"16px",background:"#020617ee",backdropFilter:"blur(8px)",zIndex:10},
  ht:{fontSize:20,fontWeight:800}, hs:{fontSize:11,opacity:.6,marginTop:2,textTransform:"uppercase"},
  tabs:{display:"flex",gap:8,marginTop:12}, tab:{flex:1,padding:"9px",borderRadius:10,background:"#0f172a",border:"1px solid #1e293b",color:"#94a3b8",fontWeight:700}, tabA:{background:"linear-gradient(135deg,#2563eb,#0ea5e9)",color:"#fff",borderColor:"#38bdf8"},
  ct:{padding:"12px 14px"}, sk:{padding:40,textAlign:"center",opacity:.6},
  pod:{display:"flex",gap:8,marginBottom:16,alignItems:"flex-end"}, pc:{flex:1,background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:12,textAlign:"center"},
  av:{borderRadius:14,border:"2px solid #334155"}, pn:{fontSize:12,fontWeight:700,marginTop:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}, pv:{fontSize:13,fontWeight:800,color:"#7dd3fc",marginTop:2},
  row:{display:"flex",alignItems:"center",gap:10,background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"10px 12px",marginBottom:8},
  rn:{width:28,textAlign:"center",color:"#64748b",fontWeight:700}, ra:{width:38,height:38,borderRadius:10}, rnm:{fontWeight:700,fontSize:14}, ru:{fontSize:11,color:"#64748b"}, rv:{fontWeight:800,color:"#7dd3fc"},
  hero:{background:"linear-gradient(160deg,#0f172a,#0b1220)",border:"1px solid #1e293b",borderRadius:20,padding:24,textAlign:"center",marginBottom:14},
  ha:{width:80,height:80,borderRadius:20,border:"3px solid #0ea5e9",marginBottom:10}, hn:{fontSize:22,fontWeight:900}, hh:{color:"#64748b",fontSize:13,marginTop:2},
  grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}, gc:{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:12,display:"flex",flexDirection:"column",gap:4},
  life:{marginTop:12,background:"linear-gradient(135deg,#1e40af,#0ea5e9)",borderRadius:16,padding:18,textAlign:"center"},
  err:{background:"#f59e0b20",border:"1px solid #f59e0b40",color:"#fcd34d",padding:12,borderRadius:12,textAlign:"center",fontSize:13},
  nav:{position:"fixed",bottom:0,left:0,right:0,display:"flex",gap:8,padding:10,background:"#020617f0",borderTop:"1px solid #1e293b"}, nb:{flex:1,padding:12,borderRadius:12,background:"#0f172a",border:"1px solid #1e293b",color:"#94a3b8",fontWeight:700}, nba:{background:"#2563eb",color:"#fff",borderColor:"#3b82f6"}
};
