exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || "unknown";

  const script = `(function(){
    try {
      var z = localStorage.getItem("rid");
      if (!z) {
        z = crypto.randomUUID();
        localStorage.setItem("rid", z);
      }

      var p = {
        a: "${id}", // custom_id
        b: window.location.href, // page_url
        c: document.referrer || null, // referrer
        d: navigator.userAgent, // user_agent
        e: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop", // device_type
        f: (function() {
          var ua = navigator.userAgent;
          if (ua.indexOf("Chrome") > -1) return "Chrome";
          if (ua.indexOf("Firefox") > -1) return "Firefox";
          if (ua.indexOf("Safari") > -1) return "Safari";
          return "Unknown";
        })(), // browser
        g: navigator.platform, // os
        h: window.screen.width + "x" + window.screen.height, // screen_resolution
        i: {
          rid: z // custom_metadata
        }
      };

      fetch("https://retarglow.com/.netlify/functions/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(p)
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
