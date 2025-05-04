exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || "x";
  const js = `!function(){try{var a=localStorage.getItem("_r");if(!a){a=crypto.randomUUID();localStorage.setItem("_r",a)}var d={cid:"${id}",u:location.href,r:document.referrer||null,ua:navigator.userAgent,dt:/Mobi|Android/i.test(navigator.userAgent)?"M":"D",b:function(){var x=navigator.userAgent;return x.includes("Chrome")?"C":x.includes("Firefox")?"F":x.includes("Safari")?"S":"U"}(),os:navigator.platform,sr:screen.width+"x"+screen.height,cm:{_r:a}};fetch("https://retarglow.com/.netlify/functions/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)})}catch(e){}}();`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
    body: js,
  };
};
