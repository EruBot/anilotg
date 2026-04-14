import { useEffect, useState } from "react";

const API = "https://anilocp.vercel.app/api/miniapp";

export default function MiniApp(){
  const [tg,setTg]=useState<any>(null);
  const [view,setView]=useState<"board"|"profile">("board");
  const [period,setPeriod]=useState<"harian"|"mingguan">("mingguan");
  const [rows,setRows]=useState<any[]>([]);
  const [profile,setProfile]=useState<any>(null);

  useEffect(()=>{
    const w=(window as any).Telegram?.WebApp;
    if(w){ w.ready(); w.expand(); setTg(w); }
  },[]);

  const chatId="-1001236366475";

  useEffect(()=>{
    if(view!=="board")return;
    fetch(`${API}/leaderboard?chat_id=${chatId}&type=cp&period=${period}`,{
      headers:{"X-Telegram-Init-Data":tg?.initData||""}
    }).then(r=>r.json()).then(d=>setRows(d.rows||[]));
  },[period,view,tg]);

  useEffect(()=>{
    if(view!=="profile"||!tg)return;
    fetch(`${API}/profile?chat_id=${chatId}`,{
      headers:{"X-Telegram-Init-Data":tg.initData||""}
    }).then(r=>r.json()).then(d=>{ if(d.ok) setProfile(d.user); });
  },[view,tg]);

  const user=tg?.initDataUnsafe?.user;

  return <div style={{background:"#020617",color:"#fff",minHeight:"100vh",padding:16,fontFamily:"system-ui"}}>
    <h2>{view==="board"?"Leaderboard Chat Point":"Profile"}</h2>
    
    {view==="board"&&<>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <button onClick={()=>setPeriod("harian")} style={{flex:1,padding:8,background:period==="harian"?"#2563eb":"#1e293b",border:0,color:"#fff",borderRadius:8}}>Harian</button>
        <button onClick={()=>setPeriod("mingguan")} style={{flex:1,padding:8,background:period==="mingguan"?"#2563eb":"#1e293b",border:0,color:"#fff",borderRadius:8}}>Mingguan</button>
      </div>
      {rows.slice(0,10).map((r:any)=><div key={r.user_id} style={{padding:10,background:"#0f172a",marginBottom:6,borderRadius:8,display:"flex",justifyContent:"space-between"}}>
        <span>#{r.rank} {r.display_name}</span><b>{r.value.toLocaleString()} CP</b>
      </div>)}
    </>}

    {view==="profile"&&<>
      {!profile&&<div>Loading...</div>}
      {profile&&<div style={{background:"#0f172a",padding:20,borderRadius:16,textAlign:"center"}}>
        <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.username||profile.first_name}`} style={{width:80,height:80,borderRadius:16,marginBottom:10}}/>
        <h3 style={{margin:0}}>{profile.first_name}</h3>
        <div style={{opacity:.6}}>@{profile.username||profile.user_id}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16,textAlign:"left"}}>
          <div style={{background:"#1e293b",padding:12,borderRadius:10}}>Rank<br/><b>{profile.current_rank}</b></div>
          <div style={{background:"#1e293b",padding:12,borderRadius:10}}>CP Minggu<br/><b>{profile.cp_mingguan}</b></div>
          <div style={{background:"#1e293b",padding:12,borderRadius:10}}>Chat Minggu<br/><b>{profile.chat_mingguan}</b></div>
          <div style={{background:"#1e293b",padding:12,borderRadius:10}}>Total CP<br/><b>{profile.total_cp}</b></div>
        </div>
      </div>}
      <div style={{marginTop:10,fontSize:12,opacity:.5}}>User ID: {user?.id} | initData: {tg?.initData?"OK":"KOSONG"}</div>
    </>}

    <div style={{position:"fixed",bottom:0,left:0,right:0,display:"flex",gap:8,padding:10,background:"#020617"}}>
      <button onClick={()=>setView("board")} style={{flex:1,padding:12,background:view==="board"?"#2563eb":"#1e293b",border:0,color:"#fff",borderRadius:10}}>Board</button>
      <button onClick={()=>setView("profile")} style={{flex:1,padding:12,background:view==="profile"?"#2563eb":"#1e293b",border:0,color:"#fff",borderRadius:10}}>Profile</button>
    </div>
  </div>;
}
