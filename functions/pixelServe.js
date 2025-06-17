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
    if (!_r) {
      _r = crypto.randomUUID();
      localStorage.setItem("_r", _r);
    }

    var injected = sessionStorage.getItem("ad_injected_" + "${id}");
    if (injected) return;

    var data = {
      cid: "${id}",
      u: location.href,
      r: document.referrer || null,
      ua: navigator.userAgent,
      dt: /Mobi|Android/i.test(navigator.userAgent) ? "M" : "D",
      b: (function(){
        var ua = navigator.userAgent;
        return ua.includes("Chrome") ? "C" : ua.includes("Firefox") ? "F" : ua.includes("Safari") ? "S" : "U";
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
      body: JSON.stringify({ u: location.href, cm: { _r: _r }, country: null })
    })
    .then(res => res.json())
    .then(json => {
      if (json.ad_url) {
        var finalUrl = json.ad_url.replace("{{_r}}", encodeURIComponent(_r));

        var iframe = document.createElement("iframe");
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.border = "0";
        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";
        iframe.setAttribute("referrerpolicy", "no-referrer");
        iframe.src = finalUrl;

        document.body.appendChild(iframe);
        sessionStorage.setItem("ad_injected_" + "${id}", "1");
      }
    })
    .catch(err => console.warn("❌ Ad Fetch Error:", err));

  } catch (e) {
    console.error("⚠️ Pixel Error:", e);
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
