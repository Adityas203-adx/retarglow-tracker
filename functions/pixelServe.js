exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || 'unknown';

  const payload = `(function(){try{fetch('https://retarglow.com/.netlify/functions/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({custom_id:'${id}',page_url:window.location.href,referrer:document.referrer,user_agent:navigator.userAgent}),credentials:'include'});}catch(e){}})();`;

  const base64Payload = Buffer.from(payload).toString('base64');

  const script = `eval(atob('${base64Payload}'))`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: script,
  };
};
