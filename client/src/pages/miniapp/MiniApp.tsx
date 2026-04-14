import { useEffect, useState } from "react";

const API = "https://anilocp.vercel.app/api/miniapp";
const CHAT_ID = "-1001236366475";

export default function MiniApp(){
  const [tg,setTg]=useState<any>(null);
  const [debug,setDebug]=useState("menunggu Telegram...");
  const [profile,setProfile]=useState<any>(null);
  const [view,setView]=useState<"board"|"profile">("profile");

  useEffect(()=>{
    let tries = 0;
    const check = () => {
      const w = (window as any).Telegram?.WebApp;
      if(w){
        w.ready(); w.expand();
        setTg(w);
        setDebug(`TG OK | len ${w.initData?.length||0} | id ${w.initDataUnsafe?.user?.id}`);
        return true;
      }
      setDebug(`coba ${++tries}/50 - TG belum ada`);
      return false;
    };
    if(!check()){
      const id = setInterval(()=>{ if(check() || tries>50) clearInterval(id); }, 100);
    }
  },[]);

  useEffect(()=>{
    if(view!=="profile" || !tg?.initData) return;
    fetch(`${API}/profile?chat_id=${CHAT_ID}`,{
      headers:{"X-Telegram-Init-Data": tg.initData}
    }).then(r=>r.json()).then(d=>{
      setProfile(d.user);
      setDebug(d.ok ? `loaded ${d.user.first_name}` : "error");
    });
  },[view,tg]);

  const user = tg?.initDataUnsafe?.user;

  return (
    <div style={{background:"#020617",color:"#fff",minHeight:"100vh",padding:16,fontFamily:"system-ui"}}>
      <div style={{background:"#f59e0b22",padding:8,borderRadius:8,fontSize:12,marginBottom:12}}>
        DEBUG: {debug}
      </div>

      {profile ? (
        <div style={{background:"#0f172a",padding:20,borderRadius:16,textAlign:"center"}}>
          <h2>{profile.first_name}</h2>
          <div>@{profile.username || user?.username} (ID: {profile.user_id})</div>
          <p style={{marginTop:16}}>CP Minggu: {profile.cp_mingguan} | Chat: {profile.chat_mingguan}</p>
          <p>Total CP: {profile.total_cp} | Rank: {profile.current_rank}</p>
        </div>
      ) : (
        <div style={{textAlign:"center",padding:40,opacity:.6}}>
          {tg ? "Loading profile..." : "Menunggu Telegram..."}
        </div>
      )}
    </div>
  );
}
