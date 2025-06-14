exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const id = event.pathParameters?.id || "default-campaign";

    const js = `!function(){
  try {
    var _r = localStorage.getItem("_r");
    _r || (_r = crypto.randomUUID(), localStorage.setItem("_r", _r));

    var hasInjected = sessionStorage.getItem("ad_injected_" + "${id}");
    if (hasInjected) return; 

    var data = {
      cid: "${id}",
      u: location.href,
      r: document.referrer || null,
      ua: navigator.userAgent,
      dt: /Mobi|Android/i.test(navigator.userAgent) ? "M" : "D",
      b: (function(){
        var e = navigator.userAgent;
        return e.includes("Chrome") ? "C" : e.includes("Firefox") ? "F" : e.includes("Safari") ? "S" : "U";
      })(),
      os: navigator.platform,
      sr: screen.width + "x" + screen.height,
      cm: { _r: _r }
    };

    fetch("https://retarglow.com/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    fetch("https://retarglow.com/getad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ u: location.href, cm: data.cm, country: null })
    })
    .then(res => res.json())
    .then(json => {
      if (json.ad_url) {
        var finalUrl = json.ad_url.replace("{{_r}}", _r);

        var iframe = document.createElement("iframe");
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.border = "0";
        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";
        iframe.setAttribute("referrerpolicy", "no-referrer");
        iframe.srcdoc = \`
          <meta http-equiv='refresh' content='0;url=\${finalUrl}'>
          <meta name='referrer' content='no-referrer'>
        \`;

        document.body.appendChild(iframe);

        sessionStorage.setItem("ad_injected_" + "${id}", "1");
      }
    })
    .catch(err => console.warn("❌ Ad Fetch Error:", err));
    
  } catch (n) {
    console.error("Pixel Error:", n);
  }
}();`;

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
