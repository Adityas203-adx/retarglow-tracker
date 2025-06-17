exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const id = event.pathParameters?.id || "default-campaign";

    const js = `
// 📦 Retarglow v2 Pixel
(function() {
  const cid = "${id}";

  function runPixel() {
    try {
      let _r = localStorage.getItem("_r");
      if (!_r) {
        _r = crypto.randomUUID();
        localStorage.setItem("_r", _r);
      }

      const injected = sessionStorage.getItem("ad_injected_" + cid);
      if (injected) return;

      const data = {
        cid: cid,
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
          const finalUrl = json.ad_url.replace("{{_r}}", _r);

          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.setAttribute("referrerpolicy", "no-referrer");
          iframe.src = finalUrl;

          document.body.appendChild(iframe);
          sessionStorage.setItem("ad_injected_" + cid, "1");
        }
      })
      .catch(err => console.warn("❌ Ad Fetch Error:", err));
    } catch (e) {
      console.error("⚠️ Pixel Error:", e);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    runPixel();
  } else {
    document.addEventListener("DOMContentLoaded", runPixel);
  }

  // Optional: handle SPA-like navigation
  ["popstate", "pushState", "replaceState"].forEach(evt => {
    window.addEventListener(evt, () => {
      sessionStorage.removeItem("ad_injected_" + cid);
      runPixel();
    });
  });
})();
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
