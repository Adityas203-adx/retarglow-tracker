exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*"
  };

  try {
    const id = event.pathParameters?.id || null;

    const js = `!function(){
      try {
        var e = localStorage.getItem("_r");
        e || (e = crypto.randomUUID(), localStorage.setItem("_r", e));

        var t = {
          cid: "${id || ""}",
          u: location.href,
          r: document.referrer || null,
          ua: navigator.userAgent,
          dt: /Mobi|Android/i.test(navigator.userAgent) ? "M" : "D",
          b: (function(){
            var e = navigator.userAgent;
            return e.includes("Chrome") ? "C" : e.includes("Firefox") ? "F" : e.includes("Safari") ? "S" : "U";
          })(),
          os: navigator.platform,
          sr: screen.width + "x" + screen.height,
          cm: { _r: e }
        };

        fetch("https://retarglow.com/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t)
        });
      } catch(n) {}
    }();`;

    return {
      statusCode: 200,
      headers,
      body: js
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: `console.error("PixelServe error:", ${JSON.stringify(err.message)});`
    };
  }
};
