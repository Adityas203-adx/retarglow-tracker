exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || "unknown";
  const script = `!function(){try{var e=localStorage.getItem("retarglow_id");e||(e=crypto.randomUUID(),localStorage.setItem("retarglow_id",e));var t={custom_id:"${id}",page_url:location.href,referrer:document.referrer||null,user_agent:navigator.userAgent,device_type:/Mobi|Android/i.test(navigator.userAgent)?"Mobile":"Desktop",browser:function(){var e=navigator.userAgent;return e.indexOf("Chrome")>-1?"Chrome":e.indexOf("Firefox")>-1?"Firefox":e.indexOf("Safari")>-1?"Safari":"Unknown"}(),os:navigator.platform,screen_resolution:screen.width+"x"+screen.height,custom_metadata:{retarglow_id:e}};fetch("https://retarglow.com/.netlify/functions/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})}catch(e){}}();`;
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*"
    },
    body: script,
  };
};
