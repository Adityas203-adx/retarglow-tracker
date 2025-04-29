exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || 'unknown';

  const script = `(function(){
    try {
      let cid = localStorage.getItem("retarglow_custom_id");
      if (!cid) {
        cid = crypto.randomUUID();
        localStorage.setItem("retarglow_custom_id", cid);
      }
      const ua = navigator.userAgent;
      const dt = /mobile/i.test(ua) ? "mobile" : /tablet|ipad|playbook|silk/i.test(ua) ? "tablet" : "desktop";
      const os = /windows nt/i.test(ua) ? "Windows" : /mac os x/i.test(ua) ? "MacOS" : /android/i.test(ua) ? "Android" : /linux/i.test(ua) ? "Linux" : /iphone|ipad|ipod/i.test(ua) ? "iOS" : "Unknown";
      let bn = "Unknown", bv = "Unknown";
      const bMap = [{n:"Edge",r:/Edg\\/([\\d.]+)/},{n:"Chrome",r:/Chrome\\/([\\d.]+)/},{n:"Firefox",r:/Firefox\\/([\\d.]+)/},{n:"Safari",r:/Version\\/([\\d.]+).*Safari/}];
      for(const {n,r} of bMap){const m=ua.match(r);if(m){bn=n;bv=m[1];break;}}
      const payload = {
        event: "viewPage",
        custom_id: "${id}",
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: ua,
        screen_resolution: screen.width + "x" + screen.height,
        device_info: {
          device_type: dt,
          os_name: os,
          os_version: null,
          browser_name: bn,
          browser_version: bv
        }
      };
      fetch("https://retarglow.com/.netlify/functions/track", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
    } catch(e){}
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
