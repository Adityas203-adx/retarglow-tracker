exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || 'unknown';

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
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        browser: navigator.userAgent,
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
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*'
    },
    body: script,
  };
};
