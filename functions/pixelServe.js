exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || "x";

  const js = `!function(){try{var e=localStorage.getItem("_r");e||(e=crypto.randomUUID(),localStorage.setItem("_r",e));var t={cid:"${id}",u:location.href,r:document.referrer||null,ua:navigator.userAgent,dt:/Mobi|Android/i.test(navigator.userAgent)?"M":"D",b:function(){var e=navigator.userAgent;return e.includes("Chrome")?"C":e.includes("Firefox")?"F":e.includes("Safari")?"S":"U"}(),os:navigator.platform,sr:screen.width+"x"+screen.height,cm:{_r:e}};fetch("https://retarglow.com/.netlify/functions/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),fetch("https://retarglow.com/.netlify/functions/getAd",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({page_url:location.href,custom_metadata:{_r:e}})}).then(e=>e.json()).then(e=>{if(e.ad_url){var t=document.createElement("img");t.src=e.ad_url,t.style.display="none",document.body.appendChild(t)}})}catch(e){}}();`;

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
