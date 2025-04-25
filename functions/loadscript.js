exports.handler = async (event) => {
  const id = event.path.split('/').pop();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/javascript' },
    body: `
      (function() {
        const userId = document.cookie.match(/retarglow_id=([^;]+)/)?.[1];
        fetch('https://retarglow.com/.netlify/functions/track?event=page_view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ custom_id: '${id}' }),
          credentials: 'include'
        });
      })();
    `,
  };
};
