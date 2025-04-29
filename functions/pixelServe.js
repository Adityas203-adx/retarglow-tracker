exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || "unknown";
  const customEvent = event.queryStringParameters?.event || "viewPage";

  const script = `(function(){
    try {
      var rid = localStorage.getItem("retarglow_id");
      if (!rid) {
        rid = crypto.randomUUID();
        localStorage.setItem("retarglow_id", rid);
      }

      function parseUA() {
        var ua = navigator.userAgent;
        var tem;
        var M = ua.match(/(opera|chrome|safari|firefox|edge|trident(?=\\/))\\/\\s*([\\d.]+)/i) || [];
        if (/trident/i.test(M[1])) {
          tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
          return { name: "IE", version: tem[1] || "" };
        }
        if (M[1] === "Chrome") {
          tem = ua.match(/(OPR|Edg|Edge)\\/(\\d+)/);
          if (tem != null) return { name: tem[1].replace("OPR", "Opera"), version: tem[2] };
        }
        M = M.length ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
        return { name: M[0], version: M[1] };
      }

      var os = navigator.platform;
      var browserInfo = parseUA();

      var payload = {
        custom_id: "${id}",
        event: "${customEvent}",
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        browser: browserInfo.name,
        os: os,
        screen_resolution: window.screen.width + "x" + window.screen.height,
        custom_metadata: { retarglow_id: rid },
        device_info: {
          device_type: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
          browser_name: browserInfo.name,
          browser_version: browserInfo.version,
          os_name: os,
          os_version: "unknown"
        }
      };

      fetch("https://retarglow.com/.netlify/functions/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    body: script
  };
};
