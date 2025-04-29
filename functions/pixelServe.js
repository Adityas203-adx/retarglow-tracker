exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || "unknown";

  const script = `(function(){
    try {
      var rid = localStorage.getItem("retarglow_id");
      if (!rid) {
        rid = crypto.randomUUID();
        localStorage.setItem("retarglow_id", rid);
      }

      function parseDeviceInfo(ua) {
        let device_type = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
        let browser_name = "Unknown", browser_version = "Unknown";
        let os_name = "Unknown", os_version = "Unknown";

        if (/Chrome/.test(ua)) {
          browser_name = "Chrome";
          browser_version = ua.match(/Chrome\\/([\\d.]+)/)?.[1] || "Unknown";
        } else if (/Safari/.test(ua)) {
          browser_name = "Safari";
          browser_version = ua.match(/Version\\/([\\d.]+)/)?.[1] || "Unknown";
        } else if (/Firefox/.test(ua)) {
          browser_name = "Firefox";
          browser_version = ua.match(/Firefox\\/([\\d.]+)/)?.[1] || "Unknown";
        }

        if (/Windows NT/.test(ua)) {
          os_name = "Windows";
          os_version = ua.match(/Windows NT ([\\d.]+)/)?.[1] || "Unknown";
        } else if (/Mac OS X/.test(ua)) {
          os_name = "macOS";
          os_version = ua.match(/Mac OS X ([\\d_]+)/)?.[1]?.replace(/_/g, ".") || "Unknown";
        } else if (/Android/.test(ua)) {
          os_name = "Android";
          os_version = ua.match(/Android ([\\d.]+)/)?.[1] || "Unknown";
        } else if (/iPhone OS/.test(ua)) {
          os_name = "iOS";
          os_version = ua.match(/iPhone OS ([\\d_]+)/)?.[1]?.replace(/_/g, ".") || "Unknown";
        }

        return { device_type, os_name, os_version, browser_name, browser_version };
      }

      var deviceInfo = parseDeviceInfo(navigator.userAgent);

      var payload = {
        custom_id: "${id}",
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: window.screen.width + "x" + window.screen.height,
        custom_metadata: {
          retarglow_id: rid
        },
        device_info: deviceInfo
      };

      fetch("https://retarglow.com/.netlify/functions/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch(e) { console.error("Retarglow error", e); }
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
