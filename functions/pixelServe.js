exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    // Use default campaign ID if not provided
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

    // 2. Load ad logic on exit or scroll
    function triggerRedirect(adUrl){
      if (adUrl) {
        const a = document.createElement("a");
        a.href = adUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }

    async function getAdAndTrigger(){
      try {
        const res = await fetch("https://retarglow.com/getad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ u: location.href, cm: data.cm, country: null }) // country can be enriched server-side
        });
        const resJson = await res.json();
        if (resJson.ad_url) {
          triggerRedirect("https://retarglow.com/redirect?ad_id=" + encodeURIComponent("${id}"));
        }
      } catch (err) {}
    }

    // 3. Exit-intent detection
    document.addEventListener("mouseout", function (e) {
      if (!e.toElement && !e.relatedTarget && e.clientY <= 0) {
        getAdAndTrigger();
      }
    });

    // 4. Scroll-depth trigger
    let triggered = false;
    window.addEventListener("scroll", function () {
      if (triggered) return;
      if (window.scrollY / document.body.scrollHeight > 0.5) {
        triggered = true;
        getAdAndTrigger();
      }
    });

  } catch (n) {}
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
