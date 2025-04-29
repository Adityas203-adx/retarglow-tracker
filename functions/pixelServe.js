exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || "unknown";

  const script = `(function(){try{var r=localStorage.getItem("rid");if(!r){r=crypto.randomUUID();localStorage.setItem("rid",r);}var p={a:"${id}",b:window.location.href,c:document.referrer||null,d:navigator.userAgent,e:/Mobi|Android/i.test(navigator.userAgent)?"Mobile":"Desktop",f:(function(){var u=navigator.userAgent;if(u.indexOf("Chrome")>-1)return"Chrome";if(u.indexOf("Firefox")>-1)return"Firefox";if(u.indexOf("Safari")>-1)return"Safari";return"Unknown"})(),g:navigator.platform,h:window.screen.width+"x"+window.screen.height,i:{rid:r}};fetch("https://retarglow.com/.netlify/functions/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)})}catch(e){}})();`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*"
    },
    body: script,
  };
};
