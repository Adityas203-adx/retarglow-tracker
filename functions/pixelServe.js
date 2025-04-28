exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || 'unknown';
  
  const script = `(function(){try{var t=document.cookie.match(/retarglow_id=([^;]+)/)?.[1];fetch('https://retarglow.com/.netlify/functions/track',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({custom_id:'${id}',page_url:window.location.href,referrer:document.referrer,user_agent:navigator.userAgent})}).catch(function(e){console.error('Tracking failed',e)});}catch(e){console.error('Pixel error',e);}})();`;
  
  return {
    statusCode: 200,
    headers: { 
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: script,
  };
};
