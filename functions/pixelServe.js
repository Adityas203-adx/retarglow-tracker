exports.handler = async (event) => {
  const id = event.queryStringParameters?.id || 'unknown';

  const script = `(function(){try{var a=document.cookie.match(/retarglow_id=([^;]+)/)?.[1];fetch('https://retarglow.com/.netlify/functions/track?event=page_view',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({custom_id:'${id}'}),credentials:'include'});}catch(e){}})();`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',   // Optional for safety
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: script,
  };
};
