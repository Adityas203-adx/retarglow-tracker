exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || "unknown";

  const script = `(function(){
    try {
      var rid = localStorage.getItem("retarglow_id");
      if (!rid) {
        rid = crypto.randomUUID();
        localStorage.setItem("retarglow_id", rid);
      }

      var payload = {
        custom_id: "${id}",
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        browser: (function() {
          var ua = navigator.userAgent;
          if (ua.indexOf("Chrome") > -1) return "Chrome";
          if (ua.indexOf("Firefox") > -1) return "Firefox";
          if (ua.indexOf("Safari") > -1) return "Safari";
          return "Unknown";
        })(),
        os: navigator.platform,
        screen_resolution: window.screen.width + "x" + window.screen.height,
        custom_metadata: {
          retarglow_id: rid
        }
      };

      fetch("https://retarglow.com/.netlify/functions/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch(e) {}
  })();`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*"
    },
    body: script,
  };
};
