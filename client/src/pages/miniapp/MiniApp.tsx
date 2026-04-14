import { useEffect, useState } from "react";

const API = "https://anilocp.vercel.app/api/miniapp";
const CHAT_ID = "-1001236366475";

export default function MiniApp(){
  const [tg,setTg]=useState<any>(null);
  const [debug,setDebug]=useState("init...");
  const [view,setView]=useState<"board"|"profile">("board");
  const [profile,setProfile]=useState<any>(null);

  useEffect(()=>{
    const w=(window as any).Telegram?.WebApp;
    if(w){ w.ready(); w.expand(); setTg(w); setDebug(`TG OK | initData ${w.initData?.length||0} | user ${w.initDataUnsafe?.user?.id}`); }
    else setDebug("TG TIDAK ADA - dibuka di browser");
  },[]);

  useEffect(()=>{
    if(view!=="profile"||!tg?.initData) return;
    setDebug("fetch profile...");
    fetch(`${API}/profile?chat_id=${CHAT_ID}`,{headers:{"X-Telegram-Init-Data":tg.initData}})
      .then(r=>r.json()).then(d=>{ setProfile(d.user); setDebug(`profile loaded: ${d.user.first_name}`); });
  },[view,tg]);

  const user = tg?.initDataUnsafe?.user;

  return (
    <div style={{background:"#020617",color:"#fff",minHeight:"100vh",padding:16,paddingBottom:80,fontFamily:"system-ui"}}>
      <div style={{background:"#f59e0b22",border:"1px solid #f59e0b",padding:8,borderRadius:8,fontSize:12,marginBottom:12}}>
        DEBUG: {debug}
      </div>

      <h2>{view==="profile"?"Profile":"Board"}</h2>
      
      {view==="profile" && (
        profile ? (
          <div style={{background:"#0f172a",padding:20,borderRadius:16,textAlign:"center"}}>
            <img src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${profile.username||"x"}`} style={{width:70,height:70,borderRadius:12}}/>
            <h3>{profile.first_name}</h3>
            <div style={{opacity:.6}}>@{profile.username || user?.username || "no-username"} (ID: {profile.user_id})</div>
            <div style={{marginTop:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>CP: {profile.cp_mingguan}</div>
              <div>Chat: {profile.chat_mingguan}</div>
              <div>Total CP: {profile.total_cp}</div>
              <div>Rank: {profile.current_rank}</div>
            </div>
          </div>
        ) : <div>Loading...</div>
      )}

      <div style={{position:"fixed",bottom:0,left:0,right:0,display:"flex"}}>
        <button onClick={()=>setView("board")} style={{flex:1,padding:14,background:"#1e293b",color:"#fff",border:0}}>Board</button>
        <button onClick={()=>setView("profile")} style={{flex:1,padding:14,background:"#1e293b",color:"#fff",border:0}}>Profile</button>
      </div>
    </div>
  );
}
