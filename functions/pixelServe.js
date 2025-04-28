exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || 'unknown';

  const script = `(function(){try{var a=document.cookie.match(/retarglow_id=([^;]+)/)?.[1];fetch('https://retarglow.com/.netlify/functions/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({custom_id:'${id}',page_url:window.location.href,referrer:document.referrer,user_agent:navigator.userAgent}),credentials:'include'});}catch(e){}})();`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/javascript' },
    body: script,
  };
};
