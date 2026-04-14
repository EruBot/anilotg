import { useEffect, useState } from "react";

const API = "https://anilocp.vercel.app/api/miniapp";
const CHAT_ID = "-1001236366475"; // Anime Lovers Indo

type Row = { rank:number; user_id:string; display_name:string; username:string|null; value:number };
type Profile = { user_id:string; first_name:string; username:string|null; chat_mingguan:number; cp_mingguan:number; total_chat:number; total_cp:number; current_rank:string };

export default function MiniApp(){
  const [tg,setTg]=useState<any>(null);
  const [view,setView]=useState<"board"|"profile">("board");
  const [period,setPeriod]=useState<"harian"|"mingguan">("mingguan");
  const [rows,setRows]=useState<Row[]>([]);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [loading,setLoading]=useState(true);

  // init Telegram - sekarang pasti dapat karena test kamu sudah hijau
  useEffect(()=>{
    const w=(window as any).Telegram?.WebApp;
    if(w){ w.ready(); w.expand(); setTg(w); }
  },[]);

  // leaderboard
  useEffect(()=>{
    if(view!=="board") return;
    setLoading(true);
    fetch(`${API}/leaderboard?chat_id=${CHAT_ID}&type=cp&period=${period}`)
      .then(r=>r.json()).then(d=>setRows(d.rows||[])).finally(()=>setLoading(false));
  },[view,period]);

  // profile - pakai initData yang sudah terbukti ada
  useEffect(()=>{
    if(view!=="profile" || !tg?.initData) return;
    setLoading(true);
    fetch(`${API}/profile?chat_id=${CHAT_ID}`,{
      headers:{"X-Telegram-Init-Data": tg.initData}
    }).then(r=>r.json()).then(d=>{
      if(d.ok) setProfile(d.user);
    }).finally(()=>setLoading(false));
  },[view,tg]);

  const user = tg?.initDataUnsafe?.user;

  return (
    <div style={{background:"#020617",color:"#e2e8f0",minHeight:"100vh",padding:"16px 14px 80px",fontFamily:"system-ui"}}>
      <h2 style={{margin:"0 0 4px",fontWeight:800}}>{view==="board"?"Leaderboard Chat Point":"Profile"}</h2>
      <div style={{fontSize:12,opacity:.6,marginBottom:12}}>
        {view==="board" ? "Anime Lovers Indo" : `@${user?.username || user?.first_name}`}
      </div>

      {view==="board" && (
        <>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {(["harian","mingguan"] as const).map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{flex:1,padding:10,borderRadius:10,border:"1px solid #1e293b",background:period===p?"#2563eb":"#0f172a",color:"#fff",fontWeight:700}}>
                {p==="harian"?"Harian":"Mingguan"}
              </button>
            ))}
          </div>
          {loading ? <div style={{opacity:.6,textAlign:"center",padding:40}}>Loading...</div> :
            rows.map(r=>(
              <div key={r.user_id} style={{display:"flex",alignItems:"center",gap:10,background:"#0f172a",border:"1px solid #1e293b",padding:"10px 12px",borderRadius:12,marginBottom:8}}>
                <span style={{width:28,color:"#64748b",fontWeight:700}}>#{r.rank}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700}}>{r.display_name}</div>
                  {r.username && <div style={{fontSize:11,opacity:.6}}>@{r.username}</div>}
                </div>
                <b style={{color:"#7dd3fc"}}>{r.value.toLocaleString("id-ID")}</b>
              </div>
            ))
          }
        </>
      )}

      {view==="profile" && (
        loading ? <div style={{opacity:.6,textAlign:"center",padding:40}}>Loading profile...</div> :
        profile ? (
          <div>
            <div style={{background:"linear-gradient(160deg,#0f172a,#0b1220)",border:"1px solid #1e293b",borderRadius:20,padding:24,textAlign:"center",marginBottom:14}}>
              <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.username||profile.first_name}`} style={{width:80,height:80,borderRadius:16,border:"3px solid #0ea5e9"}}/>
              <h3 style={{margin:"10px 0 0"}}>{profile.first_name}</h3>
              <div style={{opacity:.6,fontSize:13}}>@{profile.username || profile.user_id}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Card label="🏆 Rank" value={profile.current_rank}/>
              <Card label="📊 CP Minggu" value={profile.cp_mingguan.toLocaleString("id-ID")}/>
              <Card label="💬 Chat Minggu" value={profile.chat_mingguan.toLocaleString("id-ID")}/>
              <Card label="💬 Total Chat" value={profile.total_chat.toLocaleString("id-ID")}/>
            </div>
            <div style={{marginTop:12,background:"linear-gradient(135deg,#1e40af,#0ea5e9)",padding:18,borderRadius:16,textAlign:"center"}}>
              <div style={{fontSize:12,opacity:.8}}>⚡ TOTAL CP</div>
              <div style={{fontSize:28,fontWeight:900}}>{profile.total_cp.toLocaleString("id-ID")}</div>
            </div>
          </div>
        ) : <div style={{color:"#fbbf24"}}>Tidak ada data. Chat dulu sekali di grup.</div>
      )}

      <div style={{position:"fixed",bottom:0,left:0,right:0,display:"flex",gap:8,padding:10,background:"#020617ee",borderTop:"1px solid #1e293b"}}>
        <button onClick={()=>setView("board")} style={navBtn(view==="board")}>📊 Board</button>
        <button onClick={()=>setView("profile")} style={navBtn(view==="profile")}>👤 Profile</button>
      </div>
    </div>
  );
}

const Card=({label,value}:{label:string;value:string})=><div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:12}}><div style={{fontSize:11,opacity:.7}}>{label}</div><div style={{fontWeight:800,fontSize:18,marginTop:4}}>{value}</div></div>;
const navBtn=(a:boolean)=>({flex:1,padding:12,borderRadius:10,border:"1px solid #1e293b",background:a?"#2563eb":"#0f172a",color:"#fff",fontWeight:700});
